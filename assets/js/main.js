document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential smoothing
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // OPTIMIZATION: Sync Lenis with GSAP ScrollTrigger to fix lag/jitter
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000); // GSAP sends seconds, Lenis needs ms
    });

    gsap.ticker.lagSmoothing(0); // Critical for smooth pinning

    // 2. Initialize AOS (Animate on Scroll)
    AOS.init({
        once: true,
        offset: 50,
        duration: 800,
        easing: 'ease-out-cubic',
    });

    // 3. Responsive Catalog (REMOVED: Using GSAP Horizontal Scroll)
    /*
    let catalogSwiper = null;
    function initCatalog() { ... }
    initCatalog();
    */

    // 3.1 Initialize Swiper (Reviews - 3D Coverflow)
    const reviewsSwiper = new Swiper('.reviews-slider', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto', // Important for coverflow
        initialSlide: 1, // Start with the second slide
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        /* Autoplay removed by user request */
    });

    // 4. Calculator Logic (Advanced Format)
    const cupsEl = document.getElementById('calc-cups');
    const cafesEl = document.getElementById('calc-cafes');
    const monthsEl = document.getElementById('calc-months');
    
    const cupsValEl = document.getElementById('calc-cups-val');
    const cafesValEl = document.getElementById('calc-cafes-val');
    const monthsValEl = document.getElementById('calc-months-val');
    
    const totalResultEl = document.getElementById('calc-total-result');

    function updateCalculator() {
        // Get Values
        const cups = parseInt(cupsEl.value);
        const cafes = parseInt(cafesEl.value);
        const months = parseInt(monthsEl.value);
        
        // Update UI Labels
        cupsValEl.innerText = cups;
        cafesValEl.innerText = cafes;
        monthsValEl.innerText = months;

        // Update Slider Backgrounds (Progress Fill)
        const updateSliderBg = (el) => {
            const min = parseInt(el.min) || 0;
            const max = parseInt(el.max) || 100;
            const val = parseInt(el.value) || 0;
            const percent = ((val - min) / (max - min)) * 100;
            el.style.background = `linear-gradient(to right, #4fdad5 0%, #4fdad5 ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`;
        };

        updateSliderBg(cupsEl);
        updateSliderBg(cafesEl);
        updateSliderBg(monthsEl);

        // Formula derived from user data:
        // Profit per cup ≈ 24 UAH
        // Fixed costs ≈ 8610 UAH
        // Monthly Profit = (Cups * 30 * 24) - 8610
        let monthlyProfitPerCafe = (cups * 30 * 24) - 8610;
        
        if (monthlyProfitPerCafe < 0) monthlyProfitPerCafe = 0;

        const totalProfit = monthlyProfitPerCafe * cafes * months;

        // Emoji Logic
        let emoji = '🙂';
        if (totalProfit > 50000 && totalProfit <= 200000) emoji = '😎';
        else if (totalProfit > 200000 && totalProfit <= 500000) emoji = '🚀';
        else if (totalProfit > 500000 && totalProfit <= 1000000) emoji = '💰';
        else if (totalProfit > 1000000) emoji = '👑';

        // Update Text
        totalResultEl.innerText = totalProfit.toLocaleString('uk-UA') + ' грн';

        // Update Emoji Container
        const emojiContainer = document.getElementById('calc-emoji-container');
        if (emojiContainer) {
            emojiContainer.innerHTML = '<span class="emoji-pop">' + emoji + '</span>';
            // Animate emoji separately
            gsap.fromTo(".emoji-pop", {scale: 0.5, opacity: 0, rotate: -20}, {scale: 1, opacity: 1, rotate: 0, duration: 0.4, ease: "back.out(1.7)"});
        }
        
        // Simple scale pop for text
        gsap.fromTo(totalResultEl, {scale: 1.05}, {scale: 1, duration: 0.2});
    }

    if(cupsEl && cafesEl && monthsEl) {
        cupsEl.addEventListener('input', updateCalculator);
        cafesEl.addEventListener('input', updateCalculator);
        monthsEl.addEventListener('input', updateCalculator);
        updateCalculator(); // init
    }

    // 4.1 Initialize Fancybox
    Fancybox.bind("[data-fancybox]", {
        // Your custom options
    });
    


    // 5. GSAP Animations
    // Animated Counters in Hero
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const value = parseInt(counter.getAttribute('data-value'));
        // Use a proxy object for reliable numeric interpolation
        let proxy = { val: 0 };
        
        ScrollTrigger.create({
            trigger: counter,
            start: "top 95%", // Trigger earlier
            once: true,
            onEnter: () => {
                gsap.to(proxy, {
                    val: value,
                    duration: 2.5,
                    ease: "power3.out",
                    onUpdate: function() {
                        counter.innerText = Math.ceil(proxy.val); // Format as simple integer
                    }
                });
            }
        });
    });

    // Header Blur on Scroll (Refined for CSS classes)
    const header = document.querySelector('.header');
    
    function handleScroll() {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on init

    // 6. Mobile Menu
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    
    if(burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            
            if (nav.style.display === 'block') {
                gsap.to(nav, {opacity: 0, y: -20, duration: 0.3, onComplete: () => nav.style.display = 'none'});
            } else {
                nav.style.display = 'block';
                gsap.fromTo(nav, {opacity: 0, y: -20}, {opacity: 1, y: 0, duration: 0.3});
                
                // On mobile, often nav needs to be absolute/fixed style override
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = '#1a1a1a';
                nav.style.padding = '20px';
                nav.style.borderBottom = '1px solid #333';
            }
        });
    }

    console.log("Website Loaded - High Performance Mode");
});

// Handle Mobile Specs Toggle
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // If clicking a button, don't toggle
        if (e.target.closest('button') || e.target.closest('a')) return;
        
        // On mobile, click anywhere on card toggles the specs
        if (window.innerWidth < 992) {
             // Remove active class from others
             document.querySelectorAll('.product-card').forEach(c => {
                 if (c !== card) c.classList.remove('is-active');
             });
             card.classList.toggle('is-active');
        }
    });
});

// ==========================================
// Catalog Swiper Setup (Replaces GSAP)
// ==========================================
function initCatalogSwiper() {
    const catalogSwiper = new Swiper('.catalog-slider', {
        slidesPerView: 'auto', // Allow CSS width to control size
        spaceBetween: 20,
        grabCursor: true,
        centeredSlides: true, // Center on mobile
        loop: true,
        pagination: {
            el: '.catalog-slider .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.catalog-slider .swiper-button-next',
            prevEl: '.catalog-slider .swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 'auto',
                spaceBetween: 30,
                centeredSlides: false, // Left align on tablets
            },
            1024: {
                slidesPerView: 'auto',
                spaceBetween: 40,
                centeredSlides: false, // Left align on desktop
            }
        }
    });
}

// Ensure images are loaded before init
window.addEventListener("load", () => {
    initCatalogSwiper();
});

// Allow closing specs by clicking on the panel itself
document.addEventListener('click', (e) => {
    if (e.target.closest('.product-specs-panel') || e.target.closest('.product-card__specs')) {
        const card = e.target.closest('.product-card');
        if (card.classList.contains('details-open')) {
            card.classList.remove('details-open');
        }
    }
});

/* Cursor Blur Follower */
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursor-blur');
    if (!cursor) return;

    // Use gsap for smoother performance if available, else plain JS
    if (typeof gsap !== 'undefined') {
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
        
        let xTo = gsap.quickTo(cursor, "x", {duration: 0.6, ease: "power3"}),
            yTo = gsap.quickTo(cursor, "y", {duration: 0.6, ease: "power3"});

        window.addEventListener("mousemove", e => {
            xTo(e.clientX);
            yTo(e.clientY);
        });
    } else {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }
});

/* =========================================
   FAQ Accordion Logic
   ========================================= */
function initFaq() {
    const questions = document.querySelectorAll('.faq-header');
    
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const content = question.nextElementSibling;
            
            // Toggle current
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = 0;
            }
            
            // Close others (Accordion behavior)
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-body').style.maxHeight = 0;
                }
            });
        });
    });
}

// Init FAQ
window.addEventListener("DOMContentLoaded", () => {
   initFaq();
});

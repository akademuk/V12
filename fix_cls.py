import re

html_path = 'index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('font-display: swap;', 'font-display: optional;')

if 'line-height: 1.15;' in content:
    new_style = '''.hero__title {
            font-size: clamp(3rem, 6vw, 5rem);
            line-height: normal;
            min-height: 2.6em; /* Safe reserve */
            font-weight: 700;
            margin-bottom: 30px;
            color: var(--color-text-heading);
            overflow-wrap: break-word;
            hyphens: manual;
        }'''
    # Simple regex to replace the block
    content = re.sub(r'\.hero__title\s*\{[^}]*\}', new_style, content, count=1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed.")

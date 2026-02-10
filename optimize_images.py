import re
import sys

def optimize_images(file_path):
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")
        return

    def process_img_tag(match):
        full_tag = match.group(0)
        
        # Regex to find attributes: key="value", key='value', key=value, or just key
        # We allow alphanumeric, dashes, colons in keys (e.g. data-src, xml:lang)
        attr_regex = r'([a-zA-Z0-9:\-]+)(?:\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+)))?'
        
        attributes = {}
        # We also want to preserve the order if possible, but for this task, reconstruction is safer to ensure valid HTML syntax for added attributes.
        # However, to avoid parsing 'img' as an attribute, we skip the first match if it is 'img' 
        
        raw_attributes = re.findall(attr_regex, full_tag)
        
        for i, (key, val_double, val_single, val_unquoted) in enumerate(raw_attributes):
            key_lower = key.lower()
            if i == 0 and key_lower == 'img':
                continue
            
            val = val_double if val_double else (val_single if val_single else (val_unquoted if val_unquoted else ""))
            attributes[key_lower] = val

        # Logic checks
        classes = attributes.get('class', '').split()
        is_hero = 'hero__img' in classes
        
        # 1. Loading attribute
        if not is_hero:
            if 'loading' not in attributes:
                attributes['loading'] = 'lazy'
        else:
            # If hero, ensure NOT loading="lazy"
            # We can remove it entirely or set to eager. Removing is standard for hero to let browser decide (defaults to eager often) or just eager.
            # User said "ensures it does NOT have loading='lazy'".
            if attributes.get('loading') == 'lazy':
                del attributes['loading']

        # 2. Dimensions
        has_width = 'width' in attributes
        has_height = 'height' in attributes
        src = attributes.get('src', '').lower()
        is_svg = src.endswith('.svg')

        if not (has_width or has_height) and not is_svg and not is_hero:
             attributes['width'] = '300'
             attributes['height'] = '400'

        # Reconstruct the tag
        new_tag = '<img'
        for key, val in attributes.items():
            new_tag += f' {key}="{val}"'
        new_tag += '>'
        
        return new_tag

    # Match <img ... > case insensitive
    # This regex matches explicit <img ... > tags
    # It assumes the tag does not contain '>' inside attribute values which is valid HTML but rare/hard for regex.
    # A cleaner regex for tags: <img\s+[^>]*> matches until the first >, which fails if > is in quotes.
    # Better: <img\s+(?:[^>"\']|"[^"]*"|\'[^\']*\')*>
    tag_regex = r'<img\s+(?:[^>"\']|"[^"]*"|\'[^\']*\')*>'
    
    new_content = re.sub(tag_regex, process_img_tag, content, flags=re.IGNORECASE | re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Done.")

if __name__ == '__main__':
    optimize_images('index.html')

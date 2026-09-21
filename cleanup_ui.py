import os
import re

def remove_text(file_path, pattern):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(pattern, '', content)
    
    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

# 1. base.html - remove top-infobar CSS, HTML, and JS
base_html_path = 'templates/home/base.html'
if os.path.exists(base_html_path):
    # Remove CSS
    remove_text(base_html_path, r'/\* ===== Top Info Bar — Redesigned ===== \*/\s*\.top-infobar\{.*?\}\s*.*?\s*@keyframes tibGlow\{.*?\}\s*')
    # This is tricky with regex, so I'll use a more aggressive approach for the CSS
    # Let's try to remove from .top-infobar until the start of .navbar-m3
    with open(base_html_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if '/* ===== Top Info Bar — Redesigned ===== */' in line:
            start_idx = i
        if '/* ── Navbar: luxury glassmorphic capsule ── */' in line:
            end_idx = i
            break
    
    if start_idx != -1 and end_idx != -1:
        del lines[start_idx:end_idx]
        with open(base_html_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Removed top-infobar CSS from base.html")

    # Remove HTML
    remove_text(base_html_path, r'<!-- Top Info Bar \(homepage only\) -->\s*\{% if show_infobar %\}.*?\{% endif \%}')
    # Need to use DOTALL for multiline
    with open(base_html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'<!-- Top Info Bar \(homepage only\) -->\s*\{% if show_infobar %\}.*?\{% endif \%}', '', content, flags=re.DOTALL)
    with open(base_html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed top-infobar HTML from base.html")

    # Remove JS
    # The clock and weather JS is at the end
    with open(base_html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'<!-- Top Info Bar: Clock \+ Weather -->\s*<script>.*?</script>', '', content, flags=re.DOTALL)
    with open(base_html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed top-infobar JS from base.html")

# 2. about.html - remove "Our Story" and "About Us" header
about_html_path = 'templates/home/about.html'
if os.path.exists(about_html_path):
    with open(about_html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Remove the header block
    content = re.sub(r'<header class="m3-page-header">.*?</header>', '', content, flags=re.DOTALL)
    with open(about_html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed header from about.html")

# 3. Global cleanup for "Our Story", "About Us", and the specific description
target_files = [
    'templates/home/home.html',
    'templates/home/about.html',
    'templates/home/updates.html',
    'templates/home/contact.html',
    'templates/home/properties.html',
    'templates/home/sale_listings.html'
]

patterns = [
    r'Our Story',
    r'About Us',
    r'Dedicated to redefining luxury real estate management in Rwanda\.'
]

for file_path in target_files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for p in patterns:
            content = re.sub(p, '', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Cleaned up {file_path}")


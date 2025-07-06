#!/usr/bin/env python3
import os
import re
import glob

def fix_const_icons(file_path):
    """Remueve 'const' de Icon widgets que usan MdiIcons"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Patron para encontrar 'const Icon(MdiIcons.xxx'
        pattern = r'const Icon\(MdiIcons\.'
        
        # Reemplazar con solo 'Icon(MdiIcons.'
        fixed_content = re.sub(pattern, 'Icon(MdiIcons.', content)
        
        # Solo escribir si hubo cambios
        if fixed_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✅ Fixed {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    # Buscar archivos .dart en lib/
    dart_files = glob.glob('/Users/daniel/Desktop/NoirsCheck/frontend/lib/**/*.dart', recursive=True)
    
    fixed_count = 0
    for dart_file in dart_files:
        if fix_const_icons(dart_file):
            fixed_count += 1
    
    print(f"\n🎉 Fixed {fixed_count} files!")

if __name__ == "__main__":
    main()

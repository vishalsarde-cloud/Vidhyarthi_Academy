#!/usr/bin/env python3
"""
Batch convert all TypeScript files to JavaScript
Removes type annotations while preserving all logic
"""

import os
import re
from pathlib import Path

def convert_typescript_to_javascript(content):
    """Convert TypeScript content to JavaScript"""
    
    # Remove 'import type' statements
    content = re.sub(r'import\s+type\s+{[^}]*}\s+from\s+["\']([^"\']*)["\']', '', content)
    content = re.sub(r'import\s+type\s+\w+\s+from\s+["\']([^"\']*)["\']', '', content)
    
    # Remove type annotations from function parameters
    # e.g., (name: string) => (name)
    content = re.sub(r':\s*(?:string|number|boolean|any|void|React\.ReactNode|Readonly<[^>]*>|[A-Z]\w+(?:<[^>]*>)?)\s*(?=[,\)])', '', content)
    
    # Remove type annotations from variable declarations
    # e.g., const x: Type = value => const x = value
    content = re.sub(r':\s*(?:string|number|boolean|any|void|React\.ReactNode|Readonly<[^>]*>|[A-Z]\w+(?:<[^>]*>)?)\s*(?==)', '', content)
    
    # Remove interface declarations
    content = re.sub(r'interface\s+\w+\s*{[^}]*}', '', content, flags=re.DOTALL)
    
    # Remove type declarations
    content = re.sub(r'type\s+\w+\s*=\s*[^;]*;', '', content)
    
    # Remove 'as const' type assertions
    content = re.sub(r'\s+as\s+const', '', content)
    
    # Remove Readonly<> wrapper
    content = re.sub(r'Readonly<\{([^}]*)\}>', r'{ \1 }', content)
    
    # Remove generic type parameters from exports
    content = re.sub(r'export\s+const\s+(\w+):\s*\w+(?:<[^>]*>)?\s*=', r'export const \1 =', content)
    
    # Clean up multiple blank lines
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    return content

def process_file(file_path):
    """Process a single TypeScript file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Convert content
        converted = convert_typescript_to_javascript(content)
        
        # Create new file with .jsx or .js extension
        if file_path.endswith('.tsx'):
            new_path = file_path[:-4] + '.jsx'
        else:
            new_path = file_path[:-3] + '.js'
        
        # Write converted content
        with open(new_path, 'w', encoding='utf-8') as f:
            f.write(converted)
        
        print(f"✅ Converted: {file_path} → {new_path}")
        return True
    except Exception as e:
        print(f"❌ Error converting {file_path}: {str(e)}")
        return False

def main():
    """Main conversion function"""
    root_dir = Path('.')
    
    # Find all TypeScript files
    ts_files = list(root_dir.glob('**/*.ts')) + list(root_dir.glob('**/*.tsx'))
    
    # Exclude node_modules and already converted files
    ts_files = [f for f in ts_files if 'node_modules' not in str(f) and not str(f).endswith('.js') and not str(f).endswith('.jsx')]
    
    print(f"Found {len(ts_files)} TypeScript files to convert")
    print("=" * 60)
    
    converted = 0
    failed = 0
    
    for ts_file in sorted(ts_files):
        if process_file(str(ts_file)):
            converted += 1
        else:
            failed += 1
    
    print("=" * 60)
    print(f"Conversion complete!")
    print(f"✅ Converted: {converted} files")
    print(f"❌ Failed: {failed} files")
    print(f"Total: {converted + failed} files")

if __name__ == '__main__':
    main()

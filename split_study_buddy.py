#!/usr/bin/env python3
"""
Script to split the consolidated study-buddy-app newer.txt file into individual files.
Run with --dry-run flag to see what would be created without actually creating files.
"""

import os
import re
import argparse
from pathlib import Path
from typing import List, Tuple, Dict

class StudyBuddySplitter:
    def __init__(self, input_file: str, output_dir: str = "study-buddy", dry_run: bool = True):
        self.input_file = input_file
        self.output_dir = output_dir
        self.dry_run = dry_run
        self.files_to_create: List[Dict[str, any]] = []
        self.current_file = None
        self.current_content = []
        self.line_number = 0
        
    def parse_file(self):
        """Parse the consolidated file and extract individual files."""
        print(f"{'[DRY RUN] ' if self.dry_run else ''}Parsing {self.input_file}...")
        
        with open(self.input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        in_file_content = False
        code_block_delimiter_count = 0
        
        for i, line in enumerate(lines):
            self.line_number = i + 1
            
            # Check for file header (e.g., ## study-buddy/package.json)
            if line.startswith('## study-buddy/'):
                # Save previous file if exists
                if self.current_file:
                    self._save_current_file()
                
                # Extract file path
                file_path = line[15:].strip()  # Remove "## study-buddy/"
                self.current_file = file_path
                self.current_content = []
                in_file_content = False
                code_block_delimiter_count = 0
                
            # Check for separator line
            elif line.strip() == '---' and self.current_file:
                continue
                
            # Track code block delimiters
            elif line.strip().startswith('```'):
                code_block_delimiter_count += 1
                # First ``` after file header starts content
                if code_block_delimiter_count == 1:
                    in_file_content = True
                    # Skip the line with language identifier (e.g., ```json)
                    continue
                # Second ``` ends content
                elif code_block_delimiter_count == 2:
                    in_file_content = False
                    continue
                    
            # Collect file content
            elif in_file_content and self.current_file:
                self.current_content.append(line)
        
        # Save last file if exists
        if self.current_file:
            self._save_current_file()
    
    def _save_current_file(self):
        """Save the current file data to the files_to_create list."""
        if not self.current_file or not self.current_content:
            return
            
        self.files_to_create.append({
            'path': os.path.join(self.output_dir, self.current_file),
            'content': ''.join(self.current_content).rstrip() + '\n',
            'line_start': self.line_number - len(self.current_content) - 2
        })
    
    def create_files(self):
        """Create the actual files and directories."""
        print(f"\n{'[DRY RUN] ' if self.dry_run else ''}Processing {len(self.files_to_create)} files...\n")
        
        created_dirs = set()
        
        for file_info in self.files_to_create:
            file_path = Path(file_info['path'])
            
            # Create directory if needed
            dir_path = file_path.parent
            if dir_path not in created_dirs and str(dir_path) != '.':
                if self.dry_run:
                    print(f"[DRY RUN] Would create directory: {dir_path}")
                else:
                    dir_path.mkdir(parents=True, exist_ok=True)
                    print(f"Created directory: {dir_path}")
                created_dirs.add(dir_path)
            
            # Create file
            content_preview = file_info['content'][:100].replace('\n', '\\n')
            if len(file_info['content']) > 100:
                content_preview += "..."
                
            if self.dry_run:
                print(f"[DRY RUN] Would create file: {file_path}")
                print(f"          Size: {len(file_info['content'])} bytes")
                print(f"          Preview: {content_preview}")
                print(f"          Source lines: around {file_info['line_start']}")
                print()
            else:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(file_info['content'])
                print(f"Created file: {file_path} ({len(file_info['content'])} bytes)")
    
    def analyze_structure(self):
        """Analyze and display the project structure that would be created."""
        print(f"\n{'[DRY RUN] ' if self.dry_run else ''}Project Structure Analysis:")
        print("=" * 60)
        
        # Group files by directory
        dirs = {}
        for file_info in self.files_to_create:
            dir_path = os.path.dirname(file_info['path'])
            if dir_path not in dirs:
                dirs[dir_path] = []
            dirs[dir_path].append(os.path.basename(file_info['path']))
        
        # Display tree structure
        for dir_path in sorted(dirs.keys()):
            level = dir_path.count(os.sep)
            indent = "  " * level
            dir_name = os.path.basename(dir_path) if dir_path else "study-buddy (root)"
            print(f"{indent}{dir_name}/")
            
            for file_name in sorted(dirs[dir_path]):
                print(f"{indent}  {file_name}")
        
        # Summary statistics
        print("\nSummary:")
        print(f"  Total files: {len(self.files_to_create)}")
        print(f"  Total directories: {len(dirs)}")
        
        # File type breakdown
        extensions = {}
        for file_info in self.files_to_create:
            ext = Path(file_info['path']).suffix or 'no extension'
            extensions[ext] = extensions.get(ext, 0) + 1
        
        print("\nFile types:")
        for ext, count in sorted(extensions.items()):
            print(f"  {ext}: {count} file(s)")
    
    def validate_extraction(self):
        """Validate the extraction for potential issues."""
        print(f"\n{'[DRY RUN] ' if self.dry_run else ''}Validation Results:")
        print("=" * 60)
        
        issues = []
        
        # Check for empty files
        empty_files = [f['path'] for f in self.files_to_create if not f['content'].strip()]
        if empty_files:
            issues.append(f"Empty files detected: {', '.join(empty_files)}")
        
        # Check for duplicate file paths
        paths = [f['path'] for f in self.files_to_create]
        duplicates = [p for p in paths if paths.count(p) > 1]
        if duplicates:
            issues.append(f"Duplicate file paths: {', '.join(set(duplicates))}")
        
        # Check for very large files
        large_files = [(f['path'], len(f['content'])) for f in self.files_to_create if len(f['content']) > 50000]
        if large_files:
            for path, size in large_files:
                issues.append(f"Large file detected: {path} ({size} bytes)")
        
        if issues:
            print("⚠️  Issues found:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print("✅ No issues found!")
    
    def run(self):
        """Execute the splitting process."""
        try:
            self.parse_file()
            self.analyze_structure()
            self.validate_extraction()
            self.create_files()
            
            if self.dry_run:
                print(f"\n[DRY RUN COMPLETE] No files were created.")
                print(f"To actually create the files, run without --dry-run flag")
            else:
                print(f"\n✅ Successfully created {len(self.files_to_create)} files!")
                
        except Exception as e:
            print(f"\n❌ Error: {e}")
            if self.line_number:
                print(f"   Last processed line: {self.line_number}")
            raise


def main():
    parser = argparse.ArgumentParser(
        description='Split consolidated study-buddy file into individual project files'
    )
    parser.add_argument(
        'input_file',
        nargs='?',
        default='study-buddy-app newer.txt',
        help='Input file to split (default: study-buddy-app newer.txt)'
    )
    parser.add_argument(
        '-o', '--output-dir',
        default='study-buddy',
        help='Output directory for the project (default: study-buddy)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        default=True,
        help='Show what would be created without creating files (default: True)'
    )
    parser.add_argument(
        '--create',
        action='store_true',
        help='Actually create the files (overrides --dry-run)'
    )
    
    args = parser.parse_args()
    
    # If --create is specified, turn off dry-run
    if args.create:
        args.dry_run = False
    
    # Check if input file exists
    if not os.path.exists(args.input_file):
        print(f"❌ Error: Input file '{args.input_file}' not found!")
        return 1
    
    splitter = StudyBuddySplitter(
        input_file=args.input_file,
        output_dir=args.output_dir,
        dry_run=args.dry_run
    )
    
    splitter.run()
    return 0


if __name__ == '__main__':
    exit(main())
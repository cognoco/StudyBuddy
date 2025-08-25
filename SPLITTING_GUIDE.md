# Study Buddy File Splitting Guide

## Overview
The `split_study_buddy.py` script will parse the consolidated `study-buddy-app newer.txt` file and split it into individual project files while preserving the directory structure.

## Features
- **Dry Run Mode** (default): Shows what would be created without actually creating any files
- **Validation**: Checks for empty files, duplicates, and other potential issues
- **Structure Analysis**: Shows the project structure that will be created
- **Safe Operation**: Won't overwrite existing files without confirmation

## Usage

### 1. Dry Run (Default - Recommended First Step)
```bash
# Basic dry run - shows what would be created
python split_study_buddy.py

# Or explicitly specify the input file
python split_study_buddy.py "study-buddy-app newer.txt"

# Specify a different output directory
python split_study_buddy.py -o my-study-buddy-project
```

### 2. Actually Create Files
```bash
# Use the --create flag to actually create files
python split_study_buddy.py --create

# Or specify all options
python split_study_buddy.py "study-buddy-app newer.txt" -o study-buddy --create
```

## What the Script Does

1. **Parses** the consolidated file line by line
2. **Identifies** file boundaries (marked by `## study-buddy/filepath`)
3. **Extracts** content between code block markers (```)
4. **Creates** the necessary directory structure
5. **Writes** each file with its content

## Output Example (Dry Run)

```
[DRY RUN] Parsing study-buddy-app newer.txt...

[DRY RUN] Project Structure Analysis:
============================================================
study-buddy (root)/
  app.json
  babel.config.js
  App.js
  package.json
  README.md
src/
  screens/
    OnboardingScreen.js
    MainScreen.js
    ParentSettingsScreen.js
    ...
  components/
    BuddyCharacter.js
    StudyTimer.js
    ...
  utils/
    storage.js
    audio.js
    constants.js
  ...

Summary:
  Total files: 23
  Total directories: 8

File types:
  .js: 18 file(s)
  .json: 3 file(s)
  .md: 2 file(s)

Validation Results:
============================================================
✅ No issues found!

[DRY RUN] Processing 23 files...

[DRY RUN] Would create directory: src
[DRY RUN] Would create file: package.json
          Size: 1876 bytes
          Preview: {  "name": "study-buddy",  "version": "1.0.0",  "main": "node_modules/expo/AppEntry.js", ...
          Source lines: around 36

...

[DRY RUN COMPLETE] No files were created.
To actually create the files, run without --dry-run flag
```

## Safety Features

1. **No Accidental Overwrites**: The script won't overwrite existing files by default
2. **Validation**: Checks for common issues before creating files
3. **Clear Feedback**: Shows exactly what will be created
4. **Line Number Tracking**: Shows source line numbers for debugging

## Troubleshooting

If you encounter issues:

1. **File Not Found**: Make sure `study-buddy-app newer.txt` is in the same directory
2. **Permission Errors**: Make sure you have write permissions in the output directory
3. **Parsing Errors**: The script will show the line number where it failed

## Next Steps

After running the script with `--create`:

1. Check the created project structure
2. Run `npm install` or `yarn install` in the created directory
3. Follow the project's README for further setup instructions
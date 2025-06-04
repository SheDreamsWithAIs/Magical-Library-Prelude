# Chronicles of the Kethaneum - Manifest File System Documentation

## Overview
The manifest file system provides dynamic file discovery for game content while working within web environment limitations. Instead of hardcoding file paths throughout the codebase, we use centralized manifest files that list available content files.

## Manifest Files in Game
- **character-manifest.json** 
  - Lists the character data files for the dialogue manager.
  - **path:** /scripts/dialogue/characters
- **puzzle-manifest.json** (future)
  - Lists the word search puzzle data for the puzzle loader.
  - **path:** /scripts/data/puzzleData
- **story-event-manifest.json** (future)
  - Lists the files that store story events for the dialogue manager.
  - **path:** /scripts/dialogue/story-events


## Why Manifest Files?

### The Problem
JavaScript in web environments cannot directly scan directories to discover files. Traditional approaches often result in:
- Hardcoded file paths scattered throughout code
- Maintenance nightmares when adding new content
- No central inventory of available content
- Difficult content management

### The Solution
Manifest files provide:
- **Centralized file inventory** - One place to list all files
- **Dynamic discovery** - Code discovers files by reading manifests
- **Easy maintenance** - Adding new content requires updating one manifest entry
- **Clean architecture** - No hardcoded paths in logic code
- **Error resilience** - Missing files are handled gracefully

## Manifest File Structure

### Basic Format
Manifest files are simple JSON arrays containing filenames:

```json
[
  "filename1.json",
  "filename2.json", 
  "filename3.json"
]
```

### File Naming Convention
- Manifest files use the pattern: `[content-type]-manifest.json`
- Examples: `character-manifest.json`, `story-event-manifest.json`
- Store manifests in the same directory as the content they catalog

### Location Requirements
- Manifest files MUST be in the same directory as the content files they list
- This ensures relative paths remain consistent
- Makes content management intuitive (files and their catalog live together)

## Implementation Pattern

### 1. Create the Manifest File
```json
[
  "archivist-lumina.json",
  "keeper-valdris.json",
  "tester-testerson.json"
]
```

### 2. Load the Manifest
```javascript
async loadContentManifest() {
  try {
    const manifestPath = this.config.paths.contentDirectory + 'content-manifest.json';
    const response = await fetch(manifestPath);
    
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }
    
    const filenames = await response.json();
    
    // Validate manifest is an array
    if (!Array.isArray(filenames)) {
      throw new Error('Invalid manifest structure: expected array of filenames');
    }
    
    console.log(`Loaded manifest with ${filenames.length} files`);
    return filenames;
  } catch (error) {
    console.error('Error loading manifest:', error);
    
    // Return fallback array if needed
    return ["fallback-content.json"];
  }
}
```

### 3. Process Each File
```javascript
async loadContentFromManifest() {
  const filenames = await this.loadContentManifest();
  
  for (const filename of filenames) {
    try {
      const content = await this.loadAndValidateContentFile(filename);
      if (content) {
        // Process valid content
        this.processContent(content);
      }
    } catch (error) {
      console.warn(`Skipping invalid file: ${filename}`, error);
      // Continue processing other files
    }
  }
}
```

### 4. Graceful Error Handling
```javascript
async loadAndValidateContentFile(filename) {
  try {
    const response = await fetch(`${this.basePath}${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.status}`);
    }

    const content = await response.json();
    
    // Validate content structure
    if (!this.validateContent(content)) {
      throw new Error(`Invalid content structure in ${filename}`);
    }

    return content;
  } catch (error) {
    console.error(`Error loading file '${filename}':`, error);
    return null; // Return null for invalid files
  }
}
```

## Content Filtering

### Filter After Loading
The manifest system loads all files, then filters based on content properties:

```javascript
// Load all files from manifest
const allContent = await this.loadAllContentFromManifest();

// Filter by desired criteria
const filteredContent = allContent.filter(item => 
  item.category === desiredCategory && 
  item.active === true
);
```

### Benefits of This Approach
- **Separation of concerns**: Discovery vs. filtering are separate steps
- **Flexibility**: Can filter by any content property
- **Maintainability**: Filtering logic stays in code, file lists stay in manifests
- **Reusability**: Same manifest can serve multiple filtering needs

## Best Practices

### Manifest Maintenance
1. **Add new files to manifest immediately** when creating content
2. **Remove entries when deleting files** to avoid 404 errors
3. **Keep manifests in version control** alongside content files
4. **Document what each manifest catalogs** in this documentation.

### Error Handling Standards
1. **Always validate manifest structure** (expect array of strings)
2. **Provide fallback manifests** for critical content
3. **Log missing files** but continue processing valid ones
4. **Never crash the system** due to manifest loading failures

### Performance Considerations
1. **Load manifests once** and cache the results
2. **Process files asynchronously** but handle errors individually
3. **Consider lazy loading** for large content sets
4. **Validate content structure** before processing

## Example Implementations

### Character System (Current)
```
scripts/dialogue/characters/
├── character-manifest.json       # Lists all character files
├── archivist-lumina.json         # Character data
├── tester-testerson.json         # Character data
└── keeper-valdris.json           # Character data
```

**Manifest Content:**
```json
[
  "archivist-lumina.json",
  "tester-testerson.json", 
  "keeper-valdris.json"
]
```

### Story Events (Future)
```
scripts/dialogue/story-events/
├── story-event-manifest.json     # Lists all story event files
├── first-visit.json              # Story event data
├── book-completion.json          # Story event data
└── final-celebration.json        # Story event data
```

### Puzzle Data (Future Improvement)
```
scripts/data/puzzleData/
├── puzzle-manifest.json          # Lists all puzzle files
├── kethaneumPuzzles.json         # Puzzle data
├── naturePuzzles.json            # Puzzle data
└── fantasyPuzzles.json           # Puzzle data
```

## Migration from Hardcoded Paths

### Current Problem (puzzleLoader.js example)
```javascript
// Hardcoded paths scattered in code
const puzzlePaths = {
  'Kethaneum': 'scripts/data/puzzleData/kethaneumPuzzles.json',
  'nature': 'scripts/data/puzzleData/naturePuzzles.json'
};
```

### Manifest Solution
```javascript
// Clean discovery via manifest
const puzzleFiles = await this.loadPuzzleManifest();
const allPuzzles = await this.loadPuzzlesFromManifest(puzzleFiles);
const kethaneumPuzzles = allPuzzles.filter(p => p.genre === 'Kethaneum');
```

## Troubleshooting

### Common Issues

**"Manifest not found" errors:**
- Verify manifest file exists in correct directory
- Check file naming follows `[content-type]-manifest.json` pattern
- Ensure web server can serve JSON files

**"Invalid manifest structure" errors:**
- Confirm manifest contains valid JSON array
- Check for trailing commas or syntax errors
- Validate all entries are strings (filenames)

**"File not found" errors for listed files:**
- Remove missing files from manifest
- Check filename spelling and case sensitivity
- Verify file paths are relative to manifest location

**Performance issues:**
- Implement caching for frequently accessed manifests
- Consider lazy loading for large content sets
- Profile manifest loading in browser dev tools

### Testing Manifests

1. **Validate JSON syntax** using online JSON validators
2. **Test with missing files** to verify error handling
3. **Check with empty manifests** to test edge cases
4. **Verify fallback behavior** when manifest loading fails

## Future Enhancements

### Integration Opportunities
- **Asset management**: Extend pattern to images, audio, other assets
- **Localization**: Separate manifests for different languages
- **Modding support**: Allow external manifests for user content
- **Content updates**: Hot-reload content by refreshing manifests

## Summary

The manifest file system provides a clean, maintainable solution for dynamic content discovery in web games. By centralizing file inventories and implementing robust error handling, we can build scalable content management systems that grow gracefully with the project.

**Key Benefits:**
- Centralized content management
- Dynamic file discovery
- Graceful error handling
- Easy maintenance and updates
- Clean separation of concerns
- Reusable pattern across content types
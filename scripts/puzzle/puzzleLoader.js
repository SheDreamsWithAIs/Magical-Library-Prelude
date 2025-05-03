/**
 * Puzzle loader for Chronicles of the Kethaneum
 * This module handles loading puzzle data from JSON files
 */

import { handlePuzzleLoadError, handleInitialLoadErrors } from '../utils/errorHandler.js';

/**
 * Load puzzles from all available genres
 * @returns {Promise} - Promise resolving when all puzzles are loaded
 */
async function loadAllPuzzles() {
  console.log('Loading all puzzles...');
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  try {
    // Initialize puzzle storage if needed
    if (!state.puzzles) {
      state.puzzles = {};
    }
    
    // List of genre files to load
    const genreFiles = [
      { genre: 'Kethaneum', file: 'scripts/data/puzzleData/kethaneum.json' },
      { genre: 'nature', file: 'scripts/data/puzzleData/nature.json' }
      // Add more genres here as they become available
    ];
    
    // Load all genre files in parallel
    const loadPromises = genreFiles.map(genreInfo => loadGenrePuzzles(genreInfo.genre, genreInfo.file));
    
    // Wait for all puzzles to load
    await Promise.all(loadPromises);
    
    console.log('All puzzles loaded successfully');
    console.log('Available genres:', Object.keys(state.puzzles));
    
    // Build book-to-parts mapping for easier navigation
    buildBookPartsMapping();
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Set up error handling for initial load
    handleInitialLoadErrors(state);
    
    return state.puzzles;
  } catch (error) {
    console.error('Failed to load puzzles:', error);
    handlePuzzleLoadError(error);
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    return {};
  }
}

/**
 * Load puzzles from files with custom paths
 * @param {Object} puzzlePaths - Mapping of genre names to file paths
 * @returns {Promise} - Promise resolving when all puzzles are loaded
 */
async function loadAllPuzzlesWithPaths(puzzlePaths) {
  console.log('Loading puzzles with custom paths:', puzzlePaths);
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  try {
    // Initialize puzzle storage if needed
    if (!state.puzzles) {
      state.puzzles = {};
    }
    
    // Load all genres in parallel
    const loadPromises = Object.entries(puzzlePaths).map(([genre, filePath]) => 
      loadGenrePuzzles(genre, filePath)
    );
    
    // Wait for all puzzles to load
    await Promise.all(loadPromises);
    
    console.log('All puzzles loaded successfully');
    console.log('Available genres:', Object.keys(state.puzzles));
    
    // Build book-to-parts mapping for easier navigation
    buildBookPartsMapping();
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Set up error handling for initial load
    handleInitialLoadErrors(state);
    
    return state.puzzles;
  } catch (error) {
    console.error('Failed to load puzzles:', error);
    handlePuzzleLoadError(error);
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    return {};
  }
}

/**
 * Load puzzles for a specific genre
 * @param {string} genre - Genre name
 * @param {string} filePath - Path to JSON file
 * @returns {Promise} - Promise resolving when puzzles are loaded
 */
async function loadGenrePuzzles(genre, filePath) {
  try {
    console.log(`Loading puzzles for genre: ${genre} from ${filePath}`);
    
    // Fetch the puzzle data
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to load puzzles for ${genre}: ${response.status} ${response.statusText}`);
    }
    
    // Parse the JSON data
    const puzzleData = await response.json();
    
    if (!Array.isArray(puzzleData) || puzzleData.length === 0) {
      throw new Error(`No valid puzzles found for genre: ${genre}`);
    }
    
    // Initialize genre in state if needed
    if (!state.puzzles[genre]) {
      state.puzzles[genre] = [];
    }
    
    // Process and store each puzzle
    puzzleData.forEach(puzzle => {
      // Make sure puzzle has required fields
      if (!puzzle.title || !puzzle.book || !puzzle.words || !Array.isArray(puzzle.words)) {
        console.warn(`Skipping invalid puzzle in ${genre}:`, puzzle);
        return;
      }
      
      // Make sure puzzle has storyPart information (default to introduction)
      if (puzzle.storyPart === undefined) {
        puzzle.storyPart = 0;
      }
      
      // Add the puzzle to the state
      state.puzzles[genre].push(puzzle);
    });
    
    console.log(`Loaded ${state.puzzles[genre].length} puzzles for genre: ${genre}`);
    return state.puzzles[genre];
  } catch (error) {
    console.error(`Error loading puzzles for genre ${genre}:`, error);
    
    // Initialize empty array for this genre to prevent future errors
    if (!state.puzzles[genre]) {
      state.puzzles[genre] = [];
    }
    
    // Re-throw error for central handling
    throw error;
  }
}

/**
 * Build a mapping of books to their available story parts
 * Makes navigation and book completion checking more efficient
 */
function buildBookPartsMapping() {
  // Create/reset the mapping
  state.bookPartsMap = {};
  
  // Go through all genres and puzzles
  for (const genre in state.puzzles) {
    const puzzlesInGenre = state.puzzles[genre];
    
    puzzlesInGenre.forEach(puzzle => {
      const book = puzzle.book;
      const part = puzzle.storyPart;
      
      // Initialize book entry if needed
      if (!state.bookPartsMap[book]) {
        state.bookPartsMap[book] = new Set();
      }
      
      // Add this part to the set
      state.bookPartsMap[book].add(part);
    });
  }
  
  // Convert Sets to Arrays for easier handling
  for (const book in state.bookPartsMap) {
    state.bookPartsMap[book] = Array.from(state.bookPartsMap[book]).sort((a, b) => a - b);
  }
  
  console.log('Book parts mapping created:', state.bookPartsMap);
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.loadAllPuzzles = loadAllPuzzles;
window.loadGenrePuzzles = loadGenrePuzzles;
window.buildBookPartsMapping = buildBookPartsMapping;

// Export functions for module system
export {
  loadAllPuzzles,
  loadGenrePuzzles,
  buildBookPartsMapping,
  loadAllPuzzlesWithPaths 
};
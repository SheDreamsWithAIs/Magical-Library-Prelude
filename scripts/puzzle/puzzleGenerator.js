/**
 * Puzzle Generator for Chronicles of the Kethaneum
 * This module handles creating word search puzzles and placing words
 */

import { handleGridGenerationError, handlePuzzleInitializationError } from '../utils/errorHandler.js';
import { shuffleArray } from '../utils/mathUtils.js';
import * as Config from '../core/config.js';
import * as GameState from '../core/gameState.js';
import * as RenderSystem from '../ui/renderSystem.js';
import * as InputHandler from '../interaction/inputHandler.js';
import * as SaveSystem from '../core/saveSystem.js';
import { navigateToScreen } from '../ui/navigation.js';
import { createSeededRandom } from '../utils/mathUtils.js';

/**
 * Generate word search grid
 * @param {Array} words - Words to place in the grid
 * @returns {Array} - 2D array representing the grid
 */
function generateGrid(words) {
  try {
    // Get game state and config
    const state = GameState.getGameState();
    const config = Config.getConfig();
    
    // Create a seeded random generator
    const projectSeed = "Kethaneum".split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = createSeededRandom(projectSeed + Date.now() % 10000);
    
    // Get grid size from config
    const gridSize = config.gridSize || 10;
    
    // Validate directions array
    const validDirections = verifyDirections(config.directions);
    
    // Ensure valid words array
    const validWords = words
      .filter(word => word && typeof word === 'string' && word.length > 0)
      .map(word => word.toUpperCase());
    
    if (validWords.length === 0) {
      throw new Error("No valid words provided for grid generation");
    }
    
    // Sort words by length (longest first for easier placement)
    const sortedWords = [...validWords].sort((a, b) => b.length - a.length);

    // Create empty grid filled with empty spaces
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));

    // Track word placements for state
    const placements = [];

    // Try to place each word
    for (const word of sortedWords) {
      console.log(`Attempting to place word: ${word}`);
      let placed = false;
      let attempts = 0;
      const maxRandomAttempts = 100;

      // PHASE 1: Try random placement
      while (!placed && attempts < maxRandomAttempts) {
        attempts++;

        // Random starting position using seeded random
        const row = Math.floor(seededRandom() * gridSize);
        const col = Math.floor(seededRandom() * gridSize);

        // Random direction
        const dirIndex = Math.floor(seededRandom() * validDirections.length);
        const [dRow, dCol] = validDirections[dirIndex];

        // Check if word fits in this position and direction
        if (canPlaceWord(grid, word, row, col, dRow, dCol, gridSize)) {
          // Place the word
          placeWord(grid, word, row, col, dRow, dCol);

          // Track placement for game state
          placements.push({
            word,
            found: false,
            row,
            col,
            direction: [dRow, dCol]
          });

          placed = true;
          console.log(`Successfully placed word: ${word} after ${attempts} random attempts`);
        }
      }
      
      // PHASE 2: If random placement failed, try systematic placement
      if (!placed) {
        console.warn(`Random placement failed for "${word}" - trying systematic placement`);
        
        // Try each position and direction systematically
        for (let r = 0; r < gridSize && !placed; r++) {
          for (let c = 0; c < gridSize && !placed; c++) {
            for (const [dRow, dCol] of validDirections) {
              if (canPlaceWord(grid, word, r, c, dRow, dCol, gridSize)) {
                placeWord(grid, word, r, c, dRow, dCol);
                placements.push({
                  word,
                  found: false,
                  row: r,
                  col: c,
                  direction: [dRow, dCol]
                });
                placed = true;
                console.log(`Successfully placed word: ${word} using systematic placement at [${r},${c}]`);
                break;
              }
            }
          }
        }
      }

      // If still not placed after both attempts, throw error
      if (!placed) {
        throw new Error(`Could not place word: ${word} after random and systematic attempts`);
      }
    }

    // Save word placements to game state
    state.wordList = placements;

    // Fill remaining empty cells with random letters
    fillEmptyCells(grid);
    
    console.log("Grid generation successful with", placements.length, "words placed");

    return grid;
  } catch (error) {
    // Use the error handler function
    return handleGridGenerationError(error, words, Config.getConfig(), fillEmptyCells);
  }
}

/**
 * Helper function to verify directions array integrity
 * @param {Array} directions - Array of direction vectors
 * @returns {Array} - Validated directions array
 */
function verifyDirections(directions) {
  // Default directions if missing or invalid
  const defaultDirections = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1]   // diagonal up-right
  ];
  
  // Verify directions array is valid
  if (!Array.isArray(directions) || directions.length === 0) {
    console.warn('Invalid directions array, using defaults');
    return defaultDirections;
  }
  
  // Verify each direction is valid
  const validDirections = directions.filter(dir => 
    Array.isArray(dir) && dir.length === 2 && 
    Number.isInteger(dir[0]) && Number.isInteger(dir[1]) &&
    (dir[0] !== 0 || dir[1] !== 0) // Prevent [0,0] direction
  );
  
  if (validDirections.length === 0) {
    console.warn('No valid directions found, using defaults');
    return defaultDirections;
  }
  
  return validDirections;
}

/**
 * Check if a word can be placed at the given position and direction
 * @param {Array} grid - The grid
 * @param {string} word - Word to place
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {number} dRow - Row direction
 * @param {number} dCol - Column direction
 * @param {number} gridSize - Size of the grid
 * @returns {boolean} - Whether word can be placed
 */
function canPlaceWord(grid, word, row, col, dRow, dCol, gridSize) {
  const length = word.length;

  // Check if word goes out of bounds
  const endRow = row + (length - 1) * dRow;
  const endCol = col + (length - 1) * dCol;

  if (
    endRow < 0 || endRow >= gridSize ||
    endCol < 0 || endCol >= gridSize
  ) {
    return false;
  }

  // Check if cells are empty or match the word's letters
  for (let i = 0; i < length; i++) {
    const r = row + i * dRow;
    const c = col + i * dCol;

    if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Place a word on the grid
 * @param {Array} grid - The grid
 * @param {string} word - Word to place
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {number} dRow - Row direction
 * @param {number} dCol - Column direction
 */
function placeWord(grid, word, row, col, dRow, dCol) {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dRow;
    const c = col + i * dCol;
    grid[r][c] = word[i];
  }
}

/**
 * Fill empty cells with random letters
 * @param {Array} grid - The grid to fill
 */
function fillEmptyCells(grid) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const gridSize = grid.length;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === '') {
        const randomIndex = Math.floor(Math.random() * letters.length);
        grid[row][col] = letters[randomIndex];
      }
    }
  }
}

/**
 * Get distinctive patterns for a word that a human might notice
 * This helps make the grid scanning more human-like
 * @param {string} word - Word to find patterns for
 * @returns {Array} - Array of distinctive patterns
 */
function getDistinctivePatterns(word) {
  const patterns = [];
  const length = word.length;
  
  // Add distinctive consonant clusters - often easier to spot
  // Common consonant clusters that stand out in word searches
  const clusters = ['TH', 'CH', 'SH', 'PH', 'WH', 'GH', 'CK', 'NG', 'QU', 'SP', 'ST', 'TR', 'PL', 'CR'];
  for (const cluster of clusters) {
    const index = word.toUpperCase().indexOf(cluster);
    if (index !== -1) {
      // Found a cluster, add a pattern around it (3-4 letters including the cluster)
      const startIdx = Math.max(0, index - 1);
      const endIdx = Math.min(length, index + cluster.length + 1);
      patterns.push(word.substring(startIdx, endIdx));
    }
  }
  
  // Look for unusual letters that stand out (Q, Z, X, J, K)
  const unusualLetters = ['Q', 'Z', 'X', 'J', 'K'];
  for (const letter of unusualLetters) {
    const index = word.toUpperCase().indexOf(letter);
    if (index !== -1) {
      // Found an unusual letter, add a pattern around it
      const startIdx = Math.max(0, index - 1);
      const endIdx = Math.min(length, index + 2);
      patterns.push(word.substring(startIdx, endIdx));
    }
  }
  
  // Add end of word (often more distinctive)
  if (length >= 3) {
    patterns.push(word.substring(length - 3));
  }
  if (length >= 2) {
    patterns.push(word.substring(length - 2));
  }
  
  // Add beginning of word
  if (length >= 3) {
    patterns.push(word.substring(0, 3));
  }
  if (length >= 2) {
    patterns.push(word.substring(0, 2));
  }
  
  // Add middle section if word is long enough
  if (length >= 5) {
    const middleStart = Math.floor(length / 2) - 1;
    patterns.push(word.substring(middleStart, middleStart + 3));
  }
  
  // If word is very short, just use the whole word
  if (length <= 3) {
    patterns.push(word);
  }
  
  // If no patterns were found (unlikely), use single letters
  if (patterns.length === 0) {
    for (let i = 0; i < length; i++) {
      patterns.push(word[i]);
    }
  }
  
  // Prioritize longer patterns first
  patterns.sort((a, b) => b.length - a.length);
  
  // Remove duplicates
  return [...new Set(patterns)];
}

/**
 * Initialize a puzzle with the provided data
 * @param {Object} puzzleData - Puzzle configuration
 */
function initializePuzzle(puzzleData) {
  try {
    console.log('Initializing puzzle with data:', puzzleData);
    
    // Get state and config
    const state = GameState.getGameState();
    const config = Config.getConfig();
    
    // Basic validation
    if (!puzzleData) {
      throw new Error("Cannot initialize puzzle with null data");
    }
    
    if (!puzzleData.words || !Array.isArray(puzzleData.words) || puzzleData.words.length === 0) {
      throw new Error("Puzzle has no words to find");
    }
    
    // Reset game state
    state.wordList = [];
    state.selectedCells = [];
    state.startCell = null;
    state.currentCell = null;
    state.timeRemaining = config.timeLimit;
    state.paused = true;
    state.gameOver = false;

    // Set current book and story part
    state.currentBook = puzzleData.book || puzzleData.title;
    state.currentStoryPart = puzzleData.storyPart !== undefined ? puzzleData.storyPart : 0;

    // Ensure discoveredBooks is initialized
    if (!state.discoveredBooks || !(state.discoveredBooks instanceof Set)) {
      console.warn('discoveredBooks not initialized properly in initializePuzzle - creating new Set');
      state.discoveredBooks = new Set();
    }
    
    // Check if this book is already discovered
    const bookAlreadyDiscovered = state.discoveredBooks.has(state.currentBook);
    
    // If not already discovered, add it and update count
    if (!bookAlreadyDiscovered) {
      state.discoveredBooks.add(state.currentBook);
      state.completedBooks = state.discoveredBooks.size;
      
      console.log(`Added "${state.currentBook}" to discoveredBooks. New count:`, state.completedBooks);
      
      // Save progress immediately to ensure this discovery persists
      try {
        SaveSystem.saveGameProgress();
      } catch (saveError) {
        console.warn('Failed to save after book discovery:', saveError);
      }
    }

    // Update UI
    try {
      // Set book title and show story part
      const bookTitle = document.getElementById('book-title');
      if (bookTitle) {
        bookTitle.textContent = `${puzzleData.title} (${getStoryPartName(state.currentStoryPart)})`;
      }

      // Set story excerpt
      const storyExcerpt = document.getElementById('story-excerpt');
      if (storyExcerpt) {
        storyExcerpt.textContent = puzzleData.storyExcerpt || "No story excerpt available.";
      }
    } catch (uiError) {
      console.warn("UI update error:", uiError);
      // Non-critical error, continue with initialization
    }

    // Filter and prepare words
    const validWords = puzzleData.words
      .filter(word => word.length >= config.minWordLength && word.length <= config.maxWordLength)
      .map(word => word.toUpperCase())
      .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
      .slice(0, config.maxWords);

    if (validWords.length === 0) {
      throw new Error('No valid words provided after filtering');
    }

    // Generate grid with words
    state.grid = generateGrid(validWords);

    // Render UI
    try {
      RenderSystem.renderGrid();
      RenderSystem.renderWordList();
      RenderSystem.renderTimer();
      
      // Key addition: Set up event listeners for the puzzle
      console.log('Setting up puzzle event listeners');
      InputHandler.setupPuzzleEventListeners();
      console.log('Puzzle event listeners set up successfully');
    } catch (renderError) {
      console.error('Render error:', renderError);
      throw new Error(`Failed to render puzzle: ${renderError.message}`);
    }
    
    console.log('Puzzle initialization complete');
    return true;
  } catch (error) {
    // Handle errors in puzzle initialization
    console.error('Puzzle initialization error:', error);
    handlePuzzleInitializationError(error, navigateToScreen);
    return false;
  }
}

/**
 * Get the name of a story part from its index
 * @param {number} value - Story part index
 * @returns {string} - Human-readable name of the story part
 */
function getStoryPartName(value) {
  switch (value) {
    case 0: return "The Hook/Introduction";
    case 1: return "Rising Action/Complication";
    case 2: return "Midpoint Twist";
    case 3: return "Climactic Moment";
    case 4: return "Resolution/Epilogue";
    default: return "Unknown";
  }
}

// Export functions for module system
export {
  generateGrid,
  canPlaceWord,
  placeWord,
  fillEmptyCells,
  getDistinctivePatterns,
  initializePuzzle,
  getStoryPartName,
  verifyDirections
};
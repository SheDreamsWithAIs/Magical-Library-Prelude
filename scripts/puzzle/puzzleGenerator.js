/**
 * Puzzle Generator for Chronicles of the Kethaneum
 * This module handles creating word search puzzles and placing words
 */

import { handleGridGenerationError } from '../utils/errorHandler.js';
import { shuffleArray } from '../utils/mathUtils.js';

/**
 * Generate word search grid
 * @param {Array} words - Words to place in the grid
 * @returns {Array} - 2D array representing the grid
 */
function generateGrid(words) {
  try {
    // Get grid size from config
    const gridSize = window.config?.gridSize || 10;
    
    // Sort words by length (longest first for easier placement)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    // Create empty grid filled with empty spaces
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));

    // Track word placements for state
    const placements = [];

    // Try to place each word
    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loops

      while (!placed && attempts < maxAttempts) {
        attempts++;

        // Random starting position
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        // Random direction
        const dirIndex = Math.floor(Math.random() * window.config.directions.length);
        const [dRow, dCol] = window.config.directions[dirIndex];

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
        }
      }

      if (!placed) {
        throw new Error(`Could not place word: ${word}`);
      }
    }

    // Save word placements to game state
    window.state.wordList = placements;

    // Fill remaining empty cells with random letters
    fillEmptyCells(grid);

    return grid;
  } catch (error) {
    // Use the error handler function
    return handleGridGenerationError(error, words, window.config, fillEmptyCells);
  }
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
    // Basic validation
    if (!puzzleData) {
      throw new Error("Cannot initialize puzzle with null data");
    }
    
    if (!puzzleData.words || !Array.isArray(puzzleData.words) || puzzleData.words.length === 0) {
      throw new Error("Puzzle has no words to find");
    }
    
    // Reset game state
    window.state.wordList = [];
    window.state.selectedCells = [];
    window.state.startCell = null;
    window.state.currentCell = null;
    window.state.timeRemaining = window.config.timeLimit;
    window.state.paused = true;
    window.state.gameOver = false;

    // Set current book and story part
    window.state.currentBook = puzzleData.book || puzzleData.title;
    window.state.currentStoryPart = puzzleData.storyPart !== undefined ? puzzleData.storyPart : 0;

    // Ensure discoveredBooks is initialized
    if (!window.state.discoveredBooks || !(window.state.discoveredBooks instanceof Set)) {
      console.warn('discoveredBooks not initialized properly in initializePuzzle - creating new Set');
      window.state.discoveredBooks = new Set();
    }
    
    // Check if this book is already discovered
    const bookAlreadyDiscovered = window.state.discoveredBooks.has(window.state.currentBook);
    
    // If not already discovered, add it and update count
    if (!bookAlreadyDiscovered) {
      window.state.discoveredBooks.add(window.state.currentBook);
      window.state.completedBooks = window.state.discoveredBooks.size;
      
      console.log(`Added "${window.state.currentBook}" to discoveredBooks. New count:`, window.state.completedBooks);
      
      // Save progress immediately to ensure this discovery persists
      try {
        window.saveGameProgress();
      } catch (saveError) {
        console.warn('Failed to save after book discovery:', saveError);
      }
    }

    // Update UI
    try {
      // Set book title and show story part
      const bookTitle = document.getElementById('book-title');
      if (bookTitle) {
        bookTitle.textContent = `${puzzleData.title} (${getStoryPartName(window.state.currentStoryPart)})`;
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
      .filter(word => word.length >= window.config.minWordLength && word.length <= window.config.maxWordLength)
      .map(word => word.toUpperCase())
      .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
      .slice(0, window.config.maxWords);

    if (validWords.length === 0) {
      throw new Error('No valid words provided after filtering');
    }

    // Generate grid with words
    window.state.grid = generateGrid(validWords);

    // Render UI
    try {
      window.renderGrid();
      window.renderWordList();
      window.renderTimer();
    } catch (renderError) {
      throw new Error(`Failed to render puzzle: ${renderError.message}`);
    }
    
    return true;
  } catch (error) {
    // Handle errors in puzzle initialization
    window.handlePuzzleInitializationError(error, window.navigateToScreen);
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

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.generateGrid = generateGrid;
window.canPlaceWord = canPlaceWord;
window.placeWord = placeWord;
window.fillEmptyCells = fillEmptyCells;
window.getDistinctivePatterns = getDistinctivePatterns;
window.initializePuzzle = initializePuzzle;
window.getStoryPartName = getStoryPartName;

// Export functions for module system
export {
  generateGrid,
  canPlaceWord,
  placeWord,
  fillEmptyCells,
  getDistinctivePatterns,
  initializePuzzle,
  getStoryPartName
};
/**
 * Game State for Chronicles of the Kethaneum
 * This module handles the core game state and initialization
 */

import { loadAllPuzzles } from '../puzzle/puzzleLoader.js';
import { loadGameProgress } from './saveSystem.js';

// Define the base state with default values
const baseState = {
  currentScreen: 'title-screen',
  grid: [],             // 2D array of characters
  wordList: [],         // Array of word objects {word, found, row, col, direction}
  selectedCells: [],    // Currently selected cells
  startCell: null,      // Starting cell of current selection
  currentCell: null,    // Current cell in selection
  timer: null,          // Timer reference
  timeRemaining: 0,     // Seconds remaining
  paused: false,        // Game paused state
  gameOver: false,      // Game over flag
  puzzles: {},          // All available puzzles by genre
  currentGenre: '',     // Current selected genre
  currentPuzzleIndex: -1, // Index of current puzzle
  completedPuzzles: 0,   // Track number of completed puzzles
  lastUncompletedPuzzle: null, // Store {book, part, genre} for puzzles exited early

  // Book tracking
  books: {},            // Object to track books and their completion: { bookTitle: [bool, bool, bool, bool, bool] }
  currentBook: '',      // Current book being worked on
  currentStoryPart: -1, // Current story part (0-4)
  completedBooks: 0,     // Track number of completed books
  discoveredBooks: new Set(), // Set to track unique books discovered
  bookProgress: {}, // Tracks the next story part to show for each book
  bookPartsMap: {}, // Maps books to their available parts
};

/**
 * Initialize the game state object with default values
 */
function initializeGameState() {
  // Create a global state object 
  window.state = { ...baseState };
  
  // Initialize discoveredBooks as a Set
  window.state.discoveredBooks = new Set();
  
  
  return window.state;
}

/**
 * Get the current game state
 * @returns {Object} - The current game state
 */
function getGameState() {
  return window.state;
}

/**
 * Check if the game is in a playable state
 * @returns {boolean} - Whether game is ready to play
 */
function isGameReady() {
  const state = getGameState();
  
  // Check if puzzles are loaded
  const puzzlesLoaded = state.puzzles && 
                       Object.keys(state.puzzles).length > 0 &&
                       Object.values(state.puzzles).some(genre => genre.length > 0);
  
  return puzzlesLoaded;
}

/**
 * Update a specific property in the game state
 * @param {string} property - Property name
 * @param {any} value - New value
 */
function updateGameState(property, value) {
  if (window.state) {
    window.state[property] = value;
  }
}

/**
 * Restore a saved game state
 * @param {Object} savedState - Saved game state to restore
 */
function restoreGameState(savedState) {
  // Only restore known properties to avoid corruption
  for (const key in savedState) {
    if (key in baseState) {
      // Special handling for the discoveredBooks Set
      if (key === 'discoveredBooks') {
        if (Array.isArray(savedState.discoveredBooks)) {
          window.state.discoveredBooks = new Set(savedState.discoveredBooks);
        }
      } else {
        window.state[key] = savedState[key];
      }
    }
  }
  
  // Ensure discoveredBooks is a Set
  if (!(window.state.discoveredBooks instanceof Set)) {
    window.state.discoveredBooks = new Set();
  }
  
  // Ensure completedBooks matches the size of discoveredBooks
  window.state.completedBooks = window.state.discoveredBooks.size;
  
}

/**
 * Fully initialize the game, loading all required data
 * @returns {Promise} - Promise that resolves when game is fully initialized
 */
async function initializeGame() {
  // Initialize base state
  initializeGameState();
  
  // Load saved progress if available
  loadGameProgress();
  
  // Load puzzle data
  try {
    await loadAllPuzzles();
  } catch (error) {
    console.error('Error loading game data:', error);
  }
  
  return window.state;
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.initializeGameState = initializeGameState;
window.getGameState = getGameState;
window.isGameReady = isGameReady;
window.updateGameState = updateGameState;
window.restoreGameState = restoreGameState;
window.initializeGame = initializeGame;

// Export functions for module system
export {
  initializeGameState,
  getGameState,
  isGameReady,
  updateGameState,
  restoreGameState,
  initializeGame,
  baseState
};
/**
 * Save system for Chronicles of the Kethaneum
 * This module handles saving and loading game progress
 */

import { handleSaveError } from '../utils/errorHandler.js';
import { validateGameState } from '../ui/navigation.js';

/**
 * Save game progress to local storage
 */
function saveGameProgress() {
  try {
    // Ensure discoveredBooks exists and is a Set
    if (!state.discoveredBooks || !(state.discoveredBooks instanceof Set)) {
      console.warn('discoveredBooks is not a Set during save - reinitializing');
      state.discoveredBooks = new Set();
    }

    // Always update completedBooks based on the actual set size
    state.completedBooks = state.discoveredBooks.size;

    // Create a clean progress object with only the data we need
    const progress = {
      completedPuzzles: state.completedPuzzles,
      completedBooks: state.completedBooks,
      books: JSON.parse(JSON.stringify(state.books)), // Deep copy to avoid reference issues
      discoveredBooks: Array.from(state.discoveredBooks), // Convert Set to Array
      bookProgress: JSON.parse(JSON.stringify(state.bookProgress || {})), // Deep copy
      lastUncompletedPuzzle: state.lastUncompletedPuzzle ?
        JSON.parse(JSON.stringify(state.lastUncompletedPuzzle)) : null
    };

 

    // Save to localStorage
    localStorage.setItem('kethaneumProgress', JSON.stringify(progress));
    console.log('Game progress saved successfully');
  } catch (error) {
    console.error('Error during saveGameProgress:', error);
    handleSaveError(error);
  }
}

/**
 * Load game progress from local storage
 */
function loadGameProgress() {
  try {
    // Start with a clean state
    resetGameState(false); // Don't clear localStorage, just reset in-memory state

    const savedProgress = localStorage.getItem('kethaneumProgress');
    if (!savedProgress) {
      console.log('No saved progress found');
      return;
    }

    // Parse the saved data
    const progress = JSON.parse(savedProgress);

    // First, initialize the primitive values
    state.completedPuzzles = progress.completedPuzzles || 0;

    // Then, initialize the Set with the saved array
    if (progress.discoveredBooks && Array.isArray(progress.discoveredBooks)) {
      // Create a new Set with the array contents
      state.discoveredBooks = new Set(progress.discoveredBooks);

    } else {
      console.warn('No valid discoveredBooks array in saved data - using empty set');
      state.discoveredBooks = new Set();
    }

    // Set completedBooks based on the actual Set size, not the saved value
    state.completedBooks = state.discoveredBooks.size;

    // Load other objects (with proper validation)
    state.books = progress.books || {};
    state.bookProgress = progress.bookProgress || {};
    state.lastUncompletedPuzzle = progress.lastUncompletedPuzzle || null;

    // Update display if on Book of Passage screen
    if (state.currentScreen === 'book-of-passage-screen' && 
        typeof updateBookOfPassageProgress === 'function') {
      updateBookOfPassageProgress();
    }
  } catch (error) {
    console.error('Failed to load game progress:', error);

    // If loading fails, reset to a clean state
    resetGameState(false);
  }
}

/**
 * Reset the game state
 * @param {boolean} fullReset - Whether to clear localStorage (true) or just reset memory state (false)
 */
function resetGameState(fullReset = false) {

  // If it's a full reset, clear localStorage
  if (fullReset) {
    localStorage.removeItem('kethaneumProgress');
  }

  // Create new objects/collections to avoid reference issues
  state.books = {};
  state.lastUncompletedPuzzle = null;
  state.bookProgress = {};

  // Always create a new Set to avoid any reference issues
  state.discoveredBooks = new Set();

  // Reset counters
  state.completedPuzzles = 0;
  state.completedBooks = 0;
}

/**
 * Clear all game progress
 */
function clearGameProgress() {
  try {
    // Clear localStorage
    localStorage.removeItem('kethaneumProgress');

    // Reset state variables
    state.completedPuzzles = 0;
    state.completedBooks = 0;
    state.books = {};
    state.discoveredBooks = new Set(); // Initialize as empty Set
    state.bookProgress = {};
    state.lastUncompletedPuzzle = null;
    
    // Reset game state with full reset
    resetGameState(true);
  } catch (error) {
    console.error('Failed to clear game progress:', error);
  }
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.saveGameProgress = saveGameProgress;
window.loadGameProgress = loadGameProgress;
window.resetGameState = resetGameState;
window.clearGameProgress = clearGameProgress;

// Export functions for module system
export {
  saveGameProgress,
  loadGameProgress,
  resetGameState,
  clearGameProgress
};
/**
 * Game Logic module for Chronicles of the Kethaneum
 * This module handles game mechanics, rules, and flow
 */

import { handleSelectionError } from '../utils/errorHandler.js';
import { showWinPanel, showLosePanel } from '../ui/panelManager.js';
import { navigateToScreen } from '../ui/navigation.js';
import { saveGameProgress } from '../core/saveSystem.js';
import { markCellsAsCorrect } from '../ui/renderSystem.js';

/**
 * Check if the selected cells form a word in the puzzle
 * @returns {boolean} - Whether a word was found
 */
function checkForWord() {
  try {
    const state = window.state;
    const config = window.config;
    
    if (state.selectedCells.length < config.minWordLength) return false;
    
    // Extract the word from selected cells
    const selectedWord = state.selectedCells.map(cell => cell.textContent).join('');
    
    // Get start and end coordinates
    const startRow = parseInt(state.selectedCells[0].dataset.row);
    const startCol = parseInt(state.selectedCells[0].dataset.col);
    const endRow = parseInt(state.selectedCells[state.selectedCells.length - 1].dataset.row);
    const endCol = parseInt(state.selectedCells[state.selectedCells.length - 1].dataset.col);
    
    // Calculate direction
    const dRow = endRow === startRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
    const dCol = endCol === startCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
    
    // Check against word list
    for (const wordData of state.wordList) {
      if (wordData.found) continue;
      
      // Check if word matches in either direction
      if (
        (selectedWord === wordData.word &&
          startRow === wordData.row &&
          startCol === wordData.col &&
          dRow === wordData.direction[0] &&
          dCol === wordData.direction[1]) ||
        (selectedWord === wordData.word.split('').reverse().join('') &&
          endRow === wordData.row &&
          endCol === wordData.col &&
          dRow === -wordData.direction[0] &&
          dCol === -wordData.direction[1])
      ) {
        // Mark word as found
        markWordAsFound(wordData);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    handleSelectionError(error, 'check-word');
    return false;
  }
}

/**
 * Mark a word as found and update the UI
 * @param {Object} wordData - Word data object
 * @returns {boolean} - Success
 */
function markWordAsFound(wordData) {
  try {
    const state = window.state;
    
    // Mark word as found
    wordData.found = true;
    
    // Mark cells as correctly found
    markCellsAsCorrect(state.selectedCells);
    
    // Update word list display - desktop
    const wordListElement = document.getElementById('word-list');
    if (wordListElement) {
      const listItems = wordListElement.querySelectorAll('li');
      for (const item of listItems) {
        if (item.textContent === wordData.word) {
          item.classList.add('found');
          break;
        }
      }
    }
    
    // Update mobile word list if it exists
    const mobileWordList = document.getElementById('mobile-word-list');
    if (mobileWordList) {
      const mobileItems = mobileWordList.querySelectorAll('li');
      for (const item of mobileItems) {
        if (item.textContent === wordData.word) {
          item.classList.add('found');
          break;
        }
      }
    }
    
    // Trigger haptic feedback on mobile if available
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short 50ms vibration
    }
    
    // Check if all words are found
    checkWinCondition();
    
    return true;
  } catch (error) {
    handleSelectionError(error, 'mark-word');
    return false;
  }
}

/**
 * Check if all words have been found to trigger win condition
 */
function checkWinCondition() {
  try {
    const state = window.state;
    const allWordsFound = state.wordList.every(wordData => wordData.found);
    
    if (allWordsFound) {
      // End the game with a win
      endGame(true);
    }
  } catch (error) {
    handleSelectionError(error, 'check-win');
  }
}

/**
 * End the game
 * @param {boolean} isWin - Whether the game ended in a win
 */
function endGame(isWin) {
  try {
    const state = window.state;
    
    // Stop the timer
    clearInterval(state.timer);
    state.gameOver = true;
    
    if (isWin) {
      // Clear any saved uncompleted puzzle since this one is now complete
      if (state.lastUncompletedPuzzle &&
          state.lastUncompletedPuzzle.book === state.currentBook &&
          state.lastUncompletedPuzzle.part === state.currentStoryPart) {
        state.lastUncompletedPuzzle = null;
      }
      
      // Increment completed puzzles count
      state.completedPuzzles++;
      
      // Update book completion status
      if (state.currentBook && state.currentStoryPart >= 0) {
        // Initialize book tracking if it doesn't exist
        if (!state.books[state.currentBook]) {
          state.books[state.currentBook] = [];
        }
        
        // Mark the story part as complete
        state.books[state.currentBook][state.currentStoryPart] = true;
        
        // Ensure discoveredBooks exists and is a Set
        if (!state.discoveredBooks || !(state.discoveredBooks instanceof Set)) {
          state.discoveredBooks = new Set();
        }
        
        // Add to discoveredBooks if this is a new book
        if (!state.discoveredBooks.has(state.currentBook)) {
          state.discoveredBooks.add(state.currentBook);
          // Update completedBooks based on the actual set size
          state.completedBooks = state.discoveredBooks.size;
        }
        
        // Update the next story part to show for this book
        if (!state.bookProgress) {
          state.bookProgress = {};
        }
        
        // Advance to next part
        state.bookProgress[state.currentBook] = state.currentStoryPart + 1;
        
        // Check if the book is now complete
        checkBookCompletion(state.currentBook);
      }
      
      // Save progress
      saveGameProgress();
      
      // Show win panel
      showWinPanel();
    } else {
      // Show lose panel
      showLosePanel();
    }
  } catch (error) {
    handleSelectionError(error, 'end-game');
  }
}

/**
 * Check if a book has all parts completed
 * @param {string} bookTitle - Book title
 * @returns {boolean} - Whether book is complete
 */
function checkBookCompletion(bookTitle) {
  try {
    const state = window.state;
    
    // Return false if the book doesn't exist in state
    if (!state.books[bookTitle]) return false;
    
    // Get available parts from the mapping 
    const availableParts = state.bookPartsMap[bookTitle];
    
    // If no parts mapping exists, we can't determine completion
    if (!availableParts || availableParts.length === 0) return false;
    
    // Check if ALL available parts are complete
    const allPartsComplete = availableParts.every(part =>
      state.books[bookTitle][part] === true
    );
    
    // Only mark as complete if all available parts are complete
    if (allPartsComplete) {
      // Only increment counter if this book wasn't already marked complete
      if (!state.books[bookTitle].complete) {
        state.books[bookTitle].complete = true;
        
        // Show a celebration message in win panel
        const winMessage = document.querySelector('#win-panel p');
        if (winMessage) {
          winMessage.innerHTML = `You've successfully organized all the words in this knowledge construct!<br><br><strong>Congratulations! You've completed all parts of "${bookTitle}"!</strong>`;
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking book completion:', error);
    return false;
  }
}

/**
 * Start the game timer
 */
function startTimer() {
  try {
    const state = window.state;
    
    // Clear any existing timer
    clearInterval(state.timer);
    
    // Set up new timer
    state.timer = setInterval(() => {
      if (state.paused) return;
      
      state.timeRemaining--;
      
      // Update timer display
      const timerBar = document.getElementById('timer-bar');
      if (timerBar) {
        const percentRemaining = (state.timeRemaining / window.config.timeLimit) * 100;
        timerBar.style.width = `${percentRemaining}%`;
        
        // Change color as time runs low
        if (percentRemaining < 20) {
          timerBar.style.backgroundColor = 'var(--accent-main)';
        } else if (percentRemaining < 50) {
          timerBar.style.backgroundColor = 'var(--primary-lighter)';
        } else {
          timerBar.style.backgroundColor = 'var(--primary-light)';
        }
      }
      
      // Check for time's up
      if (state.timeRemaining <= 0) {
        endGame(false);
      }
    }, 1000);
    
    console.log('Game timer started');
  } catch (error) {
    handleSelectionError(error, 'start-timer');
  }
}

/**
 * Reset and replay current puzzle
 */
function resetCurrentPuzzle() {
  try {
    const state = window.state;
    
    // Get current puzzle data
    const puzzleData = state.puzzles[state.currentGenre][state.currentPuzzleIndex];
    
    // Re-initialize the puzzle
    window.initializePuzzle(puzzleData);
    
    // Show instructions again
    const instructionsPanel = document.getElementById('instructions-panel');
    if (instructionsPanel) {
      instructionsPanel.style.display = 'block';
    }
    
    console.log('Current puzzle reset');
  } catch (error) {
    handleSelectionError(error, 'reset-puzzle');
  }
}

/**
 * Load next puzzle (for endless mode)
 */
function loadNextPuzzle() {
  try {
    // Load a new sequential puzzle
    window.loadSequentialPuzzle();
    
    // Show instructions panel
    const instructionsPanel = document.getElementById('instructions-panel');
    if (instructionsPanel) {
      instructionsPanel.style.display = 'block';
    }
    
    // Ensure game is paused until instructions are closed
    state.paused = true;
    
    // Reset game state that might be causing issues
    state.gameOver = false;
    state.selectedCells = [];
    state.startCell = null;
    state.currentCell = null;
    
    console.log('Next puzzle loaded');
  } catch (error) {
    handleSelectionError(error, 'load-next-puzzle');
  }
}

/**
 * Show confirmation when returning to Book of Passage
 */
function confirmReturn() {
  try {
    if (confirm('Return to your Book of Passage? Your progress will be saved.')) {
      // Save current puzzle state before navigating away
      const state = window.state;
      
      if (!state.gameOver) {
        state.lastUncompletedPuzzle = {
          book: state.currentBook,
          part: state.currentStoryPart,
          genre: state.currentGenre
        };
        // Save progress to ensure uncompleted puzzle state persists
        saveGameProgress();
        console.log('Saved uncompleted puzzle:', state.lastUncompletedPuzzle);
      }
      
      // Navigate to Book of Passage
      navigateToScreen('book-of-passage-screen');
    }
  } catch (error) {
    handleSelectionError(error, 'confirm-return');
  }
}

/**
 * Start the puzzle game (called after instructions are closed)
 */
function startPuzzleGame() {
  try {
    const state = window.state;
    
    if (state.gameOver) {
      throw new Error("Cannot start game that is already over");
    }
    
    if (!state.wordList || state.wordList.length === 0) {
      throw new Error("Cannot start game with empty word list");
    }
    
    // Set game state
    state.paused = false;
    
    // Start the timer
    startTimer();
    
    console.log('Puzzle game started');
  } catch (error) {
    handleSelectionError(error, 'start-game');
  }
}

// Install key functions to window for backward compatibility during transition
window.checkForWord = checkForWord;
window.markWordAsFound = markWordAsFound;
window.checkWinCondition = checkWinCondition;
window.endGame = endGame;
window.checkBookCompletion = checkBookCompletion;
window.startTimer = startTimer;
window.resetCurrentPuzzle = resetCurrentPuzzle;
window.loadNextPuzzle = loadNextPuzzle;
window.confirmReturn = confirmReturn;
window.startPuzzleGame = startPuzzleGame;

// Export functions for module system
export {
  checkForWord,
  markWordAsFound,
  checkWinCondition,
  endGame,
  checkBookCompletion,
  startTimer,
  resetCurrentPuzzle,
  loadNextPuzzle,
  confirmReturn,
  startPuzzleGame
};

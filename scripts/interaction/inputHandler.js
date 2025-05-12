/**
 * Input Handler module for Chronicles of the Kethaneum
 * This module manages all user input interactions with the game
 */

import { handleSelectionError } from '../utils/errorHandler.js';
import { debounce, throttle, getRelativeCoordinates } from '../utils/domUtils.js';
import { updateSelectedCells } from '../ui/renderSystem.js';
import { checkForWord, confirmReturn } from './gameLogic.js';
import * as GameState from '../core/gameState.js';
import * as MobilePanels from '../ui/mobilePanels.js';

// Store active event listener removers for cleanup
const activeListeners = [];

/**
 * Set up all event listeners for the puzzle game
 */
function setupPuzzleEventListeners() {
  try {
    console.log('Setting up puzzle event listeners');
    
    // Clean up any existing event listeners first
    removeAllEventListeners();
    
    // Get the grid element
    const wordGrid = document.getElementById('word-grid');
    if (!wordGrid) {
      console.warn('Could not find word grid element');
      return;
    }
    
    // Mouse/touch events for grid cells
    activeListeners.push(
      addEventListenerWithCleanup(wordGrid, 'mousedown', handleSelectionStart),
      addEventListenerWithCleanup(wordGrid, 'mouseover', handleSelectionMove),
      
      // Touch events for mobile
      addEventListenerWithCleanup(wordGrid, 'touchstart', handleTouchStart, { passive: false }),
      addEventListenerWithCleanup(wordGrid, 'touchmove', handleTouchMove, { passive: false }),
      
      // Document-level events
      addEventListenerWithCleanup(document, 'mouseup', handleSelectionEnd),
      addEventListenerWithCleanup(document, 'touchend', handleSelectionEnd)
    );
    
    // Pause button
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      activeListeners.push(
        addEventListenerWithCleanup(pauseBtn, 'click', togglePause)
      );
    }
    
    // Return to Book of Passage button
    const returnButton = document.getElementById('return-book-of-passage-btn');
    if (returnButton) {
      activeListeners.push(
        addEventListenerWithCleanup(returnButton, 'click', confirmReturn)
      );
    }
    
    // Resume button in pause panel
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      activeListeners.push(
        addEventListenerWithCleanup(resumeBtn, 'click', resumeGame)
      );
    }
    
    // Restart button in pause panel
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      activeListeners.push(
        addEventListenerWithCleanup(restartBtn, 'click', function() {
          const pausePanel = document.getElementById('pause-panel');
          if (pausePanel) {
            pausePanel.style.display = 'none';
          }
          
          // Dynamic import for gameLogic
          import('./gameLogic.js')
            .then(GameLogic => {
              GameLogic.resetCurrentPuzzle();
            })
            .catch(error => {
              console.error('Error importing gameLogic:', error);
            });
        })
      );
    }
    
    // Book of Passage button in pause panel
    const goToBookBtn = document.getElementById('go-to-book-btn');
    if (goToBookBtn) {
      activeListeners.push(
        addEventListenerWithCleanup(goToBookBtn, 'click', function() {
          const pausePanel = document.getElementById('pause-panel');
          if (pausePanel) {
            pausePanel.style.display = 'none';
          }
          confirmReturn();
        })
      );
    }
    
    console.log('All puzzle event listeners set up successfully');
  } catch (error) {
    console.error('Error setting up puzzle event listeners:', error);
  }

  // Add mobile event listeners
  setupMobileEventListeners();
}

/**
 * Setup mobile-specific event listeners
 */
function setupMobileEventListeners() {
  // Only set up on mobile
  if (window.innerWidth > 768) return;
  
  // Unified control button
  const unifiedBtn = document.getElementById('unified-control-btn');
  if (unifiedBtn) {
    activeListeners.push(
      addEventListenerWithCleanup(unifiedBtn, 'click', function() {
        MobilePanels.openSlidePanel();
      })
    );
  }
  
  // Word list header
  const wordListHeader = document.querySelector('.word-list-header');
  if (wordListHeader) {
    activeListeners.push(
      addEventListenerWithCleanup(wordListHeader, 'click', function() {
        MobilePanels.toggleWordList();
      })
    );
  }
  
  // Tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    activeListeners.push(
      addEventListenerWithCleanup(btn, 'click', function() {
        const tabName = this.getAttribute('data-tab');
        MobilePanels.switchTab(tabName);
      })
    );
  });
  
  // Close panel button
  const closeBtn = document.querySelector('.close-panel-btn');
  if (closeBtn) {
    activeListeners.push(
      addEventListenerWithCleanup(closeBtn, 'click', function() {
        MobilePanels.closeSlidePanel();
      })
    );
  }
  
  // Overlay click to close
  const overlay = document.querySelector('.slide-panel-overlay');
  if (overlay) {
    activeListeners.push(
      addEventListenerWithCleanup(overlay, 'click', function() {
        MobilePanels.closeSlidePanel();
      })
    );
  }
  
  // Mobile menu buttons
  setupMobileMenuButtons();
}

/**
 * Setup mobile menu button handlers
 */
function setupMobileMenuButtons() {
  // Restart button
  const mobileRestartBtn = document.getElementById('mobile-restart-btn');
  if (mobileRestartBtn) {
    activeListeners.push(
      addEventListenerWithCleanup(mobileRestartBtn, 'click', function() {
        MobilePanels.closeSlidePanel();
        // Import dynamically to avoid circular dependencies
        import('./gameLogic.js')
          .then(GameLogic => {
            GameLogic.resetCurrentPuzzle();
          })
          .catch(error => {
            console.error('Error importing gameLogic:', error);
          });
      })
    );
  }
  
  // Book of Passage button
  const mobilePassageBtn = document.getElementById('mobile-passage-btn');
  if (mobilePassageBtn) {
    activeListeners.push(
      addEventListenerWithCleanup(mobilePassageBtn, 'click', function() {
        MobilePanels.closeSlidePanel();
        import('./gameLogic.js')
          .then(GameLogic => {
            GameLogic.confirmReturn();
          })
          .catch(error => {
            console.error('Error importing gameLogic:', error);
          });
      })
    );
  }
  
  // Library button (disabled)
  const mobileLibraryBtn = document.getElementById('mobile-library-btn');
  if (mobileLibraryBtn) {
    activeListeners.push(
      addEventListenerWithCleanup(mobileLibraryBtn, 'click', function() {
        alert('The Library will be available in a future update');
      })
    );
  }
}

/**
 * Add an event listener with automatic cleanup functionality
 * @param {Element} element - DOM element to attach listener to
 * @param {string} eventType - Type of event
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 * @returns {Function} - Function to remove this listener
 */
function addEventListenerWithCleanup(element, eventType, handler, options = {}) {
  if (!element) {
    console.warn(`Cannot add ${eventType} listener to undefined element`);
    return () => {};
  }
  
  element.addEventListener(eventType, handler, options);
  
  return () => {
    element.removeEventListener(eventType, handler, options);
  };
}

/**
 * Remove all active event listeners
 */
function removeAllEventListeners() {
  while (activeListeners.length > 0) {
    const removeListener = activeListeners.pop();
    if (typeof removeListener === 'function') {
      removeListener();
    }
  }
  console.log('All event listeners removed');
}

/**
 * Handle starting a word selection
 * @param {Event} e - Mouse event
 */
function handleSelectionStart(e) {
  try {
    const state = GameState.getGameState();
    if (state.paused || state.gameOver) return;
    
    const cell = e.target.closest('.grid-cell');
    if (!cell) return;
    
    state.startCell = cell;
    state.currentCell = cell;
    state.selectedCells = [cell];
    
    updateSelectedCells();
    
    e.preventDefault();
  } catch (error) {
    handleSelectionError(error, 'selection-start');
  }
}

/**
 * Handle touch start (mobile)
 * @param {TouchEvent} e - Touch event
 */
function handleTouchStart(e) {
  try {
    const state = GameState.getGameState();
    if (state.paused || state.gameOver) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    
    const cell = element.closest('.grid-cell');
    if (!cell) return;
    
    state.startCell = cell;
    state.currentCell = cell;
    state.selectedCells = [cell];
    
    updateSelectedCells();
    
    e.preventDefault(); // Prevent scrolling
  } catch (error) {
    handleSelectionError(error, 'touch-start');
  }
}

/**
 * Handle moving the selection
 * @param {MouseEvent} e - Mouse event
 */
function handleSelectionMove(e) {
  try {
    const state = GameState.getGameState();
    if (!state.startCell || state.paused || state.gameOver) return;
    
    const cell = e.target.closest('.grid-cell');
    if (!cell || cell === state.currentCell) return;
    
    // Only allow selection in straight lines
    const startRow = parseInt(state.startCell.dataset.row);
    const startCol = parseInt(state.startCell.dataset.col);
    const currentRow = parseInt(cell.dataset.row);
    const currentCol = parseInt(cell.dataset.col);
    
    // Calculate direction
    const dRow = currentRow - startRow;
    const dCol = currentCol - startCol;
    
    // Check if movement is in a straight line
    if (
      (dRow === 0 && dCol !== 0) || // Horizontal
      (dRow !== 0 && dCol === 0) || // Vertical
      (Math.abs(dRow) === Math.abs(dCol)) // Diagonal
    ) {
      // Calculate normalized direction
      const dirRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
      const dirCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);
      
      // Get all cells in the path
      const newSelectedCells = [state.startCell];
      
      let r = startRow;
      let c = startCol;
      
      while (r !== currentRow || c !== currentCol) {
        r += dirRow;
        c += dirCol;
        
        const pathCell = document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
        if (pathCell) {
          newSelectedCells.push(pathCell);
        }
      }
      
      state.selectedCells = newSelectedCells;
      state.currentCell = cell;
      
      updateSelectedCells();
    }
  } catch (error) {
    handleSelectionError(error, 'selection-move');
  }
}

/**
 * Handle touch move (mobile)
 * @param {TouchEvent} e - Touch event
 */
function handleTouchMove(e) {
  try {
    const state = GameState.getGameState();
    if (!state.startCell || state.paused || state.gameOver) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    
    const cell = element.closest('.grid-cell');
    if (!cell || cell === state.currentCell) return;
    
    // Reuse the same logic as handleSelectionMove
    const startRow = parseInt(state.startCell.dataset.row);
    const startCol = parseInt(state.startCell.dataset.col);
    const currentRow = parseInt(cell.dataset.row);
    const currentCol = parseInt(cell.dataset.col);
    
    // Calculate direction
    const dRow = currentRow - startRow;
    const dCol = currentCol - startCol;
    
    // Check if movement is in a straight line
    if (
      (dRow === 0 && dCol !== 0) || // Horizontal
      (dRow !== 0 && dCol === 0) || // Vertical
      (Math.abs(dRow) === Math.abs(dCol)) // Diagonal
    ) {
      // Calculate normalized direction
      const dirRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
      const dirCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);
      
      // Get all cells in the path
      const newSelectedCells = [state.startCell];
      
      let r = startRow;
      let c = startCol;
      
      while (r !== currentRow || c !== currentCol) {
        r += dirRow;
        c += dirCol;
        
        const pathCell = document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
        if (pathCell) {
          newSelectedCells.push(pathCell);
        }
      }
      
      state.selectedCells = newSelectedCells;
      state.currentCell = cell;
      
      updateSelectedCells();
    }
    
    e.preventDefault(); // Prevent scrolling
  } catch (error) {
    handleSelectionError(error, 'touch-move');
  }
}

/**
 * Handle ending a word selection
 */
function handleSelectionEnd() {
  try {
    const state = GameState.getGameState();
    if (!state.startCell || state.paused || state.gameOver) return;
    
    // Check if selected cells form a valid word
    checkForWord();
    
    // Clear selection
    state.selectedCells.forEach(cell => {
      cell.classList.remove('selected');
    });
    
    state.startCell = null;
    state.currentCell = null;
    state.selectedCells = [];
  } catch (error) {
    handleSelectionError(error, 'selection-end');
  }
}

/**
 * Toggle pause state
 */
function togglePause() {
  try {
    const state = GameState.getGameState();
    state.paused = !state.paused;
    
    const pauseBtn = document.getElementById('pause-btn');
    const pausePanel = document.getElementById('pause-panel');
    
    if (state.paused) {
      if (pausePanel) {
        pausePanel.style.display = 'block';
      }
      if (pauseBtn) {
        pauseBtn.textContent = 'Resume';
      }
    } else {
      if (pausePanel) {
        pausePanel.style.display = 'none';
      }
      if (pauseBtn) {
        pauseBtn.textContent = 'Pause';
      }
    }
  } catch (error) {
    handleSelectionError(error, 'toggle-pause');
  }
}

/**
 * Resume the game from pause
 */
function resumeGame() {
  try {
    const state = GameState.getGameState();
    state.paused = false;
    
    const pausePanel = document.getElementById('pause-panel');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (pausePanel) {
      pausePanel.style.display = 'none';
    }
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause';
    }
  } catch (error) {
    handleSelectionError(error, 'resume-game');
  }
}

/**
 * Setup mobile-specific enhancements
 */
function setupMobileInputHandling() {
  try {
    // Only proceed if we're on a mobile device
    if (window.innerWidth > 768) return;
    
    // Add touch-specific classes to grid
    const wordGrid = document.getElementById('word-grid');
    if (wordGrid) {
      wordGrid.classList.add('touch-enabled');
    }
    
    // Add haptic feedback initialization
    setupHapticFeedback();
    
    console.log('Mobile input handling initialized');
  } catch (error) {
    console.error('Error setting up mobile input:', error);
  }
}

/**
 * Setup haptic feedback for mobile devices
 */
function setupHapticFeedback() {
  // Check if device supports vibration
  if (navigator.vibrate) {
    console.log('Haptic feedback initialized');
  }
}

// Export functions for module system
export {
  setupPuzzleEventListeners,
  handleSelectionStart,
  handleTouchStart,
  handleSelectionMove,
  handleTouchMove,
  handleSelectionEnd,
  togglePause,
  resumeGame,
  removeAllEventListeners,
  setupMobileInputHandling,
  setupHapticFeedback,
  setupMobileEventListeners,
  setupMobileMenuButtons
};
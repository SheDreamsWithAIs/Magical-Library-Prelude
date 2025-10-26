/**
 * Navigation system for Chronicles of the Kethaneum
 * This module handles screen transitions and navigation
 */

import { handleNavigationError } from '../utils/errorHandler.js';
import { getGameState } from '../core/gameState.js';

/**
 * Navigates to a specific screen by ID
 * @param {string} screenId - ID of the screen to navigate to
 */
function navigateToScreen(screenId) {
  console.log('Navigating to:', screenId);

  try {
    // Get all screens
    const screens = document.querySelectorAll('.screen');

    // Validate state when going to specific screens
    if (screenId === 'book-of-passage-screen' || screenId === 'puzzle-screen') {
      validateGameState();
    }

    // Hide all screens
    screens.forEach(screen => {
      if (screen) {
        screen.style.display = 'none';
        screen.classList.remove('active');
      }
    });

    // Show the requested screen if it exists
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      // Add active class
      targetScreen.classList.add('active');

      // Set display property based on screen type
      if (screenId === 'puzzle-screen') {
        targetScreen.style.display = 'flex';
      } else if (screenId === 'title-screen' ||
        screenId === 'backstory-screen' ||
        screenId === 'book-of-passage-screen') {
        targetScreen.style.display = 'flex';
      } else {
        targetScreen.style.display = 'block';
      }

      // Update current screen in state
      state.currentScreen = screenId;

      // Special handling for screens
      if (screenId === 'puzzle-screen') {
        if (document.getElementById('instructions-panel')) {
          document.getElementById('instructions-panel').style.display = 'block';
        }
        state.paused = true;

        // Initialize mobile features after a short delay to ensure DOM is ready
        setTimeout(setupMobileEnhancements, 100);
      }

      if (screenId === 'book-of-passage-screen') {
        updateBookOfPassageScreen();
      }
    } else {
      throw new Error(`Screen with ID "${screenId}" not found`);
    }
  } catch (error) {
    handleNavigationError(error, screenId);
  }
}

/**
 * Validates the game state to ensure key properties are properly initialized
 * @returns {boolean} - Whether state is valid
 */
function validateGameState() {
  // Ensure discoveredBooks is a Set
  if (!state.discoveredBooks || !(state.discoveredBooks instanceof Set)) {
    console.warn('discoveredBooks not a Set during validation - reinitializing');
    state.discoveredBooks = new Set();
  }

  // Make sure completedBooks matches the Set size
  const actualSize = state.discoveredBooks.size;
  if (state.completedBooks !== actualSize) {
    console.warn(`completedBooks (${state.completedBooks}) doesn't match discoveredBooks size (${actualSize}) - fixing`);
    state.completedBooks = actualSize;
  }

  // Return true if everything was valid, false if fixes were needed
  return state.discoveredBooks instanceof Set && state.completedBooks === actualSize;
}

/**
 * Update the Book of Passage screen with current progress
 */
function updateBookOfPassageScreen() {
  const bookOfPassageContent = document.getElementById('book-of-passage-content');

  if (bookOfPassageContent) {
    bookOfPassageContent.innerHTML = `
      <p><em>The pages of your Book of Passage shimmer as new words appear, chronicling your arrival:</em></p>
      
      <p>"Today marks your first day as Assistant Archivist within the hallowed halls of the Kethaneum, the greatest repository of knowledge across all realms. After years of dedicated study, you've earned this honored position—a rare achievement celebrated by your teachers and peers alike.</p>
      
      <p>Your assignment is to catalog the newly arrived knowledge constructs, which appear to you as books containing words scattered and unordered. By finding and organizing these words, you strengthen the Kethaneum's indexing matrix, making this wisdom accessible to scholars throughout the multiverse. The Senior Archivists have noticed your particular talent for pattern recognition—a gift that will serve you well as you bring order to chaos, one word at a time."</p>
      
      <div class="progress-section">
        <h3>Your Archives Progress:</h3>
        <p>Cataloging Completed: <span id="completed-puzzles-count">${state.completedPuzzles || 0}</span></p>
        <p>Books Discovered: <span id="completed-books-count">${state.completedBooks || 0}</span></p>
        
        <div id="books-progress-section">
          <!-- Book progress will be filled dynamically -->
        </div>
      </div>
    `;

    // Update the references to these elements since they've been recreated
    const completedPuzzlesCount = document.getElementById('completed-puzzles-count');
    const completedBooksCount = document.getElementById('completed-books-count');
    const booksProgressSection = document.getElementById('books-progress-section');

    // Update the books progress section
    updateBookOfPassageProgress();
  }
}

/**
 * Update the progress display in the Book of Passage
 */
function updateBookOfPassageProgress() {
  // Validate state before updating UI
  validateGameState();

  const completedPuzzlesCount = document.getElementById('completed-puzzles-count');
  const completedBooksCount = document.getElementById('completed-books-count');
  const booksProgressSection = document.getElementById('books-progress-section');

  if (completedPuzzlesCount) {
    completedPuzzlesCount.textContent = state.completedPuzzles || 0;
  }

  if (completedBooksCount) {
    completedBooksCount.textContent = state.completedBooks || 0;
  }

  // Update the books progress section if it exists
  if (booksProgressSection) {
    let progressHTML = '<h4>Books in Progress:</h4>';

    // Sort book titles alphabetically
    const bookTitles = Object.keys(state.books).sort();

    if (bookTitles.length === 0) {
      progressHTML += '<p>No books cataloged yet.</p>';
    } else {
      progressHTML += '<ul class="book-progress-list">';

      bookTitles.forEach(bookTitle => {
        const storyParts = state.books[bookTitle];
        const completedParts = storyParts.filter(completed => completed).length;
        const isComplete = completedParts === 5 || (storyParts.complete === true);

        // Check if this book has an uncompleted puzzle
        const hasUncompletedPuzzle = state.lastUncompletedPuzzle &&
          state.lastUncompletedPuzzle.book === bookTitle;

        // Add appropriate classes
        let bookClasses = isComplete ? 'book-complete' : 'book-in-progress';
        if (hasUncompletedPuzzle) {
          bookClasses += ' has-uncompleted-puzzle';
        }

        progressHTML += `
          <li class="${bookClasses}">
            <strong>${bookTitle}</strong> - ${completedParts}/5 parts cataloged
            ${hasUncompletedPuzzle ? '<span class="uncompleted-note">(Contains in-progress puzzle)</span>' : ''}
            <div class="book-parts-progress">
        `;

        // Get all available parts for this book
        const availableParts = [];

        // Search through all genres for parts of this book
        for (const genre in state.puzzles) {
          const puzzlesForBook = state.puzzles[genre].filter(p => p.book === bookTitle);
          const parts = puzzlesForBook.map(p => p.storyPart);
          parts.forEach(part => {
            if (!availableParts.includes(part)) {
              availableParts.push(part);
            }
          });
        }

        // Sort parts numerically
        availableParts.sort((a, b) => a - b);

        // If no parts were found, use standard 0-4 range
        const partsToShow = availableParts.length > 0 ? availableParts : [0, 1, 2, 3, 4];

        // Add indicators for each story part
        partsToShow.forEach(i => {
          let partClass = 'story-part';
          let partTitle = getStoryPartName(i);

          // Check if this is the uncompleted puzzle part
          const isUncompletedPuzzle = hasUncompletedPuzzle &&
            state.lastUncompletedPuzzle.part === i;

          if (isUncompletedPuzzle) {
            partClass += ' in-progress';
            partTitle += ' (In Progress)';
          } else if (storyParts[i]) {
            partClass += ' complete';
          } else {
            partClass += ' incomplete';
          }

          progressHTML += `<span class="${partClass}" title="${partTitle}">${i + 1}</span>`;
        });

        progressHTML += '</div></li>';
      });

      progressHTML += '</ul>';
    }

    booksProgressSection.innerHTML = progressHTML;
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

/**
 * Set up screen navigation event handlers
 */
function setupScreenNavigation() {
  console.log('Setting up screen navigation');

  // Title screen buttons
  const newGameBtn = document.getElementById('new-game-btn');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', function () {
      console.log('New Game button clicked');

      // Clear progress and ensure complete state reset
      resetGameState(true);

      navigateToScreen('backstory-screen');
    });
  }

  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', function () {
      console.log('Continue button clicked');

      // Ensure clean state before loading saved progress
      resetGameState(false);
      loadGameProgress();

      // Verify state is valid after loading
      validateGameState();

      navigateToScreen('book-of-passage-screen');
    });
  }

  // Backstory screen
  const continueToBookBtn = document.getElementById('continue-to-book-btn');
  if (continueToBookBtn) {
    continueToBookBtn.addEventListener('click', function () {
      console.log('Continue to library clicked');
      navigateToScreen('library-screen');
    });
  }

  // Library screen 
  const bookOfPassageNavBtn = document.getElementById('book-of-passage-nav-btn');
  if (bookOfPassageNavBtn) {
    bookOfPassageNavBtn.addEventListener('click', function () {
      console.log('Book of Passage button clicked from Library');
      navigateToScreen('book-of-passage-screen');
    });
  }

  // Book of Passage screen
  const startCatalogingBtn = document.getElementById('start-cataloging-btn');
  if (startCatalogingBtn) {
    startCatalogingBtn.addEventListener('click', function () {
      console.log('Start cataloging clicked');
      // Load a sequential puzzle
      loadSequentialPuzzle();
      navigateToScreen('puzzle-screen');
    });
  }

  // Win panel buttons
  const nextBookBtn = document.getElementById('next-book-btn');
  if (nextBookBtn) {
    nextBookBtn.addEventListener('click', function () {
      console.log('Next book button clicked');
      if (document.getElementById('win-panel')) {
        document.getElementById('win-panel').style.display = 'none';
      }
      loadNextPuzzle();
    });
  }

  const returnToBookOfPassageBtn = document.getElementById('return-to-book-of-passage-btn');
  if (returnToBookOfPassageBtn) {
    returnToBookOfPassageBtn.addEventListener('click', function () {
      if (document.getElementById('win-panel')) {
        document.getElementById('win-panel').style.display = 'none';
      }
      navigateToScreen('book-of-passage-screen');
    });
  }

  // Lose panel buttons
  const tryAgainBtn = document.getElementById('try-again-btn');
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', function () {
      if (document.getElementById('lose-panel')) {
        document.getElementById('lose-panel').style.display = 'none';
      }
      resetCurrentPuzzle();
    });
  }

  const differentBookBtn = document.getElementById('different-book-btn');
  if (differentBookBtn) {
    differentBookBtn.addEventListener('click', function () {
      if (document.getElementById('lose-panel')) {
        document.getElementById('lose-panel').style.display = 'none';
      }
      loadNextPuzzle();
    });
  }

  // Pause panel buttons
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', function () {
      resumeGame();
    });
  }

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      if (document.getElementById('pause-panel')) {
        document.getElementById('pause-panel').style.display = 'none';
      }
      resetCurrentPuzzle();
    });
  }

  // Go to Book button in pause panel
  const goToBookBtn = document.getElementById('go-to-book-btn');
  if (goToBookBtn) {
    goToBookBtn.addEventListener('click', function () {
      if (document.getElementById('pause-panel')) {
        document.getElementById('pause-panel').style.display = 'none';
      }
      // Save current puzzle state before navigating away
      if (!state.gameOver) {
        state.lastUncompletedPuzzle = {
          book: state.currentBook,
          part: state.currentStoryPart,
          genre: state.currentGenre
        };
        // Save progress to ensure uncompleted puzzle state persists
        saveGameProgress();
        console.log('Saved uncompleted puzzle from pause menu:', state.lastUncompletedPuzzle);
      }
      navigateToScreen('book-of-passage-screen');
    });
  }

  // Instructions panel
  const startPlayingBtn = document.getElementById('start-playing-btn');
  if (startPlayingBtn) {
    startPlayingBtn.removeEventListener('click', startPlayingBtn.clickHandler);
    startPlayingBtn.clickHandler = function () {
      if (document.getElementById('instructions-panel')) {
        document.getElementById('instructions-panel').style.display = 'none';
      }

      // For mobile, start the timer animation first, then start the game after animation
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // Create and animate the timer
        setupMobileTimerWithAnimation(function () {
          // This callback runs after animation completes
          startPuzzleGame();
        });
      } else {
        // On desktop, just start the game immediately
        startPuzzleGame();
      }
    };
    startPlayingBtn.addEventListener('click', startPlayingBtn.clickHandler);
  }
}

/**
 * Setup protection against navigation interference
 */
function setupNavigationProtection() {
  window.addEventListener('load', function () {
    // Force correct display after everything else has loaded
    setTimeout(function () {
      const currentScreen = state.currentScreen || 'title-screen';
      // Force a re-navigation to current screen
      navigateToScreen(currentScreen);

      // Set up a periodic check to ensure navigation hasn't been tampered with
      setInterval(function () {
        const activeScreens = document.querySelectorAll('.screen.active');
        if (activeScreens.length !== 1 ||
          activeScreens[0].id !== state.currentScreen) {
          console.log('Navigation state corrupted - restoring');
          navigateToScreen(state.currentScreen);
        }
      }, 2000); // Check every 2 seconds
    }, 300);
  });
}

/**
 * Register navigation handlers for a specific screen
 * @param {string} screenId - ID of the screen
 * @param {Object} handlers - Map of button IDs to handler functions
 */
function registerScreenNavigationHandlers(screenId, handlers) {
  console.log(`Registering navigation handlers for screen: ${screenId}`);

  // Process each handler
  Object.entries(handlers).forEach(([buttonId, handlerFn]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      // For safety, remove any existing handler first
      if (button.navigationHandler) {
        button.removeEventListener('click', button.navigationHandler);
      }

      // Store reference to handler for potential cleanup later
      button.navigationHandler = handlerFn;

      // Add the new handler
      button.addEventListener('click', handlerFn);
      console.log(`- Registered handler for button: ${buttonId}`);
    } else {
      console.warn(`- Button not found: ${buttonId}`);
    }
  });
}

/**
 * Initialize library screen navigation
 */
function initializeLibraryNavigation() {
  registerScreenNavigationHandlers('library-screen', {
    'book-of-passage-nav-btn': function () {
      console.log('Navigating from Library to Book of Passage');
      navigateToScreen('book-of-passage-screen');
    },
    'return-to-menu-btn': function () {
      console.log('Returning to main menu from Library');
      navigateToScreen('title-screen');
    },
    'browse-archives-btn': function () {
      console.log('Browse Archives button clicked');

      // Show loading indicator
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
      }

      // Import moduleBootstrap to access loadGameData
      import('../moduleBootstrap.js')
        .then(ModuleBootstrap => {
          // Load game data first - this is the shared functionality
          ModuleBootstrap.loadGameData().then(success => {
            // Hide loading indicator
            if (loadingIndicator) {
              loadingIndicator.style.display = 'none';
            }

            if (success) {
              // Show the genre panel
              const genrePanel = document.getElementById('genre-panel');
              if (genrePanel) {
                genrePanel.style.display = 'flex';

                // Generate cards
                const container = genrePanel.querySelector('.genre-container');
                if (container) {
                  import('../ui/renderSystem.js')
                    .then(RenderSystem => {
                      const state = getGameState();
                      if (state && state.puzzles) {
                        console.log('Generating cards for genres:', Object.keys(state.puzzles));
                        RenderSystem.generateGenreCards(container, state.puzzles);
                      }
                    })
                    .catch(error => {
                      console.error('Error importing renderSystem:', error);
                    });
                }
              }
            } else {
              // Show error if data loading fails - consistent with existing pattern
              import('../utils/errorHandler.js')
                .then(ErrorHandler => {
                  ErrorHandler.showErrorMessage(
                    "Data Loading Error",
                    "The Kethaneum's archives are currently unavailable. Please try again later.",
                    "Return to Library View"
                  );
                })
                .catch(err => console.error('Error importing errorHandler:', err));
            }
          });
        })
        .catch(error => {
          console.error('Error importing moduleBootstrap:', error);

          // Hide loading indicator on error
          if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
          }
        });
    },
    'start-conversation-btn': function() {
      // Import and initialize dialogue system
      import('../dialogue/dialogueIntegration.js')
        .then(DialogueIntegration => {
          // Get DialogueUIManager from moduleBootstrap
          return import('../moduleBootstrap.js')
            .then(ModuleBootstrap => {
              const dialogueUIManager = ModuleBootstrap.getDialogueUIManager();
              
              if (!dialogueUIManager) {
                throw new Error('DialogueUIManager not available');
              }

              // Create dialogue integration instance
              const dialogueIntegration = new DialogueIntegration.default();
              
              // Initialize with DialogueUIManager instance (async)
              return dialogueIntegration.initialize(dialogueUIManager)
                .then(initSuccess => {
                  if (initSuccess) {
                    // Start dialogue with Archivist Lumina (using 'hook' story beat)
                    const dialogueSuccess = dialogueIntegration.startDialogue('archivist-lumina', 'hook');
                    
                    if (!dialogueSuccess) {
                      console.error('Failed to start dialogue');
                      // Show error message
                      import('../utils/errorHandler.js')
                        .then(ErrorHandler => {
                          ErrorHandler.showErrorMessage(
                            "Dialogue Error",
                            "Unable to start conversation with the Archivist. Please try again later.",
                            "Return to Library"
                          );
                        });
                    }
                  } else {
                    throw new Error('Failed to initialize dialogue integration');
                  }
                });
            });
        })
        .catch(error => {
          console.error('Error starting dialogue:', error);
          
          // Show error message
          import('../utils/errorHandler.js')
            .then(ErrorHandler => {
              ErrorHandler.showErrorMessage(
                "Dialogue System Error",
                "The dialogue system is currently unavailable. Please try again later.",
                "Return to Library"
              );
            })
            .catch(err => console.error('Error importing errorHandler:', err));
        });
    }
  });
  
  // Add handlers for the genre panel itself
  registerScreenNavigationHandlers('genre-panel', {
    'close-genre-panel-btn': function () {
      console.log('Closing genre panel');
      const genrePanel = document.getElementById('genre-panel');
      if (genrePanel) {
        genrePanel.style.display = 'none';
      }
    }
  });

  // Add event delegation for genre card clicks - STEP 1 IMPLEMENTATION
  const genreContainer = document.querySelector('.genre-container');
  if (genreContainer) {
    genreContainer.addEventListener('click', function(event) {
      try {
        // Check if clicked element is a genre card
        const genreCard = event.target.closest('.genre-card');
        if (!genreCard) {
          console.log('Click was not on a genre card');
          return;
        }

        // Extract genre from data attribute
        const selectedGenre = genreCard.dataset.genre;
        if (!selectedGenre) {
          console.error('Genre card missing data-genre attribute');
          return;
        }

        console.log('Genre card clicked:', selectedGenre);
        
        // Step 2 - Call the flow control function
        startPuzzleFromGenre(selectedGenre);
        
      } catch (error) {
        console.error('Error handling genre card click:', error);
      }
    });
    
    console.log('Genre card click handler installed successfully');
  } else {
    console.warn('Genre container not found - genre card clicks will not work');
  }
}

/**
 * Flow control function to start puzzle from selected genre
 * @param {string} selectedGenre - The genre selected from the genre card
 */
function startPuzzleFromGenre(selectedGenre) {
  try {
    console.log('Starting puzzle from genre:', selectedGenre);
    
    // Step 2a: Explicitly close the genre panel
    const genrePanel = document.getElementById('genre-panel');
    if (genrePanel) {
      genrePanel.style.display = 'none';
      console.log('Genre panel closed');
    } else {
      console.warn('Genre panel not found during close attempt');
    }
    
    // Step 2b: Show loading indicator for puzzle loading
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }
    
    // Step 2c: Load puzzle with selected genre
    import('../puzzle/puzzleLoader.js')
      .then(PuzzleLoader => {
        console.log('Attempting to load sequential puzzle for genre:', selectedGenre);
        
        // Call loadSequentialPuzzle with the selected genre
        const success = PuzzleLoader.loadSequentialPuzzle(selectedGenre);
        
        if (success) {
          console.log('Puzzle loaded successfully, navigating to puzzle screen');
          
          // Step 2d: Navigate to puzzle screen
          navigateToScreen('puzzle-screen');
        } else {
          console.error('Failed to load puzzle for genre:', selectedGenre);
          
          // Show error message if puzzle loading fails
          import('../utils/errorHandler.js')
            .then(ErrorHandler => {
              ErrorHandler.showErrorMessage(
                "Puzzle Loading Error",
                `Unable to load a puzzle from the "${selectedGenre}" archives. Please try a different category.`,
                "Return to Archives"
              );
            })
            .catch(err => console.error('Error importing errorHandler:', err));
        }
        
        // Hide loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error importing puzzleLoader:', error);
        
        // Hide loading indicator on error
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
        
        // Show error message
        import('../utils/errorHandler.js')
          .then(ErrorHandler => {
            ErrorHandler.showErrorMessage(
              "System Error",
              "The Kethaneum's puzzle loading system is experiencing difficulties. Please try again later.",
              "Return to Library"
            );
          })
          .catch(err => console.error('Error importing errorHandler:', err));
      });
      
  } catch (error) {
    console.error('Error in startPuzzleFromGenre:', error);
    
    // Hide loading indicator if there was an error
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.navigateTo = navigateToScreen; // Keep old name for compatibility
window.navigateToScreen = navigateToScreen;
window.validateGameState = validateGameState;
window.updateBookOfPassageScreen = updateBookOfPassageScreen;
window.updateBookOfPassageProgress = updateBookOfPassageProgress;
window.setupScreenNavigation = setupScreenNavigation;
window.setupNavigationProtection = setupNavigationProtection;

// Export functions for module system
export {
  navigateToScreen,
  validateGameState,
  updateBookOfPassageScreen,
  updateBookOfPassageProgress,
  getStoryPartName,
  setupScreenNavigation,
  setupNavigationProtection,
  registerScreenNavigationHandlers,
  initializeLibraryNavigation
};
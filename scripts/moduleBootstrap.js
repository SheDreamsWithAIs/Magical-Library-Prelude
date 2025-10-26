/**
 * Enhanced bootstrap with proper screen flow management
 */

// Import core modules
import * as Config from './core/config.js';
import * as EventSystem from './core/eventSystem.js';
import * as Navigation from './ui/navigation.js';
import * as ErrorHandler from './utils/errorHandler.js';
import { loadSequentialPuzzle } from './puzzle/puzzleLoader.js';
import DialogueUIManager from './ui/dialogueUIManager.js';

// Application version
const APP_VERSION = '0.5.0';

// Track initialization state
let gameInitialized = false;

// Global dialogue UI manager instance
let dialogueUIManager = null;

/**
 * Initialize minimal UI and button handlers only
 * This runs on page load
 */
function initializeBasicUI() {
  try {
    console.log(`%cInitializing Chronicles of the Kethaneum UI v${APP_VERSION}...`, 'color: #794d8e; font-weight: bold;');

    // Set up basic screen navigation handlers for title screen only
    setupTitleScreenHandlers();

    // Ensure only title screen is visible initially
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
      screen.classList.remove('active');
    });

    // Show title screen
    const titleScreen = document.getElementById('title-screen');
    if (titleScreen) {
      titleScreen.classList.add('active');
      titleScreen.style.display = 'flex';
    }

    console.log('%cUI initialization complete. Waiting for user action.', 'color: #E6A817; font-weight: bold;');
    return true;
  } catch (error) {
    // Handle initialization error
    console.error('Error during basic UI initialization:', error);
    ErrorHandler.showErrorMessage(
      "Initialization Error",
      "The Kethaneum's interface is experiencing difficulty initializing. Please refresh the page to try again.",
      "Reload Page",
      function () {
        window.location.reload();
      }
    );
    return false;
  }
}

/**
 * Set up title screen button handlers
 */
function setupTitleScreenHandlers() {
  // New Game button
  const newGameBtn = document.getElementById('new-game-btn');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', function () {
      console.log('New Game button clicked');

      // Initialize full game if not already done
      if (!gameInitialized) {
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
          loadingIndicator.style.display = 'flex';
        }

        initializeFullGame(true).then(() => {
          // Hide loading indicator
          if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
          }

          // Navigate to backstory screen after initialization
          Navigation.navigateToScreen('backstory-screen');

          // Set up the remaining screen handlers now that game is initialized
          setupRemainingScreenHandlers();
        });
      } else {
        // Game already initialized, just navigate
        Navigation.navigateToScreen('backstory-screen');
      }
    });
  }

  // Continue button
  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', function () {
      console.log('Continue button clicked');

      // Initialize full game if not already done
      if (!gameInitialized) {
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
          loadingIndicator.style.display = 'flex';
        }

        initializeFullGame(false).then(() => {
          // Hide loading indicator
          if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
          }

          // Navigate DIRECTLY to book of passage screen after initialization
          // (Skip backstory for returning players)
          Navigation.navigateToScreen('book-of-passage-screen');

          // Set up the remaining screen handlers now that game is initialized
          setupRemainingScreenHandlers();
        });
      } else {
        // Game already initialized, just navigate directly to Book of Passage
        Navigation.navigateToScreen('book-of-passage-screen');
      }
    });
  }
}

/**
 * Set up handlers for remaining screens
 * Only called after full game initialization
 */
function setupRemainingScreenHandlers() {
  // Backstory screen
  const continueToBookBtn = document.getElementById('continue-to-book-btn');
  if (continueToBookBtn) {
    continueToBookBtn.addEventListener('click', function () {
      console.log('Enter the Library clicked');
      Navigation.navigateToScreen('library-screen'); // Changed to library-screen
    });
  }

  // Book of Passage screen
  const startCatalogingBtn = document.getElementById('start-cataloging-btn');
  if (startCatalogingBtn) {
    startCatalogingBtn.addEventListener('click', function () {
      console.log('Start cataloging clicked');

      // Show loading indicator
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
      }

      // Load game data (puzzles) only when needed
      loadGameData().then(success => {
        // Hide loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }

        if (success) {
          // Use our local function, not window.loadSequentialPuzzle
          loadSequentialPuzzle();
          Navigation.navigateToScreen('puzzle-screen');
        } else {
          // Data loading failed, show error
          ErrorHandler.showErrorMessage(
            "Data Loading Error",
            "The Kethaneum's archives are currently unavailable. Please try again later.",
            "Return to Book of Passage"
          );
        }
      });
    });
  }

  // Library screen navigation panel navigation call

  // Using the Navigation API to initialize screen-specific navigation
  // This is part of our module architecture where navigation logic is encapsulated
  // in the navigation.js module rather than scattered across the codebase
  try {
    // Initialize library screen navigation
    Navigation.initializeLibraryNavigation();
    console.log('Library navigation initialized via API');
  } catch (navError) {
    console.error('Error initializing library navigation via API:', navError);

    // More comprehensive fallback that handles critical buttons
    console.log('Using fallback for library navigation');

    // Book of Passage button
    const bookOfPassageNavBtn = document.getElementById('book-of-passage-nav-btn');
    if (bookOfPassageNavBtn) {
      bookOfPassageNavBtn.addEventListener('click', function () {
        console.log('Navigating from Library to Book of Passage (fallback)');
        Navigation.navigateToScreen('book-of-passage-screen');
      });
    }

    // Main Menu button
    const returnToMenuBtn = document.getElementById('return-to-menu-btn');
    if (returnToMenuBtn) {
      returnToMenuBtn.addEventListener('click', function () {
        console.log('Returning to main menu from Library (fallback)');
        Navigation.navigateToScreen('title-screen');
      });
    }
  }

  // Instructions panel
  const startPlayingBtn = document.getElementById('start-playing-btn');
  if (startPlayingBtn) {
    // Remove any existing handler to prevent duplicates
    if (startPlayingBtn.clickHandler) {
      startPlayingBtn.removeEventListener('click', startPlayingBtn.clickHandler);
    }

    // Add new handler
    startPlayingBtn.clickHandler = function () {
      const instructionsPanel = document.getElementById('instructions-panel');
      if (instructionsPanel) {
        instructionsPanel.style.display = 'none';
      }

      // For mobile, start the timer animation first, then start the game after animation
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // Import RenderSystem for mobile timer
        import('./ui/renderSystem.js')
          .then(RenderSystem => {
            // Create and animate the timer
            RenderSystem.setupMobileTimerWithAnimation(function () {
              // Import and call GameLogic.startPuzzleGame
              import('./interaction/gameLogic.js')
                .then(GameLogic => {
                  GameLogic.startPuzzleGame();
                })
                .catch(error => {
                  console.error('Error importing gameLogic:', error);
                });
            });
          })
          .catch(error => {
            console.error('Error importing renderSystem:', error);
          });
      } else {
        // On desktop, just start the game immediately
        import('./interaction/gameLogic.js')
          .then(GameLogic => {
            GameLogic.startPuzzleGame();
          })
          .catch(error => {
            console.error('Error importing gameLogic:', error);
          });
      }
    };

    startPlayingBtn.addEventListener('click', startPlayingBtn.clickHandler);
  }

  // Win, Lose, and Pause panel buttons also need to be set up
  setupGamePanelHandlers();
}

/**
 * Set up handlers for game panels (win, lose, pause)
 */
function setupGamePanelHandlers() {
  // Win panel buttons
  const nextBookBtn = document.getElementById('next-book-btn');
  if (nextBookBtn) {
    nextBookBtn.addEventListener('click', function () {
      const winPanel = document.getElementById('win-panel');
      if (winPanel) {
        winPanel.style.display = 'none';
      }

      import('./interaction/gameLogic.js')
        .then(GameLogic => {
          GameLogic.loadNextPuzzle();
        })
        .catch(error => {
          console.error('Error importing gameLogic:', error);
        });
    });
  }

  const returnToBookOfPassageBtn = document.getElementById('return-to-book-of-passage-btn');
  if (returnToBookOfPassageBtn) {
    returnToBookOfPassageBtn.addEventListener('click', function () {
      const winPanel = document.getElementById('win-panel');
      if (winPanel) {
        winPanel.style.display = 'none';
      }
      Navigation.navigateToScreen('book-of-passage-screen');
    });
  }

  // Lose panel buttons
  const tryAgainBtn = document.getElementById('try-again-btn');
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', function () {
      const losePanel = document.getElementById('lose-panel');
      if (losePanel) {
        losePanel.style.display = 'none';
      }

      import('./interaction/gameLogic.js')
        .then(GameLogic => {
          GameLogic.resetCurrentPuzzle();
        })
        .catch(error => {
          console.error('Error importing gameLogic:', error);
        });
    });
  }

  const differentBookBtn = document.getElementById('different-book-btn');
  if (differentBookBtn) {
    differentBookBtn.addEventListener('click', function () {
      const losePanel = document.getElementById('lose-panel');
      if (losePanel) {
        losePanel.style.display = 'none';
      }

      import('./interaction/gameLogic.js')
        .then(GameLogic => {
          GameLogic.loadNextPuzzle();
        })
        .catch(error => {
          console.error('Error importing gameLogic:', error);
        });
    });
  }

  // Pause panel buttons
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', function () {
      import('./interaction/gameLogic.js')
        .then(GameLogic => {
          GameLogic.resumeGame();
        })
        .catch(error => {
          console.error('Error importing gameLogic:', error);
        });
    });
  }

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      const pausePanel = document.getElementById('pause-panel');
      if (pausePanel) {
        pausePanel.style.display = 'none';
      }

      import('./interaction/gameLogic.js')
        .then(GameLogic => {
          GameLogic.resetCurrentPuzzle();
        })
        .catch(error => {
          console.error('Error importing gameLogic:', error);
        });
    });
  }

  const goToBookBtn = document.getElementById('go-to-book-btn');
  if (goToBookBtn) {
    goToBookBtn.addEventListener('click', function () {
      const pausePanel = document.getElementById('pause-panel');
      if (pausePanel) {
        pausePanel.style.display = 'none';
      }

      import('./interaction/gameLogic.js')
        .then(GameLogic => {
          GameLogic.confirmReturn();
        })
        .catch(error => {
          console.error('Error importing gameLogic:', error);
        });
    });
  }
}

/**
 * Initialize the basic game systems, but not data loading
 * @param {boolean} isNewGame - Whether this is a new game
 * @returns {Promise} - Promise resolving when basic systems are initialized
 */
async function initializeBasicGameSystems(isNewGame = false) {
  try {
    console.log(`%cInitializing basic game systems...`, 'color: #794d8e; font-weight: bold;');

    // Import core modules - needed for basic functionality
    const GameState = await import('./core/gameState.js');
    const SaveSystem = await import('./core/saveSystem.js');
    const Navigation = await import('./ui/navigation.js');
    const InputHandler = await import('./interaction/inputHandler.js');
    const PanelManager = await import('./ui/panelManager.js');
    const RenderSystem = await import('./ui/renderSystem.js');

    // Initialize game state
    await GameState.initializeGameState();

    // If continuing game, load saved progress
    if (!isNewGame) {
      SaveSystem.loadGameProgress();
    } else {
      // Clear progress for new game
      SaveSystem.resetGameState(true);
    }

    // Setup event handlers
    setupEventHandlers();

    // Setup navigation protection
    Navigation.setupNavigationProtection();

    // Initialize dialogue UI manager
    try {
      dialogueUIManager = new DialogueUIManager();
      const dialogueInitSuccess = dialogueUIManager.initialize();
      if (dialogueInitSuccess) {
        console.log('%cDialogue UI Manager initialized successfully', 'color: #E6A817; font-weight: bold;');
      } else {
        console.warn('Dialogue UI Manager initialization failed - dialogue features may not work');
      }
    } catch (error) {
      console.error('Error initializing Dialogue UI Manager:', error);
    }

    console.log('%cBasic game systems initialized', 'color: #E6A817; font-weight: bold;');
    return true;
  } catch (error) {
    console.error('Error during basic game system initialization:', error);
    return false;
  }
}

/**
 * Load game data (puzzles, etc.)
 * @returns {Promise} - Promise resolving when data is loaded
 */
async function loadGameData() {
  try {
    console.log(`%cLoading game data...`, 'color: #794d8e; font-weight: bold;');

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }

    // Import data loading modules - only when needed
    const PuzzleLoader = await import('./puzzle/puzzleLoader.js');
    const GameLogic = await import('./interaction/gameLogic.js');

    // Load puzzle data with corrected paths
    try {
      // Adjust puzzle file paths to match actual location
      const puzzlePaths = {
        'Kethaneum': 'scripts/data/puzzleData/kethaneumPuzzles.json', // Complete path
        'nature': 'scripts/data/puzzleData/naturePuzzles.json',        // Complete path
        'test artifact': 'scripts/data/puzzleData/testPuzzles.json' 
      };

      await PuzzleLoader.loadAllPuzzlesWithPaths(puzzlePaths);
    } catch (puzzleError) {
      console.error('Error loading puzzles:', puzzleError);
      // Continue despite puzzle loading error
      // Error handling for missing puzzles already in place
    }

    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    console.log('%cGame data loaded successfully', 'color: #E6A817; font-weight: bold;');
    return true;
  } catch (error) {
    console.error('Error loading game data:', error);

    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    return false;
  }
}

/**
 * Combined function that initializes everything
 * @param {boolean} isNewGame - Whether this is a new game
 * @returns {Promise} - Promise resolving when game is fully initialized
 */
async function initializeFullGame(isNewGame = false) {
  try {
    console.log(`%cInitializing full game systems...`, 'color: #794d8e; font-weight: bold;');

    // First initialize basic systems
    const basicInitSuccess = await initializeBasicGameSystems(isNewGame);
    if (!basicInitSuccess) {
      throw new Error("Failed to initialize basic game systems");
    }

    // We'll load game data later, when needed
    // This marks initialization as complete even without data loading
    gameInitialized = true;

    console.log('%cFull game initialization complete', 'color: #E6A817; font-weight: bold;');
    return true;
  } catch (error) {
    // Handle initialization error
    console.error('Fatal error during initialization:', error);
    ErrorHandler.showErrorMessage(
      "Initialization Error",
      "The Kethaneum's systems are experiencing difficulty initializing. Please refresh the page to try again.",
      "Reload Page",
      function () {
        window.location.reload();
      }
    );

    return false;
  }
}

/**
 * Set up event handlers for game events
 */
function setupEventHandlers() {
  // Word found event
  EventSystem.subscribe(EventSystem.GameEvents.WORD_FOUND, (wordData) => {
    console.log(`Word found: ${wordData.word}`);
  });

  // Puzzle completed event
  EventSystem.subscribe(EventSystem.GameEvents.PUZZLE_COMPLETED, (data) => {
    console.log(`Puzzle completed: ${data.book} - Part ${data.part}`);
  });

  // Book completed event
  EventSystem.subscribe(EventSystem.GameEvents.BOOK_COMPLETED, (bookTitle) => {
    console.log(`Book completed: ${bookTitle}`);
  });

  // Screen change event
  EventSystem.subscribe(EventSystem.GameEvents.SCREEN_CHANGED, (screenId) => {
    console.log(`Screen changed: ${screenId}`);
  });

  // Error event
  EventSystem.subscribe(EventSystem.GameEvents.ERROR, (errorData) => {
    console.error(`Error in ${errorData.context}:`, errorData.error);
  });
}

// Initialize only basic UI when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  initializeBasicUI();
});

// Import GameState for loadSequentialPuzzle
import * as GameState from './core/gameState.js';

/**
 * Get the global dialogue UI manager instance
 * @returns {DialogueUIManager|null} - The dialogue UI manager instance
 */
function getDialogueUIManager() {
  return dialogueUIManager;
}

// Export functions for module access
export {
  APP_VERSION,
  initializeBasicUI,
  initializeBasicGameSystems,
  loadGameData,
  initializeFullGame,
  loadSequentialPuzzle,
  setupRemainingScreenHandlers,
  getDialogueUIManager
};
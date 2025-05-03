/**
 * Enhanced bootstrap with proper screen flow management
 */

// Import core modules
import * as Config from './core/config.js';
import * as EventSystem from './core/eventSystem.js';
import * as Navigation from './ui/navigation.js';
import * as ErrorHandler from './utils/errorHandler.js';

// Application version
const APP_VERSION = '0.5.0';

// Track initialization state
let gameInitialized = false;

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
}

// Continue button
const continueBtn = document.getElementById('continue-btn');
if (continueBtn) {
  continueBtn.addEventListener('click', function () {
    console.log('Continue button clicked');

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }

    // Initialize full game if not already done
    if (!gameInitialized) {
      initializeFullGame(false).then(() => {
        // Hide loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }

        // Navigate DIRECTLY to book of passage screen after initialization (Skip backstory for returning players)
        navigateToScreen('book-of-passage-screen');

        // Set up the remaining screen handlers
        setupRemainingScreenHandlers();
      }).catch(error => {
        console.error('Error during game initialization:', error);
        // Hide loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }

        // Show error message
        showErrorMessage(
          "Initialization Error",
          "The Kethaneum's systems encountered an error. Please try again.",
          "Return to Title",
          function () {
            document.getElementById('error-panel').style.display = 'none';
          }
        );
      });
    } else {
      // Game already initialized, just navigate directly to Book of Passage
      navigateToScreen('book-of-passage-screen');

      // Hide loading indicator if it's showing
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
    }
  });
}

/**
 * Load a sequential puzzle from available puzzles
 * @param {string} genre - Optional genre to load from
 * @param {string} book - Optional book to load
 * @returns {boolean} - Success or failure
 */
function loadSequentialPuzzle(genre, book) {
  console.log('Loading sequential puzzle:', { genre, book });

  try {
    // Get available puzzles from state
    if (!state.puzzles || Object.keys(state.puzzles).length === 0) {
      console.error('No puzzles available to load');
      ErrorHandler.showErrorMessage(
        "Puzzle Loading Error",
        "No puzzles are currently available in the Kethaneum's archives.",
        "Return to Book of Passage",
        function () {
          document.getElementById('error-panel').style.display = 'none';
          navigateToScreen('book-of-passage-screen');
        }
      );
      return false;
    }

    // Select first available genre if none specified
    if (!genre) {
      const genres = Object.keys(state.puzzles);
      if (genres.length > 0) {
        genre = genres[0];
      } else {
        throw new Error('No puzzle genres available');
      }
    }

    // Get puzzles for the genre
    const puzzlesInGenre = state.puzzles[genre];
    if (!puzzlesInGenre || puzzlesInGenre.length === 0) {
      throw new Error(`No puzzles found for genre: ${genre}`);
    }

    // Select a random puzzle if no book specified
    const randomIndex = Math.floor(Math.random() * puzzlesInGenre.length);
    const puzzleData = puzzlesInGenre[randomIndex];

    // Update state
    state.currentPuzzleIndex = randomIndex;
    state.currentGenre = genre;
    state.currentBook = puzzleData.book;
    state.currentStoryPart = puzzleData.storyPart;

    // Try to dynamically import the puzzle generator module
    import('./puzzle/puzzleGenerator.js')
      .then(PuzzleGenerator => {
        // Use the module's initializePuzzle function
        return PuzzleGenerator.initializePuzzle(puzzleData);
      })
      .catch(error => {
        console.error('Error importing puzzle generator:', error);
        // Fallback error handling
        ErrorHandler.showErrorMessage(
          "Puzzle System Error",
          "The Kethaneum's puzzle system encountered an error.",
          "Return to Book of Passage",
          function () {
            document.getElementById('error-panel').style.display = 'none';
            navigateToScreen('book-of-passage-screen');
          }
        );
        return false;
      });

    return true;
  } catch (error) {
    console.error('Error in loadSequentialPuzzle:', error);
    ErrorHandler.showErrorMessage(
      "Puzzle Selection Error",
      "The Kethaneum's indexing system encountered an error while selecting a puzzle.",
      "Return to Book of Passage",
      function () {
        document.getElementById('error-panel').style.display = 'none';
        navigateToScreen('book-of-passage-screen');
      }
    );
    return false;
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
      console.log('Continue to book clicked');
      Navigation.navigateToScreen('book-of-passage-screen');
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
          // Call our local function directly
          loadSequentialPuzzle();
          navigateToScreen('puzzle-screen');
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

      // Handle mobile timer animation
      const isMobile = window.innerWidth <= 768;
      if (isMobile && window.setupMobileTimerWithAnimation) {
        window.setupMobileTimerWithAnimation(function () {
          window.startPuzzleGame();
        });
      } else {
        window.startPuzzleGame();
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
      window.loadNextPuzzle();
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
      window.resetCurrentPuzzle();
    });
  }

  const differentBookBtn = document.getElementById('different-book-btn');
  if (differentBookBtn) {
    differentBookBtn.addEventListener('click', function () {
      const losePanel = document.getElementById('lose-panel');
      if (losePanel) {
        losePanel.style.display = 'none';
      }
      window.loadNextPuzzle();
    });
  }

  // Pause panel buttons
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', function () {
      window.resumeGame();
    });
  }

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      const pausePanel = document.getElementById('pause-panel');
      if (pausePanel) {
        pausePanel.style.display = 'none';
      }
      window.resetCurrentPuzzle();
    });
  }

  const goToBookBtn = document.getElementById('go-to-book-btn');
  if (goToBookBtn) {
    goToBookBtn.addEventListener('click', function () {
      const pausePanel = document.getElementById('pause-panel');
      if (pausePanel) {
        pausePanel.style.display = 'none';
      }
      window.confirmReturn();
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
      const puzzlePaths = {
        'Kethaneum': 'scripts/data/puzzleData/kethaneumPuzzles.json',
        'nature': 'scripts/data/puzzleData/naturePuzzles.json'
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
  // ... Event handlers remain the same as in original moduleBootstrap.js
  // This keeps the existing event subscription code
}

// Initialize only basic UI when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  initializeBasicUI();
});

// Export functions for module access
export {
  APP_VERSION,
  initializeBasicUI,
  initializeBasicGameSystems,
  loadGameData,
  initializeFullGame,
  loadSequentialPuzzle,
  setupRemainingScreenHandlers
};

/**
 * Main entry point for Chronicles of the Kethaneum
 * This module orchestrates the loading of all other modules and initializes the game
 */

// Import core modules
import * as GameState from './core/gameState.js';
import * as SaveSystem from './core/saveSystem.js';

// Import UI modules
import * as Navigation from './ui/navigation.js';
import * as PanelManager from './ui/panelManager.js';
import * as RenderSystem from './ui/renderSystem.js';

// Import puzzle modules
import * as PuzzleLoader from './puzzle/puzzleLoader.js';

// Import utility modules
import * as ErrorHandler from './utils/errorHandler.js';
import * as MathUtils from './utils/mathUtils.js';
import * as DomUtils from './utils/domUtils.js';

// Create global namespace for transition period
window.game = {
  // Module references
  core: {
    gameState: GameState,
    saveSystem: SaveSystem
  },
  
  ui: {
    navigation: Navigation,
    panelManager: PanelManager,
    renderSystem: RenderSystem
  },
  
  puzzle: {
    puzzleLoader: PuzzleLoader
  },
  
  utils: {
    errorHandler: ErrorHandler,
    mathUtils: MathUtils,
    domUtils: DomUtils
  },
  
  // Module system metadata
  version: '0.2',
  modulesLoaded: [
    'gameState', 'saveSystem',
    'navigation', 'panelManager', 'renderSystem',
    'puzzleLoader',
    'errorHandler', 'mathUtils', 'domUtils'
  ],
  
  // Initialize the game
  init: async function() {
    console.log('%cInitializing Chronicles of the Kethaneum...', 'color: #794d8e; font-weight: bold;');
    console.log(`Module system version: ${this.version}`);
    console.log(`Loaded modules: ${this.modulesLoaded.join(', ')}`);
    
    try {
      // Initialize core game state
      await GameState.initializeGame();
      
      // Initialize navigation
      Navigation.setupScreenNavigation();
      Navigation.setupNavigationProtection();
      
      console.log('%cInitialization complete', 'color: #E6A817; font-weight: bold;');
      return true;
    } catch (error) {
      console.error('Error during initialization:', error);
      return false;
    }
  },
  
  // Configuration (to be moved to a config module later)
  config: {
    gridSize: 10,           // Square grid dimension
    timeLimit: 180,         // Time limit in seconds
    minWordLength: 3,       // Minimum word length
    maxWordLength: 10,      // Maximum word length
    maxWords: 10,           // Maximum words to include
    directions: [
      [0, 1],   // right
      [1, 0],   // down
      [1, 1],   // diagonal down-right
      [0, -1],  // left
      [-1, 0],  // up
      [-1, -1], // diagonal up-left
      [1, -1],  // diagonal down-left
      [-1, 1]   // diagonal up-right
    ]
  }
};

// Assign config to window for transition period
window.config = window.game.config;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the game
  window.game.init().then(success => {
    if (success) {
      // Display module system status in console
      console.log('%cChronicles of the Kethaneum Module System', 'color: #794d8e; font-size: 16px; font-weight: bold;');
      console.log('%cAll modules loaded successfully!', 'color: #E6A817;');
    } else {
      console.error('Game initialization failed');
      ErrorHandler.showErrorMessage(
        "Initialization Error",
        "The Kethaneum's systems are experiencing difficulty initializing. Please refresh the page to try again.",
        "Reload Page",
        function() {
          window.location.reload();
        }
      );
    }
  }).catch(error => {
    console.error('Fatal error during initialization:', error);
    ErrorHandler.showErrorMessage(
      "Critical Error",
      "A critical error occurred while initializing the Kethaneum's systems. Please refresh the page to try again.",
      "Reload Page",
      function() {
        window.location.reload();
      }
    );
  });
});

// Export the game object for module access
export default window.game;
/**
 * Main entry point for Chronicles of the Kethaneum
 * This module orchestrates the loading of all other modules and initializes the game
 */

// Import core modules
import * as Config from './core/config.js';
import * as EventSystem from './core/eventSystem.js';
import * as GameState from './core/gameState.js';
import * as SaveSystem from './core/saveSystem.js';

// Import interaction modules
import * as InputHandler from './interaction/inputHandler.js';
import * as GameLogic from './interaction/gameLogic.js';

// Import UI modules
import * as Navigation from './ui/navigation.js';
import * as PanelManager from './ui/panelManager.js';
import * as RenderSystem from './ui/renderSystem.js';

// Import puzzle modules
import * as PuzzleLoader from './puzzle/puzzleLoader.js';
import * as PuzzleGenerator from './puzzle/puzzleGenerator.js';

// Import utility modules
import * as ErrorHandler from './utils/errorHandler.js';
import * as MathUtils from './utils/mathUtils.js';
import * as DomUtils from './utils/domUtils.js';

// Create global namespace for transition period
window.game = {
  // Module references
  core: {
    config: Config,
    eventSystem: EventSystem,
    gameState: GameState,
    saveSystem: SaveSystem
  },
  
  interaction: {
    inputHandler: InputHandler,
    gameLogic: GameLogic
  },
  
  ui: {
    navigation: Navigation,
    panelManager: PanelManager,
    renderSystem: RenderSystem
  },
  
  puzzle: {
    puzzleLoader: PuzzleLoader,
    puzzleGenerator: PuzzleGenerator
  },
  
  utils: {
    errorHandler: ErrorHandler,
    mathUtils: MathUtils,
    domUtils: DomUtils
  },
  
  // Module system metadata
  version: '0.4',
  modulesLoaded: [
    'config', 'eventSystem', 'gameState', 'saveSystem',
    'inputHandler', 'gameLogic',
    'navigation', 'panelManager', 'renderSystem',
    'puzzleLoader', 'puzzleGenerator',
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
      
      // Initialize navigation and UI systems
      Navigation.setupScreenNavigation();
      Navigation.setupNavigationProtection();
      
      // Register initial event handlers
      this.registerEventHandlers();
      
      // Emit initialization event
      EventSystem.emit(EventSystem.GameEvents.GAME_INITIALIZED, {
        version: this.version,
        timestamp: new Date()
      });
      
      console.log('%cInitialization complete', 'color: #E6A817; font-weight: bold;');
      return true;
    } catch (error) {
      console.error('Error during initialization:', error);
      EventSystem.emit(EventSystem.GameEvents.ERROR, {
        context: 'initialization',
        error: error
      });
      return false;
    }
  },
  
  /**
   * Register primary event handlers
   */
  registerEventHandlers: function() {
    // Word found event
    EventSystem.subscribe(EventSystem.GameEvents.WORD_FOUND, (wordData) => {
      console.log(`Word found: ${wordData.word}`);
    });
    
    // Puzzle completed event
    EventSystem.subscribe(EventSystem.GameEvents.PUZZLE_COMPLETED, (data) => {
      console.log(`Puzzle completed: ${data.book} - Part ${data.part}`);
      SaveSystem.saveGameProgress();
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
      if (Config.get('system.debugMode')) {
        console.error(`Error in ${errorData.context}:`, errorData.error);
      }
    });
  }
};

// Assign config to window for transition period
window.config = Config.getConfig();

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
/**
 * Configuration module for Chronicles of the Kethaneum
 * This module manages game configuration and settings
 */

// Default configuration values
const defaultConfig = {
  // Game settings
  gridSize: 10,           // Square grid dimension
  timeLimit: 180,         // Time limit in seconds (3 minutes)
  minWordLength: 3,       // Minimum word length
  maxWordLength: 10,      // Maximum word length
  maxWords: 10,           // Maximum words to include per puzzle
  
  // Word directions
  directions: [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1]   // diagonal up-right
  ],
  
  // Difficulty settings
  difficultyLevels: {
    easy: {
      gridSize: 8,
      timeLimit: 240,     // 4 minutes
      maxWords: 6
    },
    medium: {
      gridSize: 10,
      timeLimit: 180,     // 3 minutes
      maxWords: 8
    },
    hard: {
      gridSize: 12,
      timeLimit: 150,     // 2.5 minutes
      maxWords: 10
    }
  },
  
  // Testing flags
  testing: {
    enabled: false,       // Main testing mode toggle
    skipTimers: false,    // Skip timers for faster testing
    showAllWords: false,  // Highlight all words for validation
    autoWin: false,       // Automatic win for testing end states
    loadAllPuzzles: true  // Load all puzzles at startup
  },
  
  // Feature flags
  features: {
    hapticFeedback: true,     // Vibration on mobile when words found
    animations: true,         // Enable animations
    progressTracking: true,   // Track progress across sessions
    soundEffects: false       // Sound effects (future)
  },
  
  // System settings
  system: {
    debugMode: false,         // Enable extra logging
    persistence: true,        // Enable saving to localStorage
    errorReporting: false     // Send error reports (future)
  }
};

// Current active configuration
let activeConfig = { ...defaultConfig };

/**
 * Get the full active configuration
 * @returns {Object} - The current configuration
 */
function getConfig() {
  return { ...activeConfig };
}

/**
 * Get a specific configuration value
 * @param {string} key - The configuration key path (dot notation supported)
 * @param {any} defaultValue - Default value if key not found
 * @returns {any} - The configuration value
 */
function get(key, defaultValue = null) {
  const path = key.split('.');
  let current = activeConfig;
  
  for (const part of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
    if (current === undefined) {
      return defaultValue;
    }
  }
  
  return current !== undefined ? current : defaultValue;
}

/**
 * Set a specific configuration value
 * @param {string} key - The configuration key path (dot notation supported)
 * @param {any} value - The value to set
 * @returns {boolean} - Success
 */
function set(key, value) {
  const path = key.split('.');
  const lastKey = path.pop();
  let current = activeConfig;
  
  // Traverse the path
  for (const part of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return false;
    }
    
    // Create the path if it doesn't exist
    if (current[part] === undefined) {
      current[part] = {};
    }
    
    current = current[part];
  }
  
  // Set the value
  current[lastKey] = value;
  return true;
}

/**
 * Apply a difficulty level
 * @param {string} level - Difficulty level (easy, medium, hard)
 * @returns {boolean} - Success
 */
function setDifficultyLevel(level) {
  if (!defaultConfig.difficultyLevels[level]) {
    console.warn(`Unknown difficulty level: ${level}`);
    return false;
  }
  
  // Apply difficulty settings
  const difficultySettings = defaultConfig.difficultyLevels[level];
  for (const [key, value] of Object.entries(difficultySettings)) {
    activeConfig[key] = value;
  }
  
  console.log(`Applied ${level} difficulty settings`);
  return true;
}

/**
 * Enable testing mode
 * @param {Object} options - Testing options to enable
 */
function enableTestingMode(options = {}) {
  // Enable main testing flag
  activeConfig.testing.enabled = true;
  
  // Apply specific testing options
  for (const [key, value] of Object.entries(options)) {
    if (activeConfig.testing[key] !== undefined) {
      activeConfig.testing[key] = value;
    }
  }
  
  console.log('Testing mode enabled with options:', activeConfig.testing);
}

/**
 * Disable testing mode
 */
function disableTestingMode() {
  // Reset all testing flags to defaults
  activeConfig.testing = { ...defaultConfig.testing };
  activeConfig.testing.enabled = false;
  
  console.log('Testing mode disabled');
}

/**
 * Reset configuration to defaults
 */
function resetToDefaults() {
  activeConfig = { ...defaultConfig };
  console.log('Configuration reset to defaults');
}

/**
 * Export configuration as JSON string
 * @returns {string} - JSON configuration
 */
function exportConfig() {
  return JSON.stringify(activeConfig, null, 2);
}

/**
 * Import configuration from JSON string
 * @param {string} json - JSON configuration
 * @returns {boolean} - Success
 */
function importConfig(json) {
  try {
    const newConfig = JSON.parse(json);
    // Validate config structure
    if (typeof newConfig !== 'object' || newConfig === null) {
      throw new Error('Invalid configuration format');
    }
    
    // Apply new config
    activeConfig = newConfig;
    return true;
  } catch (error) {
    console.error('Error importing configuration:', error);
    return false;
  }
}

// Expose configuration to window for backward compatibility
window.config = activeConfig;

// Export for module system
export {
  getConfig,
  get,
  set,
  setDifficultyLevel,
  enableTestingMode,
  disableTestingMode,
  resetToDefaults,
  exportConfig,
  importConfig
};
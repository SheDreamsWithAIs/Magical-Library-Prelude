/**
 * DialogueManager for Chronicles of the Kethaneum
 * Handles character banter and story event dialogue systems
 */

class DialogueManager {
  constructor() {
    this.config = null;
    this.characters = new Map(); // character-id -> character data
    this.storyEvents = new Map(); // event-id -> story event data
    this.loadedGroups = new Set(); // track which loading groups are loaded
    this.recentlyUsedCharacters = new Set(); // track recent character interactions
    this.currentStoryBeat = 'hook'; // track story progression
    this.isInitialized = false;
  }

  /**
   * Initialize the dialogue system
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      console.log('Initializing DialogueManager...');
      
      // Load configuration first
      await this.loadConfiguration();
      
      // Load initial character groups
      await this.loadCharacterGroup('introduction_characters');
      
      this.isInitialized = true;
      console.log('DialogueManager initialized successfully');
      return true;
    } catch (error) {
      console.error('DialogueManager initialization failed:', error);
      this.handleError('initialization', error);
      return false;
    }
  }

  /**
   * Load dialogue configuration
   * @returns {Promise<void>}
   */
  async loadConfiguration() {
    try {
      const response = await fetch('scripts/dialogue/dialogue-config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      
      this.config = await response.json();
      console.log('Dialogue configuration loaded');
    } catch (error) {
      console.error('Error loading dialogue configuration:', error);
      // Use fallback configuration
      this.config = this.getFallbackConfig();
    }
  }

  /**
   * Get fallback configuration if main config fails to load
   * @returns {Object} - Fallback config
   */
  getFallbackConfig() {
    return {
      paths: {
        charactersDirectory: 'scripts/dialogue/characters/',
        storyEventsDirectory: 'scripts/dialogue/story-events/'
      },
      storyStructure: {
        storyBeats: {
          HOOK: 'hook',
          FIRST_PLOT_POINT: 'first_plot_point'
        },
        defaultStoryBeat: 'hook'
      },
      behavior: {
        banterSelection: {
          method: 'random',
          avoidRepeats: true
        },
        errorHandling: {
          missingCharacterAction: 'useDefault',
          missingStoryAction: 'skipGracefully'
        }
      }
    };
  }

  /**
   * Load characters from a specific loading group
   * @param {string} groupName - Loading group to load
   * @returns {Promise<void>}
   */
  async loadCharacterGroup(groupName) {
    if (this.loadedGroups.has(groupName)) {
      console.log(`Character group '${groupName}' already loaded`);
      return;
    }

    try {
      console.log(`Loading character group: ${groupName}`);
      
      // Load character manifest to discover available files
      const filenames = await this.loadCharacterManifest();
      
      // Load each file and check if it belongs to this group
      const groupCharacters = [];
      for (const filename of filenames) {
        try {
          const characterData = await this.loadAndValidateCharacterFile(filename);
          if (characterData && characterData.character.loadingGroup === groupName) {
            groupCharacters.push(characterData);
            // Store character data
            this.characters.set(characterData.character.id, characterData);
          }
        } catch (error) {
          console.warn(`Skipping invalid character file: ${filename}`, error);
        }
      }
      
      this.loadedGroups.add(groupName);
      console.log(`Character group '${groupName}' loaded successfully with ${groupCharacters.length} characters`);
    } catch (error) {
      console.error(`Error loading character group '${groupName}':`, error);
      this.handleError('character-loading', error);
    }
  }

  /**
   * Load the character manifest file
   * @returns {Promise<Array<string>>} - Array of character filenames
   */
  async loadCharacterManifest() {
    try {
      const manifestPath = this.config.paths.charactersDirectory + 'character-manifest.json';
      const response = await fetch(manifestPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load character manifest: ${response.status}`);
      }
      
      const filenames = await response.json();
      
      // Validate manifest is an array
      if (!Array.isArray(filenames)) {
        throw new Error('Invalid manifest structure: expected array of filenames');
      }
      
      console.log(`Loaded character manifest with ${filenames.length} character files`);
      return filenames;
    } catch (error) {
      console.error('Error loading character manifest:', error);
      
      // Return fallback array for our existing character
      return ["archivist-lumina.json"];
    }
  }

  /**
   * Load and validate a character file
   * @param {string} filename - Character filename to load
   * @returns {Promise<Object|null>} - Character data or null if invalid
   */
  async loadAndValidateCharacterFile(filename) {
    try {
      const basePath = this.config.paths.charactersDirectory;
      const response = await fetch(`${basePath}${filename}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load character file: ${response.status}`);
      }

      const characterData = await response.json();
      
      // Validate character data structure
      if (!this.validateCharacterData(characterData)) {
        throw new Error(`Invalid character data structure in ${filename}`);
      }

      console.log(`Loaded character: ${characterData.character.name} (${characterData.character.id})`);
      return characterData;
    } catch (error) {
      console.error(`Error loading character file '${filename}':`, error);
      this.handleError('character-file-loading', error);
      return null;
    }
  }

  /**
   * Validate character data structure
   * @param {Object} characterData - Character data to validate
   * @returns {boolean} - Whether data is valid
   */
  validateCharacterData(characterData) {
    if (!characterData || typeof characterData !== 'object') {
      return false;
    }

    const character = characterData.character;
    if (!character || !character.id || !character.name) {
      return false;
    }

    const dialogue = characterData.banterDialogue;
    if (!Array.isArray(dialogue)) {
      return false;
    }

    // Validate each dialogue entry has required fields
    for (const entry of dialogue) {
      if (!entry.id || !entry.text || !Array.isArray(entry.emotion)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get random character banter
   * @returns {Object|null} - Banter dialogue object or null
   */
  getRandomBanter() {
    if (!this.isInitialized) {
      console.warn('DialogueManager not initialized');
      return null;
    }

    try {
      // Placeholder implementation - will be expanded in later steps
      console.log('Getting random banter...');
      
      // This will be implemented when we have actual character data loaded
      return null;
    } catch (error) {
      console.error('Error getting random banter:', error);
      this.handleError('banter-selection', error);
      return null;
    }
  }

  /**
   * Trigger a story event
   * @param {string} eventId - Story event ID to trigger
   * @returns {Object|null} - Story event data or null
   */
  triggerStoryEvent(eventId) {
    if (!this.isInitialized) {
      console.warn('DialogueManager not initialized');
      return null;
    }

    try {
      console.log(`Triggering story event: ${eventId}`);
      
      // Placeholder implementation - will be expanded in later steps
      return null;
    } catch (error) {
      console.error(`Error triggering story event '${eventId}':`, error);
      this.handleError('story-event', error);
      return null;
    }
  }

  /**
   * Update current story beat
   * @param {string} storyBeat - New story beat
   */
  setStoryBeat(storyBeat) {
    if (this.config?.storyStructure?.storyBeats && 
        Object.values(this.config.storyStructure.storyBeats).includes(storyBeat)) {
      this.currentStoryBeat = storyBeat;
      console.log(`Story beat updated to: ${storyBeat}`);
      
      // Check if we need to load new character groups
      this.checkForGroupLoading(storyBeat);
      
      // Check for character retirements
      this.checkForCharacterRetirements(storyBeat);
    } else {
      console.warn(`Invalid story beat: ${storyBeat}`);
    }
  }

  /**
   * Check if new character groups should be loaded based on story beat
   * @param {string} storyBeat - Current story beat
   */
  checkForGroupLoading(storyBeat) {
    // Placeholder - will implement loading logic in later steps
    console.log(`Checking for group loading at story beat: ${storyBeat}`);
  }

  /**
   * Check for character retirements based on story beat
   * @param {string} storyBeat - Current story beat
   */
  checkForCharacterRetirements(storyBeat) {
    // Placeholder - will implement retirement logic in later steps
    console.log(`Checking for character retirements at story beat: ${storyBeat}`);
  }

  /**
   * Handle errors with configurable responses
   * @param {string} context - Error context
   * @param {Error} error - Error object
   */
  handleError(context, error) {
    const errorAction = this.config?.behavior?.errorHandling || {};
    
    console.error(`DialogueManager error in ${context}:`, error);
    
    // Log error details for debugging
    if (this.config?.system?.enableLogging) {
      console.log('Error details:', {
        context,
        message: error.message,
        stack: error.stack
      });
    }
    
    // Could implement error reporting here in the future
  }

  /**
   * Get system status for debugging
   * @returns {Object} - System status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentStoryBeat: this.currentStoryBeat,
      loadedGroups: Array.from(this.loadedGroups),
      charactersLoaded: this.characters.size,
      storyEventsLoaded: this.storyEvents.size,
      recentlyUsedCharacters: Array.from(this.recentlyUsedCharacters)
    };
  }
}

// Create and export singleton instance
const dialogueManager = new DialogueManager();

// Export for module system
export { DialogueManager, dialogueManager };
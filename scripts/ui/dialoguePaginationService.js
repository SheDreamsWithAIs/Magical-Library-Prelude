/**
 * DialoguePaginationService for Chronicles of the Kethaneum
 * Handles all text measurement, chunking, and pagination logic
 * Protected by Phalanx Formation 🛡️
 * 
 * EVENTUAL REFACTOR PLAN:
 * This service will eventually hold ALL pagination logic currently in DialogueUIManager
 * Functions to move FROM DialogueUIManager TO this service:
 * - measureTextProportions(text, boundaries)
 * - applyTextMarginStandards(baseCharLimit, category) 
 * - chunkDialogueText(dialogueText, marginStandards)
 * - splitLongSentence(sentence, charLimit)
 * - checkWordLength(word, charLimit)
 * - PaginationController class (entire embedded class)
 */

class DialoguePaginationService {
  constructor() {
    this.isInitialized = false;
    this.paginationController = null;
    this.currentDialogueId = null;
    this.errorState = false;
    
    console.log('DialoguePaginationService created - Phalanx shields ready 🛡️');
  }

  /**
   * Initialize the service with error handling
   * @returns {boolean} - Success status
   */
  initialize() {
    try {
      // Create embedded pagination controller (will eventually be moved here from DialogueUIManager)
      this.paginationController = new PaginationController();
      
      this.isInitialized = true;
      this.errorState = false;
      
      console.log('DialoguePaginationService initialized successfully');
      return true;
    } catch (error) {
      console.error('DialoguePaginationService initialization failed:', error);
      this.errorState = true;
      return false;
    }
  }

  /**
   * MAIN INTEGRATION METHOD - Process dialogue text for display
   * This is the primary method that DialogueUIManager will call
   * 
   * @param {string} dialogueText - Raw dialogue text to process
   * @param {Object} boundaries - Container boundaries from DialogueUIManager
   * @param {string} dialogueId - Unique identifier for this dialogue
   * @returns {Object} - Processed dialogue data or error state
   */
  processDialogueForDisplay(dialogueText, boundaries, dialogueId = null) {
    try {
      // Validate inputs
      if (!this.isInitialized) {
        throw new Error('DialoguePaginationService not initialized');
      }
      
      if (!dialogueText || typeof dialogueText !== 'string') {
        throw new Error('Invalid dialogue text provided');
      }
      
      if (!boundaries || typeof boundaries !== 'object') {
        throw new Error('Invalid boundaries provided');
      }

      // Set current dialogue ID for tracking
      this.currentDialogueId = dialogueId || `dialogue_${Date.now()}`;

      // Step 1: Measure text requirements (will use moved function)
      // TODO: Use measureTextProportions() when moved from DialogueUIManager
      const textProportions = this.measureTextRequirements(dialogueText, boundaries);
      
      // Step 2: Apply safety margins (will use moved function)
      // TODO: Use applyTextMarginStandards() when moved from DialogueUIManager  
      const marginStandards = this.applySafetyMargins(textProportions.characterLimit, textProportions.category);
      
      // Step 3: Chunk text if needed (will use moved function)
      // TODO: Use chunkDialogueText() when moved from DialogueUIManager
      const chunkedData = this.chunkTextSafely(dialogueText, marginStandards);
      
      // Step 4: Initialize pagination state
      const paginationReady = this.initializePaginationState(chunkedData);
      
      if (!paginationReady) {
        throw new Error('Failed to initialize pagination state');
      }

      // Return processed data ready for UI display
      return {
        success: true,
        dialogueId: this.currentDialogueId,
        totalChunks: chunkedData.totalChunks,
        currentChunk: 0,
        currentText: chunkedData.chunks[0] || dialogueText,
        hasMultipleChunks: chunkedData.totalChunks > 1,
        navigationEnabled: chunkedData.totalChunks > 1,
        error: null
      };

    } catch (error) {
      console.error('DialoguePaginationService processing failed:', error);
      
      // Return safe fallback data
      return this.createFallbackResponse(dialogueText, error);
    }
  }

  /**
   * Navigate to next chunk of current dialogue
   * Called when user clicks continue button
   * 
   * @returns {Object} - Next chunk data or completion status
   */
  navigateToNextChunk() {
    try {
      if (!this.paginationController || !this.paginationController.validateState()) {
        throw new Error('Pagination state invalid');
      }

      // Check if we can advance
      const canAdvance = this.paginationController.state.currentChunk < (this.paginationController.state.totalChunks - 1);
      
      if (!canAdvance) {
        return {
          success: true,
          completed: true,
          hasNext: false,
          currentText: null,
          dialogueId: this.currentDialogueId
        };
      }

      // Advance to next chunk
      this.paginationController.state.currentChunk++;
      this.paginationController.state.checksum = this.paginationController.calculateChecksum(this.paginationController.state);

      const currentText = this.paginationController.state.chunks[this.paginationController.state.currentChunk];
      const hasNext = this.paginationController.state.currentChunk < (this.paginationController.state.totalChunks - 1);

      return {
        success: true,
        completed: false,
        hasNext: hasNext,
        currentText: currentText,
        currentChunk: this.paginationController.state.currentChunk,
        totalChunks: this.paginationController.state.totalChunks,
        dialogueId: this.currentDialogueId
      };

    } catch (error) {
      console.error('Navigation failed:', error);
      
      return {
        success: false,
        error: error.message,
        completed: true, // Fail safe - end dialogue
        dialogueId: this.currentDialogueId
      };
    }
  }

  /**
   * Reset pagination state for new dialogue
   */
  resetForNewDialogue() {
    try {
      if (this.paginationController) {
        this.paginationController.resetState();
      }
      this.currentDialogueId = null;
      console.log('DialoguePaginationService reset for new dialogue');
    } catch (error) {
      console.error('Error resetting pagination service:', error);
      // Reinitialize if reset fails
      this.initialize();
    }
  }

  /**
   * TEMPORARY IMPLEMENTATIONS - Will be replaced with moved functions
   * These are placeholders until we move the real implementations from DialogueUIManager
   */
  
  /**
  * Measure text proportions for dialogue display
  * Currently handles desktop/tablet layouts (Medium, Large, ExtraLarge)
  * 
  * TODO: Add mobile layout support in Beta phase
  * - Mobile will need separate layout calculations
  * - Update this function once mobile dialogue layout is implemented
  * - Consider different text flow patterns for mobile
  * 
  * @param {string} text - Text to measure
  * @param {Object} boundaries - Container boundaries from getContainerBoundaries()
  * @returns {Object} - Text proportion data with character limits and sizing
  */
  measureTextProportions(text, boundaries) {
    try {
      // Skip mobile calculations for Alpha - will be handled in Beta
      if (boundaries.isSmall) {
        console.warn('Mobile text proportions not implemented - Beta phase feature');
        return {
          characterLimit: 100, // Temporary fallback
          chunks: [text.substring(0, 100)],
          error: 'mobile-not-implemented'
        };
      }

      // Handle desktop/tablet proportions
      const scale = boundaries.scale;

      // Base character limits for different categories
      let baseCharLimit;
      if (boundaries.isMedium) {
        baseCharLimit = 200;
      } else if (boundaries.isLarge) {
        baseCharLimit = 300;
      } else if (boundaries.isExtraLarge) {
        baseCharLimit = 400;
      }

      // Scale the character limit proportionally
      const scaledCharLimit = Math.round(baseCharLimit * scale);

      return {
        characterLimit: scaledCharLimit,
        scale: scale,
        category: boundaries.isMedium ? 'medium' : boundaries.isLarge ? 'large' : 'extraLarge',
        error: null
      };

    } catch (error) {
      console.error('Text proportion measurement failed:', error);
      return {
        characterLimit: 200, // Safe fallback
        error: error.message
      };
    }
  }

 /**
 * Apply safety margin standards to text character limits
 * Adds buffer zones and validates against corruption/tampering
 * 
 * @param {number} baseCharLimit - Base character limit from measureTextProportions
 * @param {string} category - Device category (medium, large, extraLarge)
 * @returns {Object} - Standardized limits with safety margins
 */
  applyTextMarginStandards(baseCharLimit, category) {
    try {
      // Hard minimum limits - never go below these regardless of corruption
      const HARD_MINIMUMS = {
        medium: 50,
        large: 75,
        extraLarge: 100,
        mobile: 30 // For future mobile support
      };

      // Safety margin percentages
      const SAFETY_MARGIN = 0.15; // 15% buffer

      // Validate input parameters
      if (!baseCharLimit || baseCharLimit < 0) {
        console.warn('Invalid character limit detected - using fallback');
        baseCharLimit = HARD_MINIMUMS[category] || 50;
      }

      // Apply safety margin (reduce limit by 15% for safety buffer)
      const marginAdjusted = Math.floor(baseCharLimit * (1 - SAFETY_MARGIN));

      // Enforce hard minimums (anti-corruption measure)
      const hardMin = HARD_MINIMUMS[category] || 50;
      const safeLimit = Math.max(marginAdjusted, hardMin);

      // Corruption detection - check if limits seem reasonable
      if (safeLimit > 1000) {
        console.warn('Suspiciously high character limit detected - possible corruption');
        return {
          characterLimit: hardMin,
          appliedMargin: SAFETY_MARGIN,
          category: category,
          corruptionDetected: true,
          error: 'limit-too-high'
        };
      }

      return {
        characterLimit: safeLimit,
        originalLimit: baseCharLimit,
        appliedMargin: SAFETY_MARGIN,
        hardMinimum: hardMin,
        category: category,
        corruptionDetected: false,
        error: null
      };

    } catch (error) {
      console.error('Text margin standards application failed:', error);

      // Emergency fallback
      const emergencyLimit = HARD_MINIMUMS[category] || 50;
      return {
        characterLimit: emergencyLimit,
        error: error.message,
        corruptionDetected: true
      };
    }
  }

  /**
   * Chunk dialogue text into readable segments
   * Respects character limits and natural text boundaries
   * 
   * @param {string} dialogueText - Text to chunk
   * @param {Object} marginStandards - Output from applyTextMarginStandards()
   * @returns {Object} - Chunked text data with validation
   */
  chunkDialogueText(dialogueText, marginStandards) {
    try {
      // Validate inputs
      if (!dialogueText || typeof dialogueText !== 'string') {
        throw new Error('Invalid dialogue text provided');
      }

      const charLimit = marginStandards.characterLimit || 200;

      // If text fits in one chunk, return as-is
      if (dialogueText.length <= charLimit) {
        return {
          chunks: [dialogueText],
          totalChunks: 1,
          originalLength: dialogueText.length,
          error: null
        };
      }

      // Split into chunks intelligently
      const chunks = [];
      let currentChunk = '';

      // Split by sentences first
      const sentences = dialogueText.split(/[.!?]+/).filter(s => s.trim());

      for (let sentence of sentences) {
        sentence = sentence.trim();

        // If adding this sentence would exceed limit
        if ((currentChunk + sentence).length > charLimit) {
          // Save current chunk if it has content
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
          }

          // If single sentence is too long, we'll need word-level splitting
          if (sentence.length > charLimit) {
            const wordChunks = this.splitLongSentence(sentence, charLimit);
            chunks.push(...wordChunks);
          } else {
            currentChunk = sentence;
          }
        } else {
          currentChunk += (currentChunk ? '. ' : '') + sentence;
        }
      }

      // Add remaining chunk
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      return {
        chunks: chunks,
        totalChunks: chunks.length,
        originalLength: dialogueText.length,
        averageChunkLength: Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length),
        error: null
      };

    } catch (error) {
      console.error('Dialogue chunking failed:', error);
      return {
        chunks: [dialogueText.substring(0, 200)], // Emergency fallback
        error: error.message
      };
    }
  }

  /**
   * Initialize pagination controller state with chunked data
   */
  initializePaginationState(chunkedData) {
    try {
      if (!this.paginationController) {
        this.paginationController = new PaginationController();
      }

      this.paginationController.resetState();
      this.paginationController.state.chunks = chunkedData.chunks;
      this.paginationController.state.totalChunks = chunkedData.totalChunks;
      this.paginationController.state.currentChunk = 0;
      this.paginationController.state.isActive = chunkedData.totalChunks > 1;
      this.paginationController.state.checksum = this.paginationController.calculateChecksum(this.paginationController.state);

      return this.paginationController.validateState();
    } catch (error) {
      console.error('Failed to initialize pagination state:', error);
      return false;
    }
  }

  /**
   * Create safe fallback response when processing fails
   */
  createFallbackResponse(originalText, error) {
    return {
      success: false,
      dialogueId: this.currentDialogueId || 'fallback',
      totalChunks: 1,
      currentChunk: 0,
      currentText: originalText,
      hasMultipleChunks: false,
      navigationEnabled: false,
      error: error.message,
      isFallback: true
    };
  }

  /**
   * Get current pagination status for debugging
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      errorState: this.errorState,
      currentDialogueId: this.currentDialogueId,
      paginationController: this.paginationController ? this.paginationController.getStatus() : null
    };
  }
}

/**
 * Embedded PaginationController 
 * TODO: This will eventually be moved here from DialogueUIManager during refactor
 * For now, we'll use a simplified version to establish the interface
 */
class PaginationController {
  constructor() {
    this.state = {
      chunks: [],
      currentChunk: 0,
      totalChunks: 0,
      isActive: false,
      lastValidated: null,
      checksum: null
    };
    
    this.validation = {
      maxChunks: 50,
      maxChunkLength: 1000,
      checksumSalt: 'kethaneum-pagination-v1'
    };
  }

  calculateChecksum(state) {
    try {
      const stateString = JSON.stringify({
        chunksLength: state.chunks.length,
        currentChunk: state.currentChunk,
        totalChunks: state.totalChunks,
        isActive: state.isActive
      });
      
      let hash = 0;
      const saltedString = stateString + this.validation.checksumSalt;
      
      for (let i = 0; i < saltedString.length; i++) {
        const char = saltedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Checksum calculation failed:', error);
      return null;
    }
  }

  validateState() {
    try {
      if (!this.state || typeof this.state !== 'object') {
        throw new Error('State structure corrupted');
      }

      if (this.state.currentChunk < 0 || 
          (this.state.totalChunks > 0 && this.state.currentChunk >= this.state.totalChunks)) {
        throw new Error('Current chunk index out of bounds');
      }

      if (this.state.totalChunks > this.validation.maxChunks) {
        throw new Error('Suspicious chunk count detected');
      }

      const currentChecksum = this.calculateChecksum(this.state);
      if (this.state.checksum && this.state.checksum !== currentChecksum) {
        throw new Error('State checksum mismatch - corruption detected');
      }

      this.state.lastValidated = Date.now();
      this.state.checksum = currentChecksum;
      
      return true;
    } catch (error) {
      console.error('State validation failed:', error);
      return false;
    }
  }

  resetState() {
    try {
      this.state = {
        chunks: [],
        currentChunk: 0,
        totalChunks: 0,
        isActive: false,
        lastValidated: Date.now(),
        checksum: null
      };
      
      this.state.checksum = this.calculateChecksum(this.state);
      return true;
    } catch (error) {
      console.error('State reset failed:', error);
      return false;
    }
  }

  getStatus() {
    return {
      currentChunk: this.state.currentChunk,
      totalChunks: this.state.totalChunks,
      isActive: this.state.isActive,
      isValid: this.validateState()
    };
  }
}

// Export for module system
export { DialoguePaginationService };
/**
 * Dialogue UI Manager for Chronicles of the Kethaneum
 * Phase 4, Step 1: Basic class structure with initialization
 * 
 * Blessed by Milton's sparkly sigils ✨
 * Protected by Phalanx formation 🛡️
 */

class DialogueUIManager {
  constructor() {
    this.isInitialized = false;
    this.gameContainer = null;
    this.overlayElement = null;
    this.dialoguePanel = null;
    this.currentDialogue = null;

    // Configuration
    this.config = {
      zIndex: {
        overlay: 200,      // Above all game elements
        panel: 250         // Above overlay
      },
      animations: {
        transitionDuration: '0.5s',
        easing: 'ease-in-out'
      }
    };

    console.log('DialogueUIManager created - Phase 4, Step 1 complete ✨');
  }

  /**
   * Initialize the Dialogue UI Manager
   * @returns {boolean} - Success status
   */
  initialize() {
    try {
      console.log('Initializing DialogueUIManager...');

      // Find game container (our shield wall perimeter)
      this.gameContainer = document.getElementById('game-container');

      if (!this.gameContainer) {
        throw new Error('Game container not found - cannot establish defensive perimeter');
      }

      console.log('Game container located - perimeter established 🛡️');

      // Test boundary detection immediately
      const boundaries = this.getContainerBoundaries();
      console.log('Container boundaries calculated:', boundaries);

      this.isInitialized = true;
      console.log('DialogueUIManager initialized successfully ✨');

      return true;
    } catch (error) {
      console.error('DialogueUIManager initialization failed:', error);
      return false;
    }
  }

  /**
   * Get game container boundary information
   * @returns {Object} - Container boundary data
   */
  getContainerBoundaries() {
    if (!this.gameContainer) {
      throw new Error('Game container not available - cannot calculate boundaries');
    }

    const rect = this.gameContainer.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(this.gameContainer);

    // Account for borders and padding
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
    const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

    // Calculate scale factor based on container width (1000px = 1.0 scale)
    const scale = rect.width / 1000;

    return {
      // Outer boundaries (including borders)
      outer: {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      },

      // Inner boundaries (content area)
      inner: {
        left: rect.left + borderLeft + paddingLeft,
        top: rect.top + borderTop + paddingTop,
        right: rect.right - borderRight - paddingRight,
        bottom: rect.bottom - borderBottom - paddingBottom,
        width: rect.width - borderLeft - borderRight - paddingLeft - paddingRight,
        height: rect.height - borderTop - borderBottom - paddingTop - paddingBottom
      },

      // Useful measurements
      centerX: rect.left + (rect.width / 2),
      centerY: rect.top + (rect.height / 2),

      // Scale factor for responsive sizing
      scale: scale,

      // Responsive breakpoints for dialogue sizing
      isSmall: rect.width < 600,
      isMedium: rect.width >= 600 && rect.width < 1000,
      isLarge: rect.width >= 1000
    };
  }

  /**
   * Test boundary detection with current viewport
   * @returns {Object} - Test results
   */
  testBoundaryDetection() {
    try {
      const boundaries = this.getContainerBoundaries();

      return {
        success: true,
        message: 'Boundary detection working correctly ✨🛡️',
        boundaries: boundaries,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Boundary detection failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Get system status for testing
   * @returns {Object} - Current system status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      gameContainer: this.gameContainer ? 'Found' : 'Not found',
      overlayElement: this.overlayElement ? 'Created' : 'Not created',
      dialoguePanel: this.dialoguePanel ? 'Created' : 'Not created',
      currentDialogue: this.currentDialogue ? 'Active' : 'None'
    };
  }

  /**
 * Create overlay element for dialogue display
 * Phase 4, Step 4: Fixed positioning with scroll awareness
 * @returns {boolean} - Success status
 */
  createOverlay() {
    try {
      if (this.overlayElement) {
        console.log('Overlay already exists, updating position');
        this.updateOverlayPosition();
        return true;
      }

      // Create overlay element
      this.overlayElement = document.createElement('div');
      this.overlayElement.id = 'dialogue-overlay';
      this.overlayElement.className = 'dialogue-overlay';

      // Set base styles
      Object.assign(this.overlayElement.style, {
        position: 'fixed',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: this.config.zIndex.overlay,
        opacity: '0',
        visibility: 'hidden',
        transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out', // Only animate opacity/visibility
        pointerEvents: 'none'
      });

      // Position overlay correctly
      this.updateOverlayPosition();

      // Add to document
      document.body.appendChild(this.overlayElement);

      // Set up resize listener to keep overlay positioned correctly
      this.setupOverlayResizeHandler();

      console.log('Dialogue overlay created with proper positioning ✨🛡️');
      return true;
    } catch (error) {
      console.error('Overlay creation failed:', error);
      return false;
    }
  }

  /**
   * Update overlay position to match current container boundaries
   */
  updateOverlayPosition() {
    if (!this.overlayElement || !this.gameContainer) return;

    const boundaries = this.getContainerBoundaries();

    // Apply styles cleanly
    this.overlayElement.style.left = `${boundaries.outer.left}px`;
    this.overlayElement.style.top = `${boundaries.outer.top}px`;
    this.overlayElement.style.width = `${boundaries.outer.width}px`;
    this.overlayElement.style.height = `${boundaries.outer.height}px`;

    // Force style application
    this.overlayElement.offsetHeight;

    // REAL corruption detection - check if values are reasonably close to expected
    const appliedRect = this.overlayElement.getBoundingClientRect();
    const tolerance = 5; // Allow small browser rendering differences

    const leftOk = Math.abs(appliedRect.left - boundaries.outer.left) <= tolerance;
    const topOk = Math.abs(appliedRect.top - boundaries.outer.top) <= tolerance;
    const widthOk = Math.abs(appliedRect.width - boundaries.outer.width) <= tolerance;
    const heightOk = Math.abs(appliedRect.height - boundaries.outer.height) <= tolerance;

    const positioningCorrupted = !leftOk || !topOk || !widthOk || !heightOk;

    if (positioningCorrupted) {
      // Log the corruption attempt with full details
      console.error('DialogueUIManager: Overlay positioning corruption detected', {
        expected: {
          left: boundaries.outer.left,
          top: boundaries.outer.top,
          width: boundaries.outer.width,
          height: boundaries.outer.height
        },
        actual: {
          left: appliedRect.left,
          top: appliedRect.top,
          width: appliedRect.width,
          height: appliedRect.height
        },
        timestamp: new Date().toISOString()
      });

      // Make overlay invisible rather than fight corruption
      this.overlayElement.style.display = 'none';
    } else {
      // Ensure it's visible if positioning worked correctly
      this.overlayElement.style.display = 'block';
    }
  }

  /**
   * Set up resize handler to keep overlay positioned correctly
   */
  setupOverlayResizeHandler() {
    if (this.resizeHandler) return; // Already set up

    this.resizeHandler = () => {
      if (this.overlayElement) {
        this.updateOverlayPosition();
      }
    };

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('scroll', this.resizeHandler);
  }

  /**
   * Show overlay with animation
   * @returns {boolean} - Success status
   */
  showOverlay() {
    if (!this.overlayElement) {
      console.warn('Cannot show overlay - not created yet');
      return false;
    }

    this.overlayElement.style.opacity = '1';
    this.overlayElement.style.visibility = 'visible';
    this.overlayElement.style.pointerEvents = 'all';

    return true;
  }

  /**
   * Hide overlay with animation
   * @returns {boolean} - Success status
   */
  hideOverlay() {
    if (!this.overlayElement) {
      return true; // Already hidden
    }

    this.overlayElement.style.opacity = '0';
    this.overlayElement.style.visibility = 'hidden';
    this.overlayElement.style.pointerEvents = 'none';

    return true;
  }

  /**
   * Test overlay creation and positioning
   * @returns {Object} - Test results
   */
  testOverlayCreation() {
    try {
      const created = this.createOverlay();

      if (!created) {
        throw new Error('Overlay creation failed');
      }

      return {
        success: true,
        message: 'Overlay created and positioned correctly ✨🛡️',
        overlayExists: !!this.overlayElement,
        overlayId: this.overlayElement?.id,
        overlayStyle: {
          position: this.overlayElement?.style.position,
          zIndex: this.overlayElement?.style.zIndex,
          opacity: this.overlayElement?.style.opacity
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Overlay test failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
 * Create hidden dialogue panel structure (Production Version)
 * Phase 2, Step 2a: Pre-created panel that stays hidden until needed
 * @returns {boolean} - Success status
 */
  createDialoguePanel() {
    try {
      if (this.dialoguePanel) {
        console.log('Dialogue panel already exists, updating with scaling');
        this.updateDialoguePanelPosition();
        return true;
      }

      // CORRUPTION COUNTERMEASURE: Explicitly ensure game container positioning
      if (this.gameContainer) {
        this.gameContainer.style.position = 'relative';
        console.log('Game container set to relative positioning - defensive measure active 🛡️');
      }

      // Get boundaries and scale factor
      const boundaries = this.getContainerBoundaries();
      const scale = boundaries.scale;

      // Calculate initial scaled dimensions
      const baseHeight = 200;
      const scaledHeight = Math.max(150, baseHeight * scale);
      const basePadding = 20;
      const scaledPadding = Math.max(10, basePadding * scale);

      // Create main dialogue container
      this.dialoguePanel = document.createElement('div');
      this.dialoguePanel.id = 'dialogue-panel';
      this.dialoguePanel.className = 'dialogue-panel';

      // CORRUPTION COUNTERMEASURE: Set base styles with explicit positioning
      Object.assign(this.dialoguePanel.style, {
        position: 'absolute',    // Relative to game container
        bottom: '0',            // Bottom of container, not viewport
        left: '0',              // Left edge of container
        right: '0',             // Right edge of container  
        height: `${scaledHeight}px`,
        background: 'linear-gradient(to top, rgba(77, 35, 97, 0.95) 0%, rgba(77, 35, 97, 0.9) 100%)',
        borderTop: '3px solid #E6A817',
        display: 'none',
        padding: `${scaledPadding}px`,
        boxSizing: 'border-box',
        zIndex: this.config.zIndex.panel
      });

      // Create scaled internal elements
      const scaledPortraitSize = Math.max(100, 150 * scale);
      const scaledFontSize = Math.max(14, 18 * scale);

      // Create character portrait container
      const portraitContainer = document.createElement('div');
      portraitContainer.className = 'character-portrait';
      Object.assign(portraitContainer.style, {
        width: `${scaledPortraitSize}px`,
        height: `${scaledPortraitSize}px`,
        border: '3px solid #E6A817',
        borderRadius: '10px',
        background: '#4d2361',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E6A817',
        fontSize: `${Math.max(18, 24 * scale)}px`,
        float: 'left',
        marginRight: `${scaledPadding * 1.5}px`,
        flexShrink: '0'
      });
      portraitContainer.textContent = '[Portrait]';

      // Create dialogue content container
      const contentContainer = document.createElement('div');
      contentContainer.className = 'dialogue-content';
      Object.assign(contentContainer.style, {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        flex: '1'
      });

      // Create character name element
      const characterName = document.createElement('h3');
      characterName.className = 'character-name';
      Object.assign(characterName.style, {
        color: '#E6A817',
        fontSize: `${Math.max(18, 24 * scale)}px`,
        margin: `0 0 ${scaledPadding * 0.5}px 0`,
        fontFamily: 'serif'
      });
      characterName.textContent = 'Character Name';

      // Create dialogue text element
      const dialogueText = document.createElement('p');
      dialogueText.className = 'dialogue-text';
      Object.assign(dialogueText.style, {
        color: '#f4efe7',
        fontSize: `${scaledFontSize}px`,
        margin: `0 0 ${scaledPadding}px 0`,
        lineHeight: '1.4'
      });
      dialogueText.textContent = 'Dialogue text will appear here.';

      // Create continue button
      const continueButton = document.createElement('button');
      continueButton.className = 'dialogue-continue';
      Object.assign(continueButton.style, {
        background: '#E6A817',
        color: '#4d2361',
        border: 'none',
        padding: `${scaledPadding * 0.5}px ${scaledPadding}px`,
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: `${Math.max(14, 16 * scale)}px`,
        alignSelf: 'flex-start',
        transition: 'all 0.3s'
      });
      continueButton.textContent = 'Continue';

      // Assemble the structure
      contentContainer.appendChild(characterName);
      contentContainer.appendChild(dialogueText);
      contentContainer.appendChild(continueButton);

      this.dialoguePanel.appendChild(portraitContainer);
      this.dialoguePanel.appendChild(contentContainer);

      // CORRUPTION COUNTERMEASURE: Add to game container for proper containment
      this.gameContainer.appendChild(this.dialoguePanel);

      // Position panel correctly within container
      this.updateDialoguePanelPosition();

      // Set up resize handler
      this.setupDialoguePanelResizeHandler();

      console.log(`Dialogue panel created and constrained to game container ✨🛡️`);
      console.log(`Scale applied: scale factor ${scale.toFixed(3)}, height ${scaledHeight}px`);
      return true;

    } catch (error) {
      console.error('Failed to create dialogue panel:', error);
      return false;
    }
  }

  /**
   * Update dialogue panel position to stay within game container
   */
  updateDialoguePanelPosition() {
    if (!this.dialoguePanel || !this.gameContainer) return;

    const boundaries = this.getContainerBoundaries();
    const scale = boundaries.scale;

    // Calculate scaled dimensions
    const baseHeight = 200;
    const scaledHeight = Math.max(150, baseHeight * scale);
    const basePadding = 20;
    const scaledPadding = Math.max(10, basePadding * scale);
    const baseFontSize = 18;
    const scaledFontSize = Math.max(14, baseFontSize * scale);
    const basePortraitSize = 150;
    const scaledPortraitSize = Math.max(100, basePortraitSize * scale);

    // Use container-relative positioning, NOT viewport positioning
    this.dialoguePanel.style.left = '0px';      // Left edge of container
    this.dialoguePanel.style.bottom = '0px';    // Bottom edge of container  
    this.dialoguePanel.style.width = '100%';    // Full width of container
    this.dialoguePanel.style.right = 'auto';    // Clear any right positioning
    this.dialoguePanel.style.height = `${scaledHeight}px`;
    this.dialoguePanel.style.padding = `${scaledPadding}px`;

    // Scale internal elements
    const portrait = this.dialoguePanel.querySelector('.character-portrait');
    if (portrait) {
      Object.assign(portrait.style, {
        width: `${scaledPortraitSize}px`,
        height: `${scaledPortraitSize}px`,
        marginRight: `${scaledPadding * 1.5}px`,
        fontSize: `${Math.max(18, 24 * scale)}px`
      });
    }

    const characterName = this.dialoguePanel.querySelector('.character-name');
    if (characterName) {
      characterName.style.fontSize = `${Math.max(18, 24 * scale)}px`;
      characterName.style.marginBottom = `${scaledPadding * 0.5}px`;
    }

    const dialogueText = this.dialoguePanel.querySelector('.dialogue-text');
    if (dialogueText) {
      dialogueText.style.fontSize = `${scaledFontSize}px`;
      dialogueText.style.marginBottom = `${scaledPadding}px`;
    }

    const continueButton = this.dialoguePanel.querySelector('.dialogue-continue');
    if (continueButton) {
      Object.assign(continueButton.style, {
        fontSize: `${Math.max(14, 16 * scale)}px`,
        padding: `${scaledPadding * 0.5}px ${scaledPadding}px`
      });
    }

    console.log(`Dialogue panel positioned within game container boundaries ✨🛡️`);
  }


  /**
   * Set up resize handler for dialogue panel positioning
   */
  setupDialoguePanelResizeHandler() {
    if (this.panelResizeHandler) return; // Already set up

    this.panelResizeHandler = () => {
      if (this.dialoguePanel) {
        this.updateDialoguePanelPosition();
      }
    };

    window.addEventListener('resize', this.panelResizeHandler);
    window.addEventListener('scroll', this.panelResizeHandler);

    console.log('Dialogue panel resize handler established - corruption countermeasures active 🛡️');
  }

  /**
   * Test method to verify class instantiation
   * @returns {string} - Test confirmation message
   */
  testConnection() {
    return 'DialogueUIManager connection established - Milton\'s blessing received ✨🛡️';
  }
}

// Create singleton instance for the game
const dialogueUIManager = new DialogueUIManager();

// Export for module system
export { DialogueUIManager, dialogueUIManager };

// Temporary global access during transition
window.dialogueUIManager = dialogueUIManager;
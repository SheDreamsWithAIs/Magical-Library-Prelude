/**
 * DialogueUIManager - Handles dialogue UI display and interaction
 * Extracted from Testing Tools for integration into main game
 * Phase 2: UI Manager Implementation
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

    }

    /**
     * Initialize the Dialogue UI Manager
     * @returns {boolean} - Success status
     */
    initialize() {
        try {
            // Find game container (our shield wall perimeter)
            this.gameContainer = document.getElementById('game-container');

            if (!this.gameContainer) {
                throw new Error('Game container not found - cannot establish defensive perimeter');
            }

            // Test boundary detection immediately
            const boundaries = this.getContainerBoundaries();

            this.isInitialized = true;
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
            isLarge: rect.width >= 1000,
            isExtraLarge: rect.width >= 1200
        };
    }

    /**
     * Create overlay element for dialogue display
     * Phase 2, Step 4: Fixed positioning with scroll awareness
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

        // Check if positioning worked - if not, use fallback positioning
        const appliedRect = this.overlayElement.getBoundingClientRect();
        const tolerance = 50; // More lenient tolerance

        const leftOk = Math.abs(appliedRect.left - boundaries.outer.left) <= tolerance;
        const topOk = Math.abs(appliedRect.top - boundaries.outer.top) <= tolerance;
        const widthOk = Math.abs(appliedRect.width - boundaries.outer.width) <= tolerance;
        const heightOk = Math.abs(appliedRect.height - boundaries.outer.height) <= tolerance;

        const positioningCorrupted = !leftOk || !topOk || !widthOk || !heightOk;

        if (positioningCorrupted) {
            // Use fallback positioning - cover the entire viewport
            this.overlayElement.style.left = '0px';
            this.overlayElement.style.top = '0px';
            this.overlayElement.style.width = '100vw';
            this.overlayElement.style.height = '100vh';
            this.overlayElement.style.display = 'block';
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
     * Update dialogue panel position AND scale to stay within game container
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

        // CORRUPTION FIX: Use container-relative positioning, NOT viewport positioning
        // With absolute positioning and relative parent, use simple container-relative values
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
     * Create dialogue panel with responsive scaling
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

            return true;

        } catch (error) {
            console.error('Failed to create dialogue panel:', error);
            return false;
        }
    }

    /**
     * Measure text proportions for dialogue display (TEST VERSION)
     * Currently handles desktop/tablet layouts (Medium, Large, ExtraLarge)
     * 
     * TODO: Add mobile layout support in Beta phase
     * - Mobile will need separate layout calculations
     * - Update this function once mobile dialogue layout is implemented
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
     * Split overly long sentences at word boundaries
     * Moves entire words to next chunk, allows overflow for giant words
     * 
     * @param {string} sentence - Long sentence to split
     * @param {number} charLimit - Character limit per chunk
     * @returns {Array} - Array of sentence fragments
     */
    splitLongSentence(sentence, charLimit) {
        try {
            const words = sentence.split(' ');
            const chunks = [];
            let currentChunk = '';

            for (let word of words) {
                const testChunk = currentChunk + (currentChunk ? ' ' : '') + word;

                // If adding this word would exceed limit
                if (testChunk.length > charLimit) {
                    // Save current chunk if it has content
                    if (currentChunk.trim()) {
                        chunks.push(currentChunk.trim());
                    }

                    // Start new chunk with the word that didn't fit
                    currentChunk = word;

                    // If this single word exceeds chunk limit, it will overflow
                    // (We'll let it stay in its own chunk rather than break it)

                } else {
                    currentChunk = testChunk;
                }
            }

            // Add remaining chunk
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }

            return chunks;

        } catch (error) {
            console.error('Long sentence splitting failed:', error);
            // Emergency: just return the original sentence as one chunk
            return [sentence];
        }
    }

    /**
     * Handle individual words that might exceed character limits
     * For dialogue, we preserve word integrity and allow overflow if necessary
     * 
     * @param {string} word - Word to check
     * @param {number} charLimit - Character limit per chunk  
     * @returns {Object} - Word handling result
     */
    checkWordLength(word, charLimit) {
        try {
            return {
                word: word,
                length: word.length,
                exceedsLimit: word.length > charLimit,
                shouldOverflow: word.length > charLimit,
                // For dialogue, we never split words - preserve readability
                recommendedAction: word.length > charLimit ? 'allow-overflow' : 'normal'
            };

        } catch (error) {
            console.error('Word length check failed:', error);
            return {
                word: word,
                length: word.length,
                exceedsLimit: false,
                shouldOverflow: false,
                recommendedAction: 'normal',
                error: error.message
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
}

// Export for module usage
export default DialogueUIManager;
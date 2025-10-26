/**
 * Dialogue Integration Module
 * Connects DialogueManager with DialogueUIManager for complete dialogue system
 * Phase 5: Game Integration
 */

import DialogueManager from './dialogueManager.js';
import DialogueUIManager from '../ui/dialogueUIManager.js';

class DialogueIntegration {
    constructor() {
        this.dialogueManager = null;
        this.dialogueUIManager = null;
        this.isInitialized = false;
        this.currentDialogue = null;
        this.currentChunkIndex = 0;
        this.currentChunks = [];
    }

    /**
     * Initialize the dialogue integration system
     * @param {DialogueManager} dialogueManager - The dialogue manager instance
     * @param {DialogueUIManager} dialogueUIManager - The dialogue UI manager instance
     * @returns {boolean} - Success status
     */
    initialize(dialogueManager, dialogueUIManager) {
        try {
            console.log('Initializing Dialogue Integration...');

            if (!dialogueManager) {
                throw new Error('DialogueManager instance is required');
            }

            if (!dialogueUIManager) {
                throw new Error('DialogueUIManager instance is required');
            }

            this.dialogueManager = dialogueManager;
            this.dialogueUIManager = dialogueUIManager;

            // Ensure UI components are created
            this.dialogueUIManager.createOverlay();
            this.dialogueUIManager.createDialoguePanel();

            this.isInitialized = true;
            console.log('Dialogue Integration initialized successfully ✨');
            return true;

        } catch (error) {
            console.error('Dialogue Integration initialization failed:', error);
            return false;
        }
    }

    /**
     * Start a dialogue conversation
     * @param {string} characterName - Name of the character to speak with
     * @param {string} storyBeat - Current story beat for dialogue filtering
     * @returns {boolean} - Success status
     */
    startDialogue(characterName, storyBeat = 'introduction') {
        try {
            if (!this.isInitialized) {
                throw new Error('Dialogue Integration not initialized');
            }

            console.log(`Starting dialogue with ${characterName} (story beat: ${storyBeat})`);

            // Set story beat in dialogue manager
            this.dialogueManager.setStoryBeat(storyBeat);

            // Get random banter from dialogue manager
            const banterResult = this.dialogueManager.getRandomBanter(characterName);

            if (!banterResult.success) {
                throw new Error(`Failed to get banter: ${banterResult.error}`);
            }

            this.currentDialogue = banterResult.dialogue;
            console.log('Retrieved dialogue:', this.currentDialogue);

            // Process dialogue text for display
            this.processDialogueText();

            // Show the dialogue UI
            this.showDialogue();

            return true;

        } catch (error) {
            console.error('Failed to start dialogue:', error);
            return false;
        }
    }

    /**
     * Process dialogue text for chunking and display
     */
    processDialogueText() {
        try {
            if (!this.currentDialogue || !this.currentDialogue.text) {
                throw new Error('No dialogue text to process');
            }

            const dialogueText = this.currentDialogue.text;
            const boundaries = this.dialogueUIManager.getContainerBoundaries();

            // Get text proportions
            const proportions = this.dialogueUIManager.measureTextProportions(dialogueText, boundaries);
            
            if (proportions.error) {
                console.warn('Text proportion measurement failed:', proportions.error);
                // Use fallback chunking
                this.currentChunks = [dialogueText];
            } else {
                // Apply margin standards
                const margins = this.dialogueUIManager.applyTextMarginStandards(
                    proportions.characterLimit, 
                    proportions.category
                );

                // Chunk the dialogue text
                const chunkResult = this.dialogueUIManager.chunkDialogueText(dialogueText, margins);
                
                if (chunkResult.error) {
                    console.warn('Dialogue chunking failed:', chunkResult.error);
                    this.currentChunks = [dialogueText];
                } else {
                    this.currentChunks = chunkResult.chunks;
                }
            }

            this.currentChunkIndex = 0;
            console.log(`Processed dialogue into ${this.currentChunks.length} chunks`);

        } catch (error) {
            console.error('Failed to process dialogue text:', error);
            // Emergency fallback
            this.currentChunks = [this.currentDialogue.text || 'Dialogue text unavailable'];
            this.currentChunkIndex = 0;
        }
    }

    /**
     * Show the dialogue UI with current chunk
     */
    showDialogue() {
        try {
            if (!this.currentDialogue || this.currentChunks.length === 0) {
                throw new Error('No dialogue content to show');
            }

            const currentChunk = this.currentChunks[this.currentChunkIndex];
            const panel = this.dialogueUIManager.dialoguePanel;

            if (!panel) {
                throw new Error('Dialogue panel not available');
            }

            // Update dialogue content
            const characterName = panel.querySelector('.character-name');
            const dialogueText = panel.querySelector('.dialogue-text');
            const continueButton = panel.querySelector('.dialogue-continue');

            if (characterName) {
                characterName.textContent = this.currentDialogue.character || 'Unknown Character';
            }

            if (dialogueText) {
                dialogueText.textContent = currentChunk;
            }

            // Update continue button
            if (continueButton) {
                if (this.currentChunkIndex < this.currentChunks.length - 1) {
                    continueButton.textContent = 'Continue';
                } else {
                    continueButton.textContent = 'End Conversation';
                }

                // Remove any existing event listeners
                continueButton.replaceWith(continueButton.cloneNode(true));
                const newButton = panel.querySelector('.dialogue-continue');
                
                // Add new event listener
                newButton.addEventListener('click', () => this.handleContinue());
            }

            // Show the dialogue panel
            panel.style.display = 'flex';

            // Show overlay
            const overlay = this.dialogueUIManager.overlayElement;
            if (overlay) {
                overlay.style.visibility = 'visible';
                overlay.style.pointerEvents = 'all';
                setTimeout(() => {
                    overlay.style.opacity = '1';
                }, 10);
            }

            console.log(`Showing dialogue chunk ${this.currentChunkIndex + 1}/${this.currentChunks.length}`);

        } catch (error) {
            console.error('Failed to show dialogue:', error);
        }
    }

    /**
     * Handle continue button click
     */
    handleContinue() {
        try {
            if (this.currentChunkIndex < this.currentChunks.length - 1) {
                // Show next chunk
                this.currentChunkIndex++;
                this.showDialogue();
            } else {
                // End conversation
                this.endDialogue();
            }
        } catch (error) {
            console.error('Failed to handle continue:', error);
            this.endDialogue();
        }
    }

    /**
     * End the current dialogue conversation
     */
    endDialogue() {
        try {
            console.log('Ending dialogue conversation');

            // Hide dialogue panel
            const panel = this.dialogueUIManager.dialoguePanel;
            if (panel) {
                panel.style.display = 'none';
            }

            // Hide overlay
            const overlay = this.dialogueUIManager.overlayElement;
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.visibility = 'hidden';
                    overlay.style.pointerEvents = 'none';
                }, 300);
            }

            // Reset state
            this.currentDialogue = null;
            this.currentChunkIndex = 0;
            this.currentChunks = [];

            console.log('Dialogue conversation ended');

        } catch (error) {
            console.error('Failed to end dialogue:', error);
        }
    }

    /**
     * Get current dialogue status
     * @returns {Object} - Current status information
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            hasDialogueManager: !!this.dialogueManager,
            hasDialogueUIManager: !!this.dialogueUIManager,
            currentDialogue: this.currentDialogue ? 'Active' : 'None',
            currentChunk: this.currentChunkIndex + 1,
            totalChunks: this.currentChunks.length
        };
    }
}

// Export for module usage
export default DialogueIntegration;

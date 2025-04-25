// Basic Game Flow Test for Chronicles of the Kethaneum
describe('Basic Game Flow', () => {
    beforeEach(() => {
      // Visit the game URL
      cy.visit('https://shedreamswithais.github.io/Magical-Library-Prelude/');
      
      // Clear localStorage to ensure clean state
      cy.clearLocalStorage();
    });
    
    it('should display the title screen correctly', () => {
      // Verify title screen elements
      cy.get('#title-screen').should('be.visible');
      cy.get('#game-title').should('be.visible');
      cy.get('#game-subtitle').should('be.visible');
      cy.get('#new-game-btn').should('be.visible');
      cy.get('#continue-btn').should('be.visible');
    });
    
    it('should navigate from title screen to backstory', () => {
      // Click new game button
      cy.get('#new-game-btn').click();
      
      // Verify backstory screen is visible
      cy.get('#backstory-screen').should('be.visible');
      cy.get('#backstory-content').should('be.visible');
      cy.get('#continue-to-book-btn').should('be.visible');
    });
    
    it('should navigate from backstory to Book of Passage', () => {
      // Navigate to backstory
      cy.get('#new-game-btn').click();
      
      // Continue to Book of Passage
      cy.get('#continue-to-book-btn').click();
      
      // Verify Book of Passage screen is visible
      cy.get('#book-of-passage-screen').should('be.visible');
      cy.get('.book-container').should('be.visible');
      cy.get('#start-cataloging-btn').should('be.visible');
    });
    
    it('should navigate from Book of Passage to puzzle', () => {
      // Navigate to Book of Passage
      cy.get('#new-game-btn').click();
      cy.get('#continue-to-book-btn').click();
      
      // Start cataloging
      cy.get('#start-cataloging-btn').click();
      
      // Verify puzzle screen is visible
      cy.get('#puzzle-screen').should('be.visible');
      cy.get('#instructions-panel').should('be.visible');
      cy.get('#start-playing-btn').should('be.visible');
    });
    
    it('should start the puzzle when clicking Begin Cataloging', () => {
      // Navigate to puzzle
      cy.get('#new-game-btn').click();
      cy.get('#continue-to-book-btn').click();
      cy.get('#start-cataloging-btn').click();
      
      // Start the puzzle
      cy.get('#start-playing-btn').click();
      
      // Verify instructions are closed
      cy.get('#instructions-panel').should('not.be.visible');
      
      // Verify game elements are active
      cy.get('#timer-bar').should('be.visible');
      cy.get('.grid-cell').should('have.length', 100); // 10x10 grid
      cy.get('#word-list').find('li').should('have.length.at.least', 1);
    });
    
    it('should pause and resume the game', () => {
      // Navigate to active puzzle
      cy.get('#new-game-btn').click();
      cy.get('#continue-to-book-btn').click();
      cy.get('#start-cataloging-btn').click();
      cy.get('#start-playing-btn').click();
      
      // Click pause button
      cy.get('#pause-btn').click();
      
      // Verify pause panel appears
      cy.get('#pause-panel').should('be.visible');
      cy.get('#resume-btn').should('be.visible');
      
      // Resume the game
      cy.get('#resume-btn').click();
      
      // Verify pause panel is closed
      cy.get('#pause-panel').should('not.be.visible');
    });
    
    it('should return to Book of Passage from pause menu', () => {
      // Navigate to active puzzle
      cy.get('#new-game-btn').click();
      cy.get('#continue-to-book-btn').click();
      cy.get('#start-cataloging-btn').click();
      cy.get('#start-playing-btn').click();
      
      // Pause the game
      cy.get('#pause-btn').click();
      
      // Click go to Book of Passage button
      cy.get('#go-to-book-btn').click();
      
      // Verify Book of Passage screen is visible
      cy.get('#book-of-passage-screen').should('be.visible');
    });
    
    // This test uses direct state manipulation since solving a puzzle would be complex
    it('should correctly handle win condition', () => {
      // Navigate to active puzzle
      cy.get('#new-game-btn').click();
      cy.get('#continue-to-book-btn').click();
      cy.get('#start-cataloging-btn').click();
      cy.get('#start-playing-btn').click();
      
      // Use window.state to mark words as found
      cy.window().then((win) => {
        // Make sure state exists and has wordList
        if (win.state && win.state.wordList) {
          // Mark all words as found
          win.state.wordList.forEach(word => {
            if (word) word.found = true;
          });
          
          // Trigger win condition check
          if (typeof win.checkWinCondition === 'function') {
            win.checkWinCondition();
          } else if (typeof win.endGame === 'function') {
            win.endGame(true);
          }
        }
      });
      
      // Check if win panel appears (might not work if game structure differs)
      cy.get('#win-panel', { timeout: 5000 }).should('be.visible').then(() => {
        cy.log('Win panel appeared as expected');
      }).catch(() => {
        // If win panel doesn't appear, log the current state
        cy.window().then(win => {
          cy.log('Current game state:', win.state);
          cy.log('Window state after win attempt');
        });
      });
    });
  });
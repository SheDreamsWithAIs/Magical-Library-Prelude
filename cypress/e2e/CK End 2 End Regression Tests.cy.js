// Import the word finding functions to help with automating puzzle completion
import { findWordsInPuzzle, forceWinCondition } from './revised-word-finder';

describe('Chronicles of the Kethaneum End-to-End Tests', () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    cy.clearLocalStorage();

    // Visit the game URL
    cy.visit('https://shedreamswithais.github.io/Magical-Library-Prelude/');
  });

  it('Verfiy title page', () => {
    // Verify that the title screen is displayed and has the correct text
    cy.get('#title-screen').should('be.visible')
    cy.get('#title-screen h1').should('have.text', 'Chronicles of the Kethaneum')
    cy.get('#title-screen h2').should('have.text', 'Searching the Cosmic Catalog')

    //Verify that the start and continue buttons are displayed and have the correct text
    cy.get('#new-game-btn').should('be.visible')
    cy.get('#new-game-btn').should('have.text', 'New Game')

    cy.get('#continue-btn').should('be.visible')
    cy.get('#continue-btn').should('have.text', 'Continue')
  })

  it('Click the New Game button and verify the backstory screen', () => {
    cy.get('#new-game-btn').click()

    // Verify that the title screen is no longer visible
    cy.get('#title-screen').should('not.be.visible')

    // Verify that the backstory screen is visible and has the critical elements
    cy.get('#backstory-screen').should('be.visible')
    cy.get('#backstory-screen h2').should('have.text', 'The Kethaneum')

    cy.get('#backstory-content').invoke('text').should('not.be.empty')

    cy.get('#continue-to-book-btn').should('be.visible')
    cy.get('#continue-to-book-btn').should('have.text', 'Continue to the Book of Passage')
  })

  it('Click continue on the backstory screen and verify the Book of Passage screen', () => {
    cy.get('#new-game-btn').click()
    cy.get('#continue-to-book-btn').click()

    // Verify that the backstory screen is no longer visible
    cy.get('#backstory-screen').should('not.be.visible')

    // Verify the book of Passage screen is displaying all critical elements
    cy.get('#book-of-passage-screen').should('be.visible')

    cy.get('#book-of-passage-screen > div > div.book-pages > h2').should('have.text', 'Your Book of Passage')
    cy.get('#book-of-passage-content').invoke('text').should('not.be.empty')
    cy.get('#progress-section-container').should('be.visible')

    cy.get('#start-cataloging-btn').should('be.visible')
    cy.get('#start-cataloging-btn').should('have.text', 'Begin Cataloging')
  })

  it('Click Start Cataloging and verify the puzzle screen', () => {
    cy.get('#new-game-btn').click()
    cy.get('#continue-to-book-btn').click()
    cy.get('#start-cataloging-btn').click()

    // Verify that the book of passage screen is no longer visible
    cy.get('#book-of-passage-screen').should('not.be.visible')

    // Verify the puzzle screen is displaying all critical elements
    cy.get('#puzzle-screen').should('be.visible')

    //verify UI elements are visible
    cy.get('#puzzle-screen > div.game-area > div.grid-container').should('be.visible') // The grid container 
    cy.get('#puzzle-screen > div.game-area > div.story-container').should('be.visible') // The story container 
    cy.get('#puzzle-screen > div.game-area > div.words-container').should('be.visible') // The word list container
    cy.get('#puzzle-screen > div.controls').should('be.visible') // The menu button container
    cy.get('#instructions-panel').should('be.visible') // The puzzle instruction pannel 
    cy.get('#timer-bar').should('be.visible') // timer bar
    cy.get('#word-grid > div:nth-child(100)').should('be.visible') // The grid - should have 100 cells (10x10)
    cy.get('#start-playing-btn').should('be.visible') // The puzzle start button

    //Verify text bearing elements populated with text 
    cy.get('#book-title').invoke('text').should('not.be.empty') // Puzzle's title
    cy.get('#story-excerpt').invoke('text').should('not.be.empty') // The story excerpt 
    cy.get('#word-list').invoke('text').should('not.be.empty') // The word list should have text
    cy.get('#instructions-panel').invoke('text').should('not.be.empty') // The instruction panel
    cy.get('#start-playing-btn').should('have.text', 'Begin Cataloging')

    // Verify the timer bar doesn't start decreasing before the puzzle is started
    const initialWidth = Cypress.$('#timer-bar').width();
    cy.wait(1000); // Wait a second to ensure no animation
    cy.get('#timer-bar').then($el => {
      const currentWidth = $el.width();
      expect(currentWidth).to.equal(initialWidth);
    });

    // Verify the word grid has letters in each cell
    cy.get('#word-grid > div').each($cell => {
      // Each cell should contain a letter
      cy.wrap($cell).invoke('text').should('match', /^[A-Z]$/);
    });

    // Start the puzzle
    cy.get('#start-playing-btn').click();
    cy.get('#instructions-panel').should('not.be.visible');
    
    // Verify timer begins counting down after starting
    cy.wait(1500); // Wait to ensure animation has started
    cy.get('#timer-bar').then($el => {
      const newWidth = $el.width();
      expect(newWidth).to.be.lessThan(initialWidth);
    });

    // Play the puzzle - we'll use the word finding utility
    findWordsInPuzzle(cy);
    
    // If not all words found, force win condition to continue the test
    cy.window().then(win => {
      if (!win.state.wordList.every(w => w.found)) {
        forceWinCondition(cy);
      }
    });
    
    // Verify the win panel appears
    cy.get('#win-panel', { timeout: 10000 }).should('be.visible');
    cy.get('#win-panel h2').should('have.text', 'Cataloging Complete!');
    cy.get('#next-book-btn').should('be.visible');
    cy.get('#return-to-book-of-passage-btn').should('be.visible');
    
    // Return to Book of Passage
    cy.get('#return-to-book-of-passage-btn').click();
    cy.get('#book-of-passage-screen').should('be.visible');
  });

  it('Verify Book of Passage is updated properly after completing the first book puzzle', () => {
    cy.get('#new-game-btn').click();
    cy.get('#continue-to-book-btn').click();
    cy.get('#start-cataloging-btn').click();

    // Start and complete the puzzle
    cy.get('#start-playing-btn').click();
    findWordsInPuzzle(cy);
    
    // Force win if needed
    cy.window().then(win => {
      if (!win.state.wordList.every(w => w.found)) {
        forceWinCondition(cy);
      }
    });
    
    // Return to Book of Passage from win panel
    cy.get('#win-panel', { timeout: 10000 }).should('be.visible');
    cy.get('#return-to-book-of-passage-btn').click();
    
    // Verify completed puzzles count increased
    cy.get('#completed-puzzles-count').invoke('text').then(text => {
      expect(parseInt(text)).to.equal(1); 
    });
    
    // Verify discovered books count increased
    cy.get('#completed-books-count').invoke('text').then(text => {
      expect(parseInt(text)).to.equal(1); 
    });
    
    // Verify book progress section shows at least one book
    cy.get('#books-progress-section').should('contain', 'Books in Progress');
    cy.get('.book-progress-list li').should('have.length', 1);
    
    // Verify the book shows at least one completed part
    cy.get('.book-parts-progress .story-part.complete').should('have.length', 1); 
  });

  it('Verify pause functionality during puzzle', () => {
    cy.get('#new-game-btn').click();
    cy.get('#continue-to-book-btn').click();
    cy.get('#start-cataloging-btn').click();
    cy.get('#start-playing-btn').click();
    
    // Check timer is running
    const initialWidth = Cypress.$('#timer-bar').width();
    cy.wait(1000);
    cy.get('#timer-bar').then($el => {
      const newWidth = $el.width();
      expect(newWidth).to.be.lessThan(initialWidth);
    });
    
    // Pause the game
    cy.get('#pause-btn').click();
    cy.get('#pause-panel').should('be.visible');
    
    // Verify timer stops
    const pausedWidth = Cypress.$('#timer-bar').width();
    cy.wait(1000);
    cy.get('#timer-bar').then($el => {
      const currentWidth = $el.width();
      expect(currentWidth).to.equal(pausedWidth);
    });
    
    // Resume game
    cy.get('#resume-btn').click();
    cy.get('#pause-panel').should('not.be.visible');
    
    // Verify timer resumes
    cy.wait(1000);
    cy.get('#timer-bar').then($el => {
      const resumedWidth = $el.width();
      expect(resumedWidth).to.be.lessThan(pausedWidth);
    });
    
    // Now test the restart function
    cy.get('#pause-btn').click();
    cy.get('#restart-btn').click();
    
    // Should see instructions panel again
    cy.get('#instructions-panel').should('be.visible');
    
    // Verify timer is reset
    cy.get('#timer-bar').then($el => {
      const restartedWidth = $el.width();
      expect(restartedWidth).to.be.approximately(initialWidth, 5);
    });
  });

  it('Verify state persistence AKA it saved when using Continue from main menu', () => {
    // First complete a puzzle to have some progress
    cy.get('#new-game-btn').click();
    cy.get('#continue-to-book-btn').click();
    cy.get('#start-cataloging-btn').click();
    cy.get('#start-playing-btn').click();
    findWordsInPuzzle(cy);
    
    // Force win if needed
    cy.window().then(win => {
      if (!win.state.wordList.every(w => w.found)) {
        forceWinCondition(cy);
      }
    });
    
    // Return to Book of Passage
    cy.get('#win-panel', { timeout: 10000 }).should('be.visible');
    cy.get('#return-to-book-of-passage-btn').click();
    
    // Capture progress metrics for comparison
    let completedPuzzlesCount, discoveredBooksCount;
    
    cy.get('#completed-puzzles-count').invoke('text').then(text => {
      completedPuzzlesCount = parseInt(text);
    });
    
    cy.get('#completed-books-count').invoke('text').then(text => {
      discoveredBooksCount = parseInt(text);
      
      // Return to title screen (simulating app restart)
      cy.visit('https://shedreamswithais.github.io/Magical-Library-Prelude/');
      
      // Use Continue button
      cy.get('#continue-btn').click();
      
      // Should go directly to Book of Passage
      cy.get('#book-of-passage-screen').should('be.visible');
      
      // Verify progress was maintained
      cy.get('#completed-puzzles-count').invoke('text').then(text => {
        expect(parseInt(text)).to.equal(completedPuzzlesCount);
      });
      
      cy.get('#completed-books-count').invoke('text').then(text => {
        expect(parseInt(text)).to.equal(discoveredBooksCount);
      });
      
      // Check book progress is still there
      cy.get('.book-progress-list li').should('have.length.at.least', 1);

      // start new book puzzle and verify it is the second puzzle in that book's series
    });
  });
})
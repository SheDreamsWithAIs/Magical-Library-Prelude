describe('Start New Game', () => {
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

    //[placeholder] // The timer bar should not start decreasing before the puzzle is started
    //[placeholder] // The word grid should have letters in each cell  
  })
})
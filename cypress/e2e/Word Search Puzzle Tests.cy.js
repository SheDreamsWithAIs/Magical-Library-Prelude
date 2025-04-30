// Import the revised word finding functions, including the stats functions
import { findWordsInPuzzle, forceWinCondition, reportTestRunStats, resetTestRunStats } from './revised-word-finder';

describe('Word Search Game Completion', () => {
  beforeEach(() => {
    // Visit the game URL
    cy.visit('https://shedreamswithais.github.io/Magical-Library-Prelude/');
    
    // Clear localStorage to ensure clean state
    cy.clearLocalStorage();
  });
  
  // Reset statistics before all tests
  before(() => {
    cy.visit('https://shedreamswithais.github.io/Magical-Library-Prelude/');
    resetTestRunStats(cy);
  });
  
  it('should navigate through the game flow and complete a puzzle', () => {
    // Reset statistics at the start of this test
    resetTestRunStats(cy);
    
    // Start a new game
    cy.get('#new-game-btn').click();
    cy.get('#backstory-screen').should('be.visible');
    
    // Continue to the Book of Passage
    cy.get('#continue-to-book-btn').should('be.visible');
    cy.get('#continue-to-book-btn').click();
    cy.get('#book-of-passage-screen').should('be.visible');
    
    // Start cataloging (go to puzzle)
    cy.get('#start-cataloging-btn').click();
    cy.get('#puzzle-screen').should('be.visible');
    
    // Log the current puzzle information
    cy.get('#book-title').invoke('text').then(title => {
      cy.log(`Playing puzzle: ${title}`);
    });
    
    // Start playing
    cy.get('#start-playing-btn').click();
    cy.get('#instructions-panel').should('not.be.visible');
    
    // Use our algorithm to find the words
    findWordsInPuzzle(cy);
    
    // Check if all words were found
    cy.window().then(win => {
      if (win.state && win.state.wordList) {
        const allFound = win.state.wordList.every(w => w.found);
        if (!allFound) {
          cy.log('Not all words were found, forcing win condition');
          forceWinCondition(cy);
        } else {
          cy.log('All words found successfully!');
        }
      }
    });
    
    // Verify win panel appears
    cy.get('#win-panel', { timeout: 5000 }).should('be.visible');
    
    // Return to Book of Passage
    cy.get('#return-to-book-of-passage-btn').click();
    cy.get('#book-of-passage-screen').should('be.visible');
    
    // Verify progress tracking updated
    cy.get('#completed-puzzles-count').should('not.have.text', '0');
    
    // Report test run statistics at the end
    reportTestRunStats(cy);
  });
  
  it('should complete multiple puzzles in succession', () => {
    // Reset statistics at the start of this test
    resetTestRunStats(cy);
    
    // Start a new game
    cy.get('#new-game-btn').click();
    cy.get('#continue-to-book-btn').click();
    
    // Complete first puzzle
    cy.get('#start-cataloging-btn').click();
    cy.get('#start-playing-btn').click();
    
    // Find words in first puzzle
    findWordsInPuzzle(cy);
    
    // Force win if needed and continue to next puzzle
    cy.window().then(win => {
      // Check if all words are found
      if (win.state && win.state.wordList) {
        const allFound = win.state.wordList.every(w => w.found);
        if (!allFound) {
          forceWinCondition(cy);
        }
      }
    });
    
    // Wait for win panel and continue to next puzzle
    cy.get('#win-panel', { timeout: 5000 }).should('be.visible');
    
    // Optional: Report interim statistics after first puzzle
    cy.log('Statistics after first puzzle:');
    reportTestRunStats(cy);
    
    cy.get('#next-book-btn').click();
    
    // Complete second puzzle
    cy.get('#start-playing-btn').click();
    findWordsInPuzzle(cy);
    
    // Force win if needed
    cy.window().then(win => {
      if (win.state && win.state.wordList) {
        const allFound = win.state.wordList.every(w => w.found);
        if (!allFound) {
          forceWinCondition(cy);
        }
      }
    });
    
    // Wait for win panel and return to Book of Passage
    cy.get('#win-panel', { timeout: 5000 }).should('be.visible');
    cy.get('#return-to-book-of-passage-btn').click();
    
    // Verify multiple puzzles completed
    cy.get('#completed-puzzles-count').invoke('text').then(parseInt).should('be.at.least', 2);
    
    // Report test run statistics at the end
    cy.log('Final statistics after both puzzles:');
    reportTestRunStats(cy);
  });
});
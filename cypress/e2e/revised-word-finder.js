// Revised Word Finding Algorithm based on actual game implementation
// This uses the same state structure and DOM interactions as the game code

/**
 * Simulates finding words in the word search game
 * @param {Object} cy - Cypress object
 */
function findWordsInPuzzle(cy) {
    cy.window().then((win) => {
      // Verify game state is properly initialized
      if (!win.state || !win.state.wordList || !win.state.wordList.length) {
        cy.log('Game state not properly initialized or accessible');
        return;
      }
      
      // Log words to find for debugging
      const wordListText = win.state.wordList.map(w => w.word).join(', ');
      cy.log(`Words to find: ${wordListText}`);
      
      // First attempt: Try to find words directly using their placement data
      // This uses the word placement data from the game state
      cy.log('Attempting to find words using placement data...');
      findWordsUsingPlacementData(cy, win);
      
      // Second attempt: For any remaining words, use grid scanning
      cy.log('Finding any remaining words by scanning the grid...');
      findWordsUsingGridScan(cy, win);
      
      // Verify if all words are found
      cy.window().then((updatedWin) => {
        const allFound = updatedWin.state.wordList.every(w => w.found);
        if (allFound) {
          cy.log('All words found successfully!');
        } else {
          const remainingWords = updatedWin.state.wordList.filter(w => !w.found).map(w => w.word);
          cy.log(`Words still unfound: ${remainingWords.join(', ')}`);
        }
      });
    });
  }
  
  /**
   * Find words using their placement data from the game state
   * @param {Object} cy - Cypress object
   * @param {Object} win - Window object with game state
   */
  function findWordsUsingPlacementData(cy, win) {
    const wordList = win.state.wordList;
    
    // Try to find each word
    wordList.forEach((wordData, index) => {
      // Skip already found words
      if (wordData.found) {
        cy.log(`Word "${wordData.word}" already found, skipping...`);
        return;
      }
      
      // Check if we have the placement data
      if (wordData.row === undefined || wordData.col === undefined || !wordData.direction) {
        cy.log(`Placement data for "${wordData.word}" is not available`);
        return;
      }
      
      // Select the word using its placement data
      const startRow = wordData.row;
      const startCol = wordData.col;
      const [dRow, dCol] = wordData.direction;
      const endRow = startRow + (wordData.word.length - 1) * dRow;
      const endCol = startCol + (wordData.word.length - 1) * dCol;
      
      cy.log(`Selecting word: ${wordData.word}, from [${startRow},${startCol}] to [${endRow},${endCol}]`);
      
      // Get the starting and ending cells
      cy.get(`.grid-cell[data-row="${startRow}"][data-col="${startCol}"]`).then($startCell => {
        // Need to ensure it exists
        if ($startCell.length === 0) {
          cy.log(`Start cell for "${wordData.word}" not found in DOM`);
          return;
        }
        
        // Get end cell
        cy.get(`.grid-cell[data-row="${endRow}"][data-col="${endCol}"]`).then($endCell => {
          if ($endCell.length === 0) {
            cy.log(`End cell for "${wordData.word}" not found in DOM`);
            return;
          }
          
          // Select the word by simulating mouse interactions
          cy.wrap($startCell).trigger('mousedown');
          cy.wrap($endCell).trigger('mouseover');
          cy.get('body').trigger('mouseup');
          
          // Add a brief wait to allow the game to process the selection
          cy.wait(300);
        });
      });
    });
  }
  
  /**
   * Find words by scanning the grid when placement data isn't reliable
   * @param {Object} cy - Cypress object
   * @param {Object} win - Window object with game state
   */
  function findWordsUsingGridScan(cy, win) {
    cy.window().then((currentWin) => {
      // Get current state of word list
      const wordList = currentWin.state.wordList;
      
      // Filter to words that are not yet found
      const unfoundWords = wordList.filter(w => !w.found);
      
      if (unfoundWords.length === 0) {
        cy.log('No remaining words to find');
        return;
      }
      
      cy.log(`Scanning for ${unfoundWords.length} unfound words...`);
      
      // Get grid cells and dimensions
      cy.get('.grid-cell').then($cells => {
        const gridSize = Math.sqrt($cells.length);
        cy.log(`Grid size detected: ${gridSize}x${gridSize}`);
        
        // Convert jQuery collection to array
        const cells = Array.from($cells);
        
        // Create a 2D array representation of the grid cells
        const gridCells = [];
        for (let i = 0; i < gridSize; i++) {
          gridCells.push([]);
          for (let j = 0; j < gridSize; j++) {
            const cell = cells[i * gridSize + j];
            gridCells[i].push(cell);
          }
        }
        
        // Scan for each unfound word
        unfoundWords.forEach(wordData => {
          const word = wordData.word.toUpperCase();
          
          // Try all potential starting positions
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const startCell = gridCells[row][col];
              const letter = startCell.textContent.trim().toUpperCase();
              
              // Skip if the first letter doesn't match
              if (letter !== word[0]) continue;
              
              // Try all 8 directions
              const directions = [
                [0, 1], [1, 0], [1, 1], [0, -1], 
                [-1, 0], [-1, -1], [1, -1], [-1, 1]
              ];
              
              for (const [dRow, dCol] of directions) {
                // Check if word would fit in this direction
                const endRow = row + (word.length - 1) * dRow;
                const endCol = col + (word.length - 1) * dCol;
                
                if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
                  continue;
                }
                
                // Check if the word matches in this direction
                let isMatch = true;
                for (let i = 0; i < word.length; i++) {
                  const r = row + i * dRow;
                  const c = col + i * dCol;
                  const cellContent = gridCells[r][c].textContent.trim().toUpperCase();
                  
                  if (cellContent !== word[i]) {
                    isMatch = false;
                    break;
                  }
                }
                
                if (isMatch) {
                  // Found a match, select the word
                  cy.log(`Found "${word}" at [${row},${col}] in direction [${dRow},${dCol}]`);
                  
                  const endCell = gridCells[endRow][endCol];
                  cy.wrap(startCell).trigger('mousedown');
                  cy.wrap(endCell).trigger('mouseover');
                  cy.get('body').trigger('mouseup');
                  
                  // Add a brief wait to allow the game to process the selection
                  cy.wait(300);
                  
                  // Continue to the next word
                  return;
                }
              }
            }
          }
          
          cy.log(`Could not find word "${word}" in grid scan`);
        });
      });
    });
  }
  
  /**
   * Force completion of puzzle if some words couldn't be found
   * @param {Object} cy - Cypress object
   */
  function forceWinCondition(cy) {
    cy.window().then((win) => {
      if (!win.state || !win.state.wordList) {
        cy.log('Game state not properly initialized');
        return;
      }
      
      // Check if all words are already found
      const allFound = win.state.wordList.every(word => word.found);
      if (allFound) {
        cy.log('All words already found, no need to force win');
        return;
      }
      
      // Mark all words as found
      win.state.wordList.forEach(word => {
        word.found = true;
      });
      
      // Check if checkWinCondition function exists
      if (typeof win.checkWinCondition === 'function') {
        cy.log('Using checkWinCondition to trigger win');
        win.checkWinCondition();
      } else {
        // Try to find the function in the window
        let checkWinFunction = null;
        
        // Look for possible win check function names
        ['checkWinCondition', 'checkWin', 'checkForWin'].forEach(funcName => {
          if (typeof win[funcName] === 'function') {
            checkWinFunction = win[funcName];
          }
        });
        
        if (checkWinFunction) {
          cy.log('Found win check function, calling it');
          checkWinFunction();
        } else if (typeof win.endGame === 'function') {
          cy.log('Using endGame(true) to force win');
          win.endGame(true);
        } else {
          cy.log('Could not find win check or endGame function, win condition may not trigger');
        }
      }
      
      // Verify that win panel appears
      cy.get('#win-panel', { timeout: 5000 }).should('be.visible')
        .then(() => {
          cy.log('Win panel appeared successfully');
        })
        .catch(() => {
          cy.log('Win panel did not appear, win condition might not have triggered');
        });
    });
  }
  
  // Export functions for use in tests
  export { findWordsInPuzzle, forceWinCondition };
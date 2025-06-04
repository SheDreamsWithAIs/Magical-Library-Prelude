/**
 * Simulates finding words in the word search game
 * @param {Object} cy - Cypress object
 */
function findWordsInPuzzle(cy) {
  // Initialize statistics if needed
  initializeStats(cy);
  
  // First, make sure the instructions panel is closed
  ensureInstructionsPanelClosed(cy);
  

  
  cy.window().then((win) => {
    // Verify game state is properly initialized
    if (!win.state || !win.state.wordList || !win.state.wordList.length) {
      cy.log('Game state not properly initialized or accessible');
      return;
    }
    
    // Get unfound words to search for
    const unfoundWords = win.state.wordList.filter(w => !w.found);
    const unfoundWordsInPuzzle = unfoundWords.length;
    win.testRunStats.totalWordsAttempted += unfoundWordsInPuzzle;
    
    // Log words to find for this puzzle
    const wordListText = unfoundWords.map(w => w.word).join(', ');
    cy.log(`Words to find in this puzzle: ${wordListText}`);
    cy.log(`Attempting to find ${unfoundWordsInPuzzle} words...`);
    
    // First approach: Scan the grid like a human player would for all words
    cy.log('STRATEGY: Scanning the grid for words like a human player...');
    findWordsUsingGridScan(cy, win, unfoundWords);
    
    // After grid scanning, check if any words remain unfound
    cy.window().then((updatedWin) => {
      // Get a fresh list of unfound words after grid scan
      const remainingUnfoundWords = updatedWin.state.wordList.filter(w => !w.found);
      
      if (remainingUnfoundWords.length > 0) {
        cy.log(`STRATEGY: ${remainingUnfoundWords.length} words still unfound, trying placement data...`);
        // Fall back to using placement data only for words that weren't found by grid scan
        findWordsUsingPlacementData(cy, updatedWin, remainingUnfoundWords);
      } else {
        cy.log('All words found by grid scan, skipping placement data search');
      }
    });
    
    // Verify if all words are found for this puzzle
    cy.window().then((finalWin) => {
      const allFound = finalWin.state.wordList.every(w => w.found);
      finalWin.testRunStats.puzzlesCompleted++;
      
      if (allFound) {
        cy.log('All words found successfully in this puzzle!');
      } else {
        const remainingWords = finalWin.state.wordList.filter(w => !w.found).map(w => w.word);
        cy.log(`Words still unfound in this puzzle: ${remainingWords.join(', ')}`);
      }
    });
  });
}

function ensureInstructionsPanelClosed(cy) {
  // Check if the start playing button is visible
  cy.get('body').then($body => {
    const startButton = $body.find('#start-playing-btn:visible');
    
    if (startButton.length > 0) {
      cy.log('Start button is visible, clicking it to start the game');
      
      // Click the button to start the game
      cy.get('#start-playing-btn').click();
      
      // Verify instruction panel is no longer visible
      cy.get('#instructions-panel').should('not.be.visible');
      
      // Add a small delay to ensure the game is fully initialized
      cy.wait(300);
    } else {
      cy.log('Start button not visible, game is likely already started');
    }
  });
}

/**
 * Find words by scanning the grid like a human player would
 * @param {Object} cy - Cypress object
 * @param {Object} win - Window object with game state
 */
function findWordsUsingGridScan(cy, win, wordList) {
  if (!wordList || wordList.length === 0) {
    cy.log('No words to find');
    return;
  }
  
  // Get grid cells and dimensions
  cy.get('.grid-cell').then($cells => {
    const gridSize = Math.sqrt($cells.length);
    cy.log(`Grid size detected: ${gridSize}x${gridSize}`);
    
    // Convert jQuery collection to array
    const cells = Array.from($cells);
    
    // Create a 2D array representation of the grid
    const grid = [];
    const gridCells = [];
    for (let i = 0; i < gridSize; i++) {
      grid.push([]);
      gridCells.push([]);
      for (let j = 0; j < gridSize; j++) {
        const cell = cells[i * gridSize + j];
        const cellContent = cell.textContent.trim().toUpperCase();
        grid[i].push(cellContent);
        gridCells[i].push(cell);
      }
    }
    
    // For each word, look for distinctive patterns
    wordList.forEach(wordData => {
      const word = wordData.word.toUpperCase();
      
      // Skip if already found
      if (wordData.found) {
        return;
      }
      
      cy.log(`Looking for word: ${word}`);
      
      // Use a separate function for safer check of instructions panel
      checkInstructionsPanelAndFindWord(cy, word, wordData, grid, gridSize);
    });
  });
}

/**
 * Check if instructions panel is visible, then proceed with word finding
 * @param {Object} cy - Cypress object
 * @param {string} word - Word to find
 * @param {Object} wordData - Word data object
 * @param {Array} grid - 2D array of the grid
 * @param {number} gridSize - Size of the grid
 */
function checkInstructionsPanelAndFindWord(cy, word, wordData, grid, gridSize) {
  // First verify instructions panel is not visible
  cy.get('#instructions-panel').should('not.be.visible').then(() => {
    // Try to find using patterns sequentially
    findWordWithPatterns(cy, word, wordData, grid, gridSize, 0);
  });
}

/**
 * Try to find a word using patterns sequentially
 * @param {Object} cy - Cypress object
 * @param {string} word - Word to find
 * @param {Object} wordData - Word data object
 * @param {Array} grid - 2D array of the grid
 * @param {number} gridSize - Size of the grid
 * @param {number} patternIndex - Current pattern index
 */
function findWordWithPatterns(cy, word, wordData, grid, gridSize, patternIndex) {
  // First, check if the word is already found in the current game state
  cy.window().then(win => {
    // Find this word in the current state
    const currentWordData = win.state.wordList.find(w => 
      w.word === wordData.word
    );
    
    // Skip if already found by a previous pattern
    if (currentWordData && currentWordData.found) {
      cy.log(`Word "${word}" is already found, skipping further patterns`);
      return;
    }
    
    // Generate distinctive patterns for this word
    const patterns = getDistinctivePatterns(word);
    
    // Stop if we've tried all patterns
    if (patternIndex >= patterns.length) {
      cy.log(`Could not find word "${word}" using pattern scanning`);
      return;
    }
    
    const pattern = patterns[patternIndex];
    cy.log(`Looking for pattern: ${pattern}`);
    
    // Find all possible positions where this pattern could be found
    const positions = findPatternPositions(pattern, word, grid, gridSize);
    
    if (positions.length === 0) {
      // Pattern not found, try next pattern
      findWordWithPatterns(cy, word, wordData, grid, gridSize, patternIndex + 1);
      return;
    }
    
    // Try each position sequentially
    tryPositionsSequentially(cy, word, positions, 0, result => {
      if (result) {
        // Successfully found the word
        cy.window().then((statWin) => {
          statWin.testRunStats.wordsFoundByGridScan++;
        });
        return; // Stop here, word is found
      } else {
        // Try next pattern
        findWordWithPatterns(cy, word, wordData, grid, gridSize, patternIndex + 1);
      }
    });
  });
}

/**
 * Find all positions where a pattern might appear in the given word
 * @param {string} pattern - Pattern to find
 * @param {string} word - Full word to find
 * @param {Array} grid - 2D array of the grid
 * @param {number} gridSize - Size of the grid
 * @return {Array} - Array of potential positions
 */
function findPatternPositions(pattern, word, grid, gridSize) {
  const positions = [];
  
  // Scan the grid for this pattern
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Skip if the current cell doesn't match the first letter of the pattern
      if (grid[row][col] !== pattern[0]) continue;
      
      // Try all 8 directions
      const directions = [
        [0, 1], [1, 0], [1, 1], [0, -1], 
        [-1, 0], [-1, -1], [1, -1], [-1, 1]
      ];
      
      for (const [dRow, dCol] of directions) {
        // Check if pattern would fit in this direction
        const patternEndRow = row + (pattern.length - 1) * dRow;
        const patternEndCol = col + (pattern.length - 1) * dCol;
        
        if (patternEndRow < 0 || patternEndRow >= gridSize || 
            patternEndCol < 0 || patternEndCol >= gridSize) {
          continue;
        }
        
        // Check if the pattern matches in this direction
        let patternMatch = true;
        for (let i = 0; i < pattern.length; i++) {
          const r = row + i * dRow;
          const c = col + i * dCol;
          if (grid[r][c] !== pattern[i]) {
            patternMatch = false;
            break;
          }
        }
        
        if (!patternMatch) continue;
        
        // We found a pattern match, now check if the entire word matches
        
        // Determine if this is the start or end of the word
        const patternStartInWord = word.indexOf(pattern);
        if (patternStartInWord === -1) continue;
        
        // Calculate word start position
        const wordStartRow = row - patternStartInWord * dRow;
        const wordStartCol = col - patternStartInWord * dCol;
        
        // Calculate word end position
        const wordEndRow = wordStartRow + (word.length - 1) * dRow;
        const wordEndCol = wordStartCol + (word.length - 1) * dCol;
        
        // Check if the word would fit in the grid
        if (wordStartRow < 0 || wordStartRow >= gridSize || 
            wordStartCol < 0 || wordStartCol >= gridSize ||
            wordEndRow < 0 || wordEndRow >= gridSize ||
            wordEndCol < 0 || wordEndCol >= gridSize) {
          continue;
        }
        
        // Check if the full word matches
        let fullWordMatch = true;
        for (let i = 0; i < word.length; i++) {
          const r = wordStartRow + i * dRow;
          const c = wordStartCol + i * dCol;
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize || 
              grid[r][c] !== word[i]) {
            fullWordMatch = false;
            break;
          }
        }
        
        if (fullWordMatch) {
          // Add this position to the list
          positions.push({
            startRow: wordStartRow,
            startCol: wordStartCol,
            endRow: wordEndRow,
            endCol: wordEndCol,
            dRow,
            dCol
          });
        }
      }
    }
  }
  
  return positions;
}

/**
 * Try word positions sequentially until one succeeds or all fail
 * @param {Object} cy - Cypress object
 * @param {string} word - Word to find
 * @param {Array} positions - Array of positions to try
 * @param {number} posIndex - Current position index
 * @param {Function} callback - Callback function(success)
 */
function tryPositionsSequentially(cy, word, positions, posIndex, callback) {
  // Stop if all positions have been tried
  if (posIndex >= positions.length) {
    callback(false);
    return;
  }
  
  const pos = positions[posIndex];
  cy.log(`GRID SCAN: Found "${word}" starting at [${pos.startRow},${pos.startCol}] in direction [${pos.dRow},${pos.dCol}]`);
  
  // Try to select the word
  trySelectWord(cy, pos.startRow, pos.startCol, pos.endRow, pos.endCol).then(success => {
    if (success) {
      // Verify that the word is actually marked as found in the game state
      cy.window().then(win => {
        const wordInState = win.state.wordList.find(w => w.word.toUpperCase() === word);
        if (wordInState && wordInState.found) {
          // Word is actually found - success!
          callback(true);
        } else {
          // Word not marked as found, try next position
          tryPositionsSequentially(cy, word, positions, posIndex + 1, callback);
        }
      });
    } else {
      // Selection failed, try next position
      tryPositionsSequentially(cy, word, positions, posIndex + 1, callback);
    }
  });
}

/**
 * Try to select a word by clicking and dragging
 * @param {Object} cy - Cypress object
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @param {number} endRow - Ending row
 * @param {number} endCol - Ending column
 * @return {Promise<boolean>} - Whether selection was successful
 */
function trySelectWord(cy, startRow, startCol, endRow, endCol) {
  return new Promise(resolve => {
    // Try to select with retries
    cy.get(`.grid-cell[data-row="${startRow}"][data-col="${startCol}"]`)
      .then($startCell => {
        if ($startCell.length === 0) {
          cy.log(`Start cell [${startRow},${startCol}] not found in DOM`);
          resolve(false);
          return;
        }

        cy.get(`.grid-cell[data-row="${endRow}"][data-col="${endCol}"]`)
          .then($endCell => {
            if ($endCell.length === 0) {
              cy.log(`End cell [${endRow},${endCol}] not found in DOM`);
              resolve(false);
              return;
            }

            // Perform the selection
            cy.wrap($startCell)
              .trigger('mousedown')
              .then(() => {
                cy.wrap($endCell)
                  .trigger('mouseover')
                  .then(() => {
                    cy.get('body')
                      .trigger('mouseup')
                      .then(() => {
                        // Add a brief wait to allow the game to process the selection
                        cy.wait(300).then(() => {
                          // Assume success if we get this far
                          resolve(true);
                        });
                      });
                  });
              });
          });
      });
  });
}

/**
 * Find words using their placement data from the game state (fallback method)
 * @param {Object} cy - Cypress object
 * @param {Object} win - Window object with game state
 * @param {Array} wordList - List of unfound words
 */
function findWordsUsingPlacementData(cy, win, wordList) {
  if (!wordList) {
    wordList = win.state.wordList.filter(w => !w.found);
  }

  if (wordList.length === 0) {
    cy.log('No unfound words to search for using placement data');
    return;
  }

  // Use a safer approach to check for the instructions panel
  cy.get('#instructions-panel').should('not.be.visible').then(() => {
    // Try to find each unfound word using placement data
    wordList.forEach((wordData) => {
      // Skip if already found
      if (wordData.found) {
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

      cy.log(`Using placement data to select word: ${wordData.word}, from [${startRow},${startCol}] to [${endRow},${endCol}]`);

      // Try to select the word with retry logic
      trySelectWord(cy, startRow, startCol, endRow, endCol).then(success => {
        if (success) {
          // Track this as found by placement data
          cy.window().then((statWin) => {
            statWin.testRunStats.wordsFoundByPlacementData++;
          });
        } else {
          cy.log(`Failed to select word "${wordData.word}" using placement data`);
        }
      });
    });
  });
}

// Include the rest of the functions from the original implementation
function getDistinctivePatterns(word) {
  const patterns = [];
  const length = word.length;

  // Add distinctive consonant clusters - often easier to spot
  // Common consonant clusters that stand out in word searches
  const clusters = ['TH', 'CH', 'SH', 'PH', 'WH', 'GH', 'CK', 'NG', 'QU', 'SP', 'ST', 'TR', 'PL', 'CR'];
  for (const cluster of clusters) {
    const index = word.toUpperCase().indexOf(cluster);
    if (index !== -1) {
      // Found a cluster, add a pattern around it (3-4 letters including the cluster)
      const startIdx = Math.max(0, index - 1);
      const endIdx = Math.min(length, index + cluster.length + 1);
      patterns.push(word.substring(startIdx, endIdx));
    }
  }

  // Look for unusual letters that stand out (Q, Z, X, J, K)
  const unusualLetters = ['Q', 'Z', 'X', 'J', 'K'];
  for (const letter of unusualLetters) {
    const index = word.toUpperCase().indexOf(letter);
    if (index !== -1) {
      // Found an unusual letter, add a pattern around it
      const startIdx = Math.max(0, index - 1);
      const endIdx = Math.min(length, index + 2);
      patterns.push(word.substring(startIdx, endIdx));
    }
  }

  // Add end of word (often more distinctive)
  if (length >= 3) {
    patterns.push(word.substring(length - 3));
  }
  if (length >= 2) {
    patterns.push(word.substring(length - 2));
  }

  // Add beginning of word
  if (length >= 3) {
    patterns.push(word.substring(0, 3));
  }
  if (length >= 2) {
    patterns.push(word.substring(0, 2));
  }

  // Add middle section if word is long enough
  if (length >= 5) {
    const middleStart = Math.floor(length / 2) - 1;
    patterns.push(word.substring(middleStart, middleStart + 3));
  }

  // If word is very short, just use the whole word
  if (length <= 3) {
    patterns.push(word);
  }

  // If no patterns were found (unlikely), use single letters
  if (patterns.length === 0) {
    for (let i = 0; i < length; i++) {
      patterns.push(word[i]);
    }
  }

  // Prioritize longer patterns first
  patterns.sort((a, b) => b.length - a.length);

  // Remove duplicates
  return [...new Set(patterns)];
}

function initializeStats(cy) {
  cy.window().then((win) => {
    // Only initialize if it doesn't exist yet
    if (!win.testRunStats) {
      win.testRunStats = {
        wordsFoundByGridScan: 0,
        wordsFoundByPlacementData: 0,
        totalWordsAttempted: 0,
        puzzlesCompleted: 0
      };
      cy.log('Test run statistics initialized');
    }
  });
}

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

    // Try to trigger win condition
    if (typeof win.checkWinCondition === 'function') {
      cy.log('Using checkWinCondition to trigger win');
      win.checkWinCondition();
    } else {
      cy.log('checkWinCondition not found, trying endGame');
      if (typeof win.endGame === 'function') {
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
      });
  });
}

function reportTestRunStats(cy) {
  cy.window().then((win) => {
    // Check if stats have been initialized
    if (!win.testRunStats) {
      cy.log('No test run statistics available');
      return;
    }

    // Calculate remaining unfound words
    const totalAttempted = win.testRunStats.totalWordsAttempted;
    const foundByGrid = win.testRunStats.wordsFoundByGridScan;
    const foundByPlacement = win.testRunStats.wordsFoundByPlacementData;
    const notFound = totalAttempted - (foundByGrid + foundByPlacement);

    // Log the statistics for the entire test run
    cy.log('=== WORD FINDING TEST RUN STATISTICS ===');
    cy.log(`Puzzles completed: ${win.testRunStats.puzzlesCompleted}`);
    cy.log(`Total words attempted: ${totalAttempted}`);
    cy.log(`Words found by grid scanning: ${foundByGrid} (${calculatePercentage(foundByGrid, totalAttempted)}%)`);
    cy.log(`Words found by placement data: ${foundByPlacement} (${calculatePercentage(foundByPlacement, totalAttempted)}%)`);
    cy.log(`Words not found by either method: ${notFound} (${calculatePercentage(notFound, totalAttempted)}%)`);
    cy.log('=======================================');
  });
}

function resetTestRunStats(cy) {
  cy.window().then((win) => {
    win.testRunStats = {
      wordsFoundByGridScan: 0,
      wordsFoundByPlacementData: 0,
      totalWordsAttempted: 0,
      puzzlesCompleted: 0
    };
    cy.log('Test run statistics reset');
  });
}

function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

// Export the functions
export { findWordsInPuzzle, forceWinCondition, reportTestRunStats, resetTestRunStats };
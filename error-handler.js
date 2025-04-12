/* Error handling system for Chronicles of the Kethaneum
 * This file contains functions for managing error states and recovery
 */

// Create a user-friendly error display system
function showErrorMessage(title, message, actionText = "Return to Book of Passage", actionFunction = null) {
    console.error(title + ": " + message);
    
    // Create error panel if it doesn't exist
    let errorPanel = document.getElementById('error-panel');
    if (!errorPanel) {
      errorPanel = document.createElement('div');
      errorPanel.id = 'error-panel';
      errorPanel.className = 'panel';
      errorPanel.style.zIndex = "2000"; // Make sure it appears on top
      
      document.body.appendChild(errorPanel);
    }
    
    // Default action is to return to Book of Passage
    if (!actionFunction) {
      actionFunction = function() {
        errorPanel.style.display = 'none';
        window.navigateTo('book-of-passage-screen');
      };
    }
    
    // Set error content
    errorPanel.innerHTML = `
      <h2>${title}</h2>
      <p>${message}</p>
      <button id="error-action-btn" class="accent">${actionText}</button>
    `;
    
    // Show the panel
    errorPanel.style.display = 'block';
    
    // Add event listener to the action button
    const actionBtn = document.getElementById('error-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', actionFunction);
    }
  }
  
  // Create a fallback grid with simple words when normal generation fails
  function createFallbackGrid(fallbackWords, config) {
    // Create empty grid
    const grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
    
    // Track placements
    const placements = [];
    
    // Place fallback words in predictable positions
    for (let i = 0; i < fallbackWords.length && i < 4; i++) {
      const word = fallbackWords[i].toUpperCase();
      
      // Place words in different directions
      const directions = [
        [0, 1],  // right
        [1, 0],  // down
        [1, 1],  // diagonal down-right
        [-1, -1] // diagonal up-left
      ];
      
      const [dRow, dCol] = directions[i % directions.length];
      const row = i + 1;
      const col = i + 1;
      
      // Make sure word fits
      if (row + (word.length - 1) * dRow < config.gridSize && 
          row + (word.length - 1) * dRow >= 0 &&
          col + (word.length - 1) * dCol < config.gridSize &&
          col + (word.length - 1) * dCol >= 0) {
        
        // Place the word
        for (let j = 0; j < word.length; j++) {
          const r = row + j * dRow;
          const c = col + j * dCol;
          grid[r][c] = word[j];
        }
        
        // Track placement
        placements.push({
          word,
          found: false,
          row,
          col,
          direction: [dRow, dCol]
        });
      }
    }
    
    return { grid, placements };
  }
  
  // Handle errors during puzzle loading
  function handlePuzzleLoadError(error) {
    console.error('Error loading puzzles:', error);
    
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Show user-friendly error message
    showErrorMessage(
      "Puzzle Loading Error", 
      "We couldn't load the knowledge archives. The Kethaneum's indexing matrix seems to be temporarily disrupted. Please try again later.",
      "Return to Book of Passage"
    );
  }
  
  // Handle errors during random puzzle loading
  function handleRandomPuzzleError(error, state) {
    console.error('Error loading random puzzle:', error);
    
    // Show user-friendly error message
    showErrorMessage(
      "Knowledge Construct Unavailable", 
      "The Kethaneum's archival system cannot locate the requested knowledge construct. Perhaps try a different section or return to your Book of Passage.",
      "Try Another Category",
      function() {
        document.getElementById('error-panel').style.display = 'none';
        // Try loading a completely different puzzle
        const genres = Object.keys(state.puzzles);
        if (genres.length > 0) {
          const randomGenre = genres[Math.floor(Math.random() * genres.length)];
          window.loadSequentialPuzzle(randomGenre);
          window.navigateTo('puzzle-screen');
        } else {
          // If no genres available, go back to Book of Passage
          window.navigateTo('book-of-passage-screen');
        }
      }
    );
  }
  
  // Handle errors during sequential puzzle loading
  function handleSequentialPuzzleError(error, state) {
    console.error('Error loading sequential puzzle:', error);
    
    // Show user-friendly error message with options
    showErrorMessage(
      "Knowledge Construct Inaccessible", 
      "The Kethaneum's archival system cannot access the requested knowledge patterns. This could be due to ongoing reorganization of the cosmic catalog.",
      "Explore Different Archives",
      function() {
        document.getElementById('error-panel').style.display = 'none';
        
        // Try to find ANY puzzle from ANY genre as a last resort
        const allGenres = Object.keys(state.puzzles);
        if (allGenres.length > 0) {
          for (const genreAttempt of allGenres) {
            if (state.puzzles[genreAttempt].length > 0) {
              // Found a valid puzzle, use it
              const randomIndex = Math.floor(Math.random() * state.puzzles[genreAttempt].length);
              const puzzleData = state.puzzles[genreAttempt][randomIndex];
              state.currentPuzzleIndex = randomIndex;
              state.currentGenre = genreAttempt;
              state.currentBook = puzzleData.book;
              state.currentStoryPart = puzzleData.storyPart;
              
              window.initializePuzzle(puzzleData);
              window.navigateTo('puzzle-screen');
              return;
            }
          }
        }
        
        // If truly nothing works, go back to Book of Passage
        window.navigateTo('book-of-passage-screen');
      }
    );
  }
  
  // Handle errors during grid generation
  function handleGridGenerationError(error, words, config, fillEmptyCellsFunction) {
    console.error('Error generating grid:', error);
    
    // Try again with fewer words if possible
    if (words.length > 3) {
      console.log('Retrying grid generation with fewer words');
      // Try with 75% of the words
      const reducedWords = words.slice(0, Math.max(3, Math.floor(words.length * 0.75)));
      
      try {
        // Try to generate grid with fewer words directly
        return window.generateGrid(reducedWords);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        // Continue to fallback
      }
    }
    
    // If we can't reduce words further, show error and provide fallback grid
    window.showErrorMessage(
      "Grid Generation Error", 
      "The Kethaneum's word pattern generator encountered unexpected interference. A simpler pattern has been substituted.",
      "Proceed with Simplified Pattern",
      function() {
        document.getElementById('error-panel').style.display = 'none';
      }
    );
    
    // Create an emergency fallback grid with simple words
    const fallback = createFallbackGrid(['BOOK', 'PAGE', 'WORD', 'READ'], config);
    
    // Fill empty cells with random letters
    for (let row = 0; row < config.gridSize; row++) {
      for (let col = 0; col < config.gridSize; col++) {
        if (fallback.grid[row][col] === '') {
          fillEmptyCellsFunction(fallback.grid);
          break; // Only need to call once
        }
      }
    }
    
    // Return grid and make sure to update word list
    return fallback.grid;
  }
  
  // Handle initial load errors
  function handleInitialLoadErrors(state) {
    // Set up a timeout to check if puzzles loaded
    setTimeout(() => {
      const genres = Object.keys(state.puzzles);
      if (genres.length === 0) {
        // If no puzzles were loaded, show a friendly message on the Book of Passage screen
        const bookContent = document.getElementById('book-of-passage-content');
        if (bookContent) {
          const errorMessage = `
            <p><em>The pages of your Book of Passage flicker with uncertainty:</em></p>
            
            <p>"It appears the Kethaneum's indexing matrix is currently experiencing fluctuations. The Senior Archivists are working to stabilize the connection between realms. Please try again later, or speak with an Archivist for assistance."</p>
            
            <div class="progress-section">
              <h3>System Status:</h3>
              <p>Cataloging System: <span style="color: var(--accent-main);">Recalibrating</span></p>
              <p>Connection Stability: <span style="color: var(--accent-main);">Intermittent</span></p>
              
              <div id="books-progress-section">
                <p>The Kethaneum is reorganizing its archives. Please stand by...</p>
              </div>
            </div>
          `;
          
          bookContent.innerHTML = errorMessage;
        }
      }
    }, 5000); // Check after 5 seconds
  }
  
  // Make functions available globally
  window.showErrorMessage = showErrorMessage;
  window.createFallbackGrid = createFallbackGrid;
  window.handlePuzzleLoadError = handlePuzzleLoadError;
  window.handleRandomPuzzleError = handleRandomPuzzleError;
  window.handleSequentialPuzzleError = handleSequentialPuzzleError;
  window.handleGridGenerationError = handleGridGenerationError;
  window.handleInitialLoadErrors = handleInitialLoadErrors;
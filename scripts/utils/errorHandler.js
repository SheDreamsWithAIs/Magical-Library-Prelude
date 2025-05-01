/**
 * Error handling system for Chronicles of the Kethaneum
 * This module contains functions for managing error states and recovery
 */

/**
 * Creates and displays a user-friendly error message panel
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {string} actionText - Button text, defaults to "Return to Book of Passage"
 * @param {Function} actionFunction - Function to execute when button is clicked
 */
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
      navigateToScreen('book-of-passage-screen');
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

/**
 * Creates a fallback grid with simple words when normal generation fails
 * @param {Array} fallbackWords - List of simple words to use
 * @param {Object} config - Grid configuration object
 * @returns {Object} - Grid and word placements
 */
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
    
    // Check if pattern would fit in this direction
    const endRow = row + (word.length - 1) * dRow;
    const endCol = col + (word.length - 1) * dCol;
    
    if (endRow < 0 || endRow >= config.gridSize || 
        endCol < 0 || endCol >= config.gridSize) {
      continue;
    }
    
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
  
  return { grid, placements };
}

/**
 * Handle errors during puzzle loading
 * @param {Error} error - The error that occurred
 */
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

/**
 * Handle errors during random puzzle loading
 * @param {Error} error - The error that occurred
 * @param {Object} state - Current game state
 */
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
        loadSequentialPuzzle(randomGenre);
        navigateToScreen('puzzle-screen');
      } else {
        // If no genres available, go back to Book of Passage
        navigateToScreen('book-of-passage-screen');
      }
    }
  );
}

/**
 * Handle errors during sequential puzzle loading
 * @param {Error} error - The error that occurred
 * @param {Object} state - Current game state
 */
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
            
            initializePuzzle(puzzleData);
            navigateToScreen('puzzle-screen');
            return;
          }
        }
      }
      
      // If truly nothing works, go back to Book of Passage
      navigateToScreen('book-of-passage-screen');
    }
  );
}

/**
 * Handle errors during grid generation
 * @param {Error} error - The error that occurred
 * @param {Array} words - Words to place in grid
 * @param {Object} config - Grid configuration
 * @param {Function} fillEmptyCellsFunction - Function to fill empty cells
 * @returns {Array} - Fallback grid
 */
function handleGridGenerationError(error, words, config, fillEmptyCellsFunction) {
  console.error('Error generating grid:', error);
  
  // Try again with fewer words if possible
  if (words.length > 3) {
    console.log('Retrying grid generation with fewer words');
    // Try with 75% of the words
    const reducedWords = words.slice(0, Math.max(3, Math.floor(words.length * 0.75)));
    
    try {
      // Try to generate grid with fewer words directly
      return generateGrid(reducedWords);
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      // Continue to fallback
    }
  }
  
  // If we can't reduce words further, show error and provide fallback grid
  showErrorMessage(
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
  
  // Return grid
  return fallback.grid;
}

/**
 * Handle initial load errors
 * @param {Object} state - Current game state
 */
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

/**
 * Handle puzzle initialization errors
 * @param {Error} error - The error that occurred
 * @param {Function} navigateToFunction - Function to navigate between screens
 */
function handlePuzzleInitializationError(error, navigateToFunction) {
  console.error('Puzzle initialization error:', error);
  
  showErrorMessage(
    "Knowledge Pattern Error",
    "The Kethaneum's archival system cannot properly manifest this knowledge pattern. The Senior Archivists have been notified of the disturbance.",
    "Return to Book of Passage",
    function() {
      document.getElementById('error-panel').style.display = 'none';
      navigateToFunction('book-of-passage-screen');
    }
  );
}

/**
 * Handle timer errors
 * @param {Error} error - The error that occurred
 * @param {Object} state - Current game state
 */
function handleTimerError(error, state) {
  console.error('Timer error:', error);
  
  // Create an emergency timer as fallback that doesn't use the UI
  clearInterval(state.timer);
  
  state.timer = setInterval(() => {
    if (state.paused) return;
    
    state.timeRemaining--;
    
    // Just check if time's up without trying to render
    if (state.timeRemaining <= 0) {
      clearInterval(state.timer);
      
      // Show a basic timeout message
      showErrorMessage(
        "Time Expiration",
        "Your cataloging session has timed out. The knowledge construct remains uncategorized.",
        "Try Again",
        function() {
          document.getElementById('error-panel').style.display = 'none';
          resetCurrentPuzzle();
        }
      );
    }
  }, 1000);
}

/**
 * Handle save errors with user notification
 * @param {Error} error - The error that occurred
 * @param {string} message - Optional custom error message
 */
function handleSaveError(error, message = null) {
  console.error('Save error:', error);
  
  // Create a subtle notification instead of an error panel
  const notification = document.createElement('div');
  notification.className = 'save-error-notification';
  notification.textContent = message || "The Kethaneum's record system is experiencing difficulties. Your progress may not be saved.";
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = 'var(--warm-medium)';
  notification.style.color = 'var(--accent-main)';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '2000';
  notification.style.fontSize = '14px';
  notification.style.maxWidth = '300px';
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
  
  // Try to save to sessionStorage as a fallback
  try {
    sessionStorage.setItem('kethaneum_emergency_backup', JSON.stringify({
      currentBook: state.currentBook,
      currentStoryPart: state.currentStoryPart,
      completedPuzzles: state.completedPuzzles,
      timestamp: new Date().toISOString()
    }));
  } catch (fallbackError) {
    console.error('Even fallback save failed:', fallbackError);
  }
}

/**
 * Handle navigation errors
 * @param {Error} error - The error that occurred
 * @param {string} targetScreen - Screen we tried to navigate to
 * @param {string} fallbackScreen - Fallback screen if target is unavailable
 */
function handleNavigationError(error, targetScreen, fallbackScreen = 'title-screen') {
  console.error('Navigation error:', error);
  
  // Try to restore proper screen state
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.style.display = 'none';
    screen.classList.remove('active');
  });
  
  // Try to navigate to target screen
  const targetElement = document.getElementById(targetScreen);
  if (targetElement) {
    targetElement.classList.add('active');
    targetElement.style.display = targetScreen === 'puzzle-screen' ? 'flex' : 
                                  (targetScreen === 'title-screen' || 
                                  targetScreen === 'backstory-screen' || 
                                  targetScreen === 'book-of-passage-screen') ? 'flex' : 'block';
    
    // Update state if possible
    if (state) {
      state.currentScreen = targetScreen;
    }
  } else {
    // If target screen not found, try fallback
    const fallbackElement = document.getElementById(fallbackScreen);
    if (fallbackElement) {
      fallbackElement.classList.add('active');
      fallbackElement.style.display = fallbackScreen === 'puzzle-screen' ? 'flex' : 
                                      (fallbackScreen === 'title-screen' || 
                                      fallbackScreen === 'backstory-screen' || 
                                      fallbackScreen === 'book-of-passage-screen') ? 'flex' : 'block';
      
      // Update state if possible
      if (state) {
        state.currentScreen = fallbackScreen;
      }
    }
  }
  
  // Show a subtle notification
  const notification = document.createElement('div');
  notification.className = 'navigation-error-notification';
  notification.textContent = "The Kethaneum's pathways are experiencing fluctuations. Your journey may be redirected.";
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = 'var(--warm-medium)';
  notification.style.color = 'var(--accent-main)';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '2000';
  notification.style.fontSize = '14px';
  notification.style.maxWidth = '80%';
  notification.style.textAlign = 'center';
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Temporarily continue making functions available globally 
// These will be converted to proper exports once the module system is fully implemented
window.showErrorMessage = showErrorMessage;
window.createFallbackGrid = createFallbackGrid;
window.handlePuzzleLoadError = handlePuzzleLoadError;
window.handleRandomPuzzleError = handleRandomPuzzleError;
window.handleSequentialPuzzleError = handleSequentialPuzzleError;
window.handleGridGenerationError = handleGridGenerationError;
window.handleInitialLoadErrors = handleInitialLoadErrors;
window.handlePuzzleInitializationError = handlePuzzleInitializationError;
window.handleTimerError = handleTimerError;
window.handleSaveError = handleSaveError;
window.handleNavigationError = handleNavigationError;

// Export functions for module system
export {
  showErrorMessage,
  createFallbackGrid,
  handlePuzzleLoadError,
  handleRandomPuzzleError,
  handleSequentialPuzzleError,
  handleGridGenerationError,
  handleInitialLoadErrors,
  handlePuzzleInitializationError,
  handleTimerError,
  handleSaveError,
  handleNavigationError
};
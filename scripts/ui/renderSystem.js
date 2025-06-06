/**
 * Render System for Chronicles of the Kethaneum
 * This module handles updating the UI based on game state
 */

/**
 * Render the grid to the DOM
 */
function renderGrid() {
  const wordGrid = document.getElementById('word-grid');
  if (!wordGrid) return;

  const state = window.state;
  if (!state || !state.grid || state.grid.length === 0) {
    console.error('Cannot render grid: grid data not available');
    return;
  }

  wordGrid.innerHTML = '';
  const gridSize = state.grid.length;
  wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.textContent = state.grid[row][col];
      cell.dataset.row = row;
      cell.dataset.col = col;
      wordGrid.appendChild(cell);
    }
  }
}

/**
 * Render word list to the DOM
 */
function renderWordList() {
  const state = window.state;
  if (!state || !state.wordList) return;

  const desktopWordList = document.getElementById('word-list');
  const mobileWordList = document.getElementById('mobile-word-list');

  if (!desktopWordList && !mobileWordList) return;

  // Clear both lists
  if (desktopWordList) desktopWordList.innerHTML = '';
  if (mobileWordList) mobileWordList.innerHTML = '';

  // Sort the word list to put found words at the bottom
  const sortedWordList = [...state.wordList].sort((a, b) => {
    if (a.found === b.found) return 0;
    return a.found ? 1 : -1; // Found words go to the bottom
  });

  for (const wordData of sortedWordList) {
    // Create desktop list item
    if (desktopWordList) {
      const listItem = document.createElement('li');
      listItem.textContent = wordData.word;

      if (wordData.found) {
        listItem.classList.add('found');
      }

      desktopWordList.appendChild(listItem);
    }

    // Create mobile list item
    if (mobileWordList) {
      const mobileItem = document.createElement('li');
      mobileItem.textContent = wordData.word;

      if (wordData.found) {
        mobileItem.classList.add('found');
      }

      mobileWordList.appendChild(mobileItem);
    }
  }
}

/**
 * Render timer bar
 */
function renderTimer() {
  const state = window.state;
  if (!state) return;

  const timerBar = document.getElementById('timer-bar');
  if (!timerBar) return;

  const percentRemaining = (state.timeRemaining / window.config.timeLimit) * 100;

  // Update desktop timer
  timerBar.style.width = `${percentRemaining}%`;

  // Update mobile timer if it exists
  const mobileTimerBar = document.querySelector('.mobile-timer-bar');
  if (mobileTimerBar) {
    mobileTimerBar.style.width = `${percentRemaining}%`;
  }

  // Change color as time runs low
  const timerColor = percentRemaining < 20 ?
    'var(--accent-main)' : percentRemaining < 50 ?
      'var(--primary-lighter)' : 'var(--primary-light)';

  timerBar.style.backgroundColor = timerColor;
  if (mobileTimerBar) {
    mobileTimerBar.style.backgroundColor = timerColor;
  }
}

/**
 * Update visual selection of cells
 */
function updateSelectedCells() {
  const state = window.state;
  if (!state || !state.selectedCells) return;

  // Reset all cell selections
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('selected');
  });

  // Add selection class to currently selected cells
  state.selectedCells.forEach(cell => {
    cell.classList.add('selected');
  });
}

/**
 * Mark cells as correct when a word is found
 * @param {Array} cells - Array of cell elements to mark
 */
function markCellsAsCorrect(cells) {
  if (!cells || !Array.isArray(cells)) return;

  cells.forEach(cell => {
    cell.classList.add('correct');
  });
}

/**
 * Create and animate a mobile timer
 * @param {Function} callback - Function to call when animation completes
 */
function setupMobileTimerWithAnimation(callback) {
  // Create mobile timer if it doesn't exist
  if (!document.querySelector('.mobile-timer-container')) {
    const mobileTimer = document.createElement('div');
    mobileTimer.className = 'mobile-timer-container';
    mobileTimer.innerHTML = '<div class="mobile-timer-bar"></div>';
    document.body.appendChild(mobileTimer);

    // Get the timer bar
    const mobileTimerBar = mobileTimer.querySelector('.mobile-timer-bar');

    // Animation sequence
    let flashCount = 0;
    const maxFlashes = 3;
    const flashInterval = setInterval(() => {
      if (flashCount >= maxFlashes * 2) {
        clearInterval(flashInterval);
        if (callback && typeof callback === 'function') {
          callback(); // Run the callback function after animation completes
        }
        return;
      }

      if (flashCount % 2 === 0) {
        // Flash to accent color
        mobileTimerBar.style.backgroundColor = 'var(--accent-main)';
        mobileTimerBar.style.width = '100%';
      } else {
        // Flash to primary color
        mobileTimerBar.style.backgroundColor = 'var(--primary-light)';
        mobileTimerBar.style.width = '100%';
      }

      flashCount++;
    }, 300);
  } else {
    // Timer already exists, just run the callback
    if (callback && typeof callback === 'function') {
      callback();
    }
  }
}

/**
 * Set up mobile-specific enhancements for the puzzle screen
 */
function setupMobileEnhancements() {
  // Check if we're on a mobile device
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Don't create the timer yet - wait for instruction panel close

    // Create collapsible story toggle if not already present
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer && !storyContainer.querySelector('.story-toggle')) {
      const toggleButton = document.createElement('button');
      toggleButton.className = 'story-toggle';
      toggleButton.textContent = 'Show More';
      toggleButton.addEventListener('click', function () {
        storyContainer.classList.toggle('expanded');
        this.textContent = storyContainer.classList.contains('expanded') ? 'Show Less' : 'Show More';
      });
      storyContainer.appendChild(toggleButton);
    }

    // Create mobile word list if it doesn't exist
    if (!document.querySelector('.mobile-word-list')) {
      const mobileWordList = document.createElement('ul');
      mobileWordList.className = 'mobile-word-list';
      mobileWordList.id = 'mobile-word-list';

      // Hide the desktop word list
      const desktopWordList = document.querySelector('.words-container');
      if (desktopWordList) {
        desktopWordList.style.display = 'none';
      }

      // Place mobile word list after the grid
      const gridContainer = document.querySelector('.grid-container');
      if (gridContainer && gridContainer.parentNode) {
        gridContainer.parentNode.insertBefore(mobileWordList, gridContainer.nextSibling);
      }

      // Re-render the word list to populate the mobile list
      renderWordList();
    }

    // Set up haptic feedback for word finding
    setupHapticFeedback();

    // Make sure book title is visible
    const bookTitle = document.getElementById('book-title');
    if (bookTitle) {
      bookTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/**
 * Add haptic feedback to word finding
 */
function setupHapticFeedback() {
  // Check if we've already set up haptic feedback
  if (window.hapticFeedbackSetup) return;

  // If device supports vibration API
  if (navigator.vibrate) {
    // Store original successful word selection to add vibration
    const originalMarkWordAsFound = window.markWordAsFound || function() {};
    
    window.markWordAsFound = function(wordData) {
      // Call the original function
      const result = originalMarkWordAsFound(wordData);
      
      // If word was successfully marked as found, trigger vibration
      if (result) {
        navigator.vibrate(50); // Short 50ms vibration
      }
      
      return result;
    };
    
    // Mark as set up
    window.hapticFeedbackSetup = true;
  }
}

/**
 * Generate genre cards based on available puzzle data
 * @param {HTMLElement} container - The container to add cards to
 * @param {Object} puzzles - The puzzles object from game state
 */
function generateGenreCards(container, puzzles) {
  if (!container || !puzzles) {
    console.log('Missing container or puzzles data for genre cards');
    return;
  }
  
  // Clear existing cards
  container.innerHTML = '';
  
  // Generate a card for each genre
  Object.keys(puzzles).forEach(genre => {
    if (puzzles[genre] && puzzles[genre].length > 0) {
      const card = createGenreCard(genre);
      container.appendChild(card);
    }
  });
}

/**
 * Create a genre card element
 * @param {string} genre - The genre name
 * @returns {HTMLElement} - The genre card element
 */
function createGenreCard(genre) {
  const card = document.createElement('div');
  card.className = 'genre-card';
  card.dataset.genre = genre;
  
  // Get display info for this genre
  const displayInfo = getGenreDisplayInfo(genre);
  
  card.innerHTML = `
    <div class="card-glow"></div>
    <div class="card-content">
      <h3>${displayInfo.title}</h3>
      <p>${displayInfo.description}</p>
      <div class="card-icon">${displayInfo.icon}</div>
    </div>
  `;
  
  return card;
}

/**
 * Get display information for a genre
 * @param {string} genre - The genre name
 * @returns {Object} - The display information
 */
function getGenreDisplayInfo(genre) {
  // Default display info
  const defaultInfo = {
    title: genre.charAt(0).toUpperCase() + genre.slice(1),
    description: "Knowledge constructs from across realms",
    icon: "✦"
  };
  
  // Genre-specific display info
  const genreInfo = {
    "Kethaneum": {
      title: "Kethaneum Lore",
      description: "Chronicles of the nexus between realms",
      icon: "✦"
    },
    "nature": {
      title: "Natural Wisdom",
      description: "Words of the living world",
      icon: "🍃"
    }
  };
  
  return genreInfo[genre] || defaultInfo;
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.renderGrid = renderGrid;
window.renderWordList = renderWordList;
window.renderTimer = renderTimer;
window.updateSelectedCells = updateSelectedCells;
window.markCellsAsCorrect = markCellsAsCorrect;
window.setupMobileTimerWithAnimation = setupMobileTimerWithAnimation;
window.setupMobileEnhancements = setupMobileEnhancements;
window.setupHapticFeedback = setupHapticFeedback;

// Export functions for module system
export {
  renderGrid,
  renderWordList,
  renderTimer,
  updateSelectedCells,
  markCellsAsCorrect,
  setupMobileTimerWithAnimation,
  setupMobileEnhancements,
  setupHapticFeedback,
  generateGenreCards,
  createGenreCard,
  getGenreDisplayInfo
};
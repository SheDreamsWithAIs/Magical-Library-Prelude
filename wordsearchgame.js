/* Word Search Adventure Game
 * Enhanced implementation with state management pattern,
 * performance optimizations, and transition effects
 */

// Game Configuration
const config = {
  gridSize: 10,           // Square grid dimension
  timeLimit: 180,         // Time limit in seconds
  minWordLength: 3,       // Minimum word length
  maxWordLength: 10,      // Maximum word length
  maxWords: 10,           // Maximum words to include
  directions: [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1]   // diagonal up-right
  ]
};

/**
 * State Machine for managing game state and transitions
 */
const GameStateMachine = {
  currentState: 'loading',
  puzzleData: {}, // Cache for puzzle data by genre
  
  // Current game state data
  data: {
    currentScreen: 'title-screen',
    currentGenre: '',
    currentPuzzleIndex: -1,
    grid: [],
    wordList: [],
    selectedCells: [],
    startCell: null,
    currentCell: null,
    timer: null,
    timeRemaining: 0,
    paused: false,
    gameOver: false
  },
  
  // Define all possible states and their handlers
  states: {
    'loading': {
      enter: function() {
        // Show loading indicator
        document.getElementById('loading-indicator').style.display = 'flex';
        // Load puzzle data
        this.loadPuzzleData().then(() => {
          this.transition('title');
        }).catch(error => {
          console.error('Error loading puzzle data:', error);
          alert('Failed to load game data. Please refresh the page.');
        });
      },
      exit: function() {
        // Hide loading indicator
        document.getElementById('loading-indicator').style.display = 'none';
      }
    },
    
    'title': {
      enter: function() {
        this.data.currentScreen = 'title-screen';
        this.showScreen('title-screen');
      },
      exit: function() {
        // Nothing specific needed when leaving title screen
      }
    },
    
    'backstory': {
      enter: function() {
        this.data.currentScreen = 'backstory-screen';
        this.showScreen('backstory-screen');
      },
      exit: function() {
        // Nothing specific needed when leaving backstory
      }
    },
    
    'emptyBook': {
      enter: function() {
        this.data.currentScreen = 'empty-book-screen';
        this.showScreen('empty-book-screen');
      },
      exit: function() {
        // Nothing specific needed when leaving empty book
      }
    },
    
    'library': {
      enter: function() {
        this.data.currentScreen = 'library-screen';
        this.showScreen('library-screen');
        this.resetGameState();
      },
      exit: function() {
        // Nothing specific needed when leaving library
      }
    },
    
    'puzzle': {
      enter: function(genre) {
        if (genre) {
          this.data.currentGenre = genre;
          this.loadRandomPuzzle(genre);
        }
        this.data.currentScreen = 'puzzle-screen';
        this.showScreen('puzzle-screen');
        
        // Show instructions panel
        document.getElementById('instructions-panel').style.display = 'block';
      },
      exit: function() {
        // Clear timers when leaving puzzle screen
        clearInterval(this.data.timer);
      }
    }
  },
  
  // Transition to a new state
  transition: function(newState, ...args) {
    if (this.states[this.currentState].exit) {
      console.log(`Executing exit function for ${this.currentState}`);
      this.states[this.currentState].exit.call(this);
    }
    
    this.currentState = newState;
    
    if (this.states[this.currentState].enter) {
      console.log(`Executing enter function for ${this.currentState}`);
      this.states[this.currentState].enter.apply(this, args);
    }
  },
  
  // Show a screen with transition effect
  showScreen: function(screenId) {
    console.log(`Showing screen: ${screenId}`);

    // First set all screens to opacity 0
    Object.keys(screens).forEach(key => {
      const screen = screens[key];
      screen.style.opacity = '0';
      
      // After transition completes, hide screens that should be hidden
      if (screen.id !== screenId) {
        setTimeout(() => {
          screen.classList.remove('active');
        }, 300); // Match the CSS transition duration
      }
    });
    
    // Then show and fade in the target screen
    const targetScreen = document.getElementById(screenId);
    targetScreen.classList.add('active');
    
    // Trigger reflow to ensure transition works
    void targetScreen.offsetWidth;
    
    // Set opacity to 1 to fade in
    setTimeout(() => {
      targetScreen.style.opacity = '1';
    }, 10);
  },
  
  // Load puzzle data with caching
  loadPuzzleData: async function() {
    try {
      // Only load if we haven't already
      if (Object.keys(this.puzzleData).length === 0) {
        const response = await fetch('puzzles.json');
        const puzzles = await response.json();
        
        // Organize puzzles by genre
        puzzles.forEach(puzzle => {
          const genre = puzzle.genre || 'nature'; // Default to nature if no genre specified
          if (!this.puzzleData[genre]) {
            this.puzzleData[genre] = [];
          }
          this.puzzleData[genre].push(puzzle);
        });
        
        console.log('Puzzles loaded and organized by genre');
      }
    } catch (error) {
      console.error('Error loading puzzles:', error);
      throw error;
    }
  },
  
  // Reset game state for a new puzzle
  resetGameState: function() {
    this.data.grid = [];
    this.data.wordList = [];
    this.data.selectedCells = [];
    this.data.startCell = null;
    this.data.currentCell = null;
    this.data.timeRemaining = config.timeLimit;
    this.data.paused = true;
    this.data.gameOver = false;
    
    clearInterval(this.data.timer);
  },
  
  // Select a genre and load a random puzzle
  selectGenre: function(genre) {
    this.transition('puzzle', genre);
  },
  
  // Load a random puzzle from the specified genre
  loadRandomPuzzle: function(genre) {
    const puzzlesInGenre = this.puzzleData[genre];
    
    if (!puzzlesInGenre || puzzlesInGenre.length === 0) {
      console.error(`No puzzles found for genre: ${genre}`);
      return;
    }
    
    // Reset game state
    this.resetGameState();
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'flex';
    
    // Use setTimeout to allow the loading indicator to appear
    setTimeout(() => {
      // Choose a random puzzle
      const randomIndex = Math.floor(Math.random() * puzzlesInGenre.length);
      this.data.currentPuzzleIndex = randomIndex;
      
      const puzzleData = puzzlesInGenre[randomIndex];
      
      // Initialize the puzzle with the data
      this.initializePuzzle(puzzleData);
      
      // Hide loading indicator
      document.getElementById('loading-indicator').style.display = 'none';
    }, 100);
  },
  
  // Initialize the puzzle with the provided data
  initializePuzzle: function(puzzleData) {
    // Set book title
    elements.bookTitle.textContent = puzzleData.title;
    
    // Set story excerpt
    elements.storyExcerpt.textContent = puzzleData.storyExcerpt || "No story excerpt available.";
    
    // Filter and prepare words
    const validWords = puzzleData.words
      .filter(word => word.length >= config.minWordLength && word.length <= config.maxWordLength)
      .map(word => word.toUpperCase())
      .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
      .slice(0, config.maxWords);
    
    if (validWords.length === 0) {
      console.error('No valid words provided');
      return;
    }
    
    // Generate grid with words
    try {
      this.data.grid = this.generateGrid(validWords);
    } catch (error) {
      console.error(`Could not fit all words in grid: ${error.message}`);
      return;
    }
    
    // Render UI
    this.renderGrid();
    this.renderWordList();
    this.renderTimer();
  },
  
  // Start the puzzle game (called after instructions are closed)
  startPuzzleGame: function() {
    this.data.paused = false;
    this.startTimer();
  },
  
  // Generate word search grid
  generateGrid: function(words) {
    // Sort words by length (longest first for easier placement)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    
    // Create empty grid filled with empty spaces
    const grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
    
    // Track word placements for state
    const placements = [];
    
    // Try to place each word
    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loops
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Random starting position
        const row = Math.floor(Math.random() * config.gridSize);
        const col = Math.floor(Math.random() * config.gridSize);
        
        // Random direction
        const dirIndex = Math.floor(Math.random() * config.directions.length);
        const [dRow, dCol] = config.directions[dirIndex];
        
        // Check if word fits in this position and direction
        if (this.canPlaceWord(grid, word, row, col, dRow, dCol)) {
          // Place the word
          this.placeWord(grid, word, row, col, dRow, dCol);
          
          // Track placement for game state
          placements.push({
            word,
            found: false,
            row,
            col,
            direction: [dRow, dCol]
          });
          
          placed = true;
        }
      }
      
      if (!placed) {
        throw new Error(`Could not place word: ${word}`);
      }
    }
    
    // Save word placements to game state
    this.data.wordList = placements;
    
    // Fill remaining empty cells with random letters
    this.fillEmptyCells(grid);
    
    return grid;
  },
  
  // Check if a word can be placed at the given position and direction
  canPlaceWord: function(grid, word, row, col, dRow, dCol) {
    const length = word.length;
    
    // Check if word goes out of bounds
    const endRow = row + (length - 1) * dRow;
    const endCol = col + (length - 1) * dCol;
    
    if (
      endRow < 0 || endRow >= config.gridSize ||
      endCol < 0 || endCol >= config.gridSize
    ) {
      return false;
    }
    
    // Check if cells are empty or match the word's letters
    for (let i = 0; i < length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
        return false;
      }
    }
    
    return true;
  },
  
  // Place a word on the grid
  placeWord: function(grid, word, row, col, dRow, dCol) {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      grid[r][c] = word[i];
    }
  },
  
  // Fill empty cells with random letters
  fillEmptyCells: function(grid) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let row = 0; row < config.gridSize; row++) {
      for (let col = 0; col < config.gridSize; col++) {
        if (grid[row][col] === '') {
          const randomIndex = Math.floor(Math.random() * letters.length);
          grid[row][col] = letters[randomIndex];
        }
      }
    }
  },
  
  // Render the grid to the DOM
  renderGrid: function() {
    elements.wordGrid.innerHTML = '';
    elements.wordGrid.style.gridTemplateColumns = `repeat(${config.gridSize}, 1fr)`;
    
    for (let row = 0; row < config.gridSize; row++) {
      for (let col = 0; col < config.gridSize; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = this.data.grid[row][col];
        cell.dataset.row = row;
        cell.dataset.col = col;
        elements.wordGrid.appendChild(cell);
      }
    }
  },
  
  // Render word list to the DOM
  renderWordList: function() {
    elements.wordList.innerHTML = '';
    
    for (const wordData of this.data.wordList) {
      const listItem = document.createElement('li');
      listItem.textContent = wordData.word;
      
      if (wordData.found) {
        listItem.classList.add('found');
      }
      
      elements.wordList.appendChild(listItem);
    }
  },
  
  // Start the game timer
  startTimer: function() {
    clearInterval(this.data.timer);
    
    this.data.timer = setInterval(() => {
      if (this.data.paused) return;
      
      this.data.timeRemaining--;
      this.renderTimer();
      
      if (this.data.timeRemaining <= 0) {
        this.endGame(false);
      }
    }, 1000);
  },
  
  // Render timer bar
  renderTimer: function() {
    const percentRemaining = (this.data.timeRemaining / config.timeLimit) * 100;
    elements.timerBar.style.width = `${percentRemaining}%`;
    
    // Change color as time runs low
    if (percentRemaining < 20) {
      elements.timerBar.style.backgroundColor = '#ff4d4d';
    } else if (percentRemaining < 50) {
      elements.timerBar.style.backgroundColor = '#ffcc00';
    } else {
      elements.timerBar.style.backgroundColor = '#4CAF50';
    }
  },
  
  // Handle starting a word selection
  handleSelectionStart: function(e) {
    if (this.data.paused || this.data.gameOver) return;
    
    const cell = e.target.closest('.grid-cell');
    if (!cell) return;
    
    this.data.startCell = cell;
    this.data.currentCell = cell;
    this.data.selectedCells = [cell];
    
    this.updateSelectedCells();
    
    e.preventDefault();
  },
  
  // Handle touch start (mobile)
  handleTouchStart: function(e) {
    if (this.data.paused || this.data.gameOver) return;
    
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY).closest('.grid-cell');
    
    if (!cell) return;
    
    this.data.startCell = cell;
    this.data.currentCell = cell;
    this.data.selectedCells = [cell];
    
    this.updateSelectedCells();
    
    e.preventDefault();
  },
  
  // Handle moving the selection
  handleSelectionMove: function(e) {
    if (!this.data.startCell || this.data.paused || this.data.gameOver) return;
    
    const cell = e.target.closest('.grid-cell');
    if (!cell || cell === this.data.currentCell) return;
    
    // Only allow selection in straight lines
    const startRow = parseInt(this.data.startCell.dataset.row);
    const startCol = parseInt(this.data.startCell.dataset.col);
    const currentRow = parseInt(cell.dataset.row);
    const currentCol = parseInt(cell.dataset.col);
    
    // Calculate direction
    const dRow = currentRow - startRow;
    const dCol = currentCol - startCol;
    
    // Check if movement is in a straight line
    if (
      (dRow === 0 && dCol !== 0) || // Horizontal
      (dRow !== 0 && dCol === 0) || // Vertical
      (Math.abs(dRow) === Math.abs(dCol)) // Diagonal
    ) {
      // Calculate normalized direction
      const dirRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
      const dirCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);
      
      // Get all cells in the path
      const newSelectedCells = [this.data.startCell];
      
      let r = startRow;
      let c = startCol;
      
      while (r !== currentRow || c !== currentCol) {
        r += dirRow;
        c += dirCol;
        
        const pathCell = document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
        if (pathCell) {
          newSelectedCells.push(pathCell);
        }
      }
      
      this.data.selectedCells = newSelectedCells;
      this.data.currentCell = cell;
      
      this.updateSelectedCells();
    }
  },
  
  // Handle touch move (mobile)
  handleTouchMove: function(e) {
    if (!this.data.startCell || this.data.paused || this.data.gameOver) return;
    
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY).closest('.grid-cell');
    
    if (!cell || cell === this.data.currentCell) return;
    
    // Reuse the same logic as handleSelectionMove
    const startRow = parseInt(this.data.startCell.dataset.row);
    const startCol = parseInt(this.data.startCell.dataset.col);
    const currentRow = parseInt(cell.dataset.row);
    const currentCol = parseInt(cell.dataset.col);
    
    // Calculate direction
    const dRow = currentRow - startRow;
    const dCol = currentCol - startCol;
    
    // Check if movement is in a straight line
    if (
      (dRow === 0 && dCol !== 0) || // Horizontal
      (dRow !== 0 && dCol === 0) || // Vertical
      (Math.abs(dRow) === Math.abs(dCol)) // Diagonal
    ) {
      // Calculate normalized direction
      const dirRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
      const dirCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);
      
      // Get all cells in the path
      const newSelectedCells = [this.data.startCell];
      
      let r = startRow;
      let c = startCol;
      
      while (r !== currentRow || c !== currentCol) {
        r += dirRow;
        c += dirCol;
        
        const pathCell = document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
        if (pathCell) {
          newSelectedCells.push(pathCell);
        }
      }
      
      this.data.selectedCells = newSelectedCells;
      this.data.currentCell = cell;
      
      this.updateSelectedCells();
    }
    
    e.preventDefault();
  },
  
  // Handle ending a word selection
  handleSelectionEnd: function() {
    if (!this.data.startCell || this.data.paused || this.data.gameOver) return;
    
    this.checkForWord();
    
    // Clear selection
    this.data.selectedCells.forEach(cell => {
      cell.classList.remove('selected');
    });
    
    this.data.startCell = null;
    this.data.currentCell = null;
    this.data.selectedCells = [];
  },
  
  // Update visual selection of cells
  updateSelectedCells: function() {
    // Reset all cell selections
    document.querySelectorAll('.grid-cell').forEach(cell => {
      cell.classList.remove('selected');
    });
    
    // Add selection class to currently selected cells
    this.data.selectedCells.forEach(cell => {
      cell.classList.add('selected');
    });
  },
  
  // Check if the selected cells form a word
  checkForWord: function() {
    if (this.data.selectedCells.length < config.minWordLength) return;
    
    // Extract the word from selected cells
    const selectedWord = this.data.selectedCells.map(cell => cell.textContent).join('');
    
    // Get start and end coordinates
    const startRow = parseInt(this.data.selectedCells[0].dataset.row);
    const startCol = parseInt(this.data.selectedCells[0].dataset.col);
    const endRow = parseInt(this.data.selectedCells[this.data.selectedCells.length - 1].dataset.row);
    const endCol = parseInt(this.data.selectedCells[this.data.selectedCells.length - 1].dataset.col);
    
    // Calculate direction
    const dRow = endRow === startRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
    const dCol = endCol === startCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
    
    // Check against word list
    for (const wordData of this.data.wordList) {
      if (wordData.found) continue;
      
      // Check if word matches in either direction
      if (
        (selectedWord === wordData.word && 
         startRow === wordData.row && 
         startCol === wordData.col && 
         dRow === wordData.direction[0] && 
         dCol === wordData.direction[1]) ||
        (selectedWord === wordData.word.split('').reverse().join('') && 
         endRow === wordData.row && 
         endCol === wordData.col && 
         dRow === -wordData.direction[0] && 
         dCol === -wordData.direction[1])
      ) {
        // Mark word as found
        wordData.found = true;
        
        // Mark cells as correctly found
        this.data.selectedCells.forEach(cell => {
          cell.classList.add('correct');
        });
        
        // Update word list display
        this.renderWordList();
        
        // Check if all words are found
        this.checkWinCondition();
        
        return;
      }
    }
  },
  
  // Check if all words have been found
  checkWinCondition: function() {
    const allWordsFound = this.data.wordList.every(wordData => wordData.found);
    
    if (allWordsFound) {
      this.endGame(true);
    }
  },
  
  // End the game (win or lose)
  endGame: function(isWin) {
    clearInterval(this.data.timer);
    this.data.gameOver = true;
    
    if (isWin) {
      elements.winPanel.style.display = 'block';
    } else {
      elements.losePanel.style.display = 'block';
    }
  },
  
  // Toggle pause state
  togglePause: function() {
    this.data.paused = !this.data.paused;
    
    if (this.data.paused) {
      elements.pausePanel.style.display = 'block';
      elements.pauseBtn.textContent = 'Resume';
    } else {
      elements.pausePanel.style.display = 'none';
      elements.pauseBtn.textContent = 'Pause';
    }
  },
  
  // Resume the game
  resumeGame: function() {
    this.data.paused = false;
    elements.pausePanel.style.display = 'none';
    elements.pauseBtn.textContent = 'Pause';
  },
  
  // Reset and replay current puzzle
  resetCurrentPuzzle: function() {
    // Get current puzzle data
    const puzzleData = this.puzzleData[this.data.currentGenre][this.data.currentPuzzleIndex];
    
    // Re-initialize the puzzle
    this.resetGameState();
    this.initializePuzzle(puzzleData);
    
    // Show instructions again
    elements.instructionsPanel.style.display = 'block';
  }
};

// Screens and UI Elements
const screens = {
  titleScreen: document.getElementById('title-screen'),
  backstoryScreen: document.getElementById('backstory-screen'),
  emptyBookScreen: document.getElementById('empty-book-screen'),
  libraryScreen: document.getElementById('library-screen'),
  puzzleScreen: document.getElementById('puzzle-screen')
};

const elements = {
  // Screens navigation buttons
  newGameBtn: document.getElementById('new-game-btn'),
  continueBtn: document.getElementById('continue-btn'),
  continueToBookBtn: document.getElementById('continue-to-book-btn'),
  continueToLibraryBtn: document.getElementById('continue-to-library-btn'),
  genreCards: document.querySelectorAll('.genre-card'),
  returnLibraryBtn: document.getElementById('return-library-btn'),
  
  // Puzzle game elements
  bookTitle: document.getElementById('book-title'),
  wordGrid: document.getElementById('word-grid'),
  wordList: document.getElementById('word-list'),
  timerBar: document.getElementById('timer-bar'),
  storyExcerpt: document.getElementById('story-excerpt'),
  
  // Panels and their buttons
  pauseBtn: document.getElementById('pause-btn'),
  winPanel: document.getElementById('win-panel'),
  losePanel: document.getElementById('lose-panel'),
  pausePanel: document.getElementById('pause-panel'),
  instructionsPanel: document.getElementById('instructions-panel'),
  
  nextBookBtn: document.getElementById('next-book-btn'),
  returnToLibraryBtn: document.getElementById('return-to-library-btn'),
  tryAgainBtn: document.getElementById('try-again-btn'),
  differentBookBtn: document.getElementById('different-book-btn'),
  resumeBtn: document.getElementById('resume-btn'),
  restartBtn: document.getElementById('restart-btn'),
  exitToLibraryBtn: document.getElementById('exit-to-library-btn'),
  startPlayingBtn: document.getElementById('start-playing-btn')
};

// Initialize the game and set up event listeners
function initGame() {
  // Set up screen navigation
  setupScreenNavigation();
  
  // Set up puzzle game event listeners
  setupPuzzleEventListeners();
  
  // Start the state machine
  GameStateMachine.transition('loading');
  
  // Add CSS transitions to screens
  Object.values(screens).forEach(screen => {
    screen.style.transition = 'opacity 0.3s ease';
  });
}

// Set up event listeners for screen navigation
function setupScreenNavigation() {
  // Debugging element references
  console.log('newGameBtn exists:', !!elements.newGameBtn);
  console.log('continueBtn exists:', !!elements.continueBtn);
  console.log('continueToBookBtn exists:', !!elements.continueToBookBtn);
  console.log('continueToLibraryBtn exists:', !!elements.continueToLibraryBtn);

  // Title screen buttons
  elements.newGameBtn.addEventListener('click', () => {
    console.log('New Game button clicked');
    GameStateMachine.transition('backstory');
  });
  
  elements.continueBtn.addEventListener('click', () => {
    // For now just go to library, later could load saved game
    console.log('Continue button clicked');
    GameStateMachine.transition('library');
  });
  
  // Backstory screen
  elements.continueToBookBtn.addEventListener('click', () => {
    console.log('Continue to book button clicked');
    GameStateMachine.transition('emptyBook');
  });
  
  // Empty book screen
  elements.continueToLibraryBtn.addEventListener('click', () => {
    console.log('Empty book screen Continue to Library button clicked');
    GameStateMachine.transition('library');
  });
  
  // Library screen (genre selection)
  elements.genreCards.forEach(card => {
    console.log('Library screen Genre button clicked');
    card.addEventListener('click', () => {
      const genre = card.dataset.genre;
      GameStateMachine.selectGenre(genre);
    });
  });
  
  // Return to library button on puzzle screen
  elements.returnLibraryBtn.addEventListener('click', () => {
    console.log('Return to Library button clicked');
    if (confirm('Are you sure you want to return to the library? Your progress will be lost.')) {
      GameStateMachine.transition('library');
    }
  });
  
  // Win panel buttons
  elements.nextBookBtn.addEventListener('click', () => {
    console.log('Win panel next book button clicked');
    elements.winPanel.style.display = 'none';
    GameStateMachine.loadRandomPuzzle(GameStateMachine.data.currentGenre);
  });
  
  elements.returnToLibraryBtn.addEventListener('click', () => {
    console.log('Win panel back to library button clicked');
    elements.winPanel.style.display = 'none';
    GameStateMachine.transition('library');
  });
  
  // Lose panel buttons
  elements.tryAgainBtn.addEventListener('click', () => {
    console.log('Lose panel try again button clicked');
    elements.losePanel.style.display = 'none';
    GameStateMachine.resetCurrentPuzzle();
  });
  
  elements.differentBookBtn.addEventListener('click', () => {
    console.log('Lose panel try a new puzzle button clicked');
    elements.losePanel.style.display = 'none';
    GameStateMachine.transition('library');
  });
  
  // Pause panel buttons
  elements.exitToLibraryBtn.addEventListener('click', () => {
    console.log('Pause Panel exit to library button clicked');
    elements.pausePanel.style.display = 'none';
    GameStateMachine.transition('library');
  });
  
  // Instructions panel
  elements.startPlayingBtn.addEventListener('click', () => {
    console.log('instruction panel start puzzle button clicked');
    elements.instructionsPanel.style.display = 'none';
    GameStateMachine.startPuzzleGame();
  });
}

// Set up event listeners for the puzzle game
function setupPuzzleEventListeners() {
  // Mouse/touch events for grid cells
  elements.wordGrid.addEventListener('mousedown', (e) => GameStateMachine.handleSelectionStart(e));
  elements.wordGrid.addEventListener('mouseover', (e) => GameStateMachine.handleSelectionMove(e));
  document.addEventListener('mouseup', () => GameStateMachine.handleSelectionEnd());
  
  // Touch events for mobile
  elements.wordGrid.addEventListener('touchstart', (e) => GameStateMachine.handleTouchStart(e));
  elements.wordGrid.addEventListener('touchmove', (e) => GameStateMachine.handleTouchMove(e));
  elements.wordGrid.addEventListener('touchend', () => GameStateMachine.handleSelectionEnd());
  
  // Pause button
  elements.pauseBtn.addEventListener('click', () => GameStateMachine.togglePause());
  
  // Pause panel buttons
  elements.resumeBtn.addEventListener('click', () => GameStateMachine.resumeGame());
  elements.restartBtn.addEventListener('click', () => GameStateMachine.resetCurrentPuzzle());
}

// Call initGame when the document is ready
document.addEventListener('DOMContentLoaded', initGame);
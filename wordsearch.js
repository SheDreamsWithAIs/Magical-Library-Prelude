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

// Game State
let state = {
  grid: [],             // 2D array of characters
  wordList: [],         // Array of word objects {word, found, row, col, direction}
  selectedCells: [],    // Currently selected cells
  startCell: null,      // Starting cell of current selection
  currentCell: null,    // Current cell in selection
  timer: null,          // Timer reference
  timeRemaining: 0,     // Seconds remaining
  paused: false,        // Game paused state
  gameOver: false       // Game over flag
};

// DOM Elements
const elements = {
  bookTitle: document.getElementById('book-title'),
  wordGrid: document.getElementById('word-grid'),
  wordList: document.getElementById('word-list'),
  timerBar: document.getElementById('timer-bar'),
  pauseBtn: document.getElementById('pause-btn'),
  nextBtn: document.getElementById('next-btn'),
  winPanel: document.getElementById('win-panel'),
  losePanel: document.getElementById('lose-panel'),
  pausePanel: document.getElementById('pause-panel'),
  nextLevelBtn: document.getElementById('next-level-btn'),
  tryAgainBtn: document.getElementById('try-again-btn'),
  resumeBtn: document.getElementById('resume-btn'),
  restartBtn: document.getElementById('restart-btn')
};

// Initialize Game
function initGame(bookTitle, words) {
  // Set book title
  elements.bookTitle.textContent = bookTitle;
  
  // Reset game state
  state.wordList = [];
  state.selectedCells = [];
  state.startCell = null;
  state.currentCell = null;
  state.timeRemaining = config.timeLimit;
  state.paused = false;
  state.gameOver = false;
  
  // Filter and prepare words
  const validWords = words
    .filter(word => word.length >= config.minWordLength && word.length <= config.maxWordLength)
    .map(word => word.toUpperCase())
    .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
    .slice(0, config.maxWords);
  
  if (validWords.length === 0) {
    throw new Error('No valid words provided');
  }
  
  // Generate grid with words
  try {
    state.grid = generateGrid(validWords);
  } catch (error) {
    throw new Error(`Could not fit all words in grid: ${error.message}`);
  }
  
  // Render UI
  renderGrid();
  renderWordList();
  renderTimer();
  
  // Start timer
  startTimer();
  
  // Set up event listeners
  setupEventListeners();
}

// Generate word search grid
function generateGrid(words) {
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
      if (canPlaceWord(grid, word, row, col, dRow, dCol)) {
        // Place the word
        placeWord(grid, word, row, col, dRow, dCol);
        
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
  state.wordList = placements;
  
  // Fill remaining empty cells with random letters
  fillEmptyCells(grid);
  
  return grid;
}

// Check if a word can be placed at the given position and direction
function canPlaceWord(grid, word, row, col, dRow, dCol) {
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
}

// Place a word on the grid
function placeWord(grid, word, row, col, dRow, dCol) {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dRow;
    const c = col + i * dCol;
    grid[r][c] = word[i];
  }
}

// Fill empty cells with random letters
function fillEmptyCells(grid) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let row = 0; row < config.gridSize; row++) {
    for (let col = 0; col < config.gridSize; col++) {
      if (grid[row][col] === '') {
        const randomIndex = Math.floor(Math.random() * letters.length);
        grid[row][col] = letters[randomIndex];
      }
    }
  }
}

// Render the grid to the DOM
function renderGrid() {
  elements.wordGrid.innerHTML = '';
  elements.wordGrid.style.gridTemplateColumns = `repeat(${config.gridSize}, 1fr)`;
  
  for (let row = 0; row < config.gridSize; row++) {
    for (let col = 0; col < config.gridSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.textContent = state.grid[row][col];
      cell.dataset.row = row;
      cell.dataset.col = col;
      elements.wordGrid.appendChild(cell);
    }
  }
}

// Render word list to the DOM
function renderWordList() {
  elements.wordList.innerHTML = '';
  
  for (const wordData of state.wordList) {
    const listItem = document.createElement('li');
    listItem.textContent = wordData.word;
    
    if (wordData.found) {
      listItem.classList.add('found');
    }
    
    elements.wordList.appendChild(listItem);
  }
}

// Start the game timer
function startTimer() {
  clearInterval(state.timer);
  
  state.timer = setInterval(() => {
    if (state.paused) return;
    
    state.timeRemaining--;
    renderTimer();
    
    if (state.timeRemaining <= 0) {
      endGame(false);
    }
  }, 1000);
}

// Render timer bar
function renderTimer() {
  const percentRemaining = (state.timeRemaining / config.timeLimit) * 100;
  elements.timerBar.style.width = `${percentRemaining}%`;
  
  // Change color as time runs low
  if (percentRemaining < 20) {
    elements.timerBar.style.backgroundColor = '#ff4d4d';
  } else if (percentRemaining < 50) {
    elements.timerBar.style.backgroundColor = '#ffcc00';
  } else {
    elements.timerBar.style.backgroundColor = '#4CAF50';
  }
}

// Set up event listeners
function setupEventListeners() {
  // Mouse/touch events for grid cells
  elements.wordGrid.addEventListener('mousedown', handleSelectionStart);
  elements.wordGrid.addEventListener('mouseover', handleSelectionMove);
  document.addEventListener('mouseup', handleSelectionEnd);
  
  // Touch events for mobile
  elements.wordGrid.addEventListener('touchstart', handleTouchStart);
  elements.wordGrid.addEventListener('touchmove', handleTouchMove);
  elements.wordGrid.addEventListener('touchend', handleSelectionEnd);
  
  // Button events
  elements.pauseBtn.addEventListener('click', togglePause);
  elements.nextLevelBtn.addEventListener('click', nextLevel);
  elements.tryAgainBtn.addEventListener('click', restart);
  elements.resumeBtn.addEventListener('click', resumeGame);
  elements.restartBtn.addEventListener('click', restart);
}

// Handle starting a word selection
function handleSelectionStart(e) {
  if (state.paused || state.gameOver) return;
  
  const cell = e.target.closest('.grid-cell');
  if (!cell) return;
  
  state.startCell = cell;
  state.currentCell = cell;
  state.selectedCells = [cell];
  
  updateSelectedCells();
  
  e.preventDefault();
}

// Handle touch start (mobile)
function handleTouchStart(e) {
  if (state.paused || state.gameOver) return;
  
  const touch = e.touches[0];
  const cell = document.elementFromPoint(touch.clientX, touch.clientY).closest('.grid-cell');
  
  if (!cell) return;
  
  state.startCell = cell;
  state.currentCell = cell;
  state.selectedCells = [cell];
  
  updateSelectedCells();
  
  e.preventDefault();
}

// Handle moving the selection
function handleSelectionMove(e) {
  if (!state.startCell || state.paused || state.gameOver) return;
  
  const cell = e.target.closest('.grid-cell');
  if (!cell || cell === state.currentCell) return;
  
  // Only allow selection in straight lines
  const startRow = parseInt(state.startCell.dataset.row);
  const startCol = parseInt(state.startCell.dataset.col);
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
    const newSelectedCells = [state.startCell];
    
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
    
    state.selectedCells = newSelectedCells;
    state.currentCell = cell;
    
    updateSelectedCells();
  }
}

// Handle touch move (mobile)
function handleTouchMove(e) {
  if (!state.startCell || state.paused || state.gameOver) return;
  
  const touch = e.touches[0];
  const cell = document.elementFromPoint(touch.clientX, touch.clientY).closest('.grid-cell');
  
  if (!cell || cell === state.currentCell) return;
  
  // Reuse the same logic as handleSelectionMove
  const startRow = parseInt(state.startCell.dataset.row);
  const startCol = parseInt(state.startCell.dataset.col);
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
    const newSelectedCells = [state.startCell];
    
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
    
    state.selectedCells = newSelectedCells;
    state.currentCell = cell;
    
    updateSelectedCells();
  }
  
  e.preventDefault();
}

// Handle ending a word selection
function handleSelectionEnd() {
  if (!state.startCell || state.paused || state.gameOver) return;
  
  checkForWord();
  
  // Clear selection
  state.selectedCells.forEach(cell => {
    cell.classList.remove('selected');
  });
  
  state.startCell = null;
  state.currentCell = null;
  state.selectedCells = [];
}

// Update visual selection of cells
function updateSelectedCells() {
  // Reset all cell selections
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('selected');
  });
  
  // Add selection class to currently selected cells
  state.selectedCells.forEach(cell => {
    cell.classList.add('selected');
  });
}

// Check if the selected cells form a word
function checkForWord() {
  if (state.selectedCells.length < config.minWordLength) return;
  
  // Extract the word from selected cells
  const selectedWord = state.selectedCells.map(cell => cell.textContent).join('');
  
  // Get start and end coordinates
  const startRow = parseInt(state.selectedCells[0].dataset.row);
  const startCol = parseInt(state.selectedCells[0].dataset.col);
  const endRow = parseInt(state.selectedCells[state.selectedCells.length - 1].dataset.row);
  const endCol = parseInt(state.selectedCells[state.selectedCells.length - 1].dataset.col);
  
  // Calculate direction
  const dRow = endRow === startRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
  const dCol = endCol === startCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
  
  // Check against word list
  for (const wordData of state.wordList) {
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
      state.selectedCells.forEach(cell => {
        cell.classList.add('correct');
      });
      
      // Update word list display
      renderWordList();
      
      // Check if all words are found
      checkWinCondition();
      
      return;
    }
  }
}

// Check if all words have been found
function checkWinCondition() {
  const allWordsFound = state.wordList.every(wordData => wordData.found);
  
  if (allWordsFound) {
    endGame(true);
  }
}

// End the game (win or lose)
function endGame(isWin) {
  clearInterval(state.timer);
  state.gameOver = true;
  
  if (isWin) {
    elements.winPanel.style.display = 'block';
    elements.nextBtn.disabled = false;
  } else {
    elements.losePanel.style.display = 'block';
  }
}

// Toggle pause state
function togglePause() {
  state.paused = !state.paused;
  
  if (state.paused) {
    elements.pausePanel.style.display = 'block';
    elements.pauseBtn.textContent = 'Resume';
  } else {
    elements.pausePanel.style.display = 'none';
    elements.pauseBtn.textContent = 'Pause';
  }
}

// Resume the game
function resumeGame() {
  state.paused = false;
  elements.pausePanel.style.display = 'none';
  elements.pauseBtn.textContent = 'Pause';
}

// Restart the current puzzle
function restart() {
  // Hide panels
  elements.winPanel.style.display = 'none';
  elements.losePanel.style.display = 'none';
  elements.pausePanel.style.display = 'none';
  
  // Reset word found status
  state.wordList.forEach(wordData => {
    wordData.found = false;
  });
  
  // Reset timer
  state.timeRemaining = config.timeLimit;
  state.paused = false;
  state.gameOver = false;
  
  // Update UI
  renderWordList();
  renderTimer();
  elements.pauseBtn.textContent = 'Pause';
  
  // Restart timer
  startTimer();
  
  // Reset all cell classes
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('selected', 'correct');
  });
}

// Move to next puzzle (placeholder function)
function nextLevel() {
  // Hide win panel
  elements.winPanel.style.display = 'none';
  
  // This function would typically load a new puzzle
  // For prototype, just restart with the same puzzle
  restart();
}

// Example usage:
/* 
initGame('Harry Potter and the Philosopher\'s Stone', [
  'HARRY', 'POTTER', 'MAGIC', 'WAND', 'HOGWARTS',
  'WIZARD', 'SPELL', 'QUIDDITCH', 'HERMIONE', 'RON'
]);
*/

// Add this to the end of wordsearch.js
document.addEventListener('DOMContentLoaded', function() {
  initGame('Your Book Title', [
    'WORD1', 'WORD2', 'WORD3', 'WORD4', 'WORD5',
    'WORD6', 'WORD7', 'WORD8', 'WORD9', 'WORD10'
  ]);
});

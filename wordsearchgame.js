/* Word Search Adventure Game - Updated Implementation for Kethaneum */

// Story Part Enum
const StoryPart = {
  INTRODUCTION: 0,
  RISING_ACTION: 1,
  MIDPOINT: 2,
  CLIMAX: 3,
  RESOLUTION: 4,

  // Helper function to get name from enum value
  getName: function (value) {
    switch (value) {
      case 0: return "The Hook/Introduction";
      case 1: return "Rising Action/Complication";
      case 2: return "Midpoint Twist";
      case 3: return "Climactic Moment";
      case 4: return "Resolution/Epilogue";
      default: return "Unknown";
    }
  }
};

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
  currentScreen: 'title-screen',
  grid: [],             // 2D array of characters
  wordList: [],         // Array of word objects {word, found, row, col, direction}
  selectedCells: [],    // Currently selected cells
  startCell: null,      // Starting cell of current selection
  currentCell: null,    // Current cell in selection
  timer: null,          // Timer reference
  timeRemaining: 0,     // Seconds remaining
  paused: false,        // Game paused state
  gameOver: false,      // Game over flag
  puzzles: {},          // All available puzzles by genre
  currentGenre: '',     // Current selected genre
  currentPuzzleIndex: -1, // Index of current puzzle
  completedPuzzles: 0,   // Track number of completed puzzles

  // New tracking for books
  books: {},            // Object to track books and their completion: { bookTitle: [bool, bool, bool, bool, bool] }
  currentBook: '',      // Current book being worked on
  currentStoryPart: -1, // Current story part (0-4)
  completedBooks: 0,     // Track number of completed books
  discoveredBooks: new Set(), // Set to track unique books discovered
  bookProgress: {}, // Tracks the next story part to show for each book
};

// Initialize the game when the document is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded');

  // Define screens for navigation
  const screens = {
    'title-screen': document.getElementById('title-screen'),
    'backstory-screen': document.getElementById('backstory-screen'),
    'library-screen': document.getElementById('library-screen'),
    'puzzle-screen': document.getElementById('puzzle-screen'),
    'book-of-passage-screen': document.getElementById('book-of-passage-screen')
  };

  // Set up elements for the puzzle game
  const elements = {
    // Game elements
    bookTitle: document.getElementById('book-title'),
    wordGrid: document.getElementById('word-grid'),
    wordList: document.getElementById('word-list'),
    timerBar: document.getElementById('timer-bar'),
    storyExcerpt: document.getElementById('story-excerpt'),
    pauseBtn: document.getElementById('pause-btn'),

    // Panels
    winPanel: document.getElementById('win-panel'),
    losePanel: document.getElementById('lose-panel'),
    pausePanel: document.getElementById('pause-panel'),
    instructionsPanel: document.getElementById('instructions-panel'),

    // Update title elements
    gameTitleElement: document.getElementById('game-title'),
    gameSubtitleElement: document.getElementById('game-subtitle'),

    // Update backstory content
    backstoryContent: document.getElementById('backstory-content'),

    // Update book of passage content
    bookOfPassageContent: document.getElementById('book-of-passage-content'),

    // Progress tracking
    completedPuzzlesCount: document.getElementById('completed-puzzles-count'),
    completedBooksCount: document.getElementById('completed-books-count'),
    booksProgressSection: document.getElementById('books-progress-section')
  };

  // Simple navigation function
  function navigateTo(screenId) {
    console.log('Navigating to:', screenId);

    // Hide all screens
    Object.values(screens).forEach(screen => {
      if (screen) {
        screen.style.display = 'none';
        screen.classList.remove('active');
      }
    });

    // Show the requested screen if it exists
    if (screens[screenId]) {
      // Add active class
      screens[screenId].classList.add('active');

      // Set display property based on screen type
      if (screenId === 'puzzle-screen') {
        screens[screenId].style.display = 'flex';
      } else if (screenId === 'title-screen' ||
        screenId === 'backstory-screen' ||
        screenId === 'book-of-passage-screen') {
        screens[screenId].style.display = 'flex';
      } else {
        screens[screenId].style.display = 'block';
      }

      // Update current screen in state
      state.currentScreen = screenId;

      // Special handling for screens
      if (screenId === 'puzzle-screen') {
        if (elements.instructionsPanel) {
          elements.instructionsPanel.style.display = 'block';
        }
        state.paused = true;

        // Initialize mobile features after a short delay to ensure DOM is ready
        setTimeout(setupMobileEnhancements, 100);
      }

      if (screenId === 'book-of-passage-screen') {
        updateBookOfPassageScreen();
      }
    }
  }

  // Update Book of Passage screen to display book progress
  function updateBookOfPassageScreen() {
    if (elements.bookOfPassageContent) {
      elements.bookOfPassageContent.innerHTML = `
        <p><em>The pages of your Book of Passage shimmer as new words appear, chronicling your arrival:</em></p>
        
        <p>"Today marks your first day as Assistant Archivist within the hallowed halls of the Kethaneum, the greatest repository of knowledge across all realms. After years of dedicated study, you've earned this honored position—a rare achievement celebrated by your teachers and peers alike.</p>
        
        <p>Your assignment is to catalog the newly arrived knowledge constructs, which appear to you as books containing words scattered and unordered. By finding and organizing these words, you strengthen the Kethaneum's indexing matrix, making this wisdom accessible to scholars throughout the multiverse. The Senior Archivists have noticed your particular talent for pattern recognition—a gift that will serve you well as you bring order to chaos, one word at a time."</p>
        
        <div class="progress-section">
          <h3>Your Archives Progress:</h3>
          <p>Cataloging Completed: <span id="completed-puzzles-count">${state.completedPuzzles || 0}</span></p>
          <p>Books Discovered: <span id="completed-books-count">${state.completedBooks || 0}</span></p>
          
          <div id="books-progress-section">
            <!-- Book progress will be filled dynamically -->
          </div>
        </div>
      `;

      // Update the references to these elements since they've been recreated
      elements.completedPuzzlesCount = document.getElementById('completed-puzzles-count');
      elements.completedBooksCount = document.getElementById('completed-books-count');
      elements.booksProgressSection = document.getElementById('books-progress-section');

      // Update the books progress section
      updateBookOfPassageProgress();
    }
  }

  // Update progress display in Book of Passage
  function updateBookOfPassageProgress() {
    if (elements.completedPuzzlesCount) {
      elements.completedPuzzlesCount.textContent = state.completedPuzzles || 0;
    }

    if (elements.completedBooksCount) {
      elements.completedBooksCount.textContent = state.completedBooks || 0;
    }

    // Update the books progress section if it exists
    if (elements.booksProgressSection) {
      let progressHTML = '<h4>Books in Progress:</h4>';

      // Sort book titles alphabetically
      const bookTitles = Object.keys(state.books).sort();

      if (bookTitles.length === 0) {
        progressHTML += '<p>No books cataloged yet.</p>';
      } else {
        progressHTML += '<ul class="book-progress-list">';

        bookTitles.forEach(bookTitle => {
          const storyParts = state.books[bookTitle];
          const completedParts = storyParts.filter(completed => completed).length;
          const isComplete = completedParts === 5;

          progressHTML += `
            <li class="${isComplete ? 'book-complete' : 'book-in-progress'}">
              <strong>${bookTitle}</strong> - ${completedParts}/5 parts cataloged
              <div class="book-parts-progress">
          `;

          // Add indicators for each story part
          for (let i = 0; i < 5; i++) {
            const partStatus = storyParts[i] ? 'complete' : 'incomplete';
            progressHTML += `<span class="story-part ${partStatus}" title="${StoryPart.getName(i)}">${i + 1}</span>`;
          }

          progressHTML += '</div></li>';
        });

        progressHTML += '</ul>';
      }

      elements.booksProgressSection.innerHTML = progressHTML;
    }
  }

  // Load puzzles data from JSON file
  function loadPuzzles() {
    console.log('Loading puzzles...');

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }

    fetch('puzzles.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load puzzles: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(puzzles => {
        if (!puzzles || !Array.isArray(puzzles) || puzzles.length === 0) {
          throw new Error("No puzzles found in the puzzles.json file");
        }

        // Organize puzzles by genre
        puzzles.forEach(puzzle => {
          const genre = puzzle.genre || 'nature'; // Default to nature if no genre specified

          if (!state.puzzles[genre]) {
            state.puzzles[genre] = [];
          }

          // Make sure puzzle has book information
          if (!puzzle.book) {
            puzzle.book = puzzle.title; // Use puzzle title as book title if not specified
          }

          // Make sure puzzle has storyPart information (default to introduction)
          if (puzzle.storyPart === undefined) {
            puzzle.storyPart = 0; // Default to introduction
          }

          state.puzzles[genre].push(puzzle);
        });

        console.log('Puzzles loaded and organized by genre');

        // Hide loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      })
      .catch(error => {
        // Use the error handler function
        window.handlePuzzleLoadError(error);
      });
  }

  // Load a random puzzle, choosing a random genre if none specified
  function loadRandomPuzzle(genre, book, storyPart) {
    console.log('Loading puzzle with parameters:', { genre, book, storyPart });

    try {
      // If no genre is specified, pick a random one from available genres
      if (!genre) {
        const genres = Object.keys(state.puzzles);
        if (genres.length === 0) {
          throw new Error('No puzzles loaded yet');
        }
        genre = genres[Math.floor(Math.random() * genres.length)];
      }

      let puzzlesInGenre = state.puzzles[genre];

      if (!puzzlesInGenre || puzzlesInGenre.length === 0) {
        throw new Error(`No puzzles found for genre: ${genre}`);
      }

      // Filter by book if specified
      if (book) {
        puzzlesInGenre = puzzlesInGenre.filter(p => p.book === book);

        if (puzzlesInGenre.length === 0) {
          throw new Error(`No puzzles found for book: ${book}`);
        }
      }

      // Filter by story part if specified
      if (storyPart !== undefined) {
        puzzlesInGenre = puzzlesInGenre.filter(p => p.storyPart === storyPart);

        if (puzzlesInGenre.length === 0) {
          throw new Error(`No puzzles found for story part: ${storyPart}`);
        }
      }

      // Choose a random puzzle from filtered list
      const randomIndex = Math.floor(Math.random() * puzzlesInGenre.length);
      state.currentPuzzleIndex = randomIndex;
      state.currentGenre = genre;

      const puzzleData = puzzlesInGenre[randomIndex];

      // Initialize the puzzle game
      initializePuzzle(puzzleData);
    } catch (error) {
      // Use the error handler function
      window.handleRandomPuzzleError(error, state);
    }
  }

  // Load puzzles sequentially by book and story part:
  function loadSequentialPuzzle(genre, book) {
    try {
      // Log initial request with less verbose output
      if (!genre && !book) {
        console.log('Loading next puzzle');
      } else {
        console.log('Loading specific puzzle:', { genre, book });
      }
      
      // Debug info only in development, could be removed in production
      if (Object.keys(state.bookProgress).length > 0) {
        console.log('Book progress state:', JSON.stringify(state.bookProgress));
      }
  
      // If no specific book is requested, prioritize continuing the current book series
      if (!book && state.currentBook && state.bookProgress[state.currentBook] !== undefined) {
        book = state.currentBook;
        console.log(`Prioritizing continuation of current book: ${book}`);
      }
  
      // If no genre is specified, pick a random one from available genres
      if (!genre) {
        const genres = Object.keys(state.puzzles);
        if (genres.length === 0) {
          throw new Error('No puzzles loaded yet');
        }
        genre = genres[Math.floor(Math.random() * genres.length)];
      }
  
      let puzzlesInGenre = state.puzzles[genre];
      if (!puzzlesInGenre || puzzlesInGenre.length === 0) {
        throw new Error(`No puzzles found for genre: ${genre}`);
      }
  
      // If no specific book is requested, choose one
      if (!book) {
        // Get all available books in this genre
        const booksInGenre = [...new Set(puzzlesInGenre.map(p => p.book))];
        
        if (booksInGenre.length === 0) {
          throw new Error(`No books found in genre: ${genre}`);
        }
  
        // Choose a book to work on - with stronger prioritization for in-progress books
        let selectedBook = null;
  
        // Step 1: Check for in-progress books (that aren't completed)
        const inProgressBooks = booksInGenre.filter(bookTitle =>
          state.bookProgress[bookTitle] !== undefined &&
          state.bookProgress[bookTitle] < 5 &&  // Less than 5 means not all parts completed
          !checkBookCompletion(bookTitle)
        );
  
        if (inProgressBooks.length > 0) {
          // Continue with a book that has been started
          selectedBook = inProgressBooks[Math.floor(Math.random() * inProgressBooks.length)];
          console.log(`Selected in-progress book: ${selectedBook}`);
        } else {
          // Step 2: Start with a new book (one not in bookProgress) if possible
          const newBooks = booksInGenre.filter(bookTitle => 
            state.bookProgress[bookTitle] === undefined && 
            (!state.books[bookTitle] || !state.books[bookTitle]?.every(part => part === true))
          );
          
          if (newBooks.length > 0) {
            // Prioritize completely new books
            selectedBook = newBooks[Math.floor(Math.random() * newBooks.length)];
            console.log(`Selected new book: ${selectedBook}`);
          } else {
            // Step 3: If all books have been started or completed, pick a random one
            selectedBook = booksInGenre[Math.floor(Math.random() * booksInGenre.length)];
            console.log(`Selected random book (all books already started): ${selectedBook}`);
          }
        } 
  
        book = selectedBook;
      }
  
      // Find which story part to show next
      let nextStoryPart = 0; // Default to the beginning
  
      // Initialize book progress tracking if needed
      if (!state.bookProgress) {
        state.bookProgress = {};
      }
  
      if (state.bookProgress[book] !== undefined) {
        // Get the next part (0-4 representing parts 1-5)
        nextStoryPart = state.bookProgress[book];
  
        // If we've reached part 5 (index 4), cycle back to part 1 (index 0)
        if (nextStoryPart > 4) {
          nextStoryPart = 0;
        }
      }
      
      console.log(`Loading "${book}" part ${nextStoryPart+1} (${StoryPart.getName(nextStoryPart)})`);
  
      // Find the puzzle for this book and story part
      const matchingPuzzles = puzzlesInGenre.filter(p => 
        p.book === book && p.storyPart === nextStoryPart
      );
      
      if (matchingPuzzles.length === 0) {
        // Error case: No puzzle found for this book and story part
        console.warn(`No puzzle found for book: ${book}, story part: ${nextStoryPart}`);
        
        // Try a fallback - look for any story part for this book
        const anyPartPuzzles = puzzlesInGenre.filter(p => p.book === book);
        
        if (anyPartPuzzles.length > 0) {
          // Find the lowest available story part
          const availableParts = anyPartPuzzles.map(p => p.storyPart).sort((a, b) => a - b);
          const lowestPart = availableParts[0];
          
          console.log(`Falling back to part ${lowestPart+1} of book: ${book}`);
          
          const fallbackPuzzle = puzzlesInGenre.find(p => p.book === book && p.storyPart === lowestPart);
          
          if (fallbackPuzzle) {
            state.currentPuzzleIndex = puzzlesInGenre.indexOf(fallbackPuzzle);
            state.currentGenre = genre;
            state.currentBook = book;
            state.currentStoryPart = lowestPart;
            state.bookProgress[book] = lowestPart; // Reset to this part
            
            // Initialize the puzzle
            try {
              initializePuzzle(fallbackPuzzle);
              return;
            } catch (initError) {
              throw new Error(`Failed to initialize fallback puzzle: ${initError.message}`);
            }
          }
        }
        
        // If we can't find any parts for this book, try another book
        console.warn(`Couldn't find any parts for book: ${book}, trying another book`);
        
        // Find another book from the same genre with available puzzles
        const otherBooks = [...new Set(puzzlesInGenre.map(p => p.book))].filter(b => b !== book);
        
        if (otherBooks.length > 0) {
          // Select a different book and try again with recursive call but limited depth
          const alternateBook = otherBooks[Math.floor(Math.random() * otherBooks.length)];
          console.log(`Trying alternate book: ${alternateBook}`);
          
          // Use explicit parameters to avoid infinite recursion
          return loadSequentialPuzzle(genre, alternateBook);
        }
        
        // If no other books in this genre, try another genre as last resort
        const otherGenres = Object.keys(state.puzzles).filter(g => g !== genre);
        if (otherGenres.length > 0) {
          const alternateGenre = otherGenres[Math.floor(Math.random() * otherGenres.length)];
          console.log(`Trying alternate genre: ${alternateGenre}`);
          
          // Use explicit parameters to avoid infinite recursion
          return loadSequentialPuzzle(alternateGenre, null);
        }
        
        // If we still can't find anything, throw error
        throw new Error(`No suitable puzzles found in any genre`);
      }
  
      // Choose a random puzzle if multiple match the criteria (unlikely with story parts)
      const puzzleData = matchingPuzzles[Math.floor(Math.random() * matchingPuzzles.length)];
  
      // Update tracking for which part of the book we're on
      state.currentPuzzleIndex = puzzlesInGenre.indexOf(puzzleData);
      state.currentGenre = genre;
      state.currentBook = book;
      state.currentStoryPart = nextStoryPart;
  
      // Initialize the puzzle with error handling
      try {
        initializePuzzle(puzzleData);
      } catch (initError) {
        throw new Error(`Failed to initialize puzzle: ${initError.message}`);
      }
    } catch (error) {
      // Use the error handler function
      window.handleSequentialPuzzleError(error, state);
    }
  }

  // Initialize the puzzle with the provided data
  function initializePuzzle(puzzleData) {
    try {
      if (!puzzleData) {
        throw new Error("Cannot initialize puzzle with null data");
      }
      
      if (!puzzleData.words || !Array.isArray(puzzleData.words) || puzzleData.words.length === 0) {
        throw new Error("Puzzle has no words to find");
      }
      
      // Reset game state
      state.wordList = [];
      state.selectedCells = [];
      state.startCell = null;
      state.currentCell = null;
      state.timeRemaining = config.timeLimit;
      state.paused = true;
      state.gameOver = false;
  
      // Set current book and story part
      state.currentBook = puzzleData.book || puzzleData.title;
      state.currentStoryPart = puzzleData.storyPart !== undefined ? puzzleData.storyPart : 0;
  
      // Check if this is a new book discovery
      if (!state.discoveredBooks) {
        state.discoveredBooks = new Set();
      }
  
      if (!state.discoveredBooks.has(state.currentBook)) {
        state.discoveredBooks.add(state.currentBook);
        // Update completedBooks count for newly discovered books
        state.completedBooks = state.discoveredBooks.size;
        // Save progress to persist the discovery
        try {
          saveGameProgress();
        } catch (saveError) {
          console.warn("Failed to save book discovery:", saveError);
          // Non-critical error, continue without saving
        }
      }
  
      // Update UI
      try {
        // Set book title and show story part
        if (elements.bookTitle) {
          elements.bookTitle.textContent = `${puzzleData.title} (${StoryPart.getName(state.currentStoryPart)})`;
        }
  
        // Set story excerpt
        if (elements.storyExcerpt) {
          elements.storyExcerpt.textContent = puzzleData.storyExcerpt || "No story excerpt available.";
        }
      } catch (uiError) {
        console.warn("UI update error:", uiError);
        // Non-critical error, continue with initialization
      }
  
      // Filter and prepare words
      const validWords = puzzleData.words
        .filter(word => word.length >= config.minWordLength && word.length <= config.maxWordLength)
        .map(word => word.toUpperCase())
        .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
        .slice(0, config.maxWords);
  
      if (validWords.length === 0) {
        throw new Error('No valid words provided after filtering');
      }
  
      // Generate grid with words - potential errors handled in generateGrid
      state.grid = generateGrid(validWords);
  
      // Render UI with error handling
      try {
        renderGrid();
        renderWordList();
        renderTimer();
  
        // Set up puzzle game event listeners
        setupPuzzleEventListeners();
      } catch (renderError) {
        throw new Error(`Failed to render puzzle: ${renderError.message}`);
      }
    } catch (error) {
      // Handle errors in puzzle initialization
      window.showErrorMessage(
        "Knowledge Construct Error",
        "The Kethaneum is having difficulty manifesting this knowledge construct. The patterns appear unstable. Please try a different archive section.",
        "Try Different Section",
        function() {
          document.getElementById('error-panel').style.display = 'none';
          navigateTo('book-of-passage-screen');
        }
      );
      
      // Rethrow to signal that initialization failed
      throw error;
    }
  }

  // Start the puzzle game (called after instructions are closed)
  function startPuzzleGame() {
    try {
      if (state.gameOver) {
        throw new Error("Cannot start game that is already over");
      }
      
      if (!state.wordList || state.wordList.length === 0) {
        throw new Error("Cannot start game with empty word list");
      }
      
      // Set game state
      state.paused = false;
      
      // Start the timer with error handling
      try {
        startTimer();
      } catch (timerError) {
        console.warn("Timer error:", timerError);
        // Create emergency timer as fallback
        clearInterval(state.timer);
        state.timer = setInterval(() => {
          if (state.paused) return;
          state.timeRemaining--;
          
          try {
            renderTimer();
          } catch (renderError) {
            // Last resort - just check time
            if (state.timeRemaining <= 0) {
              endGame(false);
            }
          }
        }, 1000);
      }
    } catch (error) {
      window.showErrorMessage(
        "Cataloging System Error",
        "The Kethaneum's cataloging system encountered an unexpected disruption. Please return to your Book of Passage and try again.",
        "Return to Book of Passage",
        function() {
          document.getElementById('error-panel').style.display = 'none';
          navigateTo('book-of-passage-screen');
        }
      );
    }
  }

  // Function to check if a book is complete and update counters
  function checkBookCompletion(bookTitle) {
    if (!state.books[bookTitle]) return false;

    const allPartsComplete = state.books[bookTitle].every(part => part === true);

    if (allPartsComplete) {
      // Check if this book was already counted as complete
      const wasAlreadyComplete = state.books[bookTitle].complete;

      if (!wasAlreadyComplete) {
        state.books[bookTitle].complete = true;
        state.completedBooks++;
        console.log(`Book "${bookTitle}" completed!`);

        // Show a celebration message
        if (elements.winPanel) {
          const winMessage = elements.winPanel.querySelector('p');
          if (winMessage) {
            winMessage.innerHTML = `You've successfully organized all the words in this knowledge construct!<br><br><strong>Congratulations! You've completed all parts of "${bookTitle}"!</strong>`;
          }
        }
      }

      return true;
    }

    return false;
  }

  // Generate word search grid
  function generateGrid(words) {
    try {
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
    } catch (error) {
      // Use the error handler function
      return window.handleGridGenerationError(error, words, config, fillEmptyCells);
    }
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
    if (!elements.wordGrid) return;

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

  // Render word list to the DOM - Updated with sorting
  function renderWordList() {
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

  // Render timer bar - Updated for mobile
  function renderTimer() {
    if (!elements.timerBar) return;

    const percentRemaining = (state.timeRemaining / config.timeLimit) * 100;

    // Update desktop timer
    elements.timerBar.style.width = `${percentRemaining}%`;

    // Update mobile timer if it exists
    const mobileTimerBar = document.querySelector('.mobile-timer-bar');
    if (mobileTimerBar) {
      mobileTimerBar.style.width = `${percentRemaining}%`;
    }

    // Change color as time runs low
    const timerColor = percentRemaining < 20 ?
      'var(--accent-main)' : percentRemaining < 50 ?
        'var(--primary-lighter)' : 'var(--primary-light)';

    elements.timerBar.style.backgroundColor = timerColor;
    if (mobileTimerBar) {
      mobileTimerBar.style.backgroundColor = timerColor;
    }
  }

  // Updated timer animation function with callback
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

  // Setup instructions handler
  function setupInstructionsHandler() {
    const startPlayingBtn = document.getElementById('start-playing-btn');
    if (startPlayingBtn) {
      startPlayingBtn.addEventListener('click', function () {
        if (elements.instructionsPanel) {
          elements.instructionsPanel.style.display = 'none';
        }

        // For mobile, start the timer animation first, then start the game after animation
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // Create and animate the timer
          setupMobileTimerWithAnimation(function () {
            // This callback runs after animation completes
            startPuzzleGame();
          });
        } else {
          // On desktop, just start the game immediately
          startPuzzleGame();
        }
      });
    }
  }

  // Set up mobile-specific enhancements
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

    // Setup instruction panel handler
    setupInstructionsHandler();
  }

  // Add haptic feedback to word finding
  function setupHapticFeedback() {
    // Check if we've already set up haptic feedback
    if (window.hapticFeedbackSetup) return;

    // Store the original checkForWord function reference
    const originalCheckForWord = checkForWord;

    // Override checkForWord to add haptic feedback
    window.checkForWord = function () {
      // Get the current words found count to compare later
      const wordsFoundBefore = state.wordList.filter(wordData => wordData.found).length;

      // Call the original function 
      originalCheckForWord.apply(this, arguments);

      // Check if a new word was found
      const wordsFoundAfter = state.wordList.filter(wordData => wordData.found).length;

      if (wordsFoundAfter > wordsFoundBefore) {
        // A word was found! Trigger haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(50); // Vibrate for 50ms
        }
      }
    };

    // Replace the global function
    checkForWord = window.checkForWord;

    // Mark that we've set up haptic feedback
    window.hapticFeedbackSetup = true;
  }

  // Helper debounce function for resize events
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  }

  // Listen for window resize to adjust mobile features
  window.addEventListener('resize', debounce(function () {
    if (state.currentScreen === 'puzzle-screen') {
      setupMobileEnhancements();
    }
  }, 250));

  // Add function to save game progress to local storage
  function saveGameProgress() {
    try {
      const progress = {
        completedPuzzles: state.completedPuzzles,
        completedBooks: state.completedBooks,
        books: state.books,
        discoveredBooks: Array.from(state.discoveredBooks || []),
        bookProgress: state.bookProgress || {}
      };

      localStorage.setItem('kethaneumProgress', JSON.stringify(progress));
      console.log('Game progress saved');
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }

  // Add function to load game progress from local storage
  function loadGameProgress() {
    try {
      const savedProgress = localStorage.getItem('kethaneumProgress');

      if (savedProgress) {
        const progress = JSON.parse(savedProgress);

        state.completedPuzzles = progress.completedPuzzles || 0;
        state.completedBooks = progress.completedBooks || 0;
        state.books = progress.books || {};
        state.discoveredBooks = new Set(progress.discoveredBooks || []);
        state.bookProgress = progress.bookProgress || {};

        // Ensure completedBooks matches the size of discoveredBooks
        if (state.discoveredBooks.size !== state.completedBooks) {
          state.completedBooks = state.discoveredBooks.size;
        }

        console.log('Game progress loaded');

        // Update display if on Book of Passage screen
        if (state.currentScreen === 'book-of-passage-screen') {
          updateBookOfPassageProgress();
        }
      }
    } catch (error) {
      console.error('Failed to load game progress:', error);
    }
  }

  function clearGameProgress() {
    try {
      // Clear localStorage
      localStorage.removeItem('kethaneumProgress');

      // Reset state variables
      state.completedPuzzles = 0;
      state.completedBooks = 0;
      state.books = {};
      state.discoveredBooks = new Set();
      state.bookProgress = {}; // Also clear the book progress

      console.log('Game progress cleared');
    } catch (error) {
      console.error('Failed to clear game progress:', error);
    }
  }

  // Set up event listeners for the puzzle game
  function setupPuzzleEventListeners() {
    // Mouse/touch events for grid cells
    if (elements.wordGrid) {
      elements.wordGrid.addEventListener('mousedown', handleSelectionStart);
      elements.wordGrid.addEventListener('mouseover', handleSelectionMove);

      // Touch events for mobile
      elements.wordGrid.addEventListener('touchstart', handleTouchStart, { passive: false });
      elements.wordGrid.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);

    // Pause button
    if (elements.pauseBtn) {
      elements.pauseBtn.addEventListener('click', togglePause);
    }

    // Return to Book of Passage button
    const returnButton = document.getElementById('return-book-of-passage-btn');
    if (returnButton) {
      returnButton.addEventListener('click', function () {
        if (confirm('Return to your Book of Passage? Your progress will be saved.')) {
          navigateTo('book-of-passage-screen');
        }
      });
    }
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
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const cell = element.closest('.grid-cell');
    if (!cell) return;

    state.startCell = cell;
    state.currentCell = cell;
    state.selectedCells = [cell];

    updateSelectedCells();

    e.preventDefault(); // Prevent scrolling
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
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const cell = element.closest('.grid-cell');
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

    e.preventDefault(); // Prevent scrolling
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
    try {
      clearInterval(state.timer);
      state.gameOver = true;
    
      if (isWin) {
        // Increment completed puzzles count
        state.completedPuzzles++;
    
        // Update book completion status
        if (state.currentBook && state.currentStoryPart >= 0) {
          // Initialize book tracking if it doesn't exist
          if (!state.books[state.currentBook]) {
            state.books[state.currentBook] = [false, false, false, false, false];
          }
    
          // Mark the story part as complete
          state.books[state.currentBook][state.currentStoryPart] = true;
          
          // Add to discovered books if this is new
          if (!state.discoveredBooks) {
            state.discoveredBooks = new Set();
          }
          
          if (!state.discoveredBooks.has(state.currentBook)) {
            state.discoveredBooks.add(state.currentBook);
            state.completedBooks = state.discoveredBooks.size;
          }
          
          // Update the next story part to show for this book
          if (!state.bookProgress) {
            state.bookProgress = {};
          }
          
          // Advance to next part
          state.bookProgress[state.currentBook] = state.currentStoryPart + 1;
          
          // Check if the book is now complete
          try {
            checkBookCompletion(state.currentBook);
          } catch (error) {
            console.warn("Error checking book completion:", error);
            // Non-critical, continue without completion check
          }
        }
    
        // Store progress in local storage
        try {
          saveGameProgress();
        } catch (saveError) {
          console.warn("Failed to save game progress:", saveError);
          // Show a subtle warning to the user
          const message = document.createElement('div');
          message.textContent = "Your progress could not be saved. You may need to complete this section again.";
          message.style.color = "var(--accent-main)";
          message.style.fontSize = "14px";
          message.style.padding = "10px";
          
          // Add to win panel if it exists
          if (elements.winPanel) {
            elements.winPanel.appendChild(message);
          }
        }
    
        // Show win panel
        if (elements.winPanel) {
          elements.winPanel.style.display = 'block';
        }
      } else {
        // Show lose panel
        if (elements.losePanel) {
          elements.losePanel.style.display = 'block';
        }
      }
    } catch (error) {
      // Error in game end procedure
      window.showErrorMessage(
        "Cataloging Closure Error",
        "The Kethaneum's cataloging system encountered difficulty while recording your progress. The record may be incomplete.",
        "Return to Book of Passage",
        function() {
          document.getElementById('error-panel').style.display = 'none';
          navigateTo('book-of-passage-screen');
        }
      );
    }
  }

  // Toggle pause state
  function togglePause() {
    state.paused = !state.paused;

    if (state.paused) {
      if (elements.pausePanel) {
        elements.pausePanel.style.display = 'block';
      }
      if (elements.pauseBtn) {
        elements.pauseBtn.textContent = 'Resume';
      }
    } else {
      if (elements.pausePanel) {
        elements.pausePanel.style.display = 'none';
      }
      if (elements.pauseBtn) {
        elements.pauseBtn.textContent = 'Pause';
      }
    }
  }

  // Resume the game
  function resumeGame() {
    state.paused = false;
    if (elements.pausePanel) {
      elements.pausePanel.style.display = 'none';
    }
    if (elements.pauseBtn) {
      elements.pauseBtn.textContent = 'Pause';
    }
  }

  // Reset and replay current puzzle
  function resetCurrentPuzzle() {
    // Get current puzzle data
    const puzzleData = state.puzzles[state.currentGenre][state.currentPuzzleIndex];

    // Re-initialize the puzzle
    initializePuzzle(puzzleData);

    // Show instructions again
    if (elements.instructionsPanel) {
      elements.instructionsPanel.style.display = 'block';
    }
  }

  // Load next puzzle (for endless mode)
  function loadNextPuzzle() {
    // Load a new sequential puzzle
    loadSequentialPuzzle();

    // Show instructions panel
    if (elements.instructionsPanel) {
      elements.instructionsPanel.style.display = 'block';
    }

    // Ensure game is paused until instructions are closed
    state.paused = true;

    // Reset any game state that might be causing issues
    state.gameOver = false;
    state.selectedCells = [];
    state.startCell = null;
    state.currentCell = null;
  }

  // Set up screen navigation
  function setupScreenNavigation() {
    console.log('Setting up screen navigation');

    // Title screen buttons
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', function () {
        console.log('New Game button clicked');
        clearGameProgress(); // Clear progress before starting new game
        navigateTo('backstory-screen');
      });
    }

    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', function () {
        console.log('Continue button clicked');
        // Go directly to Book of Passage instead of library
        navigateTo('book-of-passage-screen');
      });
    }

    // Backstory screen
    const continueToBookBtn = document.getElementById('continue-to-book-btn');
    if (continueToBookBtn) {
      continueToBookBtn.addEventListener('click', function () {
        console.log('Continue to book clicked');
        navigateTo('book-of-passage-screen');
      });
    }

    // Book of Passage screen
    const startCatalogingBtn = document.getElementById('start-cataloging-btn');
    if (startCatalogingBtn) {
      startCatalogingBtn.addEventListener('click', function () {
        console.log('Start cataloging clicked');
        // Load a sequential puzzle
        loadSequentialPuzzle();
        navigateTo('puzzle-screen');
      });
    }

    // Win panel buttons - modified for endless mode
    const nextBookBtn = document.getElementById('next-book-btn');
    if (nextBookBtn) {
      nextBookBtn.addEventListener('click', function () {
        console.log('Next book button clicked');
        if (elements.winPanel) {
          elements.winPanel.style.display = 'none';
        }
        loadNextPuzzle();
      });
    }

    const returnToBookOfPassageBtn = document.getElementById('return-to-book-of-passage-btn');
    if (returnToBookOfPassageBtn) {
      returnToBookOfPassageBtn.addEventListener('click', function () {
        if (elements.winPanel) {
          elements.winPanel.style.display = 'none';
        }
        navigateTo('book-of-passage-screen');
      });
    }

    // Lose panel buttons - modified for endless mode
    const tryAgainBtn = document.getElementById('try-again-btn');
    if (tryAgainBtn) {
      tryAgainBtn.addEventListener('click', function () {
        if (elements.losePanel) {
          elements.losePanel.style.display = 'none';
        }
        resetCurrentPuzzle();
      });
    }

    const differentBookBtn = document.getElementById('different-book-btn');
    if (differentBookBtn) {
      differentBookBtn.addEventListener('click', function () {
        if (elements.losePanel) {
          elements.losePanel.style.display = 'none';
        }
        loadNextPuzzle();
      });
    }

    // Pause panel buttons
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        resumeGame();
      });
    }

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        if (elements.pausePanel) {
          elements.pausePanel.style.display = 'none';
        }
        resetCurrentPuzzle();
      });
    }

    const goToBookBtn = document.getElementById('go-to-book-btn');
    if (goToBookBtn) {
      goToBookBtn.addEventListener('click', function () {
        if (elements.pausePanel) {
          elements.pausePanel.style.display = 'none';
        }
        navigateTo('book-of-passage-screen');
      });
    }

    // Instructions panel
    const startPlayingBtn = document.getElementById('start-playing-btn');
    if (startPlayingBtn) {
      startPlayingBtn.removeEventListener('click', startPlayingBtn.clickHandler);
      startPlayingBtn.clickHandler = function () {
        if (elements.instructionsPanel) {
          elements.instructionsPanel.style.display = 'none';
        }

        // For mobile, start the timer animation first, then start the game after animation
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // Create and animate the timer
          setupMobileTimerWithAnimation(function () {
            // This callback runs after animation completes
            startPuzzleGame();
          });
        } else {
          // On desktop, just start the game immediately
          startPuzzleGame();
        }
      };
      startPlayingBtn.addEventListener('click', startPlayingBtn.clickHandler);
    }
  }

  // Start the game
  loadPuzzles();
  loadGameProgress(); // Load progress from local storage
  setupScreenNavigation();
  window.handleInitialLoadErrors(state);

  // Initially show the title screen
  navigateTo('title-screen');


  // Protection against navigation interference
  window.addEventListener('load', function () {
    // Force correct display after everything else has loaded
    setTimeout(function () {
      const currentScreen = state.currentScreen || 'title-screen';
      // Force a re-navigation to current screen
      navigateTo(currentScreen);

      // Set up a periodic check to ensure navigation hasn't been tampered with
      setInterval(function () {
        const activeScreens = document.querySelectorAll('.screen.active');
        if (activeScreens.length !== 1 ||
          activeScreens[0].id !== state.currentScreen) {
          console.log('Navigation state corrupted - restoring');
          navigateTo(state.currentScreen);
        }
      }, 2000); // Check every 2 seconds
    }, 300);
  });

  // Make key functions available to the error handler
window.generateGrid = generateGrid;
window.initializePuzzle = initializePuzzle;
window.navigateTo = navigateTo;
window.fillEmptyCells = fillEmptyCells;
window.canPlaceWord = canPlaceWord;
window.placeWord = placeWord;
window.resetCurrentPuzzle = resetCurrentPuzzle;
window.loadSequentialPuzzle = loadSequentialPuzzle;
window.state = state;  // Make state accessible for detailed error handling

});
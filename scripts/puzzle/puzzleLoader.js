/**
 * Puzzle loader for Chronicles of the Kethaneum
 * This module handles loading puzzle data from JSON files
 */

import { handlePuzzleLoadError, handleInitialLoadErrors } from '../utils/errorHandler.js';
import { initializePuzzle } from './puzzleGenerator.js';

/**
 * Load puzzles from all available genres
 * @returns {Promise} - Promise resolving when all puzzles are loaded
 */
async function loadAllPuzzles() {
  console.log('Loading all puzzles...');
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  try {
    // Initialize puzzle storage if needed
    if (!state.puzzles) {
      state.puzzles = {};
    }
    
    // List of genre files to load
    const genreFiles = [
      { genre: 'Kethaneum', file: 'scripts/data/puzzleData/kethaneum.json' },
      { genre: 'nature', file: 'scripts/data/puzzleData/nature.json' }
      // Add more genres here as they become available
    ];
    
    // Load all genre files in parallel
    const loadPromises = genreFiles.map(genreInfo => loadGenrePuzzles(genreInfo.genre, genreInfo.file));
    
    // Wait for all puzzles to load
    await Promise.all(loadPromises);
    
    console.log('All puzzles loaded successfully');
    console.log('Available genres:', Object.keys(state.puzzles));
    
    // Build book-to-parts mapping for easier navigation
    buildBookPartsMapping();
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Set up error handling for initial load
    handleInitialLoadErrors(state);
    
    return state.puzzles;
  } catch (error) {
    console.error('Failed to load puzzles:', error);
    handlePuzzleLoadError(error);
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    return {};
  }
}

/**
 * Load puzzles from files with custom paths
 * @param {Object} puzzlePaths - Mapping of genre names to file paths
 * @returns {Promise} - Promise resolving when all puzzles are loaded
 */
async function loadAllPuzzlesWithPaths(puzzlePaths) {
  console.log('Loading puzzles with custom paths:', puzzlePaths);
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  try {
    // Initialize puzzle storage if needed
    if (!state.puzzles) {
      state.puzzles = {};
    }
    
    // Load all genres in parallel
    const loadPromises = Object.entries(puzzlePaths).map(([genre, filePath]) => 
      loadGenrePuzzles(genre, filePath)
    );
    
    // Wait for all puzzles to load
    await Promise.all(loadPromises);
    
    console.log('All puzzles loaded successfully');
    console.log('Available genres:', Object.keys(state.puzzles));
    
    // Build book-to-parts mapping for easier navigation
    buildBookPartsMapping();
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Set up error handling for initial load
    handleInitialLoadErrors(state);
    
    return state.puzzles;
  } catch (error) {
    console.error('Failed to load puzzles:', error);
    handlePuzzleLoadError(error);
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    return {};
  }
}

/**
 * Load puzzles for a specific genre
 * @param {string} genre - Genre name
 * @param {string} filePath - Path to JSON file
 * @returns {Promise} - Promise resolving when puzzles are loaded
 */
async function loadGenrePuzzles(genre, filePath) {
  try {
    console.log(`Loading puzzles for genre: ${genre} from ${filePath}`);
    
    // Fetch the puzzle data
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to load puzzles for ${genre}: ${response.status} ${response.statusText}`);
    }
    
    // Parse the JSON data
    const puzzleData = await response.json();
    
    if (!Array.isArray(puzzleData) || puzzleData.length === 0) {
      throw new Error(`No valid puzzles found for genre: ${genre}`);
    }
    
    // Initialize genre in state if needed
    if (!state.puzzles[genre]) {
      state.puzzles[genre] = [];
    }
    
    // Process and store each puzzle
    puzzleData.forEach(puzzle => {
      // Make sure puzzle has required fields
      if (!puzzle.title || !puzzle.book || !puzzle.words || !Array.isArray(puzzle.words)) {
        console.warn(`Skipping invalid puzzle in ${genre}:`, puzzle);
        return;
      }
      
      // Make sure puzzle has storyPart information (default to introduction)
      if (puzzle.storyPart === undefined) {
        puzzle.storyPart = 0;
      }
      
      // Add the puzzle to the state
      state.puzzles[genre].push(puzzle);
    });
    
    console.log(`Loaded ${state.puzzles[genre].length} puzzles for genre: ${genre}`);
    return state.puzzles[genre];
  } catch (error) {
    console.error(`Error loading puzzles for genre ${genre}:`, error);
    
    // Initialize empty array for this genre to prevent future errors
    if (!state.puzzles[genre]) {
      state.puzzles[genre] = [];
    }
    
    // Re-throw error for central handling
    throw error;
  }
}

/**
 * Load a sequential puzzle based on game progression
 * @param {string} genre - Optional genre to load from
 * @param {string} book - Optional book to load
 * @returns {boolean} - Success or failure
 */
function loadSequentialPuzzle(genre, book) {
  try {
    console.log('Loading sequential puzzle:', { genre, book });
    
    // Get state reference
    const state = window.state;
    
    // Check if we have an uncompleted puzzle to resume
    if (state.lastUncompletedPuzzle && !genre && !book) {
      console.log('Resuming previously uncompleted puzzle:', state.lastUncompletedPuzzle);
      book = state.lastUncompletedPuzzle.book;
      genre = state.lastUncompletedPuzzle.genre;
    }
    
    // Helper function to get all available parts for a book across all genres
    function getAvailableParts(bookTitle) {
      const parts = new Set();
      
      // Look through all genres for this book's parts
      for (const g in state.puzzles) {
        if (!state.puzzles[g]) continue;
        
        const bookPuzzles = state.puzzles[g].filter(p => p.book === bookTitle);
        bookPuzzles.forEach(puzzle => {
          if (puzzle.storyPart !== undefined) {
            parts.add(puzzle.storyPart);
          }
        });
      }
      
      // Return sorted array of parts
      return Array.from(parts).sort((a, b) => a - b);
    }
    
    // Helper function to check if a book is complete
    function isBookComplete(bookTitle) {
      if (!state.books || !state.books[bookTitle]) return false;
      
      const availableParts = getAvailableParts(bookTitle);
      if (availableParts.length === 0) return false;
      
      return availableParts.every(part => state.books[bookTitle][part] === true);
    }
    
    // Helper function to check if a book is in progress
    function isBookInProgress(bookTitle) {
      if (!state.books || !state.books[bookTitle]) return false;
      
      const availableParts = getAvailableParts(bookTitle);
      if (availableParts.length === 0) return false;
      
      return availableParts.some(part => state.books[bookTitle][part] === true) &&
             !isBookComplete(bookTitle);
    }
    
    // STEP 1: Determine which genre to use
    let selectedGenre = genre;
    if (!selectedGenre) {
      console.log('No genre specified, determining best genre...');
      
      // Calculate genre stats (cached for this function call)
      const genreStats = {};
      
      for (const g in state.puzzles) {
        if (!state.puzzles[g] || !Array.isArray(state.puzzles[g]) || state.puzzles[g].length === 0) {
          continue;
        }
        
        // Get unique books in this genre
        const bookSet = new Set();
        state.puzzles[g].forEach(puzzle => {
          if (puzzle.book) bookSet.add(puzzle.book);
        });
        
        const books = Array.from(bookSet);
        let completeBooks = 0;
        let incompleteBooks = 0;
        let inProgressBooks = 0;
        
        books.forEach(bookTitle => {
          if (isBookComplete(bookTitle)) {
            completeBooks++;
          } else {
            incompleteBooks++;
            
            if (isBookInProgress(bookTitle)) {
              inProgressBooks++;
            }
          }
        });
        
        genreStats[g] = {
          totalBooks: books.length,
          completeBooks,
          incompleteBooks,
          inProgressBooks,
          books
        };
        
        console.log(`Genre '${g}' stats:`, genreStats[g]);
      }
      
      // First check current genre for incomplete books
      if (state.currentGenre && genreStats[state.currentGenre] && 
          genreStats[state.currentGenre].incompleteBooks > 0) {
        selectedGenre = state.currentGenre;
        console.log(`Continuing with current genre: ${selectedGenre}`);
      } else {
        // Find genres with incomplete books
        const genresWithIncompleteBooks = Object.keys(genreStats).filter(g => 
          genreStats[g].incompleteBooks > 0
        );
        
        if (genresWithIncompleteBooks.length > 0) {
          // Random selection from genres with incomplete books
          selectedGenre = genresWithIncompleteBooks[
            Math.floor(Math.random() * genresWithIncompleteBooks.length)
          ];
          console.log(`Selected genre with incomplete books: ${selectedGenre}`);
        } else {
          // All books in all genres are complete, pick a random genre
          const allGenres = Object.keys(genreStats);
          selectedGenre = allGenres[Math.floor(Math.random() * allGenres.length)];
          console.log(`All books complete, randomly selected genre: ${selectedGenre}`);
        }
      }
    }
    
    // Validate selected genre
    if (!state.puzzles[selectedGenre] || state.puzzles[selectedGenre].length === 0) {
      throw new Error(`No puzzles found for genre: ${selectedGenre}`);
    }
    
    // STEP 2: Select a book within the genre
    let selectedBook = book;
    if (!selectedBook) {
      console.log('No book specified, determining best book...');
      
      // Get all books in this genre
      const bookTitles = [...new Set(state.puzzles[selectedGenre].map(p => p.book))];
      
      // Categorize books
      const completeBooks = [];
      const inProgressBooks = [];
      const unstartedBooks = [];
      
      bookTitles.forEach(bookTitle => {
        if (isBookComplete(bookTitle)) {
          completeBooks.push(bookTitle);
        } else if (isBookInProgress(bookTitle)) {
          inProgressBooks.push(bookTitle);
        } else {
          unstartedBooks.push(bookTitle);
        }
      });
      
      console.log(`Book categories in '${selectedGenre}':`, {
        complete: completeBooks.length,
        inProgress: inProgressBooks.length,
        unstarted: unstartedBooks.length
      });
      
      // Priority 1: Continue current book if not complete
      if (state.currentBook && 
          bookTitles.includes(state.currentBook) && 
          !isBookComplete(state.currentBook)) {
        selectedBook = state.currentBook;
        console.log(`Continuing current book: ${selectedBook}`);
      } 
      // Priority 2: Random in-progress book
      else if (inProgressBooks.length > 0) {
        selectedBook = inProgressBooks[Math.floor(Math.random() * inProgressBooks.length)];
        console.log(`Selected in-progress book: ${selectedBook}`);
      } 
      // Priority 3: Random unstarted book
      else if (unstartedBooks.length > 0) {
        selectedBook = unstartedBooks[Math.floor(Math.random() * unstartedBooks.length)];
        console.log(`Selected unstarted book: ${selectedBook}`);
      } 
      // Priority 4: Reset a completed book
      else if (completeBooks.length > 0) {
        selectedBook = completeBooks[Math.floor(Math.random() * completeBooks.length)];
        console.log(`All books complete, resetting book: ${selectedBook}`);
        
        // Track historical completion as suggested by Assembly
        if (!state.historicalCompletions) {
          state.historicalCompletions = {};
        }
        
        if (!state.historicalCompletions[selectedBook]) {
          state.historicalCompletions[selectedBook] = 0;
        }
        
        state.historicalCompletions[selectedBook]++;
        console.log(`${selectedBook} has been completed ${state.historicalCompletions[selectedBook]} times`);
        
        // Reset book completion status but preserve historical data
        if (state.books && state.books[selectedBook]) {
          // Save completion state before reset
          const wasComplete = state.books[selectedBook].complete === true;
          
          // Reset all parts
          const availableParts = getAvailableParts(selectedBook);
          availableParts.forEach(part => {
            state.books[selectedBook][part] = false;
          });
          
          // Reset complete flag
          state.books[selectedBook].complete = false;
          
          // Log what we did
          if (wasComplete) {
            console.log(`Reset completion status for book: ${selectedBook}`);
          }
        }
      } else {
        throw new Error(`No valid books found in genre: ${selectedGenre}`);
      }
    }
    
    // Validate selected book
    const bookPuzzles = state.puzzles[selectedGenre].filter(p => p.book === selectedBook);
    if (bookPuzzles.length === 0) {
      throw new Error(`No puzzles found for book: ${selectedBook}`);
    }
    
    // STEP 3: Determine which part to load next
    console.log(`Determining next part for book: ${selectedBook}`);
    
    // Initialize book tracking if needed
    if (!state.books) {
      state.books = {};
    }
    if (!state.books[selectedBook]) {
      state.books[selectedBook] = [];
    }
    
    // Get all story parts for this book
    const availableParts = getAvailableParts(selectedBook);
    if (availableParts.length === 0) {
      throw new Error(`No story parts defined for book: ${selectedBook}`);
    }
    
    // Find the next part to load
    let nextPartToLoad;
    
    // Case 1: Continuing current book
    if (state.currentBook === selectedBook && 
        state.currentStoryPart !== undefined) {
      console.log(`Current part: ${state.currentStoryPart}`);
      
      // Find parts higher than current
      const higherParts = availableParts.filter(part => part > state.currentStoryPart);
      
      if (higherParts.length > 0) {
        // Next sequential part
        nextPartToLoad = Math.min(...higherParts);
        console.log(`Found next sequential part: ${nextPartToLoad}`);
      } else {
        // No higher parts, check for incomplete parts
        const incompleteParts = availableParts.filter(part => 
          !state.books[selectedBook][part]
        );
        
        if (incompleteParts.length > 0) {
          // Lowest incomplete part
          nextPartToLoad = Math.min(...incompleteParts);
          console.log(`Found lowest incomplete part: ${nextPartToLoad}`);
        } else {
          // All parts complete, start from beginning
          nextPartToLoad = Math.min(...availableParts);
          console.log(`All parts complete, starting over with part: ${nextPartToLoad}`);
          
          // Reset just this part's completion status
          state.books[selectedBook][nextPartToLoad] = false;
        }
      }
    } 
    // Case 2: New or switched book
    else {
      // Find the lowest incomplete part or start at beginning
      const incompleteParts = availableParts.filter(part => 
        !state.books[selectedBook][part]
      );
      
      if (incompleteParts.length > 0) {
        // Start with lowest incomplete part
        nextPartToLoad = Math.min(...incompleteParts);
        console.log(`Found lowest incomplete part: ${nextPartToLoad}`);
      } else {
        // All parts complete, start from beginning
        nextPartToLoad = Math.min(...availableParts);
        console.log(`All parts complete, starting with part: ${nextPartToLoad}`);
        
        // Reset just this part's completion status
        state.books[selectedBook][nextPartToLoad] = false;
      }
    }
    
    // Find the puzzle matching the selected part
    const puzzleToLoad = bookPuzzles.find(p => p.storyPart === nextPartToLoad);
    if (!puzzleToLoad) {
      throw new Error(`Could not find puzzle for book "${selectedBook}" part ${nextPartToLoad}`);
    }
    
    // Verify data integrity before state update
    const verificationCheck = {
      beforeUpdate: {
        currentBook: state.currentBook,
        currentGenre: state.currentGenre,
        currentStoryPart: state.currentStoryPart,
        currentPuzzleIndex: state.currentPuzzleIndex
      }
    };
    
    // STEP 4: Update state atomically
    try {
      state.currentPuzzleIndex = state.puzzles[selectedGenre].indexOf(puzzleToLoad);
      state.currentGenre = selectedGenre;
      state.currentBook = selectedBook;
      state.currentStoryPart = nextPartToLoad;
    } catch (stateError) {
      console.error('Error updating state:', stateError, verificationCheck.beforeUpdate);
      throw new Error('State update failed, aborting puzzle load');
    }
    
    // Verify successful state update
    verificationCheck.afterUpdate = {
      currentBook: state.currentBook,
      currentGenre: state.currentGenre,
      currentStoryPart: state.currentStoryPart,
      currentPuzzleIndex: state.currentPuzzleIndex
    };
    
    console.log(`Loading puzzle: "${puzzleToLoad.title}", Book: "${selectedBook}", Part: ${nextPartToLoad}`);
    console.log('State transition:', verificationCheck);
    
    // Initialize the puzzle
    const initResult = initializePuzzle(puzzleToLoad);
    
    if (!initResult) {
      throw new Error('Puzzle initialization failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error loading sequential puzzle:', error);
    
    // Add recovery mechanism
    try {
      if (state.lastUncompletedPuzzle) {
        console.log('Attempting fallback to last uncompleted puzzle');
        const fallbackGenre = state.lastUncompletedPuzzle.genre;
        const fallbackBook = state.lastUncompletedPuzzle.book;
        
        if (state.puzzles[fallbackGenre]) {
          const fallbackPuzzles = state.puzzles[fallbackGenre].filter(p => p.book === fallbackBook);
          if (fallbackPuzzles.length > 0) {
            const fallbackPuzzle = fallbackPuzzles[0];
            console.log('Using fallback puzzle:', fallbackPuzzle.title);
            initializePuzzle(fallbackPuzzle);
            return true;
          }
        }
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
    }
    
    return false;
  }
}

/**
 * Build a mapping of books to their available story parts
 * Makes navigation and book completion checking more efficient
 */
function buildBookPartsMapping() {
  // Create/reset the mapping
  state.bookPartsMap = {};
  
  // Go through all genres and puzzles
  for (const genre in state.puzzles) {
    const puzzlesInGenre = state.puzzles[genre];
    
    puzzlesInGenre.forEach(puzzle => {
      const book = puzzle.book;
      const part = puzzle.storyPart;
      
      // Initialize book entry if needed
      if (!state.bookPartsMap[book]) {
        state.bookPartsMap[book] = new Set();
      }
      
      // Add this part to the set
      state.bookPartsMap[book].add(part);
    });
  }
  
  // Convert Sets to Arrays for easier handling
  for (const book in state.bookPartsMap) {
    state.bookPartsMap[book] = Array.from(state.bookPartsMap[book]).sort((a, b) => a - b);
  }
  
  console.log('Book parts mapping created:', state.bookPartsMap);
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.loadAllPuzzles = loadAllPuzzles;
window.loadGenrePuzzles = loadGenrePuzzles;
window.buildBookPartsMapping = buildBookPartsMapping;

// Export functions for module system
export {
  loadAllPuzzles,
  loadGenrePuzzles,
  buildBookPartsMapping,
  loadAllPuzzlesWithPaths,
  loadSequentialPuzzle
};
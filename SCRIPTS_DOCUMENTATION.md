# Chronicles of the Kethaneum - Scripts Documentation

This document provides a comprehensive overview of the logic and architecture in each script file for Chronicles of the Kethaneum word search game.

---

## Table of Contents
1. [Core Systems](#core-systems)
2. [Puzzle System](#puzzle-system)
3. [Dialogue System](#dialogue-system)
4. [Interaction & Game Logic](#interaction--game-logic)
5. [UI & Rendering](#ui--rendering)
6. [Utilities](#utilities)
7. [Bootstrap & Initialization](#bootstrap--initialization)

---

## Core Systems

### scripts/core/config.js

**Purpose**: Centralized configuration management for game settings.

**Key Logic**:
- **Default Configuration**: Defines default values for grid size (10x10), time limit (180s), word constraints, difficulty levels, and feature flags
- **Active Configuration**: Maintains a mutable `activeConfig` object that can be modified at runtime
- **Dot Notation Access**: Implements `get()` and `set()` functions supporting dot notation (e.g., `get('testing.enabled')`)
- **Difficulty System**: Three preset difficulty levels (easy, medium, hard) that modify grid size, time limit, and max words
  - Easy: 8x8 grid, 240s, 6 words
  - Medium: 10x10 grid, 180s, 8 words
  - Hard: 12x12 grid, 150s, 10 words
- **Testing Mode**: Flags for debugging including skip timers, show all words, auto-win, and load all puzzles
- **Feature Toggles**: Supports haptic feedback, animations, progress tracking, and sound effects
- **Import/Export**: Can serialize/deserialize configuration as JSON for persistence

**Exports**: `getConfig`, `get`, `set`, `setDifficultyLevel`, `enableTestingMode`, `disableTestingMode`, `resetToDefaults`, `exportConfig`, `importConfig`

---

### scripts/core/gameState.js

**Purpose**: Manages the core game state and initialization.

**Key Logic**:
- **Base State Definition**: Defines the complete state structure including:
  - Screen management (`currentScreen`)
  - Puzzle data (`grid`, `wordList`, `selectedCells`)
  - Timing (`timer`, `timeRemaining`, `paused`, `gameOver`)
  - Puzzle catalog (`puzzles` by genre, `currentGenre`, `currentPuzzleIndex`)
  - Book tracking (`books`, `currentBook`, `currentStoryPart`, `bookProgress`)
  - Progress tracking (`completedPuzzles`, `completedBooks`, `discoveredBooks`)
  - Resume capability (`lastUncompletedPuzzle`)

- **State Initialization**: `initializeGameState()` creates a global `window.state` object with all base properties
- **discoveredBooks Management**: Special handling for `discoveredBooks` as a Set (not array) to track unique books
- **State Validation**: `isGameReady()` checks if puzzles are loaded and game can begin
- **State Restoration**: `restoreGameState()` carefully restores saved state while converting `discoveredBooks` array back to Set
- **Full Initialization**: `initializeGame()` coordinates state setup, save loading, and puzzle data loading

**Exports**: `initializeGameState`, `getGameState`, `isGameReady`, `updateGameState`, `restoreGameState`, `initializeGame`, `baseState`

---

### scripts/core/eventSystem.js

**Purpose**: Centralized event management system for decoupled communication.

**Key Logic**:
- **Subscription Management**: Uses a Map to store event subscriptions with unique IDs
- **Priority System**: Subscribers can specify priority (higher numbers execute first)
- **Once Subscriptions**: `subscribeOnce()` automatically unsubscribes after first trigger
- **Event Emission**: `emit()` calls all subscribers with error handling for each
- **Automatic Cleanup**: Once subscriptions are removed after execution
- **Event Constants**: Defines common game events:
  - Lifecycle: `GAME_INITIALIZED`, `GAME_START`, `GAME_PAUSE`, `GAME_RESUME`, `GAME_END`
  - Puzzle: `PUZZLE_LOADED`, `PUZZLE_STARTED`, `PUZZLE_RESET`, `PUZZLE_COMPLETED`
  - Word: `WORD_SELECTED`, `WORD_FOUND`, `ALL_WORDS_FOUND`
  - Navigation: `SCREEN_CHANGE`, `SCREEN_CHANGED`
  - Progress: `PROGRESS_SAVED`, `PROGRESS_LOADED`, `BOOK_COMPLETED`
  - UI: `PANEL_SHOW`, `PANEL_HIDE`, `TIMER_TICK`
  - System: `ERROR`, `CONFIG_CHANGED`

**Exports**: `subscribe`, `subscribeOnce`, `unsubscribe`, `emit`, `hasSubscribers`, `getSubscriberCount`, `clearEvent`, `clearAllEvents`, `GameEvents`

---

### scripts/core/saveSystem.js

**Purpose**: Handles saving and loading game progress to localStorage.

**Key Logic**:
- **Save Strategy**: `saveGameProgress()` saves only essential data:
  - Progress counters (`completedPuzzles`, `completedBooks`)
  - Book completion tracking (`books`, `bookProgress`)
  - Discovered books (converted from Set to Array for JSON)
  - Last uncompleted puzzle for resumption

- **Set Synchronization**: Always ensures `completedBooks` matches `discoveredBooks.size`
- **Load Strategy**: `loadGameProgress()` reconstructs state from saved data:
  - Starts with clean state via `resetGameState(false)`
  - Parses saved data
  - Reconstructs `discoveredBooks` Set from saved array
  - Recalculates `completedBooks` from Set size (never trusts saved value)

- **Reset Options**: `resetGameState(fullReset)` can either:
  - Full reset (true): Clears localStorage and resets memory
  - Partial reset (false): Only resets in-memory state

- **Error Handling**: Comprehensive try-catch with fallback to clean state on load failure

**Exports**: `saveGameProgress`, `loadGameProgress`, `resetGameState`, `clearGameProgress`

---

## Puzzle System

### scripts/puzzle/puzzleLoader.js

**Purpose**: Handles loading puzzle data from JSON files and selecting which puzzles to present.

**Key Logic - Data Loading**:

1. **Loading Functions**:
   - `loadAllPuzzles()`: Loads from hardcoded genre file paths
   - `loadAllPuzzlesWithPaths(puzzlePaths)`: Loads from provided path mapping (more flexible)
   - `loadGenrePuzzles(genre, filePath)`: Fetches and validates a single genre file

2. **Genre Loading Process**:
   ```
   For each genre file:
   → Fetch JSON file
   → Validate response status
   → Parse JSON array
   → For each puzzle object:
     → Validate required fields (title, book, words)
     → Ensure storyPart is defined (default to 0)
     → Add to state.puzzles[genre] array
   → Handle errors per-genre (doesn't fail entire load)
   ```

3. **Puzzle Validation**:
   - Required fields: `title`, `book`, `words` (array)
   - Optional field: `storyPart` (defaults to 0 if missing)
   - Invalid puzzles are logged and skipped

4. **Book Parts Mapping**:
   - `buildBookPartsMapping()` creates `state.bookPartsMap`
   - Maps each book to its available story parts across all genres
   - Converts Sets to sorted arrays for easier iteration

**Key Logic - Puzzle Selection**:

5. **Sequential Puzzle Loading** (`loadSequentialPuzzle(genre, book)`):

   **Step 1 - Genre Selection**:
   - If genre specified: Use it
   - If resuming: Use `state.lastUncompletedPuzzle.genre`
   - Otherwise:
     - Calculate stats for each genre (complete books, incomplete books, in-progress books)
     - Prefer current genre if it has incomplete books
     - Otherwise randomly select from genres with incomplete books
     - If all complete, randomly select any genre

   **Step 2 - Book Selection**:
   - If book specified: Use it
   - If resuming: Use `state.lastUncompletedPuzzle.book`
   - Otherwise categorize books as:
     - Complete: All parts finished
     - In-progress: Some parts finished
     - Unstarted: No parts finished
   - Priority order:
     1. Continue current book if not complete
     2. Random in-progress book
     3. Random unstarted book
     4. Reset and replay a completed book (tracks via `state.historicalCompletions`)

   **Step 3 - Part Selection**:
   - Get available parts for the book from `bookPartsMap`
   - If continuing current book:
     - Find parts higher than `currentStoryPart`
     - If available, load next sequential part
     - Otherwise load lowest incomplete part
   - If new/switched book:
     - Load lowest incomplete part
     - If all complete, start from beginning

   **Step 4 - State Update**:
   - Find the puzzle matching selected genre, book, and part
   - Atomically update state:
     - `currentPuzzleIndex`
     - `currentGenre`
     - `currentBook`
     - `currentStoryPart`
   - Verify state update succeeded
   - Call `initializePuzzle()` from puzzleGenerator

6. **Fallback/Recovery**:
   - If any step fails, attempts to load `lastUncompletedPuzzle`
   - If that fails, shows error via error handler

**Exports**: `loadAllPuzzles`, `loadGenrePuzzles`, `buildBookPartsMapping`, `loadAllPuzzlesWithPaths`, `loadSequentialPuzzle`

---

### scripts/puzzle/puzzleGenerator.js

**Purpose**: Generates word search grids and initializes puzzle state.

**Key Logic**:

1. **Grid Generation** (`generateGrid(words)`):
   - Creates seeded random generator for reproducibility
   - Validates and filters words (uppercase, non-empty)
   - Sorts words by length (longest first for easier placement)
   - Creates empty grid of configured size
   - **Two-phase placement**:
     - **Phase 1**: Random placement attempts (100 tries per word)
     - **Phase 2**: Systematic placement (tries every position/direction)
   - Tracks placements in `state.wordList` with coordinates and direction
   - Fills empty cells with random letters
   - Returns 2D grid array

2. **Word Placement Logic**:
   - `canPlaceWord()`: Checks if word fits without going out of bounds
   - Allows words to overlap if letters match
   - `placeWord()`: Places word in grid by modifying cells
   - Supports all 8 directions from config

3. **Direction Validation** (`verifyDirections()`):
   - Ensures direction array is valid
   - Filters out invalid entries
   - Falls back to default 8 directions if needed

4. **Puzzle Initialization** (`initializePuzzle(puzzleData)`):
   - Validates puzzle data (non-null, has words array)
   - Resets game state (word list, selection, timer, flags)
   - Sets current book and story part
   - **discoveredBooks Management**:
     - Ensures `discoveredBooks` is a Set
     - Adds book if not already discovered
     - Updates `completedBooks` count
     - Saves progress immediately after discovery
   - Updates UI elements (book title with story part, story excerpt)
   - Filters words by length constraints
   - Generates grid via `generateGrid()`
   - Renders grid, word list, and timer
   - Sets up input event listeners

5. **Story Part Names**:
   - 0: "The Hook/Introduction"
   - 1: "Rising Action/Complication"
   - 2: "Midpoint Twist"
   - 3: "Climactic Moment"
   - 4: "Resolution/Epilogue"

6. **Error Handling**:
   - Grid generation failures use fallback grid via error handler
   - Puzzle initialization failures navigate to Book of Passage

**Exports**: `generateGrid`, `canPlaceWord`, `placeWord`, `fillEmptyCells`, `getDistinctivePatterns`, `initializePuzzle`, `getStoryPartName`, `verifyDirections`

---

## Dialogue System

### scripts/dialogue/dialogueManager.js

**Purpose**: Manages character dialogue, banter selection, and story beat progression.

**Key Logic**:

1. **Initialization**:
   - Loads configuration from `dialogue-config.json` (or uses fallback)
   - Loads initial character group ('introduction_characters')
   - Tracks loaded groups to avoid duplicates

2. **Character Loading**:
   - Reads `character-manifest.json` for available character files
   - Loads and validates each character file
   - Stores characters in Map by ID
   - Groups characters by `loadingGroup` for progressive loading

3. **Story Beat System**:
   - Tracks current story beat (default: 'hook')
   - Story beat progression: hook → first_plot_point → ... (defined in config)
   - Dialogue availability filtered by story beat range (`availableFrom`, `availableUntil`)
   - `isStoryBeatInRange()` checks if current beat is within availability window

4. **Banter Selection** (`getRandomBanter(storyBeat)`):
   ```
   → Get available characters for current story beat
   → For each character:
     → Check if loading group is loaded
     → Filter dialogue by story beat availability
   → Select character using weighted random:
     → Recent characters get weight 1
     → Non-recent characters get weight 3
   → Randomly select dialogue from available dialogue
   → Add character to recently used list (window size from config)
   → Return complete banter object with character name, text, emotion, category
   ```

5. **Recently Used Avoidance**:
   - Maintains Set of recently used character IDs
   - Configurable window size (default 3)
   - Characters are weighted lower if recently used

6. **Event Emission**:
   - Emits custom events for story beat changes
   - Events dispatched on document for global listening

7. **Validation**:
   - Character data must have: `character.id`, `character.name`, `banterDialogue` array
   - Each dialogue entry must have: `id`, `text`, `emotion` array

**Exports**: `DialogueManager` class, `dialogueManager` singleton

---

### scripts/dialogue/dialogueIntegration.js

**Purpose**: Integrates DialogueManager with DialogueUIManager for complete dialogue system.

**Key Logic**:

1. **Initialization** (`initialize(dialogueUIManager)`):
   - Creates DialogueManager instance
   - Stores reference to DialogueUIManager
   - Initializes DialogueManager
   - Ensures UI overlay and panel are created

2. **Starting Dialogue** (`startDialogue(characterName, storyBeat)`):
   - Sets story beat in DialogueManager
   - Gets random banter via DialogueManager
   - Processes dialogue text for chunking
   - Shows dialogue UI

3. **Text Processing** (`processDialogueText()`):
   - Measures text proportions for current container
   - Applies margin standards
   - Chunks dialogue text to fit container
   - Handles errors with fallback (show full text)

4. **Dialogue Display** (`showDialogue()`):
   - Updates character name
   - Displays current chunk
   - Updates continue button text ("Continue" vs "End Conversation")
   - Shows dialogue panel and overlay
   - Sets up continue button handler

5. **Continuation** (`handleContinue()`):
   - If more chunks: Show next chunk
   - If last chunk: End dialogue

6. **Ending Dialogue** (`endDialogue()`):
   - Hides panel and overlay
   - Resets state (dialogue, chunk index, chunks array)

**Exports**: `DialogueIntegration` class

---

## Interaction & Game Logic

### scripts/interaction/gameLogic.js

**Purpose**: Core game mechanics including word validation, win/loss conditions, and game flow.

**Key Logic**:

1. **Word Checking** (`checkForWord()`):
   - Requires minimum word length from config
   - Extracts selected word from cells
   - Calculates direction vector from start/end cells
   - Checks against word list:
     - Forward direction match
     - Reverse direction match (allows backwards selection)
   - Calls `markWordAsFound()` if match

2. **Word Found** (`markWordAsFound(wordData)`):
   - Marks word as found in state
   - Marks cells as correct (CSS class)
   - Re-renders word list (found words sorted to bottom)
   - Triggers haptic feedback if available
   - Checks win condition

3. **Win Condition** (`checkWinCondition()`):
   - Checks if all words in `wordList` have `found: true`
   - Calls `endGame(true)` if complete

4. **Game End** (`endGame(isWin)`):
   - Stops timer
   - Sets `gameOver` flag
   - **If Win**:
     - Clears `lastUncompletedPuzzle` if this puzzle
     - Increments `completedPuzzles`
     - Updates book completion:
       - Marks current story part as complete
       - Adds book to `discoveredBooks` Set
       - Updates `completedBooks` count
       - Advances `bookProgress` to next part
       - Checks if all parts complete via `checkBookCompletion()`
     - Saves progress
     - Shows win panel
   - **If Loss**:
     - Shows lose panel

5. **Book Completion** (`checkBookCompletion(bookTitle)`):
   - Gets available parts from `bookPartsMap`
   - Checks if ALL parts are marked complete
   - If complete:
     - Sets `books[bookTitle].complete = true`
     - Updates win message to celebrate book completion
     - Returns true

6. **Timer** (`startTimer()`):
   - Interval function runs every 1000ms
   - Skips if paused
   - Decrements `timeRemaining`
   - Updates timer bar width and color:
     - <20%: Accent color (red)
     - <50%: Primary lighter color
     - ≥50%: Primary light color
   - Calls `endGame(false)` when time reaches 0

7. **Puzzle Management**:
   - `resetCurrentPuzzle()`: Re-initializes current puzzle, shows instructions
   - `loadNextPuzzle()`: Calls `loadSequentialPuzzle()`, shows instructions, resets pause state
   - `confirmReturn()`: Shows confirmation, saves uncompleted puzzle state, navigates to Book of Passage

8. **Game Start** (`startPuzzleGame()`):
   - Validates game not over and word list exists
   - Sets `paused = false`
   - Starts timer

**Exports**: `checkForWord`, `markWordAsFound`, `checkWinCondition`, `endGame`, `checkBookCompletion`, `startTimer`, `resetCurrentPuzzle`, `loadNextPuzzle`, `confirmReturn`, `startPuzzleGame`

---

### scripts/interaction/inputHandler.js

**Purpose**: Manages all user input (mouse, touch, keyboard) for puzzle interaction.

**Key Logic**:

1. **Event Listener Setup** (`setupPuzzleEventListeners()`):
   - Cleans up existing listeners first
   - Adds listeners for:
     - Grid: mousedown, mouseover, touchstart, touchmove
     - Document: mouseup, touchend (for ending selection)
     - Pause button
     - Return button
     - Pause panel buttons (resume, restart, go to book)
   - Stores cleanup functions in `activeListeners` array

2. **Selection Start** (`handleSelectionStart`, `handleTouchStart`):
   - Checks game not paused or over
   - Finds clicked/touched grid cell
   - Sets `startCell`, `currentCell`, `selectedCells` in state
   - Updates visual selection
   - Prevents default (prevents scrolling on mobile)

3. **Selection Move** (`handleSelectionMove`, `handleTouchMove`):
   - Checks selection is active and game running
   - Validates movement is straight line:
     - Horizontal (dRow = 0)
     - Vertical (dCol = 0)
     - Diagonal (|dRow| = |dCol|)
   - Calculates normalized direction
   - Builds path of cells from start to current
   - Updates `selectedCells` and visual selection
   - Prevents default on touch

4. **Selection End** (`handleSelectionEnd()`):
   - Checks selection is active and game running
   - Calls `checkForWord()` to validate selection
   - Clears visual selection
   - Resets state (`startCell`, `currentCell`, `selectedCells`)

5. **Pause Toggle** (`togglePause()`):
   - Flips `paused` state
   - Shows/hides pause panel
   - Updates pause button text

6. **Mobile Support**:
   - `setupMobileInputHandling()`: Adds touch-specific classes
   - `setupHapticFeedback()`: Checks for vibration API support
   - Touch events use `elementFromPoint()` to find cell under finger

7. **Cleanup**:
   - `removeAllEventListeners()`: Calls all stored cleanup functions
   - Prevents memory leaks and duplicate listeners

**Exports**: `setupPuzzleEventListeners`, `handleSelectionStart`, `handleTouchStart`, `handleSelectionMove`, `handleTouchMove`, `handleSelectionEnd`, `togglePause`, `resumeGame`, `removeAllEventListeners`, `setupMobileInputHandling`, `setupHapticFeedback`

---

## UI & Rendering

### scripts/ui/renderSystem.js

**Purpose**: Updates DOM elements based on game state.

**Key Logic**:

1. **Grid Rendering** (`renderGrid()`):
   - Clears existing grid
   - Sets CSS grid columns based on grid size
   - Creates div for each cell with:
     - Class: 'grid-cell'
     - Content: Letter from `state.grid[row][col]`
     - Data attributes: row, col

2. **Word List Rendering** (`renderWordList()`):
   - Renders to both desktop and mobile word lists
   - Sorts words (found words to bottom)
   - Creates list items with:
     - Word text
     - 'found' class if completed

3. **Timer Rendering** (`renderTimer()`):
   - Calculates percentage remaining
   - Updates both desktop and mobile timer bars
   - Sets width based on percentage
   - Color based on time remaining:
     - <20%: Accent (red)
     - <50%: Primary lighter
     - ≥50%: Primary light

4. **Selection Updates** (`updateSelectedCells()`):
   - Removes 'selected' class from all cells
   - Adds 'selected' class to cells in `state.selectedCells`

5. **Correct Cell Marking** (`markCellsAsCorrect(cells)`):
   - Adds 'correct' class to cells (when word found)

6. **Mobile Timer Animation** (`setupMobileTimerWithAnimation(callback)`):
   - Creates mobile timer container if needed
   - Flashes timer 3 times (alternating colors)
   - Calls callback when animation complete

**Exports**: `renderGrid`, `renderWordList`, `renderTimer`, `updateSelectedCells`, `markCellsAsCorrect`, `setupMobileTimerWithAnimation`

---

### scripts/ui/navigation.js

**Purpose**: Handles screen transitions and navigation.

**Key Logic**:

1. **Screen Navigation** (`navigateToScreen(screenId)`):
   - Validates game state for specific screens
   - Hides all screens (sets display: none, removes 'active' class)
   - Shows target screen:
     - Adds 'active' class
     - Sets appropriate display property (flex or block)
   - Updates `state.currentScreen`
   - **Special handling**:
     - Puzzle screen: Shows instructions panel, sets paused, sets up mobile features
     - Book of Passage: Updates progress display

2. **State Validation** (`validateGameState()`):
   - Ensures `discoveredBooks` is a Set
   - Synchronizes `completedBooks` with Set size
   - Logs warnings if fixes needed
   - Returns true if valid, false if fixed

3. **Book of Passage Update** (`updateBookOfPassageScreen()`):
   - Displays narrative text
   - Shows progress stats (completed puzzles, discovered books)
   - Calls `updateBookOfPassageProgress()` to render book details

4. **Progress Display** (`updateBookOfPassageProgress()`):
   - Validates state first
   - Updates progress counters
   - For each book:
     - Counts completed parts (out of 5)
     - Determines if complete
     - Checks if has uncompleted puzzle
     - Displays book title, progress bar, uncompleted note
     - Gets available parts from `bookPartsMap`
     - Shows checkmark or number for each part

5. **Library Navigation** (`initializeLibraryNavigation()`):
   - Sets up navigation buttons for library screen
   - Book of Passage button
   - Main Menu button

6. **Navigation Protection** (`setupNavigationProtection()`):
   - Warns user before leaving page if game in progress
   - Uses `beforeunload` event

**Exports**: `navigateToScreen`, `validateGameState`, `updateBookOfPassageScreen`, `updateBookOfPassageProgress`, `initializeLibraryNavigation`, `setupNavigationProtection`

---

### scripts/ui/panelManager.js

**Purpose**: Manages showing/hiding overlay panels (win, lose, pause, instructions, error).

**Key Logic**:

1. **Show/Hide Functions**: For each panel type:
   - `showWinPanel(customMessage)`: Shows win panel, optional custom message
   - `hideWinPanel()`: Hides win panel
   - `showLosePanel(customMessage)`: Shows lose panel, optional custom message
   - `hideLosePanel()`: Hides lose panel
   - `showPausePanel()`: Shows pause panel
   - `hidePausePanel()`: Hides pause panel
   - `showInstructionsPanel()`: Shows instructions
   - `hideInstructionsPanel()`: Hides instructions

2. **Panel Visibility Check** (`isAnyPanelVisible()`):
   - Checks if any panel has `display: block`
   - Useful for determining if game should pause

3. **Hide All** (`hideAllPanels()`):
   - Hides win, lose, pause, instructions, and error panels
   - Quick way to clear all overlays

4. **Notifications** (`showNotification(message, type, duration)`):
   - Creates temporary notification element
   - Types: info, warning, error
   - Positioning: Fixed bottom-right
   - Auto-removes after duration (default 3000ms)
   - Fade in/out animations

**Exports**: `showWinPanel`, `hideWinPanel`, `showLosePanel`, `hideLosePanel`, `showPausePanel`, `hidePausePanel`, `showInstructionsPanel`, `hideInstructionsPanel`, `isAnyPanelVisible`, `hideAllPanels`, `showNotification`

---

### scripts/ui/dialogueUIManager.js

**Purpose**: Manages dialogue UI display including overlay and dialogue panel.

**Key Logic**:

1. **Initialization** (`initialize()`):
   - Finds game container element
   - Tests boundary detection
   - Sets initialized flag

2. **Container Boundaries** (`getContainerBoundaries()`):
   - Calculates container rect with borders and padding
   - Provides outer and inner boundaries
   - Calculates scale factor (based on 1000px width)
   - Determines responsive breakpoints (small, medium, large, extra large)

3. **Overlay Creation** (`createOverlay()`):
   - Creates fixed-position overlay element
   - Dark semi-transparent background
   - Initially hidden (opacity 0, visibility hidden)
   - Sets up resize handler to keep positioned correctly

4. **Dialogue Panel Creation** (`createDialoguePanel()`):
   - Creates panel with character name, text area, continue button
   - Positions within overlay
   - Styled with theme colors

5. **Text Measurement** (`measureTextProportions(text, boundaries)`):
   - Creates temporary element to measure text
   - Calculates how text fits in container
   - Returns character limit and category

6. **Text Chunking** (`chunkDialogueText(text, margins)`):
   - Splits text into chunks that fit container
   - Respects margin standards
   - Returns array of text chunks

7. **Margin Standards** (`applyTextMarginStandards(characterLimit, category)`):
   - Applies safety margins based on text length category
   - Ensures text never overflows

**Exports**: `DialogueUIManager` class

---

### scripts/ui/dialoguePaginationService.js

**Purpose**: Handles chunking and pagination of long dialogue text.

**Key Features**:
- Text measurement and proportional analysis
- Intelligent chunking based on container size
- Margin standards for safe display
- Handles edge cases (empty text, overflow, etc.)

---

## Utilities

### scripts/utils/errorHandler.js

**Purpose**: Centralized error handling and recovery for all game systems.

**Key Logic**:

1. **User-Facing Errors** (`showErrorMessage(title, message, actionText, actionFunction)`):
   - Creates/shows error panel overlay
   - Default action: Return to Book of Passage
   - Custom actions supported
   - Error logged to console

2. **Fallback Grid Creation**:
   - `createFallbackGrid()`: Creates simple grid with predictable words
   - `createResilientFallbackGrid()`: More robust version with built-in letter filling
   - Uses simple words: BOOK, PAGE, WORD, FIND, READ
   - Ensures game can continue even if grid generation fails

3. **Specific Error Handlers**:
   - `handlePuzzleLoadError()`: Shows error when puzzles can't load
   - `handleGridGenerationError()`: Creates fallback grid, shows adjusted message
   - `handlePuzzleInitializationError()`: Returns to Book of Passage
   - `handleSaveError()`: Shows subtle notification, tries sessionStorage fallback
   - `handleNavigationError()`: Attempts recovery, shows subtle notification
   - `handleSelectionError()`: Clears selection state, shows notification for critical errors
   - `handleTimerError()`: Creates emergency fallback timer

4. **Initial Load Handling** (`handleInitialLoadErrors(state)`):
   - Checks after 5 seconds if puzzles loaded
   - Shows friendly message on Book of Passage if no puzzles
   - Doesn't block UI, allows graceful degradation

5. **Dialogue Error Handlers**:
   - `handleDialogueUIErrors(issues)`: Processes array of issues, determines if recoverable
   - `handleDialoguePanelCorruption()`: Shows info notification about panel reset

**Exports**: All error handling functions

---

### scripts/utils/mathUtils.js

**Purpose**: Mathematical utility functions.

**Functions**:
- `calculatePercentage(part, total)`: Calculates percentage
- `getRandomInt(min, max)`: Random integer in range
- `doRectanglesOverlap(rect1, rect2)`: Rectangle collision detection
- `calculateDistance(x1, y1, x2, y2)`: Euclidean distance
- `shuffleArray(array)`: Fisher-Yates shuffle
- `clamp(value, min, max)`: Constrain value to range
- `lerp(a, b, t)`: Linear interpolation
- `calculateAverage(values)`: Array average
- `createSeededRandom(seed)`: Seeded random number generator (for reproducible grids)

**Exports**: All math utility functions

---

### scripts/utils/domUtils.js

**Purpose**: DOM manipulation and interaction utilities.

**Functions**:
- `createElement(tag, attributes, children)`: Create element with attributes and children
- `clearElement(element)`: Remove all children from element
- `isElementVisible(element)`: Check if element is visible (display, visibility, size, parent visibility)
- `isElementInViewport(element, offset)`: Check if element is in viewport
- `addCleanupEventListener(element, event, handler, options)`: Add event listener with cleanup function
- `throttle(func, limit)`: Create throttled function (limits execution frequency)
- `debounce(func, delay)`: Create debounced function (delays execution)
- `getRelativeCoordinates(event, element)`: Get coordinates relative to element (supports mouse and touch)

**Exports**: All DOM utility functions

---

## Bootstrap & Initialization

### scripts/moduleBootstrap.js

**Purpose**: Application initialization and screen flow management.

**Key Logic**:

1. **Initialization Phases**:
   - **Basic UI** (`initializeBasicUI()`):
     - Runs on page load
     - Sets up title screen handlers only
     - Hides all screens except title screen

   - **Basic Game Systems** (`initializeBasicGameSystems(isNewGame)`):
     - Initializes game state
     - Loads/resets save data based on `isNewGame`
     - Sets up event handlers
     - Initializes DialogueUIManager
     - Sets up navigation protection

   - **Game Data Loading** (`loadGameData()`):
     - Loads puzzle data from JSON files
     - Called lazily when needed (not on initial page load)
     - Shows loading indicator

   - **Full Initialization** (`initializeFullGame(isNewGame)`):
     - Calls basic systems init
     - Sets `gameInitialized = true`
     - Does NOT load puzzle data (deferred)

2. **Screen Handler Setup**:
   - **Title Screen Handlers** (`setupTitleScreenHandlers()`):
     - New Game: Initializes full game, navigates to backstory, sets up remaining handlers
     - Continue: Initializes full game, navigates directly to Book of Passage, sets up remaining handlers

   - **Remaining Handlers** (`setupRemainingScreenHandlers()`):
     - Only called after full game initialization
     - Sets up:
       - Backstory → Library screen
       - Book of Passage → Puzzle screen (loads data first)
       - Library navigation
       - Instructions panel
       - Game panel buttons (win, lose, pause)

3. **Event Handlers** (`setupEventHandlers()`):
   - Subscribes to game events:
     - Word found
     - Puzzle completed
     - Book completed
     - Screen changed
     - Errors

4. **Game Panel Handlers** (`setupGamePanelHandlers()`):
   - Win panel: Next book, Return to Book of Passage
   - Lose panel: Try again, Different book
   - Pause panel: Resume, Restart, Go to Book

5. **Data Loading Strategy**:
   - Puzzle data NOT loaded on page load
   - Loaded when user clicks "Start Cataloging"
   - Improves initial page load time
   - Loading indicator shown during data fetch

**Exports**: `APP_VERSION`, `initializeBasicUI`, `initializeBasicGameSystems`, `loadGameData`, `initializeFullGame`, `loadSequentialPuzzle`, `setupRemainingScreenHandlers`, `getDialogueUIManager`

---

## Summary of Puzzle Data Loading

The puzzle data loading system is implemented across multiple files with a clear separation of concerns:

### Loading Pipeline:

1. **Trigger**: User clicks "Start Cataloging" button on Book of Passage screen
2. **Load Data**: `moduleBootstrap.loadGameData()` is called
3. **Fetch Files**: Calls `puzzleLoader.loadAllPuzzlesWithPaths()` with genre→filepath mapping
4. **Per Genre**: For each genre, `loadGenrePuzzles()` fetches and validates JSON
5. **Validation**: Each puzzle checked for required fields (title, book, words array)
6. **Storage**: Valid puzzles stored in `state.puzzles[genre]` array
7. **Mapping**: `buildBookPartsMapping()` creates book→parts lookup table
8. **Selection**: When puzzle needed, `loadSequentialPuzzle()` uses intelligent selection logic
9. **Initialization**: Selected puzzle passed to `puzzleGenerator.initializePuzzle()`

### Selection Logic:

The `loadSequentialPuzzle()` function implements a sophisticated algorithm:
- **Remembers** incomplete puzzles for resumption
- **Prioritizes** in-progress books over new books
- **Distributes** play across genres with incomplete content
- **Tracks** which story parts are complete per book
- **Allows** replay of completed books (with historical tracking)

This ensures a coherent narrative progression while giving players variety.

---

## Architecture Notes

### Module System:
- Transitioning from global functions to ES6 modules
- Most files export functions and temporarily attach to `window` for backward compatibility
- Import statements use relative paths (e.g., `import { foo } from '../core/bar.js'`)

### State Management:
- Global `window.state` object holds all game state
- Accessed via `getGameState()` where possible
- `discoveredBooks` is **always** a Set (critical for tracking unique books)
- Save/load system carefully converts Set↔Array for JSON serialization

### Error Philosophy:
- User-facing errors show in-universe messages about "Kethaneum's systems"
- Critical errors navigate to safe screen (usually Book of Passage)
- Non-critical errors show subtle notifications
- Fallback mechanisms prevent total failure

### Dialogue System:
- Modular: DialogueManager (logic) + DialogueUIManager (display) + DialogueIntegration (glue)
- Story beat progression controls available dialogue
- Weighted random selection avoids repetition
- Chunking system handles long dialogue text

---

## End of Documentation

This documentation provides a complete overview of the game's architecture and logic. Use it to compare with the refreshed project and identify differences in implementation.

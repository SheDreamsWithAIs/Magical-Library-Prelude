# Chronicles of the Kethaneum - Module System

This directory contains the modular code structure for the Chronicles of the Kethaneum word search game.

## Directory Structure

```
scripts/
├── core/             # Core game functionality
│   ├── gameState.js  # Game state management
│   └── saveSystem.js # Save/load game progress
|
├── data/             # Game data
│   └── puzzleData/   # Puzzle JSON files
│       ├── kethaneum.json  # Kethaneum genre puzzles
│       └── nature.json     # Nature genre puzzles
│
├── interaction/      # User interaction
│   ├── gameLogic.js     # Game mechanics and rules
│   └── inputHandler.js  # User input processing
│
├── puzzle/           # Puzzle-related functionality
│   ├── puzzleGenerator.js  # Puzzle generation
│   └── puzzleLoader.js     # Puzzle data loading
│
├── ui/               # User interface components
│   ├── navigation.js    # Screen navigation
│   ├── panelManager.js  # Panel/modal management
│   └── renderSystem.js  # UI rendering
│
├── utils/            # Utility functions
│   ├── domUtils.js      # DOM utilities
│   ├── errorHandler.js  # Error handling
│   └── mathUtils.js     # Math utilities
│
└── main.js           # Main entry point and module orchestration
```

## Module System

The game uses a simple module system with ES modules (import/export). Each module is responsible for a specific aspect of the game and exports only what other modules need.

### Architecture Overview

- **Core modules**: Handle game state and persistence
- **Interaction modules**: Handle user input and game logic
- **Puzzle modules**: Handle puzzle generation and loading
- **UI modules**: Handle navigation and rendering
- **Utility modules**: Provide helper functions used by other modules

### Module Dependencies

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│   Utils   │◄────┤    UI     │◄────┤   Core    │
└───────────┘     └───────────┘     └───────────┘
      ▲                 ▲                 ▲
      │                 │                 │
      │           ┌───────────┐           │
      └───────────┤Interaction│◄──────────┘
                  └───────────┘
                        ▲
                        │
                  ┌───────────┐
                  │  Puzzle   │
                  └───────────┘
```

### Transition Approach

During the transition from the monolithic structure to modules:

1. Each module temporarily assigns its functions to `window` for backward compatibility
2. A global `window.game` object maintains references to all modules
3. The `main.js` file orchestrates module loading and initialization

## Specific Module Responsibilities

### Core Modules
- **gameState.js**: Manages the game state object, initialization, and access
- **saveSystem.js**: Handles saving and loading game progress from localStorage

### Interaction Modules
- **inputHandler.js**: Processes user input (mouse, touch) and manages event listeners
- **gameLogic.js**: Implements game rules, checks for win conditions, manages game flow

### Puzzle Modules
- **puzzleGenerator.js**: Creates word search puzzles with placed words
- **puzzleLoader.js**: Loads puzzle data from JSON files, manages puzzle selection

### UI Modules
- **navigation.js**: Manages screen transitions and display
- **panelManager.js**: Controls modal panels (win, lose, pause)
- **renderSystem.js**: Updates visual elements based on game state

### Utility Modules
- **errorHandler.js**: Provides error handling, recovery, and user-friendly messages
- **mathUtils.js**: Provides mathematical utility functions
- **domUtils.js**: Provides DOM manipulation helper functions

## Module Usage Examples

### Loading a Module
```javascript
import * as InputHandler from './interaction/inputHandler.js';
```

### Using a Module Function
```javascript
// Direct import
import { navigateToScreen } from './ui/navigation.js';
navigateToScreen('puzzle-screen');

// Via game object
window.game.ui.navigation.navigateToScreen('puzzle-screen');
```

### Properly Structured New Code
```javascript
// In new modules, add functionality like this:
function newFeature() {
  // Implementation
}

// Export for module system
export { newFeature };

// Temporarily add to window for transition
window.newFeature = newFeature;
```

## Future Improvements

- Add a proper config module for game settings
- Create an event system for inter-module communication
- Implement unit testing for individual modules
- Create a component system for UI elements
- Add accessibility improvements
- Support alternate input methods (keyboard, gamepad)
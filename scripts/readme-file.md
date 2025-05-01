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
│   └── puzzleData/      # Puzzle JSON files
│       ├── kethaneum.json  # Kethaneum genre puzzles
│       └── nature.json     # Nature genre puzzles
│
├── interaction/      # User interaction (future expansion)
│
├── puzzle/           # Puzzle-related functionality
│   └── puzzleLoader.js  # Puzzle data loading
│
├── ui/               # User interface components
│   ├── navigation.js    # Screen navigation
│   ├── panelManager.js  # Panel/modal management
│   └── renderSystem.js  # UI rendering
│
├── utils/            # Utility functions
│   ├── errorHandler.js  # Error handling
│   ├── mathUtils.js     # Math utilities
│   └── domUtils.js      # DOM utilities
│
└── main.js           # Main entry point and module orchestration
```

## Module System

The game uses a simple module system with ES modules (import/export). Each module is responsible for a specific aspect of the game and exports only what other modules need.

### Transition Approach

During the transition from the monolithic structure to modules:

1. Each module temporarily assigns its functions to `window` for backward compatibility
2. A global `window.game` object maintains references to all modules
3. The `main.js` file orchestrates module loading and initialization

### Module Dependencies

- **Core modules**: Handle game state and persistence
- **UI modules**: Handle navigation and rendering
- **Puzzle modules**: Handle puzzle loading and generation
- **Utility modules**: Provide helper functions used by other modules

## Future Improvements

- Add a proper config module for game settings
- Create player action and event handler modules
- Split puzzle generator from puzzle loader
- Implement a proper event system for inter-module communication
- Add unit testing for individual modules

## Maintenance Approach

When adding new features:

1. Identify which module should contain the functionality
2. Add the new code to that module
3. Export new functions from the module
4. Update any dependent modules
5. Update main.js if needed for initialization

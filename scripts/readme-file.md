# Chronicles of the Kethaneum - Module System

This directory contains the modular code structure for the Chronicles of the Kethaneum word search game.

## Directory Structure

```
scripts/
├── core/             # Core game functionality
│   ├── config.js        # Game configuration settings
│   ├── eventSystem.js   # Event management system
│   ├── gameState.js     # Game state management
│   └── saveSystem.js    # Save/load game progress
|
├── data/             # Game data
│   ├── puzzleData/      # Puzzle JSON files
│   │   ├── kethaneum.json
│   │   └── nature.json
│   └── dialogue/        # Dialogue JSON files
│       ├── characters/     # Character banter data
│       └── story-events/   # Story event scripts
│
├── dialogue/            # NEW - Dialogue system data and logic
│   ├── characters/         # Character-specific banter files
│   ├── story-events/       # Sequential story dialogue files
│   ├── dialogueManager.js  # Core dialogue system
│   └── dialogueUI.js       # Dialogue user interface
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
└── moduleBootstrap.js           # Main entry point and module orchestration
```

## Module System

The game uses a simple module system with ES modules (import/export). Each module is responsible for a specific aspect of the game and exports only what other modules need.

### Architecture Overview

- **Core modules**: Handle game state, configuration, events, and persistence
- **Dialogue modules**: Handle loading dialogue and managing dialogue triggers
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
3. The `moduleBootstrap.js` file orchestrates module loading and initialization

## Specific Module Responsibilities

### Core Modules
- **config.js**: Manages game configuration, difficulty levels, and feature flags
- **eventSystem.js**: Provides a pub/sub system for inter-module communication
- **gameState.js**: Manages the game state object, initialization, and access
- **saveSystem.js**: Handles saving and loading game progress from localStorage

### Dialogue Modules
- **dialogueManager.js**: Manages dialogue state, loads character and story files, handles dialogue flow and selection logic
- **dialogueUI.js**: Creates and manages dialogue overlay panels, character portrait display, responsive text sizing, and user interaction controls

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

## Key Features

### Configuration System
The configuration system provides:
- Centralized game settings management
- Difficulty level presets
- Feature flags for conditional functionality
- Testing mode options for development and QA
- Import/export capabilities for saving configurations

### Dialogue System (NEW)
The dialogue system provides:
- Character-based idle banter with random selection
- Sequential story event dialogues with multiple characters  
- Responsive text display adapting to screen size
- Integration with library screen and future cross-screen compatibility
- JSON-based dialogue data structure for easy content management
- Character portrait system for visual character representation

### Event System
The event system enables:
- Loose coupling between modules via pub/sub pattern
- Centralized event handling
- Priority-based event processing
- One-time event subscriptions
- Predefined game events for common actions

## Module Usage Examples

### Loading a Module
```javascript
import * as Config from './core/config.js';
```

### Using a Module Function
```javascript
// Direct import
import { navigateToScreen } from './ui/navigation.js';
navigateToScreen('puzzle-screen');

// Via game object
window.game.ui.navigation.navigateToScreen('puzzle-screen');
```

### Using the Event System
```javascript
// Subscribe to an event
import { subscribe, GameEvents } from './core/eventSystem.js';

subscribe(GameEvents.WORD_FOUND, (wordData) => {
  console.log(`Player found the word: ${wordData.word}`);
});

// Emit an event
import { emit, GameEvents } from './core/eventSystem.js';

emit(GameEvents.WORD_FOUND, { word: 'EXAMPLE', points: 10 });
```

### Configuration Example
```javascript
// Get a configuration value
import { get } from './core/config.js';

const timeLimit = get('timeLimit');
const isDebugMode = get('system.debugMode');

// Set a configuration value
import { set } from './core/config.js';

set('features.soundEffects', true);
```

## Properly Structured New Code
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

- Create a component system for swappable UI elements
- Implement unit testing for individual modules
- Add support for alternate input methods (keyboard, gamepad)
- Create specialized screen handler modules
- Add localization support
- Implement audio module for sound effects
- Create animation system for visual effects
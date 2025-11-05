# 🎨 Chronicles of the Kethaneum - Component Library

A modular, reusable UI component library for building game interfaces. Designed for easy content swapping and rapid game development.

## 📦 What's Included

### Core Components

1. **BaseComponent** - Foundation class for all components
2. **Button** - Interactive buttons with multiple variants
3. **Panel** - Modal/overlay dialogs
4. **Screen** - Full-screen views with navigation
5. **Card** - Content cards with specialized variants
6. **Container** - Flex and Grid layout systems
7. **List** - Dynamic lists with custom rendering

---

## 🎯 Component Overview

### 1. BaseComponent

The foundation for all components. Provides:

- **Lifecycle management**: `mount()`, `unmount()`, `destroy()`
- **State management**: `setState()`, `onStateChange()`
- **Event handling**: `on()`, `off()`
- **Child management**: `addChild()`, `removeChild()`
- **Visibility control**: `show()`, `hide()`, `toggle()`

```javascript
import { BaseComponent } from './scripts/components/BaseComponent.js';

class CustomComponent extends BaseComponent {
  createElement() {
    const element = document.createElement('div');
    element.textContent = 'Custom Component';
    return element;
  }
}
```

---

### 2. Button Component

**Variants:**
- `primary` - Main action button (default)
- `secondary` - Alternative actions
- `accent` - Highlighted actions
- `large` - Prominent buttons
- `disabled` - Inactive state

**Features:**
- Click handlers
- Icon support
- Dynamic text updates
- Enable/disable states
- Variant switching

**Usage:**

```javascript
import { Button, createPrimaryButton } from './scripts/components/Button.js';

// Using the class
const button = new Button({
  text: 'Start Game',
  variant: 'accent',
  onClick: () => startGame(),
  icon: '▶'
});
button.mount('#container');

// Using factory functions
const primaryBtn = createPrimaryButton('Continue', handleContinue);
const secondaryBtn = createSecondaryButton('Back', goBack);
const accentBtn = createAccentButton('Next Puzzle', nextPuzzle);
```

**Methods:**
- `setText(newText)` - Update button text
- `setDisabled(boolean)` - Enable/disable button
- `setVariant(variant)` - Change button style

---

### 3. Panel Component

Modal overlay system for dialogs and notifications.

**Features:**
- Overlay background
- Optional close button
- Custom content (HTML or elements)
- Button groups
- Click-outside-to-close
- Open/close callbacks

**Usage:**

```javascript
import { Panel, createPanel } from './scripts/components/Panel.js';

const winPanel = new Panel({
  title: 'Puzzle Complete!',
  content: '<p>Congratulations! You found all the words.</p>',
  showCloseButton: true,
  closeOnOverlayClick: true,
  buttons: [
    {
      text: 'Next Puzzle',
      variant: 'accent',
      onClick: () => {
        winPanel.close();
        loadNextPuzzle();
      }
    },
    {
      text: 'Return to Library',
      variant: 'secondary',
      onClick: () => {
        winPanel.close();
        navigateToLibrary();
      }
    }
  ],
  state: {
    onOpen: () => console.log('Panel opened'),
    onClose: () => console.log('Panel closed')
  }
});

winPanel.mount(document.body);
winPanel.open(); // Show the panel
```

**Methods:**
- `open()` - Show panel with overlay
- `close()` - Hide panel and overlay
- `setContent(content)` - Update panel content
- `setTitle(title)` - Update panel title

---

### 4. Screen Component

Full-screen view management with navigation system.

**Features:**
- Screen activation/deactivation
- Navigation history
- Enter/exit callbacks
- Dynamic content management
- Screen transitions

**Usage:**

```javascript
import { Screen, ScreenManager, createScreen } from './scripts/components/Screen.js';

// Create screens
const titleScreen = new Screen({
  id: 'title-screen',
  title: 'Chronicles of the Kethaneum',
  content: titleContent,
  onEnter: (screen) => {
    console.log('Entered title screen');
    playMusic('title-theme');
  },
  onExit: (screen) => {
    console.log('Left title screen');
    stopMusic();
  }
});

const gameScreen = new Screen({
  id: 'game-screen',
  title: 'Puzzle',
  content: gameContent
});

// Set up navigation
const screenManager = new ScreenManager();
screenManager
  .addScreen('title', titleScreen)
  .addScreen('game', gameScreen);

// Mount screens
titleScreen.mount('#app');
gameScreen.mount('#app');

// Navigate
screenManager.navigateTo('title');
screenManager.navigateTo('game');
screenManager.goBack(); // Returns to title
```

**Screen Methods:**
- `activate()` - Show screen
- `deactivate()` - Hide screen
- `addContent(content)` - Add content to screen
- `clearContent()` - Remove all content

**ScreenManager Methods:**
- `addScreen(name, screen)` - Register a screen
- `navigateTo(screenName)` - Navigate to screen
- `goBack()` - Return to previous screen
- `getCurrentScreen()` - Get active screen

---

### 5. Card Component

Flexible card layout for displaying structured content.

**Variants:**
- Basic card
- `GenreCard` - Specialized for genre selection with badges

**Features:**
- Title, description, image, footer
- Click handlers
- Glow effects
- Dynamic updates
- Badge support (GenreCard)

**Usage:**

```javascript
import { Card, GenreCard, createCard } from './scripts/components/Card.js';

// Basic card
const card = new Card({
  title: 'Mystery Novel',
  description: 'A thrilling detective story set in Victorian London.',
  image: '/images/mystery.jpg',
  footer: 'Difficulty: Medium',
  onClick: () => selectBook('mystery-1')
});
card.mount('#book-list');

// Genre card with count
const genreCard = new GenreCard({
  genre: 'Mystery',
  title: 'Mystery',
  description: 'Unravel the clues',
  count: 12, // Number of puzzles
  onClick: () => selectGenre('mystery')
});
genreCard.mount('#genre-list');

// Add visual feedback
genreCard.addGlow();
setTimeout(() => genreCard.removeGlow(), 1000);
```

**Methods:**
- `setTitle(title)` - Update title
- `setDescription(desc)` - Update description
- `setImage(url)` - Update image
- `addGlow()` - Add glow effect
- `removeGlow()` - Remove glow effect
- `setCount(count)` - Update badge count (GenreCard only)

---

### 6. Container Components

Layout containers for organizing UI elements.

**Types:**
- `Container` - Generic container
- `FlexContainer` - Flexbox layout
- `GridContainer` - CSS Grid layout

**Usage:**

```javascript
import { FlexContainer, GridContainer } from './scripts/components/Container.js';
import { Button } from './scripts/components/Button.js';

// Flex container (horizontal button group)
const buttonGroup = new FlexContainer({
  direction: 'row',
  gap: '1rem',
  align: 'center',
  justify: 'center'
});

buttonGroup
  .addChild(new Button({ text: 'Pause' }))
  .addChild(new Button({ text: 'Restart' }))
  .addChild(new Button({ text: 'Exit' }))
  .mount('#controls');

// Grid container (card grid)
const cardGrid = new GridContainer({
  columns: 3,
  gap: '1.5rem'
});

genreList.forEach(genre => {
  const card = new GenreCard({
    genre: genre.name,
    count: genre.puzzleCount,
    onClick: () => selectGenre(genre)
  });
  cardGrid.addChild(card);
});

cardGrid.mount('#genres');
```

**FlexContainer Methods:**
- `setDirection(direction)` - Change flex direction
- `setAlign(align)` - Change alignment
- `setJustify(justify)` - Change justification

**GridContainer Methods:**
- `setColumns(columns)` - Change column count
- `setRows(rows)` - Change row count

---

### 7. List Component

Dynamic list rendering with custom item rendering.

**Variants:**
- Basic `List`
- `WordList` - Specialized for word search with found/unfound states

**Features:**
- Custom item rendering
- Click handlers
- Add/remove/update items
- Filtering
- Mark items (WordList)

**Usage:**

```javascript
import { List, WordList, createWordList } from './scripts/components/List.js';

// Basic list
const progressList = new List({
  items: [
    { text: 'Chapter 1: The Mystery Begins', classes: 'completed' },
    { text: 'Chapter 2: Following Clues', classes: 'in-progress' },
    { text: 'Chapter 3: The Revelation', classes: 'locked' }
  ],
  itemRenderer: (item) => {
    return `<span class="${item.classes}">${item.text}</span>`;
  },
  onItemClick: (item) => console.log('Selected:', item.text)
});
progressList.mount('#progress');

// Word list for puzzle
const words = ['MYSTERY', 'CLUE', 'DETECTIVE', 'SUSPECT', 'ALIBI'];
const wordList = new WordList({
  items: words
});
wordList.mount('#word-list');

// Mark words as found
wordList.markWordFound('CLUE');
wordList.markWordFound('DETECTIVE');

// Check if puzzle complete
if (wordList.areAllWordsFound()) {
  showWinPanel();
}
```

**List Methods:**
- `addItem(item)` - Add item to list
- `removeItem(index)` - Remove item by index
- `updateItem(index, item)` - Update an item
- `clearItems()` - Remove all items
- `setItems(items)` - Replace all items
- `filter(predicate)` - Filter visible items
- `showAll()` - Show all items

**WordList Methods:**
- `markWordFound(word)` - Mark word as found
- `areAllWordsFound()` - Check completion

---

## 🎨 Visual Style Guide

### Button Variants

```
┌─────────────────┐
│ Primary Button  │  - Main actions (blue-purple)
└─────────────────┘

┌─────────────────┐
│Secondary Button │  - Alternative actions (gray)
└─────────────────┘

┌─────────────────┐
│ Accent Button   │  - Highlighted actions (gold)
└─────────────────┘

┌────────────────────┐
│  Large Button      │  - Prominent CTAs (bigger)
└────────────────────┘

┌─────────────────┐
│ Disabled Button │  - Inactive (grayed out)
└─────────────────┘
```

### Card Layouts

```
┌──────────────────────┐
│  [Image Area]        │
├──────────────────────┤
│  Card Title          │
│  Card description    │
│  goes here...        │
├──────────────────────┤
│  Footer info         │
└──────────────────────┘
```

### Panel Structure

```
╔════════════════════════════════╗
║ Panel Title               [×]  ║
╟────────────────────────────────╢
║                                ║
║  Panel content goes here...    ║
║                                ║
╟────────────────────────────────╢
║          [Cancel] [Confirm]    ║
╚════════════════════════════════╝
```

---

## 🚀 Quick Start Example

Here's a complete example creating a simple game screen:

```javascript
import {
  Screen,
  ScreenManager,
  Panel,
  FlexContainer,
  GridContainer,
  GenreCard,
  createAccentButton,
  createSecondaryButton
} from './scripts/components/index.js';

// Initialize screen manager
const screenManager = new ScreenManager();

// Create title screen
const titleScreen = new Screen({
  id: 'title',
  title: 'Chronicles of the Kethaneum'
});

// Add buttons to title screen
const buttonContainer = new FlexContainer({
  direction: 'column',
  gap: '1rem',
  align: 'center'
});

buttonContainer.addChild(
  createAccentButton('New Game', () => screenManager.navigateTo('genre-select'))
);
buttonContainer.addChild(
  createSecondaryButton('Continue', () => loadSavedGame())
);

titleScreen.addContent(buttonContainer.render());

// Create genre selection screen
const genreScreen = new Screen({
  id: 'genre-select',
  title: 'Choose Your Genre'
});

const genreGrid = new GridContainer({
  columns: 3,
  gap: '1.5rem'
});

const genres = [
  { name: 'Mystery', count: 12 },
  { name: 'Fantasy', count: 8 },
  { name: 'Sci-Fi', count: 10 }
];

genres.forEach(genre => {
  const card = new GenreCard({
    genre: genre.name,
    title: genre.name,
    count: genre.count,
    onClick: () => startPuzzle(genre.name)
  });
  genreGrid.addChild(card);
});

genreScreen.addContent(genreGrid.render());

// Create completion panel
const completePanel = new Panel({
  title: 'Puzzle Complete!',
  content: 'You found all the words! Ready for the next challenge?',
  buttons: [
    {
      text: 'Next Puzzle',
      variant: 'accent',
      onClick: () => {
        completePanel.close();
        loadNextPuzzle();
      }
    }
  ]
});

// Mount everything
titleScreen.mount('#app');
genreScreen.mount('#app');
completePanel.mount(document.body);

// Set up navigation
screenManager
  .addScreen('title', titleScreen)
  .addScreen('genre-select', genreScreen);

// Start on title screen
screenManager.navigateTo('title');
```

---

## 📁 File Structure

```
scripts/
└── components/
    ├── BaseComponent.js      - Base class for all components
    ├── Button.js             - Button component + factories
    ├── Panel.js              - Modal panel component
    ├── Screen.js             - Screen + ScreenManager
    ├── Card.js               - Card + GenreCard
    ├── Container.js          - Container + Flex + Grid
    ├── List.js               - List + WordList
    └── index.js              - Main export file

styles/
└── component-library.css     - Component styles

component-library-demo.html   - Interactive demo page
```

---

## 🎯 Design Principles

1. **Modular** - Each component is self-contained
2. **Reusable** - Components work across different games
3. **Extensible** - Easy to create custom components
4. **Consistent** - Uses existing CSS variables
5. **Lifecycle** - Proper mounting, updating, and cleanup
6. **Chainable** - Methods return `this` for chaining
7. **Type-safe** - Clear parameter expectations

---

## 🔄 Component Lifecycle

All components follow this lifecycle:

1. **Create** - `new Component(config)`
2. **Render** - `render()` creates DOM element
3. **Mount** - `mount(parent)` adds to DOM
4. **Update** - Methods like `setText()`, `setState()`
5. **Unmount** - `unmount()` removes from DOM
6. **Destroy** - `destroy()` complete cleanup

---

## 🎮 Integration with Existing Code

### Migrating Existing UI

**Before (direct HTML manipulation):**
```javascript
const button = document.getElementById('start-btn');
button.addEventListener('click', startGame);
```

**After (component-based):**
```javascript
import { createAccentButton } from './scripts/components/Button.js';

const startButton = createAccentButton('Start Game', startGame);
startButton.mount('#button-container');
```

### Using with Existing Panels

You can gradually migrate by using components alongside your existing `panelManager.js`:

```javascript
import { Panel } from './scripts/components/Panel.js';
import { showWinPanel } from './ui/panelManager.js'; // Existing

// Use new component for new features
const customPanel = new Panel({...});

// Keep using old system where it works
showWinPanel('Great job!');
```

---

## 🌟 Benefits

### For Development
- **Faster UI creation** - Build screens in minutes
- **Less boilerplate** - No repetitive DOM manipulation
- **Type safety** - Clear component APIs
- **Easy testing** - Components are isolated

### For Content Creation
- **Swap themes easily** - Change game themes without code changes
- **Reuse across games** - Same components, different content
- **Modular content** - Add/remove features easily
- **Rapid prototyping** - Test ideas quickly

---

## 📝 Next Steps

1. ✅ Component library created
2. Try the demo: Open `component-library-demo.html`
3. Integrate components into your game
4. Create custom components as needed
5. Build new game screens using the library

---

## 🤝 Contributing

To add a new component:

1. Extend `BaseComponent`
2. Implement `createElement()`
3. Add specific methods for your component
4. Export from `index.js`
5. Add styles to `component-library.css`
6. Update this documentation

---

## 📚 Resources

- Demo page: `component-library-demo.html`
- Existing CSS variables: `styles/cssVariables.css`
- Base styles: `styles/baseCSS.css`

**Happy building! 🎮✨**

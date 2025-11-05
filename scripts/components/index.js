/**
 * Component Library Index
 * Central export point for all reusable UI components
 */

// Base Component
export { BaseComponent } from './BaseComponent.js';

// Core Components
export {
  Button,
  createPrimaryButton,
  createSecondaryButton,
  createAccentButton,
  createLargeButton
} from './Button.js';

export {
  Panel,
  createPanel,
  createInlinePanel
} from './Panel.js';

export {
  Screen,
  ScreenManager,
  createScreen
} from './Screen.js';

export {
  Card,
  GenreCard,
  createCard,
  createGenreCard
} from './Card.js';

export {
  Container,
  FlexContainer,
  GridContainer,
  createContainer,
  createFlexContainer,
  createGridContainer
} from './Container.js';

export {
  List,
  WordList,
  createList,
  createWordList
} from './List.js';

/**
 * Component library version
 */
export const VERSION = '1.0.0';

/**
 * Initialize the component library
 */
export function initComponentLibrary(config = {}) {
  console.log(`🎨 Component Library v${VERSION} initialized`);

  if (config.debug) {
    console.log('📦 Available components:', {
      BaseComponent: 'Base class for all components',
      Button: 'Interactive button with variants',
      Panel: 'Modal/overlay panel',
      Screen: 'Full-screen view component',
      Card: 'Content card component',
      Container: 'Layout container (flex/grid)',
      List: 'Ordered/unordered list component'
    });
  }

  return true;
}

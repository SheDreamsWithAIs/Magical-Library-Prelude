/**
 * Screen.js
 * Full-screen view component for navigation system
 */

import { BaseComponent } from './BaseComponent.js';

export class Screen extends BaseComponent {
  constructor(config = {}) {
    super(config);

    this.title = config.title || '';
    this.content = config.content || null;
    this.onEnter = config.onEnter || (() => {});
    this.onExit = config.onExit || (() => {});

    this.classes.push('screen');
  }

  createElement() {
    const screen = document.createElement('div');

    // Add title if provided
    if (this.title) {
      const titleElement = document.createElement('h1');
      titleElement.classList.add('screen-title');
      titleElement.textContent = this.title;
      screen.appendChild(titleElement);
    }

    // Add content container
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('screen-content');

    if (typeof this.content === 'string') {
      contentContainer.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      contentContainer.appendChild(this.content);
    } else if (this.content instanceof BaseComponent) {
      contentContainer.appendChild(this.content.render());
    }

    screen.appendChild(contentContainer);

    return screen;
  }

  /**
   * Activate/show this screen
   */
  activate() {
    this.element?.classList.add('active');
    this.onEnter(this);
    return this;
  }

  /**
   * Deactivate/hide this screen
   */
  deactivate() {
    this.element?.classList.remove('active');
    this.onExit(this);
    return this;
  }

  /**
   * Add content to the screen
   */
  addContent(content) {
    if (!this.element) return this;

    const contentContainer = this.element.querySelector('.screen-content');
    if (!contentContainer) return this;

    if (typeof content === 'string') {
      const div = document.createElement('div');
      div.innerHTML = content;
      contentContainer.appendChild(div);
    } else if (content instanceof HTMLElement) {
      contentContainer.appendChild(content);
    } else if (content instanceof BaseComponent) {
      contentContainer.appendChild(content.render());
    }

    return this;
  }

  /**
   * Clear all content from the screen
   */
  clearContent() {
    if (this.element) {
      const contentContainer = this.element.querySelector('.screen-content');
      if (contentContainer) {
        contentContainer.innerHTML = '';
      }
    }
    return this;
  }
}

/**
 * ScreenManager - Manages navigation between screens
 */
export class ScreenManager {
  constructor() {
    this.screens = new Map();
    this.currentScreen = null;
    this.history = [];
  }

  /**
   * Register a screen
   */
  addScreen(name, screen) {
    this.screens.set(name, screen);
    return this;
  }

  /**
   * Navigate to a screen by name
   */
  navigateTo(screenName, addToHistory = true) {
    const screen = this.screens.get(screenName);

    if (!screen) {
      console.error(`Screen "${screenName}" not found`);
      return this;
    }

    // Deactivate current screen
    if (this.currentScreen) {
      this.currentScreen.deactivate();

      if (addToHistory) {
        this.history.push(this.currentScreen);
      }
    }

    // Activate new screen
    screen.activate();
    this.currentScreen = screen;

    return this;
  }

  /**
   * Go back to previous screen
   */
  goBack() {
    if (this.history.length > 0) {
      const previousScreen = this.history.pop();

      if (this.currentScreen) {
        this.currentScreen.deactivate();
      }

      previousScreen.activate();
      this.currentScreen = previousScreen;
    }

    return this;
  }

  /**
   * Get the current active screen
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Check if a screen exists
   */
  hasScreen(screenName) {
    return this.screens.has(screenName);
  }
}

/**
 * Factory function for creating screens
 */
export function createScreen(title, content, config = {}) {
  return new Screen({
    ...config,
    title,
    content
  });
}

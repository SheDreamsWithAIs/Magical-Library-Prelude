/**
 * List.js
 * Reusable list component for displaying ordered/unordered lists
 */

import { BaseComponent } from './BaseComponent.js';

export class List extends BaseComponent {
  constructor(config = {}) {
    super(config);

    this.items = config.items || [];
    this.ordered = config.ordered || false;
    this.itemRenderer = config.itemRenderer || null;
    this.onItemClick = config.onItemClick || null;

    this.classes.push('list');

    if (config.variant) {
      this.classes.push(`list-${config.variant}`);
    }
  }

  createElement() {
    const list = document.createElement(this.ordered ? 'ol' : 'ul');

    this.items.forEach((item, index) => {
      const li = this.createListItem(item, index);
      list.appendChild(li);
    });

    return list;
  }

  /**
   * Create a single list item
   */
  createListItem(item, index) {
    const li = document.createElement('li');

    // Use custom renderer if provided
    if (this.itemRenderer) {
      const rendered = this.itemRenderer(item, index);

      if (typeof rendered === 'string') {
        li.innerHTML = rendered;
      } else if (rendered instanceof HTMLElement) {
        li.appendChild(rendered);
      } else if (rendered instanceof BaseComponent) {
        li.appendChild(rendered.render());
      }
    } else {
      // Default rendering
      if (typeof item === 'string') {
        li.textContent = item;
      } else if (item instanceof HTMLElement) {
        li.appendChild(item);
      } else if (item.text) {
        li.textContent = item.text;

        // Apply classes if provided
        if (item.classes) {
          li.classList.add(...(Array.isArray(item.classes) ? item.classes : [item.classes]));
        }
      }
    }

    // Add click handler if provided
    if (this.onItemClick) {
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => this.onItemClick(item, index));
    }

    // Store reference to item data
    li.dataset.index = index;

    return li;
  }

  /**
   * Add an item to the list
   */
  addItem(item) {
    this.items.push(item);

    if (this.element) {
      const li = this.createListItem(item, this.items.length - 1);
      this.element.appendChild(li);
    }

    return this;
  }

  /**
   * Remove an item from the list by index
   */
  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);

      if (this.element) {
        const li = this.element.querySelector(`li[data-index="${index}"]`);
        if (li) {
          li.remove();
        }

        // Update remaining indices
        this.element.querySelectorAll('li').forEach((li, i) => {
          li.dataset.index = i;
        });
      }
    }

    return this;
  }

  /**
   * Update an item in the list
   */
  updateItem(index, newItem) {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = newItem;

      if (this.element) {
        const li = this.element.querySelector(`li[data-index="${index}"]`);
        if (li) {
          const newLi = this.createListItem(newItem, index);
          li.replaceWith(newLi);
        }
      }
    }

    return this;
  }

  /**
   * Clear all items from the list
   */
  clearItems() {
    this.items = [];

    if (this.element) {
      this.element.innerHTML = '';
    }

    return this;
  }

  /**
   * Set all items (replaces existing)
   */
  setItems(items) {
    this.items = items;

    if (this.element) {
      this.element.innerHTML = '';
      items.forEach((item, index) => {
        const li = this.createListItem(item, index);
        this.element.appendChild(li);
      });
    }

    return this;
  }

  /**
   * Get all items
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Filter list items visually (doesn't modify items array)
   */
  filter(predicate) {
    if (this.element) {
      const listItems = this.element.querySelectorAll('li');

      listItems.forEach((li, index) => {
        const item = this.items[index];
        const shouldShow = predicate(item, index);
        li.style.display = shouldShow ? '' : 'none';
      });
    }

    return this;
  }

  /**
   * Show all items
   */
  showAll() {
    if (this.element) {
      this.element.querySelectorAll('li').forEach(li => {
        li.style.display = '';
      });
    }

    return this;
  }
}

/**
 * WordList - Specialized list for word search words
 */
export class WordList extends List {
  constructor(config = {}) {
    super({
      ...config,
      variant: 'word-list'
    });
  }

  /**
   * Mark a word as found
   */
  markWordFound(word) {
    const index = this.items.findIndex(item =>
      (typeof item === 'string' ? item : item.word) === word
    );

    if (index >= 0 && this.element) {
      const li = this.element.querySelector(`li[data-index="${index}"]`);
      if (li) {
        li.classList.add('found');
      }
    }

    return this;
  }

  /**
   * Check if all words are found
   */
  areAllWordsFound() {
    if (!this.element) return false;

    const listItems = this.element.querySelectorAll('li');
    const foundItems = this.element.querySelectorAll('li.found');

    return listItems.length > 0 && listItems.length === foundItems.length;
  }
}

/**
 * Factory functions for creating lists
 */
export function createList(items, config = {}) {
  return new List({
    ...config,
    items
  });
}

export function createWordList(words, config = {}) {
  return new WordList({
    ...config,
    items: words
  });
}

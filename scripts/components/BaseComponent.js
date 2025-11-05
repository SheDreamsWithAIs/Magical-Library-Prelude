/**
 * BaseComponent.js
 * Base class for all UI components in the game engine.
 * Provides common lifecycle methods and event handling.
 */

export class BaseComponent {
  constructor(config = {}) {
    this.id = config.id || this.generateId();
    this.classes = config.classes || [];
    this.element = null;
    this.children = [];
    this.eventHandlers = new Map();
    this.mounted = false;
    this.state = config.state || {};
  }

  /**
   * Generate a unique ID for the component
   */
  generateId() {
    return `component-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create the DOM element (to be implemented by subclasses)
   */
  createElement() {
    throw new Error('createElement() must be implemented by subclass');
  }

  /**
   * Render the component and return the DOM element
   */
  render() {
    if (!this.element) {
      this.element = this.createElement();
      this.element.id = this.id;

      // Apply classes
      if (this.classes.length > 0) {
        this.element.classList.add(...this.classes);
      }

      // Attach event handlers
      this.attachEventHandlers();
    }

    return this.element;
  }

  /**
   * Mount the component to a parent element
   */
  mount(parent) {
    if (!this.element) {
      this.render();
    }

    if (typeof parent === 'string') {
      parent = document.getElementById(parent) || document.querySelector(parent);
    }

    if (parent && this.element) {
      parent.appendChild(this.element);
      this.mounted = true;
      this.onMount();
    }

    return this;
  }

  /**
   * Unmount the component from the DOM
   */
  unmount() {
    if (this.element && this.element.parentNode) {
      this.onUnmount();
      this.element.parentNode.removeChild(this.element);
      this.mounted = false;
    }

    return this;
  }

  /**
   * Update component state and re-render if needed
   */
  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.onStateChange(oldState, this.state);
    return this;
  }

  /**
   * Add a child component
   */
  addChild(component) {
    this.children.push(component);
    if (this.element && component.element) {
      this.element.appendChild(component.render());
    }
    return this;
  }

  /**
   * Remove a child component
   */
  removeChild(component) {
    const index = this.children.indexOf(component);
    if (index > -1) {
      this.children.splice(index, 1);
      component.unmount();
    }
    return this;
  }

  /**
   * Add an event listener to the component
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);

    if (this.element) {
      this.element.addEventListener(event, handler);
    }

    return this;
  }

  /**
   * Remove an event listener from the component
   */
  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }

    if (this.element) {
      this.element.removeEventListener(event, handler);
    }

    return this;
  }

  /**
   * Attach all event handlers to the element
   */
  attachEventHandlers() {
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.element.addEventListener(event, handler);
      });
    });
  }

  /**
   * Show the component
   */
  show() {
    if (this.element) {
      this.element.style.display = '';
      this.element.classList.add('active');
    }
    return this;
  }

  /**
   * Hide the component
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.element.classList.remove('active');
    }
    return this;
  }

  /**
   * Toggle component visibility
   */
  toggle() {
    if (this.element) {
      const isHidden = this.element.style.display === 'none';
      return isHidden ? this.show() : this.hide();
    }
    return this;
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    // Remove all children
    this.children.forEach(child => child.destroy());
    this.children = [];

    // Remove all event listeners
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        if (this.element) {
          this.element.removeEventListener(event, handler);
        }
      });
    });
    this.eventHandlers.clear();

    // Remove from DOM
    this.unmount();

    // Clear references
    this.element = null;
    this.mounted = false;
  }

  // Lifecycle hooks (to be overridden by subclasses)

  /**
   * Called after the component is mounted to the DOM
   */
  onMount() {}

  /**
   * Called before the component is unmounted from the DOM
   */
  onUnmount() {}

  /**
   * Called when the component state changes
   */
  onStateChange(oldState, newState) {}
}

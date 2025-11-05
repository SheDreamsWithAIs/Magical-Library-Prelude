/**
 * Container.js
 * Layout container components for organizing UI elements
 */

import { BaseComponent } from './BaseComponent.js';

/**
 * Generic container component
 */
export class Container extends BaseComponent {
  constructor(config = {}) {
    super(config);

    this.layout = config.layout || 'block'; // block, flex, grid
    this.direction = config.direction || 'row'; // row, column (for flex)
    this.gap = config.gap || null;
    this.padding = config.padding || null;
    this.align = config.align || null;
    this.justify = config.justify || null;

    this.classes.push('container');

    if (config.variant) {
      this.classes.push(`container-${config.variant}`);
    }
  }

  createElement() {
    const container = document.createElement('div');

    // Apply layout styles
    if (this.layout === 'flex') {
      container.style.display = 'flex';
      container.style.flexDirection = this.direction;

      if (this.align) {
        container.style.alignItems = this.align;
      }

      if (this.justify) {
        container.style.justifyContent = this.justify;
      }
    } else if (this.layout === 'grid') {
      container.style.display = 'grid';
    }

    if (this.gap) {
      container.style.gap = this.gap;
    }

    if (this.padding) {
      container.style.padding = this.padding;
    }

    // Render all children that were added before createElement was called
    this.children.forEach(child => {
      container.appendChild(child.render());
    });

    return container;
  }

  /**
   * Add multiple children at once
   */
  addChildren(components) {
    components.forEach(component => this.addChild(component));
    return this;
  }

  /**
   * Clear all children
   */
  clearChildren() {
    this.children.forEach(child => child.destroy());
    this.children = [];

    if (this.element) {
      this.element.innerHTML = '';
    }

    return this;
  }
}

/**
 * FlexContainer - Specialized flex layout container
 */
export class FlexContainer extends Container {
  constructor(config = {}) {
    super({
      ...config,
      layout: 'flex'
    });
  }

  /**
   * Set flex direction
   */
  setDirection(direction) {
    this.direction = direction;
    if (this.element) {
      this.element.style.flexDirection = direction;
    }
    return this;
  }

  /**
   * Set alignment
   */
  setAlign(align) {
    this.align = align;
    if (this.element) {
      this.element.style.alignItems = align;
    }
    return this;
  }

  /**
   * Set justification
   */
  setJustify(justify) {
    this.justify = justify;
    if (this.element) {
      this.element.style.justifyContent = justify;
    }
    return this;
  }
}

/**
 * GridContainer - Specialized grid layout container
 */
export class GridContainer extends Container {
  constructor(config = {}) {
    super({
      ...config,
      layout: 'grid'
    });

    this.columns = config.columns || 'auto';
    this.rows = config.rows || 'auto';
  }

  createElement() {
    const container = document.createElement('div');

    // Apply base layout styles
    container.style.display = 'grid';

    if (this.gap) {
      container.style.gap = this.gap;
    }

    if (this.padding) {
      container.style.padding = this.padding;
    }

    if (this.columns) {
      container.style.gridTemplateColumns =
        typeof this.columns === 'number'
          ? `repeat(${this.columns}, 1fr)`
          : this.columns;
    }

    if (this.rows) {
      container.style.gridTemplateRows =
        typeof this.rows === 'number'
          ? `repeat(${this.rows}, 1fr)`
          : this.rows;
    }

    // Render all children that were added before createElement was called
    this.children.forEach(child => {
      container.appendChild(child.render());
    });

    return container;
  }

  /**
   * Set number of columns
   */
  setColumns(columns) {
    this.columns = columns;
    if (this.element) {
      this.element.style.gridTemplateColumns =
        typeof columns === 'number'
          ? `repeat(${columns}, 1fr)`
          : columns;
    }
    return this;
  }

  /**
   * Set number of rows
   */
  setRows(rows) {
    this.rows = rows;
    if (this.element) {
      this.element.style.gridTemplateRows =
        typeof rows === 'number'
          ? `repeat(${rows}, 1fr)`
          : rows;
    }
    return this;
  }
}

/**
 * Factory functions for creating containers
 */
export function createContainer(config = {}) {
  return new Container(config);
}

export function createFlexContainer(direction = 'row', config = {}) {
  return new FlexContainer({
    ...config,
    direction
  });
}

export function createGridContainer(columns, config = {}) {
  return new GridContainer({
    ...config,
    columns
  });
}

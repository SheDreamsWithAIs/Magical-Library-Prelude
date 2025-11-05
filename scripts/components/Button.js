/**
 * Button.js
 * Reusable button component with multiple style variants
 */

import { BaseComponent } from './BaseComponent.js';

export class Button extends BaseComponent {
  constructor(config = {}) {
    super(config);

    this.text = config.text || '';
    this.onClick = config.onClick || (() => {});
    this.variant = config.variant || 'primary'; // primary, secondary, accent, large
    this.disabled = config.disabled || false;
    this.icon = config.icon || null;

    // Add variant class
    if (this.variant) {
      this.classes.push(this.variant);
    }

    if (this.disabled) {
      this.classes.push('disabled');
    }
  }

  createElement() {
    const button = document.createElement('button');

    // Add icon if provided
    if (this.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.classList.add('button-icon');
      iconSpan.textContent = this.icon;
      button.appendChild(iconSpan);
    }

    // Add text
    const textSpan = document.createElement('span');
    textSpan.classList.add('button-text');
    textSpan.textContent = this.text;
    button.appendChild(textSpan);

    // Set disabled state
    button.disabled = this.disabled;

    // Add click handler
    button.addEventListener('click', (e) => {
      if (!this.disabled) {
        this.onClick(e);
      }
    });

    return button;
  }

  /**
   * Update button text
   */
  setText(newText) {
    this.text = newText;
    if (this.element) {
      const textSpan = this.element.querySelector('.button-text');
      if (textSpan) {
        textSpan.textContent = newText;
      }
    }
    return this;
  }

  /**
   * Enable/disable the button
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.element) {
      this.element.disabled = disabled;

      if (disabled) {
        this.element.classList.add('disabled');
      } else {
        this.element.classList.remove('disabled');
      }
    }
    return this;
  }

  /**
   * Change button variant
   */
  setVariant(variant) {
    if (this.element) {
      // Remove old variant class
      this.element.classList.remove(this.variant);
      // Add new variant class
      this.element.classList.add(variant);
    }
    this.variant = variant;
    return this;
  }
}

/**
 * Factory functions for common button types
 */

export function createPrimaryButton(text, onClick, config = {}) {
  return new Button({
    ...config,
    text,
    onClick,
    variant: 'primary'
  });
}

export function createSecondaryButton(text, onClick, config = {}) {
  return new Button({
    ...config,
    text,
    onClick,
    variant: 'secondary'
  });
}

export function createAccentButton(text, onClick, config = {}) {
  return new Button({
    ...config,
    text,
    onClick,
    variant: 'accent'
  });
}

export function createLargeButton(text, onClick, config = {}) {
  return new Button({
    ...config,
    text,
    onClick,
    variant: 'large'
  });
}

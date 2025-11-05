/**
 * Panel.js
 * Reusable modal panel/overlay component
 */

import { BaseComponent } from './BaseComponent.js';
import { Button } from './Button.js';

export class Panel extends BaseComponent {
  constructor(config = {}) {
    super(config);

    this.title = config.title || '';
    this.content = config.content || '';
    this.inline = config.inline || false; // New: inline mode (no overlay)
    this.showCloseButton = config.showCloseButton !== false;
    this.closeOnOverlayClick = config.closeOnOverlayClick !== false;
    this.buttons = config.buttons || [];
    this.overlay = null;

    this.classes.push('panel');

    // Add inline class if in inline mode
    if (this.inline) {
      this.classes.push('panel-inline');
    }
  }

  createElement() {
    const panel = document.createElement('div');

    // Create panel content container
    const panelContent = document.createElement('div');
    panelContent.classList.add('panel-content');

    // Add title if provided
    if (this.title) {
      const titleElement = document.createElement('div');
      titleElement.classList.add('panel-title');
      titleElement.textContent = this.title;
      panelContent.appendChild(titleElement);
    }

    // Add close button if enabled (only for modal mode)
    if (this.showCloseButton && !this.inline) {
      const closeBtn = document.createElement('button');
      closeBtn.classList.add('panel-close');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => this.close());
      panelContent.appendChild(closeBtn);
    }

    // Add content
    const contentElement = document.createElement('div');
    contentElement.classList.add('panel-body');

    if (typeof this.content === 'string') {
      contentElement.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      contentElement.appendChild(this.content);
    }

    panelContent.appendChild(contentElement);

    // Add button group if buttons provided
    if (this.buttons.length > 0) {
      const buttonGroup = document.createElement('div');
      buttonGroup.classList.add('panel-buttons');

      this.buttons.forEach(buttonConfig => {
        const button = new Button(buttonConfig);
        buttonGroup.appendChild(button.render());
      });

      panelContent.appendChild(buttonGroup);
    }

    panel.appendChild(panelContent);

    // Initially hidden for modal mode, visible for inline mode
    if (!this.inline) {
      panel.style.display = 'none';
    }

    return panel;
  }

  /**
   * Create overlay element
   */
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.classList.add('panel-overlay');
    overlay.style.display = 'none';

    if (this.closeOnOverlayClick) {
      overlay.addEventListener('click', () => this.close());
    }

    return overlay;
  }

  /**
   * Show the panel
   */
  open() {
    // Inline panels don't need overlay
    if (!this.inline) {
      // Create and show overlay if it doesn't exist
      if (!this.overlay) {
        this.overlay = this.createOverlay();
        document.body.appendChild(this.overlay);
      }

      this.overlay.style.display = 'block';
    }

    // Show panel
    this.show();

    // Trigger onOpen callback if provided
    if (this.state.onOpen) {
      this.state.onOpen();
    }

    return this;
  }

  /**
   * Close/hide the panel
   */
  close() {
    // Hide overlay
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }

    // Hide panel
    this.hide();

    // Trigger onClose callback if provided
    if (this.state.onClose) {
      this.state.onClose();
    }

    return this;
  }

  /**
   * Update panel content
   */
  setContent(content) {
    this.content = content;
    if (this.element) {
      const contentElement = this.element.querySelector('.panel-body');
      if (contentElement) {
        if (typeof content === 'string') {
          contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          contentElement.innerHTML = '';
          contentElement.appendChild(content);
        }
      }
    }
    return this;
  }

  /**
   * Update panel title
   */
  setTitle(title) {
    this.title = title;
    if (this.element) {
      const titleElement = this.element.querySelector('.panel-title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
    return this;
  }

  /**
   * Clean up when destroying
   */
  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    super.destroy();
  }
}

/**
 * Factory function for creating modal panels
 */
export function createPanel(title, content, buttons = [], config = {}) {
  return new Panel({
    ...config,
    title,
    content,
    buttons
  });
}

/**
 * Factory function for creating inline content panels
 */
export function createInlinePanel(title, content, buttons = [], config = {}) {
  return new Panel({
    ...config,
    title,
    content,
    buttons,
    inline: true,
    showCloseButton: false
  });
}

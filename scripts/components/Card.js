/**
 * Card.js
 * Reusable card component for displaying content in a card format
 */

import { BaseComponent } from './BaseComponent.js';

export class Card extends BaseComponent {
  constructor(config = {}) {
    super(config);

    this.title = config.title || '';
    this.description = config.description || '';
    this.image = config.image || null;
    this.footer = config.footer || null;
    this.onClick = config.onClick || null;
    this.metadata = config.metadata || {};

    this.classes.push('card');

    if (config.variant) {
      this.classes.push(`card-${config.variant}`);
    }
  }

  createElement() {
    const card = document.createElement('div');

    // Add click handler if provided
    if (this.onClick) {
      card.classList.add('card-clickable');
      card.addEventListener('click', this.onClick);
      card.style.cursor = 'pointer';
    }

    // Add image if provided
    if (this.image) {
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('card-image');

      const img = document.createElement('img');
      img.src = this.image;
      img.alt = this.title || 'Card image';

      imageContainer.appendChild(img);
      card.appendChild(imageContainer);
    }

    // Add card content
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');

    // Add title
    if (this.title) {
      const titleElement = document.createElement('h3');
      titleElement.classList.add('card-title');
      titleElement.textContent = this.title;
      cardContent.appendChild(titleElement);
    }

    // Add description
    if (this.description) {
      const descElement = document.createElement('p');
      descElement.classList.add('card-description');

      if (typeof this.description === 'string') {
        descElement.textContent = this.description;
      } else if (this.description instanceof HTMLElement) {
        descElement.appendChild(this.description);
      }

      cardContent.appendChild(descElement);
    }

    card.appendChild(cardContent);

    // Add footer if provided
    if (this.footer) {
      const footerElement = document.createElement('div');
      footerElement.classList.add('card-footer');

      if (typeof this.footer === 'string') {
        footerElement.innerHTML = this.footer;
      } else if (this.footer instanceof HTMLElement) {
        footerElement.appendChild(this.footer);
      }

      card.appendChild(footerElement);
    }

    return card;
  }

  /**
   * Update card title
   */
  setTitle(title) {
    this.title = title;
    if (this.element) {
      const titleElement = this.element.querySelector('.card-title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
    return this;
  }

  /**
   * Update card description
   */
  setDescription(description) {
    this.description = description;
    if (this.element) {
      const descElement = this.element.querySelector('.card-description');
      if (descElement) {
        if (typeof description === 'string') {
          descElement.textContent = description;
        } else if (description instanceof HTMLElement) {
          descElement.innerHTML = '';
          descElement.appendChild(description);
        }
      }
    }
    return this;
  }

  /**
   * Update card image
   */
  setImage(imageUrl) {
    this.image = imageUrl;
    if (this.element) {
      const img = this.element.querySelector('.card-image img');
      if (img) {
        img.src = imageUrl;
      }
    }
    return this;
  }

  /**
   * Add a glow effect to the card
   */
  addGlow() {
    if (this.element) {
      this.element.classList.add('card-glow');
    }
    return this;
  }

  /**
   * Remove glow effect
   */
  removeGlow() {
    if (this.element) {
      this.element.classList.remove('card-glow');
    }
    return this;
  }
}

/**
 * GenreCard - Specialized card for genre selection
 */
export class GenreCard extends Card {
  constructor(config = {}) {
    super({
      ...config,
      variant: 'genre'
    });

    this.genre = config.genre || '';
    this.count = config.count || 0;
  }

  createElement() {
    const card = super.createElement();
    card.classList.add('genre-card');

    // Add count badge if count > 0
    if (this.count > 0) {
      const badge = document.createElement('span');
      badge.classList.add('card-badge');
      badge.textContent = this.count;
      card.appendChild(badge);
    }

    return card;
  }

  /**
   * Update the count badge
   */
  setCount(count) {
    this.count = count;
    if (this.element) {
      let badge = this.element.querySelector('.card-badge');

      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.classList.add('card-badge');
          this.element.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    }
    return this;
  }
}

/**
 * Factory functions for creating cards
 */
export function createCard(title, description, config = {}) {
  return new Card({
    ...config,
    title,
    description
  });
}

export function createGenreCard(genre, count, onClick, config = {}) {
  return new GenreCard({
    ...config,
    title: genre,
    genre,
    count,
    onClick
  });
}

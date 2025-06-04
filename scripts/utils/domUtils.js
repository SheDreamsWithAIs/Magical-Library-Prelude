/**
 * DOM utilities for Chronicles of the Kethaneum
 * This module provides DOM manipulation helper functions
 */

/**
 * Create an element with attributes and children
 * @param {string} tag - Element tag name
 * @param {Object} attributes - Element attributes
 * @param {Array|Node|string} children - Child elements or text content
 * @returns {HTMLElement} - Created element
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        for (const [dataKey, dataValue] of Object.entries(value)) {
          element.dataset[dataKey] = dataValue;
        }
      } else {
        element.setAttribute(key, value);
      }
    }
    
    // Add children
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Node) {
          element.appendChild(child);
        } else {
          element.appendChild(document.createTextNode(String(child)));
        }
      });
    } else if (children instanceof Node) {
      element.appendChild(children);
    } else {
      element.textContent = String(children);
    }
    
    return element;
  }
  
  /**
   * Clear all children from an element
   * @param {HTMLElement} element - Element to clear
   */
  function clearElement(element) {
    if (!element) return;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  /**
 * Check if an element is visible
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - Whether element is visible
 */
function isElementVisible(element) {
    if (!element) return false;
    
    // Check if element exists in DOM
    if (!document.body.contains(element)) return false;
    
    // Check display style
    const style = window.getComputedStyle(element);
    if (style.display === 'none') return false;
    if (style.visibility === 'hidden') return false;
    
    // Check if element has zero size
    if (element.offsetWidth === 0 && element.offsetHeight === 0) return false;
    
    // Check if any parent is hidden
    let parent = element.parentElement;
    while (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
        return false;
      }
      parent = parent.parentElement;
    }
    
    return true;
  }
  
  /**
   * Check if an element is in the viewport
   * @param {HTMLElement} element - Element to check
   * @param {number} offset - Optional offset from viewport edges
   * @returns {boolean} - Whether element is in viewport
   */
  function isElementInViewport(element, offset = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= 0 - offset &&
      rect.left >= 0 - offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  }
  
  /**
   * Add an event listener with automatic cleanup
   * @param {HTMLElement} element - Element to attach listener to
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {Function} - Function to remove the listener
   */
  function addCleanupEventListener(element, event, handler, options = {}) {
    if (!element) return () => {};
    
    element.addEventListener(event, handler, options);
    
    return () => {
      element.removeEventListener(event, handler, options);
    };
  }
  
  /**
   * Create a throttled version of a function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Throttle limit in milliseconds
   * @returns {Function} - Throttled function
   */
  function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * Create a debounced version of a function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Debounce delay in milliseconds
   * @returns {Function} - Debounced function
   */
  function debounce(func, delay) {
    let timeout;
    
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }
  
  /**
   * Get coordinates relative to an element
   * @param {Event} event - Mouse or touch event
   * @param {HTMLElement} element - Reference element
   * @returns {Object} - {x, y} coordinates
   */
  function getRelativeCoordinates(event, element) {
    const rect = element.getBoundingClientRect();
    let x, y;
    
    // Handle both mouse and touch events
    if (event.touches && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }
    
    return { x, y };
  }
  
  // Temporarily continue making functions available globally
  // These will be converted to proper exports once the module system is fully implemented
  window.createElement = createElement;
  window.clearElement = clearElement;
  window.isElementVisible = isElementVisible;
  window.isElementInViewport = isElementInViewport;
  window.addCleanupEventListener = addCleanupEventListener;
  window.throttle = throttle;
  window.debounce = debounce;
  window.getRelativeCoordinates = getRelativeCoordinates;
  
  // Export functions for module system
  export {
    createElement,
    clearElement,
    isElementVisible,
    isElementInViewport,
    addCleanupEventListener,
    throttle,
    debounce,
    getRelativeCoordinates
  };
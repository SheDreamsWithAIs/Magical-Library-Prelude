/**
 * Event System module for Chronicles of the Kethaneum
 * This module provides a centralized event management system
 */

// Storage for event subscriptions
const eventSubscriptions = new Map();

// Generate unique IDs for subscriptions
let lastSubscriptionId = 0;

/**
 * Subscribe to an event
 * @param {string} eventName - Name of the event to subscribe to
 * @param {Function} callback - Function to call when event is fired
 * @param {Object} options - Subscription options
 * @param {boolean} options.once - Whether to automatically unsubscribe after first event
 * @param {number} options.priority - Priority level (higher numbers execute first)
 * @returns {string} - Subscription ID for unsubscribing
 */
function subscribe(eventName, callback, options = {}) {
  if (typeof callback !== 'function') {
    console.error('Event subscription callback must be a function');
    return null;
  }
  
  // Generate subscription ID
  const subscriptionId = `sub_${++lastSubscriptionId}`;
  
  // Create event list if it doesn't exist
  if (!eventSubscriptions.has(eventName)) {
    eventSubscriptions.set(eventName, []);
  }
  
  // Add subscription
  const subscription = {
    id: subscriptionId,
    callback,
    once: options.once === true,
    priority: options.priority || 0
  };
  
  // Add to subscription list
  const subscriptions = eventSubscriptions.get(eventName);
  subscriptions.push(subscription);
  
  // Sort by priority (highest first)
  subscriptions.sort((a, b) => b.priority - a.priority);
  
  console.log(`Subscribed to event: ${eventName} (${subscriptionId})`);
  return subscriptionId;
}

/**
 * Subscribe to an event once
 * @param {string} eventName - Name of the event to subscribe to
 * @param {Function} callback - Function to call when event is fired
 * @param {Object} options - Subscription options
 * @returns {string} - Subscription ID for unsubscribing
 */
function subscribeOnce(eventName, callback, options = {}) {
  options.once = true;
  return subscribe(eventName, callback, options);
}

/**
 * Unsubscribe from an event
 * @param {string} subscriptionId - ID of the subscription to remove
 * @returns {boolean} - Whether unsubscribe was successful
 */
function unsubscribe(subscriptionId) {
  // Search all event lists for subscription
  for (const [eventName, subscriptions] of eventSubscriptions.entries()) {
    const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
    
    if (index !== -1) {
      // Remove subscription
      subscriptions.splice(index, 1);
      console.log(`Unsubscribed from event: ${eventName} (${subscriptionId})`);
      
      // Clean up empty subscription lists
      if (subscriptions.length === 0) {
        eventSubscriptions.delete(eventName);
      }
      
      return true;
    }
  }
  
  console.warn(`Subscription not found: ${subscriptionId}`);
  return false;
}

/**
 * Emit an event
 * @param {string} eventName - Name of the event to emit
 * @param {any} data - Data to pass to subscribers
 * @returns {number} - Number of subscribers notified
 */
function emit(eventName, data = null) {
  if (!eventSubscriptions.has(eventName)) {
    return 0;
  }
  
  const subscriptions = eventSubscriptions.get(eventName);
  const subsToRemove = [];
  let notifiedCount = 0;
  
  // Call all subscribers
  for (const sub of subscriptions) {
    try {
      sub.callback(data);
      notifiedCount++;
      
      // Mark once subscriptions for removal
      if (sub.once) {
        subsToRemove.push(sub.id);
      }
    } catch (error) {
      console.error(`Error in event subscriber (${eventName}):`, error);
    }
  }
  
  // Remove once subscriptions
  for (const subId of subsToRemove) {
    const index = subscriptions.findIndex(sub => sub.id === subId);
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
  }
  
  // Clean up empty subscription lists
  if (subscriptions.length === 0) {
    eventSubscriptions.delete(eventName);
  }
  
  return notifiedCount;
}

/**
 * Check if an event has subscribers
 * @param {string} eventName - Name of the event to check
 * @returns {boolean} - Whether the event has subscribers
 */
function hasSubscribers(eventName) {
  return eventSubscriptions.has(eventName) && eventSubscriptions.get(eventName).length > 0;
}

/**
 * Get the number of subscribers for an event
 * @param {string} eventName - Name of the event to check
 * @returns {number} - Number of subscribers
 */
function getSubscriberCount(eventName) {
  if (!eventSubscriptions.has(eventName)) {
    return 0;
  }
  
  return eventSubscriptions.get(eventName).length;
}

/**
 * Clear all subscriptions for an event
 * @param {string} eventName - Name of the event to clear
 * @returns {number} - Number of subscriptions cleared
 */
function clearEvent(eventName) {
  if (!eventSubscriptions.has(eventName)) {
    return 0;
  }
  
  const count = eventSubscriptions.get(eventName).length;
  eventSubscriptions.delete(eventName);
  return count;
}

/**
 * Clear all event subscriptions
 * @returns {number} - Number of subscriptions cleared
 */
function clearAllEvents() {
  let totalCount = 0;
  
  for (const subscriptions of eventSubscriptions.values()) {
    totalCount += subscriptions.length;
  }
  
  eventSubscriptions.clear();
  return totalCount;
}

// Common game events
const GameEvents = {
  // Game lifecycle events
  GAME_INITIALIZED: 'game:initialized',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_END: 'game:end',
  
  // Puzzle events
  PUZZLE_LOADED: 'puzzle:loaded',
  PUZZLE_STARTED: 'puzzle:started',
  PUZZLE_RESET: 'puzzle:reset',
  PUZZLE_COMPLETED: 'puzzle:completed',
  
  // Word events
  WORD_SELECTED: 'word:selected',
  WORD_FOUND: 'word:found',
  ALL_WORDS_FOUND: 'word:all_found',
  
  // Navigation events
  SCREEN_CHANGE: 'navigation:screen_change',
  SCREEN_CHANGED: 'navigation:screen_changed',
  
  // Progress events
  PROGRESS_SAVED: 'progress:saved',
  PROGRESS_LOADED: 'progress:loaded',
  BOOK_COMPLETED: 'progress:book_completed',
  
  // UI events
  PANEL_SHOW: 'ui:panel_show',
  PANEL_HIDE: 'ui:panel_hide',
  TIMER_TICK: 'ui:timer_tick',
  
  // System events
  ERROR: 'system:error',
  CONFIG_CHANGED: 'system:config_changed'
};

// Install to window for backward compatibility
window.eventSystem = {
  subscribe,
  subscribeOnce,
  unsubscribe,
  emit,
  hasSubscribers,
  getSubscriberCount,
  clearEvent,
  clearAllEvents,
  GameEvents
};

// Export for module system
export {
  subscribe,
  subscribeOnce,
  unsubscribe,
  emit,
  hasSubscribers,
  getSubscriberCount,
  clearEvent,
  clearAllEvents,
  GameEvents
};
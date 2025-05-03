/**
 * Math utilities for Chronicles of the Kethaneum
 * This module provides mathematical helper functions
 */

// adding a comment to justify a new commit.

/**
 * Calculate percentage of a part relative to a total
 * @param {number} part - The part value
 * @param {number} total - The total value
 * @returns {number} - The percentage (0-100)
 */
function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Generate a random integer between min (inclusive) and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if two rectangles overlap
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} - Whether the rectangles overlap
 */
function doRectanglesOverlap(rect1, rect2) {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Calculate distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} - Euclidean distance
 */
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array (modifies original)
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Calculate the average of an array of numbers
 * @param {Array<number>} values - Array of numbers
 * @returns {number} - Average value
 */
function calculateAverage(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.calculatePercentage = calculatePercentage;
window.getRandomInt = getRandomInt;
window.doRectanglesOverlap = doRectanglesOverlap;
window.calculateDistance = calculateDistance;
window.shuffleArray = shuffleArray;
window.clamp = clamp;
window.lerp = lerp;
window.calculateAverage = calculateAverage;

// Export functions for module system
export {
  calculatePercentage,
  getRandomInt,
  doRectanglesOverlap,
  calculateDistance,
  shuffleArray,
  clamp,
  lerp,
  calculateAverage
};
/**
 * Panel Manager for Chronicles of the Kethaneum
 * This module handles showing, hiding, and managing all game panels
 */

/**
 * Show the win panel
 * @param {string} customMessage - Optional custom message to display
 */
function showWinPanel(customMessage = null) {
  const winPanel = document.getElementById('win-panel');
  if (!winPanel) return;
  
  // Set custom message if provided
  if (customMessage && winPanel.querySelector('p')) {
    winPanel.querySelector('p').innerHTML = customMessage;
  }
  
  // Show the panel
  winPanel.style.display = 'block';
}

/**
 * Hide the win panel
 */
function hideWinPanel() {
  const winPanel = document.getElementById('win-panel');
  if (winPanel) {
    winPanel.style.display = 'none';
  }
}

/**
 * Show the lose panel
 * @param {string} customMessage - Optional custom message to display
 */
function showLosePanel(customMessage = null) {
  const losePanel = document.getElementById('lose-panel');
  if (!losePanel) return;
  
  // Set custom message if provided
  if (customMessage && losePanel.querySelector('p')) {
    losePanel.querySelector('p').innerHTML = customMessage;
  }
  
  // Show the panel
  losePanel.style.display = 'block';
}

/**
 * Hide the lose panel
 */
function hideLosePanel() {
  const losePanel = document.getElementById('lose-panel');
  if (losePanel) {
    losePanel.style.display = 'none';
  }
}

/**
 * Show the pause panel
 */
function showPausePanel() {
  const pausePanel = document.getElementById('pause-panel');
  if (pausePanel) {
    pausePanel.style.display = 'block';
  }
}

/**
 * Hide the pause panel
 */
function hidePausePanel() {
  const pausePanel = document.getElementById('pause-panel');
  if (pausePanel) {
    pausePanel.style.display = 'none';
  }
}

/**
 * Show the instructions panel
 */
function showInstructionsPanel() {
  const instructionsPanel = document.getElementById('instructions-panel');
  if (instructionsPanel) {
    instructionsPanel.style.display = 'block';
  }
}

/**
 * Hide the instructions panel
 */
function hideInstructionsPanel() {
  const instructionsPanel = document.getElementById('instructions-panel');
  if (instructionsPanel) {
    instructionsPanel.style.display = 'none';
  }
}

/**
 * Check if any game panel is currently visible
 * @returns {boolean} - Whether any panel is visible
 */
function isAnyPanelVisible() {
  const panels = [
    document.getElementById('win-panel'),
    document.getElementById('lose-panel'),
    document.getElementById('pause-panel'),
    document.getElementById('instructions-panel'),
    document.getElementById('error-panel')
  ];
  
  return panels.some(panel => panel && panel.style.display === 'block');
}

/**
 * Hide all panels
 */
function hideAllPanels() {
  hideWinPanel();
  hideLosePanel();
  hidePausePanel();
  hideInstructionsPanel();
  
  // Also hide error panel if it exists
  const errorPanel = document.getElementById('error-panel');
  if (errorPanel) {
    errorPanel.style.display = 'none';
  }
}

/**
 * Create a notification that appears briefly
 * @param {string} message - Message to display
 * @param {string} type - Notification type (info, warning, error)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = type === 'error' ? 'var(--accent-main)' : 'var(--warm-medium)';
  notification.style.color = type === 'error' ? 'white' : 'var(--accent-main)';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '2000';
  notification.style.fontSize = '14px';
  notification.style.maxWidth = '300px';
  
  // Add to document
  document.body.appendChild(notification);
  
  // Add fade-in animation
  notification.style.opacity = '0';
  notification.style.transition = 'opacity 0.3s ease-in-out';
  
  // Trigger reflow to ensure transition works
  notification.offsetHeight;
  
  // Fade in
  notification.style.opacity = '1';
  
  // Set timeout to remove
  setTimeout(() => {
    // Fade out
    notification.style.opacity = '0';
    
    // Remove after fade out
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// Temporarily continue making functions available globally
// These will be converted to proper exports once the module system is fully implemented
window.showWinPanel = showWinPanel;
window.hideWinPanel = hideWinPanel;
window.showLosePanel = showLosePanel;
window.hideLosePanel = hideLosePanel;
window.showPausePanel = showPausePanel;
window.hidePausePanel = hidePausePanel;
window.showInstructionsPanel = showInstructionsPanel;
window.hideInstructionsPanel = hideInstructionsPanel;
window.isAnyPanelVisible = isAnyPanelVisible;
window.hideAllPanels = hideAllPanels;
window.showNotification = showNotification;

// Export functions for module system
export {
  showWinPanel,
  hideWinPanel,
  showLosePanel,
  hideLosePanel,
  showPausePanel,
  hidePausePanel,
  showInstructionsPanel,
  hideInstructionsPanel,
  isAnyPanelVisible,
  hideAllPanels,
  showNotification
};
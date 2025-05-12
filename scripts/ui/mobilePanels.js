/**
 * Mobile Panels UI for Chronicles of the Kethaneum
 * Handles visual panel management for mobile interface
 */

// Panel state
let panelStates = {
  isWordListExpanded: false,
  activeTab: 'story'
};

/**
 * Initialize mobile panels UI
 */
function initializeMobilePanelsUI() {
  console.log('Initializing mobile panels UI');
  
  // Create panel structures if they don't exist
  createCollapsibleWordList();
  setupSlidePanel();
  
  // Initialize visual states
  updateWordListVisualState();
}

/**
 * Create collapsible word list structure with error handling
 */
function createCollapsibleWordList() {
  try {
    const mobileWordList = document.querySelector('.mobile-word-list');
    if (!mobileWordList) {
      console.warn('Mobile word list not found - skipping creation');
      return;
    }
    
    // Check if already has header to prevent duplication
    if (mobileWordList.querySelector('.word-list-header')) {
      console.log('Word list header already exists');
      return;
    }
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'collapsible-word-list collapsed';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'word-list-header clickable';
    
    const title = document.createElement('h4');
    title.textContent = 'Words to Find';
    title.id = 'word-count-display';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-button';
    toggleBtn.textContent = 'Show ▲';
    
    header.appendChild(title);
    header.appendChild(toggleBtn);
    
    // Create word list container
    const listContainer = document.createElement('div');
    listContainer.className = 'vertical-word-list';
    
    // Move existing items to new container (check if they exist)
    const existingItems = mobileWordList.querySelectorAll('li');
    existingItems.forEach(item => {
      item.className = 'word-item' + (item.classList.contains('found') ? ' found' : '');
      listContainer.appendChild(item);
    });
    
    // Build the new structure
    wrapper.appendChild(header);
    wrapper.appendChild(listContainer);
    
    // Replace only if parent exists
    if (mobileWordList.parentNode) {
      mobileWordList.parentNode.replaceChild(wrapper, mobileWordList);
    }
    
    // Update count
    updateWordCount();
    
  } catch (error) {
    console.error('Error creating collapsible word list:', error);
    // Game continues without collapsible list
  }
}

/**
 * Toggle word list with error handling
 */
function toggleWordList() {
  try {
    const wordList = document.querySelector('.collapsible-word-list');
    const toggleBtn = document.querySelector('.toggle-button');
    
    if (!wordList || !toggleBtn) {
      console.warn('Word list elements not found for toggle');
      return;
    }
    
    panelStates.isWordListExpanded = !panelStates.isWordListExpanded;
    updateWordListVisualState();
    
    // Save to game state with error handling
    if (window.state && typeof window.saveGameProgress === 'function') {
      window.state.mobileUIState = { ...window.state.mobileUIState, ...panelStates };
      window.saveGameProgress();
    }
    
  } catch (error) {
    console.error('Error toggling word list:', error);
  }
}

/**
 * Update word list visual state based on current state
 */
function updateWordListVisualState() {
  const wordList = document.querySelector('.collapsible-word-list');
  const toggleBtn = document.querySelector('.toggle-button');
  
  if (!wordList || !toggleBtn) return;
  
  if (panelStates.isWordListExpanded) {
    wordList.classList.remove('collapsed');
    wordList.classList.add('expanded');
    toggleBtn.textContent = 'Hide ▼';
  } else {
    wordList.classList.remove('expanded');
    wordList.classList.add('collapsed');
    toggleBtn.textContent = 'Show ▲';
  }
}

/**
 * Update word count display
 */
function updateWordCount() {
  const state = window.state;
  if (!state || !state.wordList) return;
  
  const wordCount = document.getElementById('word-count-display');
  if (wordCount) {
    const foundCount = state.wordList.filter(word => word.found).length;
    const totalCount = state.wordList.length;
    wordCount.textContent = `Words to Find (${foundCount}/${totalCount})`;
  }
}

/**
 * Setup slide panel structure
 */
function setupSlidePanel() {
  // Panel already exists in HTML, just set up content
  updateStoryContent();
}

/**
 * Open slide panel with error handling
 */
function openSlidePanel() {
  try {
    const panel = document.getElementById('mobile-slide-panel');
    const overlay = document.querySelector('.slide-panel-overlay');
    
    if (!panel) {
      console.error('Mobile slide panel not found');
      return;
    }
    
    if (!overlay) {
      console.warn('Slide panel overlay not found - panel may not close properly');
    }
    
    // Update story content before opening
    updateStoryContent();
    
    // Open panel
    panel.classList.add('open');
    if (overlay) {
      overlay.classList.add('visible');
    }
    
  } catch (error) {
    console.error('Error opening slide panel:', error);
  }
}

/**
 * Close slide panel
 */
function closeSlidePanel() {
  const panel = document.getElementById('mobile-slide-panel');
  const overlay = document.querySelector('.slide-panel-overlay');
  
  if (!panel || !overlay) return;
  
  panel.classList.remove('open');
  overlay.classList.remove('visible');
}

/**
 * Switch active tab
 * @param {string} tabName - Name of tab to activate
 */
function switchTab(tabName) {
  panelStates.activeTab = tabName;
  
  // Update tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update content
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    if (content.getAttribute('data-content') === tabName) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

/**
 * Update story content in slide panel
 */
function updateStoryContent() {
  const desktopStory = document.querySelector('#story-excerpt');
  const mobileStory = document.querySelector('#mobile-story-excerpt');
  
  if (desktopStory && mobileStory) {
    mobileStory.innerHTML = desktopStory.innerHTML;
  }
}

/**
 * Refresh word list display for mobile
 */
function refreshMobileWordList() {
  const listContainer = document.querySelector('.vertical-word-list');
  if (!listContainer) return;
  
  const state = window.state;
  if (!state || !state.wordList) return;
  
  // Clear existing items
  listContainer.innerHTML = '';
  
  // Sort words (found at bottom)
  const sortedWords = [...state.wordList].sort((a, b) => {
    if (a.found === b.found) return 0;
    return a.found ? 1 : -1;
  });
  
  // Create word items
  sortedWords.forEach(wordData => {
    const item = document.createElement('div');
    item.className = 'word-item';
    item.textContent = wordData.word;
    
    if (wordData.found) {
      item.classList.add('found');
    }
    
    listContainer.appendChild(item);
  });
  
  // Update count
  updateWordCount();
}

// Export functions
export {
  initializeMobilePanelsUI,
  toggleWordList,
  openSlidePanel,
  closeSlidePanel,
  switchTab,
  updateStoryContent,
  refreshMobileWordList,
  updateWordCount
};
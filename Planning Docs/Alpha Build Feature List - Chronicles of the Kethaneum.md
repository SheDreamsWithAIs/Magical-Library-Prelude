# Chronicles of the Kethaneum - Alpha Build Feature List

## .:: Basic UI ::.

### Title Screen
- [x] Title and Subtitle
- [x] New Game Button
- [x] Continue Game Button
- [x] Options Button
- [ ] Option Menu Panel
  - [ ] Background Music Volume Slider
  - [ ] Voice Acting Volume Slider
  - [ ] Sound Effects Volume Slider
  - [ ] Mute Everything Button
  - [ ] Back to Title Screen Button
- [x] Credits Button
- [x] Game Logo Area

### Credits Screen
- [ ] Credits Text Area
- [ ] Scrollbar
- [ ] Back to Title Screen Button

### Backstory Screen
- [x] Backstory Blurb Area
- [x] Scrollbar
- [x] Continue Game Button

### Library Screen
- [x] Library Art Container
- [x] Character dialog start button
- [x] Go to Main Menu button
- [x] Go to Book of Passage Button
- [x] Genre Selection UI button
  - [x] Genre card container
  - [x] Genre Selection cards
- [ ] Character Dialogue System Integration (not fully integrated yet)
  - [x] Dialogue overlay container
  - [x] Character portrait area
  - [x] Dialogue text display area
  - [x] Dialogue navigation controls

### Book of Passage Screen
- [x] Book of Passage Title
- [x] Story and Progress Container
  - [x] The Archivist's story so far text
  - [ ] Archivist's story history Area
    - [ ] Archivist's story history text
    - [ ] History Navigation Buttons
  - [x] Books Discovered counter
  - [x] Books Cataloged counter
  - [ ] Book Progress tracker 
    - [ ] Book Progress Navigation Buttons
    - [x] Completed Books
    - [x] In Progress Books
  - [ ] Book of Passage Art Container
    - [ ] Book of Passage Art
    - [ ] Book of Passage Text Area
- [ ] Story and Progress Navigation Buttons (Get to different sections in the Book of Passage)
- [ ] Scrollbar
- [x] Start Cataloging Button
- [ ] Return to Library Button
- [ ] Return to Title Screen Button
- [ ] Options Menu Button
- [ ] Options Menu Panel
  - [ ] Menu Title 
  - [ ] Volume Sliders
  - [ ] Mute Button
  - [ ] Back to Library Screen Button

### Word Puzzle Screen
- [x] Book Title
- [x] Story excerpt Area
- [x] Word Puzzle grid
- [x] Word List
- [x] Pause Cataloging Button (Open pause menu)
- [ ] Pause Menu
  - [x] Resume Button
  - [x] Restart Puzzle Button
  - [ ] Return to Library Button
  - [ ] Quit to Title Screen Button
- [ ] Option Menu Button
- [ ] Options Menu Panel
  - [ ] Menu Title 
  - [ ] Volume Sliders
  - [ ] Mute Button

### End of Game Screen
- [ ] End of Game text Area
- [ ] Scrollbar
- [ ] Return to Library Button
- [ ] Return to Book of Passage Button
- [ ] Return to Title Screen Button
___
## .:: Word Puzzle ::.

### Word Puzzle Screen
- [x] Programmatic Word placement
- [x] Programmatic Word grid filling
- [x] Word list loading and storage
- [x] Recognition of Word Selection
- [x] Win and Lose State Management
- [x] Puzzle Caching for loading
- [x] Timer System
- [ ] 4 Genres and 10 books for each Genre:
  - [ ] Sci Fi
  - [ ] Fantasy
  - [ ] Romance
  - [ ] kethaneum
___
## .:: Narrative Delivery ::.
- [x] Easy Narrative File Swap Out
- [x] Easy Puzzle File Swap Out

### Backstory Screen
- [x] Kethaneum Backstory Placeholder Text

### Library Screen
- [x] Placeholder Character Dialogue Text
- [ ] Character dialogue system
  - [ ] Event driven dialogue
  - [x] Banter dialogue
- [x] Genre Cards

### Core Dialogue Foundation
- [x] Dialogue folder structure and file organization
  - [x] `/dialogue/characters/` directory
  - [x] `/dialogue/story-events/` directory  
  - [x] `dialogue-config.json` configuration file
- [x] Basic DialogueManager module
  - [x] File loading system
  - [x] Error handling and validation
  - [x] Module integration with existing architecture
- [x] Character Banter System
  - [x] Random character selection logic
  - [x] Banter dialogue file structure (JSON)
  - [x] Character-specific dialogue loading
- [ ] Story Event System  
  - [ ] Sequential dialogue file structure (JSON)
  - [ ] Multi-character conversation handling
  - [ ] Story event triggering system
- [x] Dialogue UI Implementation
  - [x] Basic dialogue overlay panel
  - [x] Character portrait placeholder system
  - [x] Text display with responsive sizing
  - [x] Continue/advance dialogue controls
- [ ] Library Screen Integration
  - [ ] "Start Conversation" button functionality
  - [x] Dialogue panel show/hide management
  - [ ] Integration with existing library navigation

### Book of Passage Screen
- [x] The Archivist's story so far Placeholder Text
- [ ] Archivist's story history Placeholder Text 
- [ ] Placeholder Character Dialogue Placeholder Text
- [ ] Story system for revealing and allowing review of the archivist's story 

### Word Puzzle Screen
- [ ] Placeholder Character Dialogue Text Content
- [x] Word Puzzle Excerpt Text Content (especially Kethaneum related)

### End of Game Screen
- [ ] End of Game Placeholder Content

### Tutorial Screens
- [ ] Tutorial Library Screen (deactivated until tutorial system implementation)
- [ ] Tutorial Book of Passage Screen (deactivated until tutorial system implementation)
- [ ] Tutorial Word Puzzle Screen (deactivated until tutorial system implementation)
___
## .:: Navigation ::.

### Title Screen
- [x] Start a new Game (Go to Backstory Screen)
- [x] Load a saved game (Go to Book of Passage)
- [ ] Navigate to credits screen

### Credits Screen
- [ ] Navigate back to title screen

### Backstory Screen
- [x] Navigate to Library Screen

### Library Screen
- [x] Navigate to Book of Passage Screen
- [x] Navigate to Word Puzzle Screen through Genre Selection
- [x] Navigate to Title Screen

### Book of Passage Screen
- [x] Navigate to word puzzle screen through start cataloging button
- [ ] Navigate to library screen
- [ ] Navigate to Title Screen

### Word Puzzle Screen
- [x] Navigate to Book of Passage Screen through pause menu
- [ ] Navigate to Library Screen through pause menu
- [ ] Navigate to Title Screen through pause menu

### End of Game Screen
- [ ] Navigate to Library Screen
- [ ] Navigate to Book of Passage Screen
- [ ] Navigate to Title Screen

### Options Menu
- [ ] Navigate to Title Screen
___
## .:: Art ::.

### Concept Art
- [ ] Character Concept Art
- [x] Title Screen Concept Art
- [ ] Credits Screen Concept Art
- [x] Backstory Screen Concept Art
- [ ] Book of Passage Concept Art
- [ ] Library Concept Art
- [ ] Word Puzzle Concept Art
- [ ] Particle Effect Prototypes
- [ ] Border Designs

### Credits Screen
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation

### Title Screen
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation

### Backstory Screen
- [ ] Styled Scrollbar
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation

### Library Screen
- [ ] Library Art Placeholder

### Book of Passage Screen
- [ ] Styled Scrollbar
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation

### Word Puzzle Screen
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation
___
## .:: Save System ::.
- [x] Local Storage Implementation
  - [x] Player Story progress
  - [x] Completed books tracking
  - [x] Book part completion status
  - [x] Game state serialization and restoration
- [x] Auto-save on book/puzzle completion
- [ ] Manual save through pause menu
- [ ] Manual save through options menu
- [ ] Save data integrity validation
- [ ] Incomplete puzzle state preservation
  - [ ] Ability to return to puzzles in progress
- [ ] Historical Book completion tracking
___
## .:: Sound System ::.
- [ ] Audio Manager
  - [ ] Background Music handler
  - [ ] Sound Effects handler
  - [ ] Voice Acting handler
  - [ ] Selective Channel Muting
- [ ] Single Background Music Track
- [ ] Sound Effects Placeholders
  - [ ] Navigation Button Clicks
  - [ ] Menu button Clicks
  - [ ] Button Hover Sound
  - [ ] Puzzle Completion
  - [ ] Puzzle Failure
- [ ] Voice Acting Placeholders
___
## .:: Character Dialogue System ::.
  - [ ] Character Image Handler
  - [x] Character Dialogue Handler
  - [x] Dialogue Navigation
  - [ ] Event triggers 
___
## .:: Event System ::.
- [x] Core Event Publication/Subscription Architecture
- [x] Game State Event Handlers
  - [x] Puzzle Completion Events
  - [x] Word Discovery Events
  - [x] Book Completion Events
- [ ] UI Event Handlers
  - [x] Screen Navigation Events
  - [ ] Button Click Events
  - [ ] Hover State Events
- [ ] Narrative Event Triggers
  - [ ] Character Dialogue Triggers
  - [ ] Story Progression Triggers
- [ ] Audio Event Triggers
  - [ ] Music Change Events
  - [ ] Sound Effect Events
- [ ] Achievement/Progress Event Tracking
___
## .:: Test Set Up ::.
- [x] End to End Automated Test
- [x] Word Search Happy Path Automated Test
- [ ] Early Playtesting
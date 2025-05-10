# Chronicles of the Kethaneum - Alpha Build Feature List

## .:: Basic UI ::.

### Title Screen
- [x] Title and Subtitle
- [ ] New Game Button
- [ ] Continue Game Button
- [ ] Options Button
- [ ] Option Menu Panel
  - [ ] Background Music Volume Slider
  - [ ] Voice Acting Volume Slider
  - [ ] Sound Effects Volume Slider
  - [ ] Mute Everything Button
  - [ ] Back to Title Screen Button
- [ ] Credits Button
- [ ] Game Logo Area

### Credits Screen
- [ ] Credits Text Area
- [ ] Scrollbar
- [ ] Back to Title Screen Button

### Backstory Screen
- [ ] Backstory Blurb Area
- [ ] Scrollbar
- [ ] Continue Game Button

### Library Screen
- [ ] Genre Selection Buttons
- [ ] Library Art Container
- [ ] Library Navigation buttons
- [ ] Go to Book of Passage Button
- [ ] Character Container/overlay
  - [ ] Character dialogue area
  - [ ] Dialogue Navigation Buttons

### Book of Passage Screen
- [ ] Book of Passage Title
- [ ] Story and Progress Container
  - [ ] The Archivist's story so far text
  - [ ] Archivist's story history Area
    - [ ] Archivist's story history text
    - [ ] History Navigation Buttons
  - [ ] Books Discovered counter
  - [ ] Books Cataloged counter
  - [ ] Book Progress tracker 
    - [ ] Book Progress Navigation Buttons
    - [ ] Completed Books
    - [ ] In Progress Books
  - [ ] Book of Passage Art Container
    - [ ] Book of Passage Art
    - [ ] Book of Passage Text Area
- [ ] Story and Progress Navigation Buttons (Get to different sections in the Book of Passage)
- [ ] Scrollbar
- [ ] Start Cataloging Button
- [ ] Return to Library Button
- [ ] Return to Title Screen Button
- [ ] Options Menu Button
- [ ] Options Menu Panel
  - [ ] Menu Title 
  - [ ] Volume Slider
  - [ ] Mute Button
  - [ ] Back to Library Screen Button

### Word Puzzle Screen
- [ ] Book Title
- [ ] Story excerpt
- [ ] Word Puzzle grid
- [ ] Word List
- [ ] Pause Cataloging Button (Open pause menu)
- [ ] Pause Menu
  - [ ] Resume Button
  - [ ] Restart Puzzle Button
  - [ ] Return to Library Button
  - [ ] Quit to Title Screen Button
  - [ ] Options Menu Button
- [ ] Option Menu Button

### End of Game Screen
- [ ] End of Game text Area
- [ ] Scrollbar
- [ ] Return to Library Button
- [ ] Return to Book of Passage Button
- [ ] Return to Title Screen Button
___
## .:: Word Puzzle ::.

### Word Puzzle Screen
- [ ] Programmatic Word placement
- [ ] Programmatic Word grid filling
- [ ] Word list loading and storage
- [ ] Recognition of Word Selection
- [ ] Win and Lose State Management
___
## .:: Narrative Delivery ::.

### Backstory Screen
- [ ] Kethaneum Backstory Text Content

### Library Screen
- [ ] Placeholder Character Dialogue Text Content

### Book of Passage Screen
- [ ] The Archivist's story so far Text Content
- [ ] Archivist's story history Text Content
- [ ] Placeholder Character Dialogue Text Content

### Word Puzzle Screen
- [ ] Placeholder Character Dialogue Text Content
- [ ] Word Puzzle Excerpt Text Content (especially Kethaneum related)

### End of Game Screen
- [ ] End of Game Text Content

### Tutorial Screens
- [ ] Tutorial Library Screen (deactivated until tutorial system implementation)
- [ ] Tutorial Book of Passage Screen (deactivated until tutorial system implementation)
- [ ] Tutorial Word Puzzle Screen (deactivated until tutorial system implementation)
___
## .:: Navigation ::.

### Title Screen
- [ ] Start a new Game
- [ ] Load a saved game
- [ ] Navigate to credits screen

### Credits Screen
- [ ] Navigate back to title screen

### Backstory Screen
- [ ] Navigate to Library Screen

### Library Screen
- [ ] Navigate to Book of Passage Screen
- [ ] Navigate to Word Puzzle Screen through Genre Selection

### Book of Passage Screen
- [ ] Navigate to word puzzle screen through start cataloging button
- [ ] Navigate to library screen

### Word Puzzle Screen
- [ ] Navigate to Book of Passage Screen through pause menu
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
- [ ] Title Screen Concept Art
- [ ] Credits Screen Concept Art
- [ ] Backstory Screen Concept Art
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
- [ ] Themed Scrollbar
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation

### Library Screen
- [ ] Library Art Placeholder

### Book of Passage Screen
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation

### Word Puzzle Screen
- [ ] Border Art placeholders
- [ ] Twinkling Stars background animation
___
## .:: Save System ::.
- [ ] Local Storage Implementation
  - [ ] Player Story progress
  - [ ] Completed books tracking
  - [ ] Book part completion status
  - [ ] Game state serialization and restoration
- [ ] Auto-save on book/puzzle completion
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
# Chronicles of the Kethaneum - Dialogue System Documentation

## Overview
The dialogue system provides two main types of interactions:
1. **Character Banter** - Random idle dialogue from library inhabitants
2. **Story Events** - Scripted sequences triggered by story progression

## System Architecture

### Core Components
- **DialogueManager** - Main system controller (to be implemented)
- **DialogueUI** - User interface components (to be implemented)
- **Configuration** - `dialogue-config.json` - Central settings
- **Character Files** - Individual character banter data
- **Story Event Files** - Sequential story dialogue scripts

## File Structure

```
scripts/dialogue/
├── characters/           # Character-specific banter files
│   ├── archivist-lumina.json
│   └── [character-id].json
├── story-events/         # Sequential story dialogue
│   ├── first-visit.json
│   └── [event-id].json
└── dialogue-config.json  # System configuration
```

## Configuration System (`dialogue-config.json`)

### Story Structure Integration
Based on K.M. Weiland's "5 Secrets of Story Structure":
- `hook` - Opening/introduction phase
- `first_plot_point` - First major story beat
- `first_pinch_point` - Initial conflict escalation
- `midpoint` - Central story turning point
- `second_pinch_point` - Final conflict escalation
- `second_plot_point` - Final story beat before climax
- `climax` - Story climax
- `resolution` - Story conclusion

### Character Loading Groups
Characters load in phases to optimize performance:

1. **Introduction Characters** - Essential starting characters (5-7)
   - Always available once loaded
   - Load immediately on game start

2. **Regular Contacts** - Close proximity workers (10-15)
   - Load when player first visits library
   - Characters player encounters frequently

3. **Essential Library Staff** - Core library personnel
   - Load during early story progression
   - Permanent library residents

4. **Extended Library Staff** - Specialized library roles
   - Load as story progresses
   - Characters with specific expertise

5. **Long Term Scholars** - Established researchers
   - Load during mid-story
   - Characters with deep knowledge

6. **Visiting Scholars** - Temporary researchers
   - Load and retire based on story beats
   - Default retirement: `second_plot_point`

7. **Visiting Dignitaries** - Important temporary visitors
   - Load for special occasions
   - Default retirement: `resolution`

8. **Knowledge Contributors** - Community knowledge sharers
   - Load mid-story
   - Default retirement: `midpoint`

9. **Special Event Characters** - Story-specific characters
   - Load/retire based on individual needs
   - Retirement varies by character

### Character Retirement System
Characters can be "retired" (unloaded) at specific story beats:

**Group-Level Defaults**: Set in config under `characterRetirement`
**Character-Level Overrides**: Set in individual character files using `retireAfter` field

Values: Any story beat name or `"never"` for permanent characters

## Character File Structure

```json
{
  "character": {
    "id": "unique-character-id",
    "name": "Display Name",
    "title": "Character Title/Role",
    "description": "Character background and personality description",
    "portraitFile": "filename.svg",
    "loadingGroup": "group_name",
    "retireAfter": "story_beat_or_never",
    "specialties": ["area1", "area2", "area3"]
  },
  "banterDialogue": [
    {
      "id": "unique-dialogue-id",
      "text": "What the character says",
      "emotion": ["emotion1", "emotion2"],
      "category": "dialogue-category",
      "availableFrom": "story_beat",
      "availableUntil": "story_beat"  // Optional
    }
  ],
  "metadata": {
    "personalityTraits": ["trait1", "trait2"],
    "relationshipToPlayer": "relationship-type",
    "availableInScreens": ["screen1", "screen2"],
    "lastUpdated": "YYYY-MM-DD"
  }
}
```

### Dialogue Availability Windows
Dialogue can be:
- **Always available**: Only `availableFrom` specified
- **Time-limited**: Both `availableFrom` and `availableUntil` specified
- **Story-specific**: Available only during specific story beats

## Story Event File Structure

```json
{
  "storyEvent": {
    "id": "unique-event-id",
    "title": "Event Display Title",
    "triggerCondition": "what-triggers-this-event",
    "storyBeat": "associated_story_beat"
  },
  "dialogue": [
    {
      "sequence": 1,
      "speaker": "character-id",
      "text": "What they say",
      "emotion": ["emotion1", "emotion2"],
      "pauseAfter": true,
      "isLastInSequence": false
    }
  ],
  "characters": [
    {
      "id": "character-id",
      "portraitFile": "filename.svg"
    }
  ],
  "metadata": {
    "estimatedDuration": "short|medium|long",
    "storyImportance": "introduction|development|climax",
    "unlocks": ["feature1", "feature2"],
    "lastUpdated": "YYYY-MM-DD"
  }
}
```

## Probability and Selection System

### Banter Selection
- **Method**: Random selection from available characters
- **Weighting**: Recently used characters have reduced probability
- **Reset**: Probability resets when all available characters have been seen

### Story Event Triggering
- **Method**: External trigger based on game conditions
- **No Priority**: Events triggered by story logic, not competing priorities
- **Sequential**: Events follow story progression naturally

## Responsive Text Display

Text display adapts to screen size:

### Mobile (≤768px)
- Max characters per screen: 120
- Estimated words per screen: 20
- More "continue" taps needed for longer dialogue

### Tablet (769px-1024px)
- Max characters per screen: 200
- Estimated words per screen: 35
- Moderate "continue" taps

### Desktop (≥1025px)
- Max characters per screen: 300
- Estimated words per screen: 50
- Fewer "continue" taps needed

## Implementation Notes

### Phase-Based Development
1. **Phase 1**: Directory structure and basic files ✅
2. **Phase 2**: DialogueManager class and file loading
3. **Phase 3**: Banter system implementation
4. **Phase 4**: Story event system implementation
5. **Phase 5**: DialogueUI overlay implementation
6. **Phase 6**: Library screen integration
7. **Phase 7**: Polish and styling

### Future Enhancements
- Cross-screen dialogue access (Beta phase)
- Advanced character relationship tracking
- Dynamic dialogue based on player progress
- Character portrait animations
- Dialogue history/review system

## Error Handling
- **Missing Characters**: Use default character or skip gracefully
- **Missing Story Events**: Log error and continue
- **Corrupted Files**: Log error and continue with fallback
- **File Loading Failures**: Graceful degradation with error logging
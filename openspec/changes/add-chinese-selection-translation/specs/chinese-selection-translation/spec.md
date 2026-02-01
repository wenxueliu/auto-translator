# Chinese Selection Translation

## ADDED Requirements

### Requirement: Chinese Text Detection in Context Menus
The system SHALL detect when selected text contains Chinese characters and dynamically update context menu options accordingly.

#### Scenario: Chinese text selection shows dedicated translation option
- **WHEN** user selects Chinese text "你好世界" on a webpage
- **AND** the user right-clicks on the selection
- **THEN** the context menu displays "翻译为英文" option

#### Scenario: English text maintains current behavior
- **WHEN** user selects English text "Hello World" on a webpage
- **AND** the user right-clicks on the selection
- **THEN** the context menu displays the standard "翻译选中文本" option

#### Scenario: Mixed language falls back to generic option
- **WHEN** user selects mixed language text "Hello 你好" on a webpage
- **AND** the user right-clicks on the selection
- **THEN** the context menu displays the generic "翻译选中文本" option as fallback

### Requirement: Dynamic Context Menu Creation
The system SHALL create language-aware context menus that show appropriate translation options based on the selected text's language.

#### Scenario: Initial menu creation with hidden Chinese option
- **WHEN** the extension loads on a Chinese webpage
- **AND** the context menus are created
- **THEN** a "翻译为英文" menu item is created but initially hidden

#### Scenario: Menu visibility updates with selection changes
- **WHEN** user selects different text portions multiple times
- **AND** each selection is made
- **THEN** the menu visibility updates to reflect the detected language

### Requirement: Chinese-to-English Translation Handler
The system SHALL provide a dedicated handler for Chinese-to-English translation that ensures the correct translation direction.

#### Scenario: Forced translation direction for Chinese text
- **WHEN** user clicks "翻译为英文" context menu option
- **AND** the handler processes the request
- **THEN** it forces translation direction to 'zh-to-en' regardless of settings

#### Scenario: Correct translation result
- **WHEN** Chinese text "智能翻译" is selected and "翻译为英文" is clicked
- **AND** the translation is performed
- **THEN** the result shows the English translation "Smart Translation"

### Requirement: Menu State Management
The system SHALL efficiently manage context menu visibility states to provide responsive user experience.

#### Scenario: Rapid menu updates
- **WHEN** user rapidly switches between selecting Chinese and English text
- **AND** each selection is made
- **THEN** the context menu updates within 100ms

#### Scenario: Graceful error handling
- **WHEN** system encounters errors during menu updates
- **AND** failures occur
- **THEN** the system gracefully falls back to generic menu options

### Requirement: Backward Compatibility
The system SHALL maintain full backward compatibility with existing translation functionality.

#### Scenario: Existing functionality preserved
- **WHEN** existing user with current settings uses the extension
- **AND** they select text and right-click
- **THEN** all existing menu options continue to work as before

#### Scenario: Settings override for Chinese translation
- **WHEN** user has custom translation direction settings
- **AND** they use the new "翻译为英文" option
- **THEN** it overrides the direction setting specifically for Chinese text

### Requirement: Performance Optimization
The system SHALL optimize language detection and menu updates to minimize performance impact.

#### Scenario: Fast language detection
- **WHEN** user selects large paragraphs of Chinese text
- **AND** language detection is performed
- **THEN** it completes within 50ms for text up to 1000 characters

#### Scenario: Efficient menu updates
- **WHEN** user makes frequent text selections
- **AND** menu visibility is updated
- **THEN** the system uses caching to avoid redundant language detection
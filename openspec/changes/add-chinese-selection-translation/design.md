# Design: Chinese Selection Translation

## Architecture Overview

This enhancement builds on the existing bidirectional translation infrastructure by adding language-aware context menu capabilities. The design leverages the current `LanguageDetector` class and `TranslationService` to provide a more intuitive user experience for Chinese text translation.

## Current System Analysis

### Existing Infrastructure
- **LanguageDetector Class**: Already provides Chinese text detection via `isChineseText()` and `detectLanguage()` methods
- **TranslationService**: Supports bidirectional translation with `zh-to-en` direction
- **Context Menu System**: Uses `chrome.contextMenus` API with static menu creation
- **Storage System**: Maintains vocabulary and settings with language metadata

### Current Context Menu Structure
```
翻译选中文本 (parent)
├── 添加到词库
└── 添加到词库并翻译
翻译当前网页
```

## Design Decisions

### 1. Dynamic Menu Creation Strategy
**Decision**: Create language-aware context menus that adapt based on selected text language.

**Rationale**:
- Provides clear translation direction indication
- Improves feature discoverability
- Maintains backward compatibility
- Leverages existing language detection capabilities

**Implementation**:
- Extend `createContextMenus()` to support conditional menu items
- Use selection text analysis when context menu is invoked
- Cache language detection results for performance

### 2. Menu Structure Design
**Primary Structure for Chinese Text**:
```
翻译为英文 (new dedicated option)
翻译选中文本 (existing - submenu)
├── 添加到词库
└── 添加到词库并翻译
翻译当前网页
```

**Fallback Structure for Mixed/Unknown Text**:
```
翻译选中文本 (existing generic option)
├── 添加到词库
└── 添加到词库并翻译
翻译当前网页
```

### 3. Language Detection Integration
**Approach**: Utilize existing `LanguageDetector` class with minimal modifications.

**Integration Points**:
- Context menu creation logic in `background.js`
- Selection text analysis in menu click handlers
- Fallback behavior for edge cases

### 4. Handler Architecture
**New Handler**: `translateChineseToEnglish()` - Dedicated handler for Chinese text translation

**Existing Handlers**: Maintain current handlers for compatibility
- `addToVocabulary()`
- `addToVocabularyAndTranslate()`
- `translatePage()`

## Technical Implementation

### Enhanced Background Script (`background.js`)

#### Language-Aware Menu Creation
```javascript
function createLanguageAwareContextMenus() {
    chrome.contextMenus.removeAll(() => {
        // Base menus
        createBaseMenus();

        // Language-specific selection menu
        chrome.contextMenus.create({
            id: 'chinese-to-english',
            title: '翻译为英文',
            contexts: ['selection'],
            visible: false // Initially hidden
        });

        // Existing generic menu
        createSelectionMenus();
    });
}
```

#### Menu Visibility Management
```javascript
async function updateMenuVisibility(selectionText) {
    const isChinese = LanguageDetector.isChineseText(selectionText);

    chrome.contextMenus.update('chinese-to-english', {
        visible: isChinese
    });

    // Optionally hide generic menu when Chinese is detected
    chrome.contextMenus.update('selection-root', {
        visible: !isChinese
    });
}
```

#### Handler Implementation
```javascript
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'chinese-to-english') {
        await translateChineseToEnglish(info.selectionText, tab.id);
    }
    // ... existing handlers
});

async function translateChineseToEnglish(text, tabId) {
    // Ensure Chinese-to-English translation direction
    const direction = 'zh-to-en';
    await translateSelectedWordWithDirection(text, tabId, direction);
}
```

### Integration Points

#### Selection Event Handling
- Monitor selection changes to update menu visibility
- Use `chrome.contextMenus` API for dynamic updates
- Cache detection results for performance

#### Translation Service Integration
- Extend existing `translateSelectedWord()` function
- Add explicit direction parameter when needed
- Maintain current context-aware translation capabilities

## Performance Considerations

### Language Detection Optimization
- Cache detection results for frequently selected text
- Use efficient regex patterns for Chinese character detection
- Minimize detection overhead for short selections

### Menu Update Efficiency
- Batch menu updates to reduce Chrome API calls
- Use debouncing for rapid selection changes
- Maintain menu state to avoid unnecessary updates

## Compatibility and Migration

### Backward Compatibility
- Existing functionality remains unchanged
- Original menu structure preserved for non-Chinese text
- All current settings and vocabulary maintained

### Migration Strategy
- Extend existing menu creation function
- Add new menu items alongside current ones
- Maintain current handler structure
- No breaking changes to storage schema

## Error Handling

### Language Detection Failures
- Fallback to generic menu when detection fails
- Graceful degradation for edge cases (mixed language text)
- Logging for detection accuracy monitoring

### Menu Creation Errors
- Robust error handling for Chrome API failures
- Retry mechanisms for menu updates
- Fallback to static menu structure if dynamic creation fails

## Testing Strategy

### Unit Testing
- Language detection accuracy testing
- Menu creation logic verification
- Handler function testing

### Integration Testing
- End-to-end translation flow testing
- Menu visibility behavior verification
- Compatibility testing with existing features

### User Experience Testing
- Menu responsiveness testing
- Selection behavior validation
- Performance testing with large text selections
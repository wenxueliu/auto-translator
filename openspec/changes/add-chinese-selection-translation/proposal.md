# Add Chinese Selection Translation

## Why
Users browsing Chinese websites need a quick way to translate selected Chinese text to English. While the extension already supports bidirectional translation, the context menu doesn't clearly indicate the translation direction for Chinese text selection, making the feature less discoverable and intuitive.

## Summary
Add a dedicated "翻译为英文" (Translate to English) context menu option that appears when Chinese text is selected, providing clear and immediate access to Chinese-to-English translation functionality.

## Current Behavior
The extension currently provides a generic "翻译选中文本" (Translate Selected Text) context menu that:
- Shows for any selected text regardless of language
- Requires users to understand the translation will be automatic based on language detection
- Doesn't explicitly indicate the translation direction
- May be confusing for users who want to ensure Chinese text gets translated to English

## Proposed Solution
Implement language-aware context menus that dynamically adapt based on the selected text's language:

### Enhanced Context Menu Logic
When Chinese text is selected, show a dedicated "翻译为英文" menu option alongside the existing options. When English text is selected, maintain the current behavior or show "翻译为中文" if needed.

### Key Features
1. **Language Detection on Selection**: Detect whether selected text is Chinese when context menu is invoked
2. **Dynamic Menu Creation**: Show appropriate translation options based on detected language
3. **Clear Translation Direction**: Explicitly indicate "翻译为英文" for Chinese text selections
4. **Fallback Compatibility**: Maintain existing functionality for mixed or unknown language selections

## Architectural Impact
- **Background Script**: Extend context menu creation to be language-aware
- **Language Detection**: Utilize existing `LanguageDetector` class for menu text determination
- **Menu Handlers**: Add new menu item handler for Chinese-to-English translation
- **User Experience**: Improve discoverability of Chinese translation capabilities

## What Changes
This change introduces language-aware context menus with the following modifications:

### Context Menu Enhancement
- Extend `createContextMenus()` function to support language-specific menu items
- Add "翻译为英文" menu option for Chinese text selections
- Maintain existing "翻译选中文本" as fallback for mixed/unknown text
- Preserve current vocabulary management options

### Language Detection Integration
- Utilize existing `LanguageDetector.isChineseText()` method for menu logic
- Add language detection to context menu click handlers
- Ensure proper fallback behavior for edge cases

### Handler Updates
- Add dedicated handler for Chinese-to-English translation selection
- Integrate with existing `translateSelectedWord()` function
- Maintain compatibility with current translation flow

## Benefits
1. **Improved User Experience**: Clear indication of translation direction for Chinese text
2. **Better Feature Discoverability**: Users can easily find Chinese-to-English translation
3. **Intuitive Interface**: Menu text matches user expectation for Chinese content
4. **Backward Compatibility**: Existing functionality remains unchanged
5. **Leverages Existing Infrastructure**: Builds on current bidirectional translation system

## Implementation Scope
This focused change includes:
1. Dynamic context menu creation based on text language detection
2. New menu item handler for Chinese-to-English translation
3. Integration with existing translation service and language detection capabilities
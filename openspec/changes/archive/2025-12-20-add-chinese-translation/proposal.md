# Bidirectional Chinese Translation Support

## Why
The current Chrome extension only supports unidirectional English→Chinese translation, limiting its usefulness for Chinese speakers and learners who need to translate Chinese content to English. Users cannot add Chinese vocabulary to their personal learning database, missing a crucial use case for language learning. This change addresses these limitations by implementing comprehensive bidirectional translation capabilities.

## Summary
Add support for Chinese-to-English translation and Chinese vocabulary management to the Chrome extension, enabling bidirectional translation capabilities.

## Current Limitations
The extension currently only supports **English-to-Chinese** translation with the following constraints:
- All AI prompts are hardcoded for English→Chinese translation
- No language detection capabilities
- Vocabulary system only supports English words/phrases
- No translation direction configuration in settings

## Proposed Solution
Implement bidirectional translation support with the following capabilities:

### 1. Chinese-to-English Translation
- Detect source language automatically or allow user selection
- Support Chinese text translation to English
- Extend all AI models to handle Chinese→English translation
- Maintain context-aware translation for Chinese content

### 2. Chinese Vocabulary Support
- Add Chinese words/phrases to personal vocabulary
- Store Chinese vocabulary with English translations
- Support Chinese characters, pinyin, and usage examples
- Import/export Chinese vocabulary

### 3. Enhanced Language Settings
- Translation direction selector (Auto, EN→ZH, ZH→EN)
- Source/target language configuration
- Language detection toggle
- Separate settings for each translation direction

### 4. UI Improvements
- Dynamic context menus based on detected language
- Bilingual vocabulary display
- Language switching in popup interface

## Architectural Impact
- **Translation Service**: Extend to support bidirectional translation
- **AI Prompts**: Dynamic prompt generation based on language direction
- **Storage Schema**: Extend vocabulary schema for language metadata
- **Background Script**: Add language detection and menu handling
- **Content Script**: Implement language detection and text processing
- **Popup Interface**: Add language direction controls

## What Changes
This change introduces two major capabilities to the Chrome extension:

### Chinese-to-English Translation
- Add language detection system to identify Chinese vs English text
- Extend TranslationService with bidirectional prompt generation
- Update all AI model integrations to support Chinese→English translation
- Implement translation direction settings and persistence
- Add language-aware context menus and UI elements

### Chinese Vocabulary Support
- Extend vocabulary storage schema for multilingual entries
- Add Chinese-specific metadata (pinyin, pronunciation, context)
- Implement bilingual vocabulary management interface
- Update import/export functionality for Chinese vocabulary
- Add language filtering and search capabilities

### Architectural Modifications
- TranslationService class enhancement for bidirectional support
- Storage schema extension while maintaining backward compatibility
- Background script updates for language detection
- Content script modifications for Chinese text processing
- Popup interface additions for language settings

## Benefits
1. **Complete Bidirectional Support**: Full Chinese↔English translation capabilities
2. **Comprehensive Learning**: Support for both English and Chinese vocabulary acquisition
3. **Improved User Experience**: Automatic language detection and smart defaults
4. **Extensible Architecture**: Foundation for adding more language pairs in the future

## Implementation Scope
This change includes two main capabilities:
1. **Chinese-to-English Translation** (see specs/chinese-to-english-translation/)
2. **Chinese Vocabulary Support** (see specs/chinese-vocabulary-support/)

Both capabilities will be implemented together to provide a complete bidirectional translation experience.
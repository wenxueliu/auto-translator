# Bidirectional Translation Design

## Overview
This design document outlines the technical approach for implementing bidirectional Chinese-English translation and Chinese vocabulary support in the Chrome extension.

## Current Architecture Analysis

### Existing Components
- **TranslationService**: Handles AI model integration with hardcoded English→Chinese prompts
- **Background Script**: Manages context menus and vocabulary storage (English-only)
- **Content Script**: Processes DOM text and handles translation requests
- **Popup Interface**: Settings and vocabulary management (English vocabulary only)
- **Storage Schema**: Simple key-value vocabulary storage

### Current Limitations
1. **Monolingual Prompts**: All AI prompts assume English→Chinese translation
2. **No Language Detection**: No mechanism to determine source language
3. **English-Only Vocabulary**: Storage and UI only support English words
4. **Fixed Translation Direction**: No configuration for translation direction

## Proposed Architecture

### 1. Language Detection System

#### Implementation Strategy
```javascript
class LanguageDetector {
    static detectLanguage(text) {
        // Check for Chinese characters
        const chineseRegex = /[\u4e00-\u9fff]/;
        // Check for English words
        const englishRegex = /[a-zA-Z]+/;

        const hasChinese = chineseRegex.test(text);
        const hasEnglish = englishRegex.test(text);

        if (hasChinese && !hasEnglish) return 'zh';
        if (hasEnglish && !hasChinese) return 'en';
        if (hasChinese && hasEnglish) return 'mixed';
        return 'unknown';
    }

    static getTranslationDirection(sourceLang, settings) {
        const { translationDirection } = settings;

        if (translationDirection === 'auto') {
            return sourceLang === 'zh' ? 'zh-to-en' : 'en-to-zh';
        }
        return translationDirection;
    }
}
```

### 2. Enhanced Translation Service

#### Dynamic Prompt Generation
```javascript
class EnhancedTranslationService extends TranslationService {
    getModelPayload(model, word, context, settings, translationDirection) {
        const prompts = this.getPromptsByDirection(translationDirection);

        if (model.startsWith('gpt-') || model === 'custom-openai') {
            return {
                model: model === 'custom-openai' ? settings.customModelName : model,
                messages: [
                    {
                        role: 'system',
                        content: prompts.system
                    },
                    {
                        role: 'user',
                        content: prompts.user(word, context)
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            };
        }
        // Similar pattern for other models...
    }

    getPromptsByDirection(direction) {
        const promptMap = {
            'zh-to-en': {
                system: '你是一个专业的翻译助手。将中文单词翻译成英文，考虑上下文，只返回简洁的英文翻译。',
                user: (word, context) => `${word}（上下文：${context}）`
            },
            'en-to-zh': {
                system: '你是一个专业的翻译助手。将英文单词翻译成中文，考虑上下文，只返回简洁的中文翻译。',
                user: (word, context) => `${word}（上下文：${context}）`
            }
        };

        return promptMap[direction] || promptMap['en-to-zh'];
    }
}
```

### 3. Extended Storage Schema

#### Vocabulary Storage Structure
```javascript
// Enhanced vocabulary entry structure
{
  "normalizedKey": {
    word: "原始文本",
    translation: "翻译结果",
    language: "zh" | "en" | "mixed",
    sourceLanguage: "zh" | "en",
    targetLanguage: "en" | "zh",
    addedAt: "ISOString",
    frequency: 1,
    type: "word" | "phrase",
    wordCount: 1,
    // Chinese-specific fields
    pinyin: "pinyin pronunciation",
    // Context metadata
    context: "usage context",
    domain: "technology" | "general" | "business"
  }
}
```

#### Settings Structure Extension
```javascript
{
  "settings": {
    // Existing fields
    apiKey: "sk-...",
    apiModel: "qwen-mt-turbo",
    contextAware: true,
    showOriginal: false,

    // New fields
    translationDirection: "auto" | "en-to-zh" | "zh-to-en",
    autoDetectLanguage: true,
    sourceLanguage: "auto" | "en" | "zh",
    targetLanguage: "auto" | "zh" | "en",
    showPinyin: true,
    vocabularyLanguageFilter: "all" | "en" | "zh"
  }
}
```

### 4. UI/UX Enhancements

#### Dynamic Context Menus
- Language-aware menu text based on detection
- Direction indicators in menu items
- Visual feedback for detected language

#### Enhanced Popup Interface
- Language direction selector dropdown
- Bilingual vocabulary display with tabs
- Chinese character rendering with pinyin support
- Language filter for vocabulary list

### 5. Implementation Strategy

#### Phase 1: Core Infrastructure
1. Extend TranslationService with direction support
2. Implement LanguageDetector utility
3. Update storage schema with backward compatibility
4. Add language direction settings to popup

#### Phase 2: Chinese Translation Support
1. Implement Chinese→English AI prompts for all models
2. Add language detection to content script
3. Update context menus for language awareness
4. Implement dynamic translation routing

#### Phase 3: Chinese Vocabulary Support
1. Extend vocabulary system for multilingual entries
2. Add Chinese-specific metadata (pinyin, context)
3. Update popup UI for bilingual vocabulary
4. Implement language-based filtering and search

#### Phase 4: Polish and Optimization
1. Performance optimization for language detection
2. Error handling improvements
3. User experience refinements
4. Comprehensive testing

## Technical Considerations

### Character Encoding
- Ensure UTF-8 support throughout the system
- Handle Chinese character rendering in UI components
- Proper encoding for storage and export

### Performance
- Efficient language detection using regex patterns
- Cached language detection results for repeated text
- Optimized Chinese text processing

### Backward Compatibility
- Existing English vocabulary remains functional
- Default settings maintain current behavior
- Gradual migration path for existing users

### Error Handling
- Graceful fallback for language detection failures
- Clear error messages for unsupported languages
- Robust handling of mixed-language content

## Testing Strategy

### Language Detection Tests
- Pure Chinese text detection
- Pure English text detection
- Mixed content handling
- Edge cases (numbers, symbols, empty text)

### Translation Accuracy Tests
- Chinese→English translation quality
- Context-aware translation accuracy
- Model compatibility verification

### Vocabulary System Tests
- Chinese vocabulary addition/retrieval
- Bilingual vocabulary display
- Import/export functionality
- Search and filtering

### UI/UX Tests
- Language direction settings
- Dynamic menu behavior
- Chinese character rendering
- Responsive design for mixed content

## Future Extensibility

This architecture provides foundation for:
- Additional language pairs (Japanese, Korean, etc.)
- Advanced language detection using ML models
- Multiple translation directions simultaneously
- Language learning features and progress tracking
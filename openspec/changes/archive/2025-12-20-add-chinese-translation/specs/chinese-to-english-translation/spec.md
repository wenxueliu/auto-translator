# Chinese-to-English Translation Capability

## ADDED Requirements

### Requirement: Language Direction Configuration
The extension SHALL support user-configurable translation direction settings allowing users to choose between English→Chinese, Chinese→English, or automatic detection modes.
#### Scenario:
User opens extension settings and selects translation direction "Chinese to English". When translating selected Chinese text, the extension should use Chinese→English translation prompts and return English results.

### Requirement: Dynamic AI Prompt Generation
The translation service SHALL automatically generate appropriate AI prompts based on detected source language and configured translation direction, supporting all AI models with consistent translation quality.
#### Scenario:
System detects selected text is Chinese characters. The translation service should automatically generate appropriate AI prompts for Chinese→English translation based on the selected model, considering context and providing English translation results.

### Requirement: Chinese Text Processing
The system SHALL properly identify, process, and translate Chinese text including characters, phrases, and mixed-language content with accurate language detection.
#### Scenario:
User selects Chinese text "你好世界" and clicks translate. The system should:
1. Detect the text contains Chinese characters
2. Determine appropriate translation direction (Chinese→English)
3. Process the text through configured AI model
4. Return "Hello World" as the translation result

### Requirement: Context-Aware Chinese Translation
Chinese translation SHALL consider surrounding context to provide accurate English translations, distinguishing between homophones and words with multiple meanings.
#### Scenario:
User selects Chinese text "苹果" in the context of technology discussion. The system should provide "Apple" as translation, considering the context rather than the fruit meaning.

### Requirement: Auto Language Detection
The extension SHALL automatically detect the primary language of selected text and determine appropriate translation direction when configured for automatic mode.
#### Scenario:
User has "Auto detect" setting enabled and selects mixed content. The system should automatically determine if the primary language is Chinese or English and use appropriate translation direction.

### Requirement: Model-Agnostic Chinese Translation
All supported AI models SHALL provide consistent Chinese→English translation capabilities with model-specific prompt formatting while maintaining translation quality across different providers.
#### Scenario:
User configures different AI models (OpenAI, Claude, Gemini, etc.). All models should support Chinese→English translation with model-specific prompt formatting while maintaining consistent translation quality.

### Requirement: Translation Direction Persistence
Translation direction settings SHALL persist across browser sessions and remain active until manually changed by the user.
#### Scenario:
User sets translation direction to Chinese→English. The setting should persist across browser sessions and be applied to all subsequent translation requests until manually changed.

### Requirement: Error Handling for Chinese Translation
The system SHALL gracefully handle Chinese translation failures with appropriate fallback mechanisms and user-friendly error messages in the interface language.
#### Scenario:
Chinese translation request fails due to API error. The system should gracefully fallback to local translation or display appropriate error message in Chinese interface language.

### Requirement: Performance Optimization for Chinese Text
Chinese translation processing SHALL be optimized for performance, handling long texts efficiently with appropriate chunking and context preservation.
#### Scenario:
User translates long Chinese paragraph. The translation should complete within reasonable time limits, with appropriate chunking for large texts and maintaining context between segments.

### Requirement: Chinese Text Validation
The system SHALL validate and classify Chinese text accurately, distinguishing between pure Chinese, mixed-language content, and identifying dominant language for translation routing.
#### Scenario:
User selects text containing both Chinese and English. The system should identify dominant language and apply appropriate translation direction, with clear indication of detected language.

## MODIFIED Requirements

### Requirement: Translation Service Architecture
The existing TranslationService SHALL be extended to support bidirectional translation with language direction parameters and dynamic prompt generation for multiple language pairs.
#### Scenario:
TranslationService.getTranslation() method should accept additional language direction parameter and route requests to appropriate translation handlers based on source/target language configuration.

### Requirement: Settings Schema Extension
The Chrome extension settings storage SHALL be extended to include language configuration fields while maintaining backward compatibility with existing settings structure.
#### Scenario:
Extension settings should include new fields for translationDirection, autoDetectLanguage, and sourceLanguage/targetLanguage preferences alongside existing apiKey and apiModel settings.

### Requirement: Context Menu Behavior
Context menu text and behavior SHALL be dynamically updated based on detected text language and current translation direction settings.
#### Scenario:
Right-click context menus should display appropriate text based on current translation direction settings and detected text language, showing "翻译为英文" for Chinese text and "Translate to Chinese" for English text.
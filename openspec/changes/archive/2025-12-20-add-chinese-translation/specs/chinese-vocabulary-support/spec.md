# Chinese Vocabulary Support Capability

## ADDED Requirements

### Requirement: Chinese Vocabulary Addition
The vocabulary system SHALL support adding Chinese words and phrases with appropriate metadata including language classification, pinyin pronunciation, and English translations.
#### Scenario:
User selects Chinese text "学习" and right-clicks "添加到词库". The system should add the Chinese word to vocabulary with metadata including language type, pinyin, and English translation.

### Requirement: Multilingual Vocabulary Storage
The vocabulary storage system SHALL handle mixed-language entries with proper language classification and metadata while maintaining search and filtering capabilities across languages.
#### Scenario:
User has both English and Chinese words in vocabulary. The storage system should distinguish between languages and store appropriate metadata for each entry (language, translation, pronunciation, etc.).

### Requirement: Chinese Vocabulary Display
The vocabulary popup interface SHALL properly display Chinese characters with optional pinyin, English translations, and usage examples in a clear, readable format.
#### Scenario:
User opens vocabulary popup containing Chinese word "计算机". The display should show the Chinese characters, pinyin "jìsuànjī", English translation "computer", and contextual usage examples.

### Requirement: Chinese Vocabulary Search
The vocabulary search functionality SHALL support searching Chinese characters, pinyin, and English translations with cross-language matching capabilities.
#### Scenario:
User searches vocabulary for "电脑". The system should return matching Chinese vocabulary entries and also find English entries where "电脑" appears in translations.

### Requirement: Chinese Vocabulary Import/Export
The import/export system SHALL handle Chinese vocabulary with proper UTF-8 encoding, preserving all Chinese-specific metadata including pinyin and context information.
#### Scenario:
User exports vocabulary containing Chinese words. The exported JSON should include all Chinese-specific metadata and be importable while preserving Chinese character encoding and language information.

### Requirement: Pinyin Support
The vocabulary system SHALL support pinyin generation, storage, and display for Chinese vocabulary entries to assist with pronunciation and learning.
#### Scenario:
User adds Chinese word "北京" to vocabulary. The system should automatically generate or allow manual input of pinyin "běijīng" for pronunciation reference.

### Requirement: Chinese Character Recognition
The system SHALL properly recognize Chinese characters, words, and phrases for vocabulary categorization and processing.
#### Scenario:
User adds Chinese phrase "你好世界" to vocabulary. The system should recognize this as Chinese content, categorize appropriately, and handle multi-character vocabulary entries.

### Requirement: Bilingual Vocabulary Management
The vocabulary management interface SHALL support mixed-language vocabulary lists with clear language indicators and filtering capabilities.
#### Scenario:
User views vocabulary list containing both English and Chinese entries. The interface should clearly indicate language type and allow filtering by language.

### Requirement: Chinese Vocabulary Context
Chinese vocabulary entries SHALL capture and store contextual information to provide accurate translations and usage examples.
#### Scenario:
User adds Chinese word "苹果" from technology context. The vocabulary entry should store the context and provide appropriate English translation "Apple" rather than fruit meaning.

### Requirement: Vocabulary Statistics by Language
The vocabulary statistics system SHALL provide separate counts and progress indicators for English and Chinese vocabulary entries.
#### Scenario:
User checks vocabulary statistics. The system should show separate counts for English words, Chinese words, and phrases, with learning progress indicators for each language.

## MODIFIED Requirements

### Requirement: Vocabulary Schema Extension
The existing vocabulary storage schema SHALL be extended to support language metadata, translations, pinyin, and context information while maintaining backward compatibility.
#### Scenario:
Vocabulary storage structure should include language field, translation field, pinyin field (for Chinese), and context metadata while maintaining backward compatibility with existing English vocabulary entries.

### Requirement: Background Script Language Detection
The background script vocabulary addition functions SHALL detect source language and store appropriate metadata for Chinese vocabulary entries.
#### Scenario:
addToVocabulary() function should detect source language of selected text and store appropriate metadata in vocabulary entry based on whether text contains Chinese characters.

### Requirement: Popup Interface Language Support
The popup interface SHALL properly render Chinese characters, support mixed-language vocabulary lists, and provide appropriate controls for Chinese vocabulary management.
#### Scenario:
Popup vocabulary display should render Chinese characters correctly, support mixed-language vocabulary lists, and provide appropriate input methods for Chinese vocabulary management.

### Requirement: Context Menu Language Awareness
Context menus for vocabulary operations SHALL display appropriate text based on the detected language of selected text.
#### Scenario:
Right-click menu for adding to vocabulary should display appropriate text ("添加到词库" for Chinese text, "Add to vocabulary" for English text) based on detected language of selected text.

### Requirement: Import/Export Language Preservation
The import/export functionality SHALL preserve language metadata and handle Chinese character encoding correctly across different systems and browser environments.
#### Scenario:
Vocabulary import/export functionality should preserve language metadata and handle Chinese character encoding correctly across different systems and browsers.
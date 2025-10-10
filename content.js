// 内容脚本 - 处理页面翻译和DOM操作

let isTranslating = false;
let originalTexts = new Map();
let vocabulary = {};
let settings = {};

// 创建翻译服务实例
class TranslationService {
    constructor() {
        this.localTranslations = {
        };
    }
    
    async getTranslation(word, context, settings) {
        try {
            console.log('🤖 开始翻译:', word);
            
            // 检查是否有API key
            if (!settings.apiKey) {
                console.log('⚠️ 无API key，使用本地翻译');
                return this.getLocalTranslation(word);
            }
            
            // 使用OpenAI API
            return await this.getOpenAITranslation(word, context, settings);
            
        } catch (error) {
            console.error('❌ 翻译失败:', error);
            return this.getLocalTranslation(word) || word;
        }
    }
    
    async getOpenAITranslation(word, context, settings) {
        try {
            // 获取模型对应的URL
            const url = this.getModelUrl(settings.apiModel || 'qwen-mt-turbo', settings);
            const headers = this.getModelHeaders(settings.apiModel || 'qwen-mt-turbo', settings.apiKey);
            const payload = this.getModelPayload(settings.apiModel || 'qwen-mt-turbo', word, context, settings);
            
            console.log(`🌐 使用模型: ${settings.apiModel || 'qwen-mt-turbo'}`);
            console.log(`🔗 请求URL: ${url}`);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            const translation = this.extractTranslation(data, settings.apiModel || 'qwen-mt-turbo');
            console.log('✅ 翻译成功:', word, '->', translation);
            return translation;
            
        } catch (error) {
            console.error('❌ 翻译失败:', {
                word: word,
                error: error.message,
                status: error.status
            });
            return this.getLocalTranslation(word) || word;
        }
    }
    
    getLocalTranslation(word) {
        return this.localTranslations[word.toLowerCase()];
    }
    
    // 获取模型对应的URL
    getModelUrl(model, settings = {}) {
        const modelUrls = {
            'gpt-3.5-turbo': 'https://api.openai.com/v1/chat/completions',
            'gpt-4': 'https://api.openai.com/v1/chat/completions',
            'gpt-4-turbo': 'https://api.openai.com/v1/chat/completions',
            'claude-3-haiku': 'https://api.anthropic.com/v1/messages',
            'claude-3-sonnet': 'https://api.anthropic.com/v1/messages',
            'claude-3-opus': 'https://api.anthropic.com/v1/messages',
            'gemini-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            'gemini-1.5-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            'gemini-1.5-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
            'deepseek-chat': 'https://api.deepseek.com/chat/completions',
            'qwen-mt-turbo': 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            'qwen-mt-plus': 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        };

        // 如果是自定义OpenAI模型
        if (model === 'custom-openai' && settings.customModelUrl) {
            return settings.customModelUrl;
        }

        return modelUrls[model] || modelUrls['gpt-3.5-turbo'];
    }
    
    // 获取模型对应的请求头
    getModelHeaders(model, apiKey) {
        if (model.startsWith('gpt-') || model === 'custom-openai') {
            return {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
        } else if (model.startsWith('claude-')) {
            return {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            };
        } else if (model.startsWith('gemini-')) {
            return {
                'Content-Type': 'application/json'
            };
        }
        
        return {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
    }
    
    // 获取模型对应的请求体
    getModelPayload(model, word, context, settings = {}) {
        if (model.startsWith('gpt-') || model === 'custom-openai') {
            const modelName = model === 'custom-openai' ? (settings.customModelName || 'gpt-3.5-turbo') : model;
            return {
                model: modelName,
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的翻译助手。将英文单词翻译成中文，考虑上下文，只返回简洁的中文翻译。'
                    },
                    {
                        role: 'user',
                        content: `${word}（上下文：${context}）`
                    }
                ],
                max_tokens: 5,
                temperature: 0.1
            };
        } else if (model.startsWith('claude-')) {
            return {
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: `将英文单词"${word}"翻译成中文，考虑上下文"${context}"。只返回中文翻译结果。`
                    }
                ],
                max_tokens: 5,
                temperature: 0.1
            };
        } else if (model.startsWith('gemini-')) {
            return {
                contents: [
                    {
                        parts: [
                            {
                                text: `将英文单词"${word}"翻译成中文，考虑上下文"${context}"。只返回中文翻译结果。`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 5
                }
            };
        } else if (model.startsWith('deepseek-')) {
                return {
                    model: model,
                    messages: [
                        {
                             role: 'system',
                             content: '你是一个中英文翻译专家，将用户输入的中文翻译成英文，或将用户输入的英文翻译成中文。对于非中文内容，它将提供中文翻译结果。用户可以向助手发送需要翻译的内容，助手会回答相应的翻译结果，并确保符合中文语言习惯，你可以调整语气和风格，并考虑到某些词语的文化内涵和地区差异。同时作为翻译家，需将原文翻译成具有信达雅标准的译文。"信" 即忠实于原文的内容与意图；"达" 意味着译文应通顺易懂，表达清晰；"雅" 则追求译文的文化审美和语言的优美。目标是创作出既忠于原作精神，又符合目标语言文化和读者审美的翻译。'
                        },
                        {
                             role: 'user',
                             content: `将英文单词"${word}"翻译成中文，考虑上下文"${context}"。只返回"${word}"的中文翻译结果。`
                        }
                    ],
                    max_tokens: 2048,
                    temperature: 1.3
                };
        } else if (model.startsWith('qwen-')) {
                 return {
                     model: model,
                     messages: [
                         {
                              role: 'user',
                              content: `将英文单词"${word}"翻译成中文，考虑上下文"${context}"。只返回"${word}"的中文翻译结果。`
                         }
                     ],
                     translation_options: {
                           source_lang: 'English',
                           target_lang: 'Chinese'
                     }
                 };
        }
        return {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: `将"${word}"翻译成中文`
                }
            ],
            max_tokens: 5,
            temperature: 0.1
        };
    }
    
    // 从响应中提取翻译结果
    extractTranslation(data, model) {
        try {
            if (model.startsWith('gpt-') || model.startsWith('qwen-') || model === 'custom-openai') {
                return data.choices[0].message.content.trim();
            } else if (model.startsWith('claude-')) {
                return data.content[0].text.trim();
            } else if (model.startsWith('gemini-')) {
                return data.candidates[0].content.parts[0].text.trim();
            }
            
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('❌ 解析翻译结果失败:', error);
            return '';
        }
    }
}

// 创建翻译服务实例
const translationService = new TranslationService();

// 初始化
async function init() {
    console.log('智能翻译插件已加载');
    
    // 加载词库和设置
    await loadSettings();
    await loadVocabulary();
    
    // 监听消息
    window.addEventListener('message', handleMessage);
    
    // 监听存储变化
    chrome.storage.onChanged.addListener((changes, namespace) => {
        console.log('存储变化:', changes, '命名空间:', namespace);
        if (namespace === 'local') {
            if (changes.vocabulary) {
                vocabulary = changes.vocabulary.newValue || {};
                console.log('✅ 词库已更新，新词库:', Object.keys(vocabulary));
                console.log('📊 词库大小:', Object.keys(vocabulary).length);
            }
            if (changes.settings) {
                settings = changes.settings.newValue || {};
                console.log('设置已更新');
            }
        }
    });
    
    // 手动刷新词库
    async function refreshVocabulary() {
        try {
            const result = await new Promise((resolve) => {
                chrome.storage.local.get(['vocabulary'], resolve);
            });
            vocabulary = result.vocabulary || {};
            console.log('🔄 手动刷新词库成功:', Object.keys(vocabulary));
            return vocabulary;
        } catch (error) {
            console.error('❌ 刷新词库失败:', error);
            return {};
        }
    }
    
    // 每30秒自动刷新词库
//    setInterval(refreshVocabulary, 30000);
}

// 处理消息
function handleMessage(event) {
    if (event.source !== window) return;
    
    if (event.data.type === 'TRANSLATE_PAGE') {
        translatePage();
    } else if (event.data.type === 'TRANSLATE_SELECTION') {
        translateSelectedText(event.data.word);
    }
}

// 加载设置
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['settings']);
        settings = result.settings || {
            contextAware: true,
            showOriginal: false,
            apiKey: '',
            apiModel: 'qwen-mt-turbo'
        };
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 加载词库
async function loadVocabulary() {
    try {
        const result = await chrome.storage.local.get(['vocabulary']);
        vocabulary = result.vocabulary || {};
        console.log('已加载词库，包含', Object.keys(vocabulary).length, '个单词');
    } catch (error) {
        console.error('加载词库失败:', error);
    }
}

// 获取上下文感知的翻译
async function getContextualTranslation(word, context) {
    try {
        return await translationService.getTranslation(word, context, settings);
    } catch (error) {
        console.error('上下文翻译失败:', error);
        return word;
    }
}

// 获取页面中所有文本节点
function getTextNodes() {
    const textNodes = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // 过滤掉脚本、样式、注释等
                if (node.parentNode.tagName && 
                    ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'CODE', 'PRE'].includes(node.parentNode.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // 过滤掉空文本
                if (node.textContent.trim().length === 0) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

// 处理文本节点 - 支持单词和短语匹配，防止重复翻译
async function processTextNode(node) {
    let text = node.textContent;
    if (!text || text.trim().length === 0) {
        return false;
    }
    
    // 检查是否已经翻译过（检测翻译标记）
    const alreadyTranslated = hasAlreadyBeenTranslated(text);
    if (alreadyTranslated) {
        console.log('文本已翻译过，跳过处理');
        return false;
    }
    
    // 保存原始文本（如果尚未保存）
    if (!originalTexts.has(node)) {
        originalTexts.set(node, text);
    }
    
    // 获取所有词汇键（包括短语）
    const vocabularyKeys = Object.keys(vocabulary);
    if (vocabularyKeys.length === 0) return false;
    
    // 按长度降序排序，优先匹配长短语
    const sortedKeys = vocabularyKeys.sort((a, b) => b.length - a.length);
    
    let hasChanges = false;
    let processedText = text;
    const matches = [];
    
    // 检查每个词汇（短语优先）
    for (const key of sortedKeys) {
        const item = vocabulary[key];
        if (!item) continue;
        
        const searchText = item.word;
        
        // 跳过已翻译的词汇（检查是否已有翻译标记）
        if (isWordAlreadyTranslated(processedText, searchText)) {
            continue;
        }
        
        // 使用正则表达式匹配整个短语，考虑边界
        const regex = new RegExp(`\\b${escapeRegExp(searchText)}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(processedText)) !== null) {
            let translation = item.translation;
            
            // 如果尚未有翻译，则进行翻译
            if (!translation) {
                if (settings.contextAware && settings.apiKey && item.type === 'word') {
                    const context = getPhraseContext(processedText, match.index, searchText);
                    translation = await getContextualTranslation(searchText, context);
                } else if (settings.contextAware && settings.apiKey && item.type === 'phrase') {
                    // 短语使用更丰富的上下文
                    const context = getEnhancedPhraseContext(processedText, match.index, searchText);
                    translation = await getContextualTranslation(searchText, context);
                } else {
                    // 使用缓存或默认翻译
                    translation = item.translation || searchText;
                }
                
                // 缓存翻译结果
                if (translation !== searchText) {
                    vocabulary[key].translation = translation;
                }
            }
            
            matches.push({
                start: match.index,
                end: match.index + searchText.length,
                original: searchText,
                translated: `${searchText}(${translation})`
            });
        }
    }
    
    // 按位置排序并替换（从后向前避免索引变化）
    if (matches.length > 0) {
        matches.sort((a, b) => b.start - a.start);
        
        for (const match of matches) {
            processedText = processedText.slice(0, match.start) + 
                          match.translated + 
                          processedText.slice(match.end);
        }
        
        // 更新节点文本
        node.textContent = processedText;
        return true;
    }
    
    return false;
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 获取上下文
function getContext(node, wordIndex, words) {
    let context = '';
    
    // 获取前后各5个单词作为上下文
    const start = Math.max(0, wordIndex - 5);
    const end = Math.min(words.length, wordIndex + 6);
    
    for (let i = start; i < end; i++) {
        if (i === wordIndex) {
            context += `**${words[i]}** `;
        } else {
            context += words[i] + ' ';
        }
    }
    
    return context.trim();
}

// 获取单词的上下文
function getPhraseContext(text, startIndex, phrase) {
    const beforeContext = text.slice(Math.max(0, startIndex - 100), startIndex);
    const afterContext = text.slice(startIndex + phrase.length, Math.min(text.length, startIndex + phrase.length + 100));
    
    // 提取前后各20个单词作为上下文
    const beforeWords = beforeContext.split(/\s+/).slice(-20).join(' ');
    const afterWords = afterContext.split(/\s+/).slice(0, 20).join(' ');
    
    return `${beforeWords} **${phrase}** ${afterWords}`.trim();
}

// 获取短语的增强上下文
function getEnhancedPhraseContext(text, startIndex, phrase) {
    const sentenceRegex = /[^.!?]*[.!?]/g;
    const sentences = [];
    let match;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
        const sentence = match[0];
        const sentenceStart = match.index;
        const sentenceEnd = sentenceStart + sentence.length;
        
        if (startIndex >= sentenceStart && startIndex <= sentenceEnd) {
            // 找到包含短语的句子
            const phraseInSentence = sentence.includes(phrase) ? phrase : `[${phrase}]`;
            return sentence.replace(phrase, `**${phraseInSentence}**`);
        }
    }
    
    // 如果没找到句子，返回基本上下文
    return getPhraseContext(text, startIndex, phrase);
}

// 翻译页面
async function translatePage() {
    if (isTranslating) {
        console.log('正在翻译中...');
        return;
    }
    
    isTranslating = true;
    console.log('🔍 === 开始翻译页面 ===');
    console.log('📚 当前词库:', Object.keys(vocabulary));
    
    try {
        // 获取页面中所有文本节点
        const textNodes = getTextNodes();
        console.log(`📄 找到 ${textNodes.length} 个文本节点`);
        
        let translatedCount = 0;
        let nodeIndex = 0;
        
        for (const node of textNodes) {
            nodeIndex++;
            const wasTranslated = await processTextNode(node);
            if (wasTranslated) {
                translatedCount++;
            }
        }
        
        console.log(`🎉 翻译完成总结:`);
        console.log(`📊 共处理节点: ${textNodes.length}`);
        console.log(`✅ 翻译节点: ${translatedCount}`);
        
        if (translatedCount === 0) {
            console.warn('⚠️ 未找到匹配的英文单词');
            console.log('💡 建议：先用右键菜单添加英文单词到词库');
        }
        
    } catch (error) {
        console.error('❌ 翻译页面时出错:', error);
        console.error('错误堆栈:', error.stack);
    } finally {
        isTranslating = false;
        console.log('🔍 === 翻译结束 ===');
    }
}

// 恢复原始文本
function restoreOriginal() {
    originalTexts.forEach((originalText, node) => {
        if (node.textContent !== originalText) {
            node.textContent = originalText;
        }
    });
    originalTexts.clear();
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 收到消息:', request.action);
    
    if (request.action === 'translate') {
        translatePage();
        sendResponse({ success: true });
    } else if (request.action === 'restore') {
        restoreOriginal();
        sendResponse({ success: true });
    } else if (request.action === 'getSelection') {
        const selection = window.getSelection().toString().trim();
        sendResponse({ text: selection });
    } else if (request.action === 'vocabularyUpdated') {
        vocabulary = request.vocabulary || {};
        console.log('🔄 收到词库更新通知');
        sendResponse({ success: true });
    }
});

// 检查文本是否已经被翻译过（检测翻译标记）
function hasAlreadyBeenTranslated(text) {
    // 检测是否包含翻译标记格式：单词(翻译)
    const translationPattern = /\w+\([^)]+\)/g;
    return translationPattern.test(text);
}

// 检查特定单词是否已经被翻译
function isWordAlreadyTranslated(text, word) {
    // 检查该单词是否已经有翻译标记
    const escapedWord = escapeRegExp(word);
    const wordTranslationPattern = new RegExp(`\\b${escapedWord}\\([^)]+\\)`, 'gi');
    return wordTranslationPattern.test(text);
}

// 翻译选中的文字
async function translateSelectedText(word) {
    console.log('🎯 翻译选中文字:', word);
    
    if (!word || word.trim().length === 0) {
        console.log('选中文本为空');
        return;
    }
    
    try {
        // 遍历所有文本节点，查找并翻译选中的单词或短语
        const textNodes = getTextNodes();
        let translatedCount = 0;
        
        for (const node of textNodes) {
            let text = node.textContent;
            if (!text || !text.includes(word)) {
                continue;
            }
            
            // 检查是否已经翻译过
            if (isWordAlreadyTranslated(text, word)) {
                console.log('该单词已翻译过:', word);
                continue;
            }
            
            // 保存原始文本
            if (!originalTexts.has(node)) {
                originalTexts.set(node, text);
            }
            
            // 获取翻译
            let translation = '';
            const normalizedKey = word.toLowerCase().trim();
            const vocabItem = vocabulary[normalizedKey];
            
            if (vocabItem && vocabItem.translation) {
                // 使用缓存的翻译
                translation = vocabItem.translation;
            } else {
                // 实时翻译
                const context = getPhraseContext(text, text.indexOf(word), word);
                translation = await getContextualTranslation(word, context);
                
                // 缓存翻译结果
                if (vocabItem) {
                    vocabItem.translation = translation;
                }
            }
            
            if (translation && translation !== word) {
                // 替换文本
                const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
                const newText = text.replace(regex, `${word}(${translation})`);
                
                if (newText !== text) {
                    node.textContent = newText;
                    translatedCount++;
                    console.log('✅ 翻译并替换:', word, '->', translation);
                }
            }
        }
        
        console.log(`🎯 选中文字翻译完成，共翻译 ${translatedCount} 处`);
        
    } catch (error) {
        console.error('❌ 翻译选中文本失败:', error);
    }
}

// 初始化
init();
// 翻译功能模块

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
            const url = this.getModelUrl(settings.apiModel || 'gpt-3.5-turbo', settings);
            const headers = this.getModelHeaders(settings.apiModel || 'gpt-3.5-turbo', settings.apiKey);
            const payload = this.getModelPayload(settings.apiModel || 'gpt-3.5-turbo', word, context, settings);
            
            console.log(`🌐 使用模型: ${settings.apiModel || 'gpt-3.5-turbo'}`);
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
            const translation = this.extractTranslation(data, settings.apiModel || 'gpt-3.5-turbo');
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
            'deepseek-chat': 'https://api.deepseek.com/chat/completions'
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
                        content: '你是一个专业的翻译助手。将英文单词翻译成中文，考虑上下文，只返回简洁的中文翻译。'
                    },
                    {
                        role: 'user',
                        content: `将"${word}"翻译成中文，考虑上下文"${context}"。只返回中文翻译结果。`
                    }
                ],
                stream: false,
                max_tokens: 2048,
                temperature: 1.3
            };
        }
        
        return {
            model: model,
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的翻译助手。将英文单词翻译成中文，考虑上下文，只返回简洁的中文翻译。'
                },
                {
                    role: 'user',
                    content: `将"${word}"翻译成中文，考虑上下文"${context}"。只返回中文翻译结果。`
                }
            ],
            stream: false,
            max_tokens: 2048,
            temperature: 0.1
        };
    }
    
    // 从响应中提取翻译结果
    extractTranslation(data, model) {
        try {
            if (model.startsWith('gpt-') || model === 'custom-openai') {
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
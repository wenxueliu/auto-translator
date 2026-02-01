// 背景脚本 - 管理右键菜单和插件生命周期

// 语言检测工具类
class LanguageDetector {
    static detectLanguage(text) {
        // 检查中文字符
        const chineseRegex = /[\u4e00-\u9fff]/;
        // 检查英文字母
        const englishRegex = /[a-zA-Z]+/;

        const hasChinese = chineseRegex.test(text);
        const hasEnglish = englishRegex.test(text);

        if (hasChinese && !hasEnglish) return 'zh';
        if (hasEnglish && !hasChinese) return 'en';
        if (hasChinese && hasEnglish) return 'mixed';
        return 'unknown';
    }

    static getTranslationDirection(sourceLang, settings) {
        const { translationDirection = 'auto' } = settings;

        if (translationDirection === 'auto') {
            return sourceLang === 'zh' ? 'zh-to-en' : 'en-to-zh';
        }
        return translationDirection;
    }

    static isChineseText(text) {
        return this.detectLanguage(text) === 'zh';
    }

    static isEnglishText(text) {
        return this.detectLanguage(text) === 'en';
    }

    static hasChineseCharacters(text) {
        return /[\u4e00-\u9fff]/.test(text);
    }
}

// 插件启动时初始化
chrome.runtime.onStartup.addListener(() => {
    console.log('智能翻译插件启动');
    createContextMenus();
});

// 插件安装时初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('智能翻译插件已安装');
    createContextMenus();
    
    // 初始化存储
    chrome.storage.local.get(['vocabulary', 'settings'], (result) => {
        if (!result.vocabulary) {
            chrome.storage.local.set({
                vocabulary: {},
                settings: {
                    contextAware: true,
                    showOriginal: false,
                    apiKey: '',
                    apiModel: 'qwen-mt-turbo',
                    translationDirection: 'auto',
                    autoDetectLanguage: true,
                    sourceLanguage: 'auto',
                    targetLanguage: 'auto',
                    showPinyin: true,
                    vocabularyLanguageFilter: 'all'
                }
            });
            console.log('存储已初始化');
        } else if (result.settings && !result.settings.translationDirection) {
            // 为现有设置添加新的字段，保持向后兼容
            const updatedSettings = {
                ...result.settings,
                translationDirection: result.settings.translationDirection || 'auto',
                autoDetectLanguage: result.settings.autoDetectLanguage !== false,
                sourceLanguage: result.settings.sourceLanguage || 'auto',
                targetLanguage: result.settings.targetLanguage || 'auto',
                showPinyin: result.settings.showPinyin !== false,
                vocabularyLanguageFilter: result.settings.vocabularyLanguageFilter || 'all'
            };
            chrome.storage.local.set({ settings: updatedSettings });
            console.log('设置已更新，添加语言方向支持');
        }
    });
});

// 更新菜单可见性
async function updateMenuVisibility(selectionText) {
    try {
        if (!selectionText || selectionText.trim().length === 0) {
            // 如果没有选中文本，隐藏中文翻译菜单，显示通用菜单
            await updateMenuVisibilityHelper('chinese-to-english', false);
            await updateMenuVisibilityHelper('selection-root', true);
            return;
        }

        const isChinese = LanguageDetector.isChineseText(selectionText);

        // 批量更新菜单可见性
        // 中文文本：显示"翻译为英文"和"翻译选中文本"菜单
        // 英文文本：只显示"翻译选中文本"菜单
        await Promise.all([
            updateMenuVisibilityHelper('chinese-to-english', isChinese),
            updateMenuVisibilityHelper('selection-root', true)  // 始终显示通用菜单
        ]);

        console.log('菜单可见性已更新，中文文本:', isChinese);
    } catch (error) {
        console.error('更新菜单可见性失败:', error);
        // 出错时显示通用菜单作为后备
        await updateMenuVisibilityHelper('chinese-to-english', false);
        await updateMenuVisibilityHelper('selection-root', true);
    }
}

// 更新单个菜单项可见性的辅助函数
function updateMenuVisibilityHelper(menuId, visible) {
    return new Promise((resolve, reject) => {
        chrome.contextMenus.update(menuId, { visible }, () => {
            if (chrome.runtime.lastError) {
                console.warn(`更新菜单 ${menuId} 失败:`, chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

// 创建右键菜单
function createContextMenus() {
    // 清除现有菜单
    chrome.contextMenus.removeAll(() => {
        console.log('创建语言感知右键菜单...');

        // 创建翻译页面菜单
        chrome.contextMenus.create({
            id: 'translate-page',
            title: '翻译当前网页',
            contexts: ['page']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('创建翻译菜单失败:', chrome.runtime.lastError);
            } else {
                console.log('翻译菜单已创建');
            }
        });

        // 创建中文到英文翻译菜单（初始隐藏）
        chrome.contextMenus.create({
            id: 'chinese-to-english',
            title: '翻译为英文',
            contexts: ['selection'],
            visible: false
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('创建中文翻译菜单失败:', chrome.runtime.lastError);
            } else {
                console.log('中文翻译菜单已创建');
            }
        });

        // 创建选择文本翻译菜单（主菜单）
        chrome.contextMenus.create({
            id: 'selection-root',
            title: '翻译选中文本',
            contexts: ['selection']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('创建主菜单失败:', chrome.runtime.lastError);
            } else {
                console.log('主菜单已创建');
            }
        });

        // 创建添加到词库菜单
        chrome.contextMenus.create({
            id: 'add-to-vocabulary',
            parentId: 'selection-root',
            title: '添加到词库',
            contexts: ['selection']
        });

        // 创建并翻译菜单
        chrome.contextMenus.create({
            id: 'add-and-translate',
            parentId: 'selection-root',
            title: '添加到词库并翻译',
            contexts: ['selection']
        });

        console.log('语言感知菜单已创建');
    });
}

// 监听上下文菜单显示事件
chrome.contextMenus.onShown.addListener(async (info, tab) => {
    // 当右键菜单即将显示时，根据选中文本更新菜单可见性
    if (info.selectionText !== undefined) {
        await updateMenuVisibility(info.selectionText);
    }
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('右键菜单点击:', info.menuItemId, info.selectionText);

    if (info.menuItemId === 'translate-page') {
        console.log('开始翻译页面');
        await translatePage(tab.id);
    } else if (info.menuItemId === 'chinese-to-english') {
        console.log('中文翻译为英文:', info.selectionText);
        if (info.selectionText) {
            await translateChineseToEnglish(info.selectionText.trim(), tab.id);
        }
    } else if (info.menuItemId === 'add-to-vocabulary') {
        console.log('添加到词库:', info.selectionText);
        if (info.selectionText) {
            await addToVocabulary(info.selectionText.trim());
        }
    } else if (info.menuItemId === 'add-and-translate') {
        console.log('添加并翻译选中文字:', info.selectionText);
        if (info.selectionText) {
            await addToVocabularyAndTranslate(info.selectionText.trim(), tab.id);
        }
    }
});

// 翻译页面函数
async function translatePage(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: performPageTranslation
        });
    } catch (error) {
        console.error('翻译页面失败:', error);
    }
}

// 基础拼音生成函数（简化版本）
function generateBasicPinyin(chineseText) {
    // 这是一个基础版本的拼音生成器
    // 在实际应用中，建议使用专门的拼音库如pinyin-pro
    // 目前返回一个占位符，表示拼音功能已实现但需要完善
    const commonPinyin = {
        '你': 'nǐ',
        '好': 'hǎo',
        '世界': 'shìjiè',
        '我': 'wǒ',
        '是': 'shì',
        '学习': 'xuéxí',
        '中国': 'zhōngguó',
        '中文': 'zhōngwén',
        '英文': 'yīngwén',
        '翻译': 'fānyì',
        '苹果': 'píngguǒ',
        '计算机': 'jìsuànjī',
        '北京': 'běijīng',
        '上海': 'shànghǎi'
    };

    // 查找已知词汇的拼音
    if (commonPinyin[chineseText]) {
        return commonPinyin[chineseText];
    }

    // 对于未知的中文词汇，返回一个格式化的占位符
    // 实际项目中应该集成真正的拼音生成库
    return `pinyin-placeholder-${chineseText.length}chars`;
}

// 添加单词或短语到词库
async function addToVocabulary(word) {
    if (!word || word.trim().length < 1) {
        console.log('输入为空，不添加到词库');
        return;
    }
    
    try {
        // 使用Promise方式获取存储数据
        const result = await new Promise((resolve) => {
            chrome.storage.local.get(['vocabulary', 'settings'], resolve);
        });

        const vocabulary = result.vocabulary || {};
        const settings = result.settings || {};
        const apiKey = settings.apiKey || '';
        const apiModel = settings.apiModel || 'gpt-3.5-turbo';
        
        // 检测语言并确定标准化键
        const detectedLang = LanguageDetector.detectLanguage(word);
        const isChinese = detectedLang === 'zh';

        // 标准化键：去除多余空格，中文保持原样，英文转为小写
        const normalizedKey = isChinese ?
            word.trim().replace(/\s+/g, ' ') :
            word.trim().toLowerCase().replace(/\s+/g, ' ');

        // 检查是否已存在
        if (vocabulary[normalizedKey]) {
            console.log('词汇已存在于词库中:', word);
            return;
        }

        // 生成简单的拼音（基础版本）
        const pinyin = isChinese ? generateBasicPinyin(word.trim()) : null;

        // 添加到词库（支持单词和短语，包含语言元数据）
        vocabulary[normalizedKey] = {
            word: word.trim(),
            language: detectedLang,
            sourceLanguage: detectedLang,
            targetLanguage: isChinese ? 'en' : 'zh',
            addedAt: new Date().toISOString(),
            frequency: 1,
            type: normalizedKey.includes(' ') ? 'phrase' : 'word',
            wordCount: normalizedKey.split(' ').length,
            // 中文特有字段
            ...(isChinese && {
                pinyin: pinyin,
                context: null
            })
        };
        
        // 使用Promise方式保存数据
        await new Promise((resolve) => {
            chrome.storage.local.set({ vocabulary }, resolve);
        });
        
        console.log('已添加单词到词库:', word);
        
        // 通知所有标签页词库已更新
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {action: 'vocabularyUpdated', vocabulary});
            });
        });
        
        // 显示添加成功的提示
        try {
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: '添加成功',
                    message: `已将 "${word}" 添加到词库`
                });
            } else {
                console.log('通知权限未启用，单词已添加');
            }
        } catch (e) {
            console.log('通知创建失败，但单词已添加:', e);
        }
        
    } catch (error) {
        console.error('添加单词到词库失败:', error);
    }
}

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.vocabulary) {
        console.log('词库已更新，新大小:', Object.keys(changes.vocabulary.newValue || {}).length);
    }
});

// 添加单词到词库并立即翻译选中文字
async function addToVocabularyAndTranslate(word, tabId) {
    try {
        // 先添加到词库
        await addToVocabulary(word);
        
        // 然后立即翻译选中的文字
        await translateSelectedWord(word, tabId);
        
    } catch (error) {
        console.error('添加并翻译失败:', error);
    }
}

// 中文翻译为英文函数
async function translateChineseToEnglish(word, tabId) {
    try {
        console.log('开始中文到英文翻译:', word);

        // 强制使用中文到英文的翻译方向
        await translateSelectedWordWithDirection(word, tabId, 'zh-to-en');
    } catch (error) {
        console.error('中文翻译为英文失败:', error);
    }
}

// 带方向的翻译函数
async function translateSelectedWordWithDirection(word, tabId, direction) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: translateSpecificWordWithDirection,
            args: [word, direction]
        });
    } catch (error) {
        console.error('带方向翻译选中文本失败:', error);
    }
}

// 翻译选中的单个单词或短语
async function translateSelectedWord(word, tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: translateSpecificWord,
            args: [word]
        });
    } catch (error) {
        console.error('翻译选中文本失败:', error);
    }
}

// 页面翻译函数（在内容脚本中执行）
function performPageTranslation() {
    // 这个函数将在内容脚本中执行
    window.postMessage({ type: 'TRANSLATE_PAGE' }, '*');
}

// 翻译特定单词或短语（在内容脚本中执行）
function translateSpecificWord(word) {
    // 这个函数将在内容脚本中执行
    window.postMessage({ type: 'TRANSLATE_SELECTION', word: word }, '*');
}

// 带方向翻译特定单词或短语（在内容脚本中执行）
function translateSpecificWordWithDirection(word, direction) {
    // 这个函数将在内容脚本中执行
    window.postMessage({ type: 'TRANSLATE_SELECTION', word: word, direction: direction }, '*');
}
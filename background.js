// 背景脚本 - 管理右键菜单和插件生命周期

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
                    apiModel: 'qwen-mt-turbo'
                }
            });
            console.log('存储已初始化');
        }
    });
});

// 创建右键菜单
function createContextMenus() {
    // 清除现有菜单
    chrome.contextMenus.removeAll(() => {
        console.log('创建右键菜单...');
        
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
        
        // 创建添加到词库并翻译菜单
        chrome.contextMenus.create({
            id: 'add-to-vocabulary-translate',
            title: '添加到词库并翻译',
            contexts: ['selection']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('创建菜单失败:', chrome.runtime.lastError);
            } else {
                console.log('添加并翻译菜单已创建');
            }
        });
    });
}

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('右键菜单点击:', info.menuItemId, info.selectionText);
    
    if (info.menuItemId === 'translate-page') {
        console.log('开始翻译页面');
        await translatePage(tab.id);
    } else if (info.menuItemId === 'add-to-vocabulary-translate') {
        console.log('添加并翻译选中文字:', info.selectionText);
        if (info.selectionText) {
            await addToVocabularyAndTranslate(info.selectionText.trim(), tab.id);
        }
    }
});

// 监听扩展启动
chrome.runtime.onStartup.addListener(() => {
    console.log('扩展已启动');
});

// 监听扩展安装/更新
chrome.runtime.onInstalled.addListener((details) => {
    console.log('扩展状态:', details.reason);
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

// 添加单词或短语到词库
async function addToVocabulary(word) {
    if (!word || word.trim().length < 1) {
        console.log('输入为空，不添加到词库');
        return;
    }
    
    try {
        // 使用Promise方式获取存储数据
        const result = await new Promise((resolve) => {
            chrome.storage.local.get(['vocabulary', 'apiKey', 'apiModel'], resolve);
        });
        
        const vocabulary = result.vocabulary || {};
        const apiKey = result.apiKey || '';
        const apiModel = result.apiModel || 'gpt-3.5-turbo';
        
        // 标准化键：去除多余空格，转为小写
        const normalizedKey = word.trim().toLowerCase().replace(/\s+/g, ' ');
        
        // 检查是否已存在
        if (vocabulary[normalizedKey]) {
            console.log('词汇已存在于词库中:', word);
            return;
        }
        
        // 添加到词库（支持单词和短语）
        vocabulary[normalizedKey] = {
            word: word.trim(),
            addedAt: new Date().toISOString(),
            frequency: 1,
            type: normalizedKey.includes(' ') ? 'phrase' : 'word',
            wordCount: normalizedKey.split(' ').length
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
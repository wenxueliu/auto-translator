// popup.js - 设置页面功能

document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await loadVocabulary();
    setupEventListeners();
});

// 加载设置
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['settings', 'vocabulary']);
        const settings = result.settings || {};
        const vocabulary = result.vocabulary || {};
        
        // 填充API设置
        document.getElementById('apiKey').value = settings.apiKey || '';
        document.getElementById('apiModel').value = settings.apiModel || 'gpt-3.5-turbo';
        document.getElementById('customModelUrl').value = settings.customModelUrl || '';
        document.getElementById('customModelName').value = settings.customModelName || '';

        // 填充翻译设置
        document.getElementById('translationDirection').value = settings.translationDirection || 'auto';
        document.getElementById('contextAware').checked = settings.contextAware !== false;
        document.getElementById('showOriginal').checked = settings.showOriginal || false;
        document.getElementById('showPinyin').checked = settings.showPinyin !== false;

        // 填充词库设置
        document.getElementById('vocabularyLanguageFilter').value = settings.vocabularyLanguageFilter || 'all';

        // 显示/隐藏自定义模型配置
        toggleCustomModelConfig();
        
        console.log('设置已加载');
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 加载词库
async function loadVocabulary() {
    try {
        const result = await chrome.storage.local.get(['vocabulary', 'settings']);
        const vocabulary = result.vocabulary || {};
        const settings = result.settings || {};

        const vocabList = document.getElementById('vocabularyList');
        vocabList.innerHTML = '';

        // 获取语言筛选器设置
        const languageFilter = settings.vocabularyLanguageFilter || 'all';
        const showPinyin = settings.showPinyin !== false;

        let words = Object.values(vocabulary);

        // 按语言筛选
        if (languageFilter !== 'all') {
            words = words.filter(item => item.language === languageFilter);
        }

        if (words.length === 0) {
            vocabList.innerHTML = '<p style="color: #666; font-size: 12px;">' +
                (languageFilter === 'all' ? '词库为空' : '该语言下暂无词汇') + '</p>';
            return;
        }

        // 按添加时间排序
        words.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        words.forEach(item => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';

            // 语言标识和类型徽章
            const isChinese = item.language === 'zh';
            const languageBadge = isChinese ?
                '<span class="type-badge chinese">中文</span>' :
                '<span class="type-badge english">英文</span>';
            const typeBadge = item.type === 'phrase' ?
                '<span class="type-badge phrase">短语</span>' :
                '<span class="type-badge word">单词</span>';

            // 拼音显示（仅中文词汇且启用时）
            const pinyinDisplay = isChinese && showPinyin && item.pinyin ?
                `<span class="pinyin-text">${item.pinyin}</span>` : '';

            // 显示的词汇文本（保持原格式）
            const displayWord = item.word;

            wordItem.innerHTML = `
                <div>
                    <span class="word-text">${displayWord}</span>
                    ${pinyinDisplay}
                    <div class="word-badges">
                        ${languageBadge}
                        ${typeBadge}
                    </div>
                    <span class="word-meta">${item.wordCount || 1}词 · ${new Date(item.addedAt).toLocaleDateString()}</span>
                </div>
                <button class="delete-word" data-word="${item.word}">删除</button>
            `;
            vocabList.appendChild(wordItem);
        });

    } catch (error) {
        console.error('加载词库失败:', error);
    }
}

// 切换自定义模型配置显示
function toggleCustomModelConfig() {
    const modelSelect = document.getElementById('apiModel');
    const customConfig = document.getElementById('customModelConfig');

    if (modelSelect.value === 'custom-openai') {
        customConfig.style.display = 'block';
    } else {
        customConfig.style.display = 'none';
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 模型选择变化时切换自定义配置显示
    document.getElementById('apiModel').addEventListener('change', toggleCustomModelConfig);

    // 保存API配置
    document.getElementById('saveApiConfig').addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const apiModel = document.getElementById('apiModel').value;
        const customModelUrl = document.getElementById('customModelUrl').value.trim();
        const customModelName = document.getElementById('customModelName').value.trim();

        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};

            settings.apiKey = apiKey;
            settings.apiModel = apiModel;

            // 如果选择了自定义模型，保存自定义配置
            if (apiModel === 'custom-openai') {
                settings.customModelUrl = customModelUrl;
                settings.customModelName = customModelName;
            }

            await chrome.storage.local.set({ settings });
            showNotification('API配置已保存');
        } catch (error) {
            console.error('保存API配置失败:', error);
            showNotification('保存失败: ' + error.message, true);
        }
    });
    
    // 保存其他设置
    document.getElementById('saveSettings').addEventListener('click', async () => {
        const translationDirection = document.getElementById('translationDirection').value;
        const contextAware = document.getElementById('contextAware').checked;
        const showOriginal = document.getElementById('showOriginal').checked;
        const showPinyin = document.getElementById('showPinyin').checked;
        const vocabularyLanguageFilter = document.getElementById('vocabularyLanguageFilter').value;

        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};

            settings.translationDirection = translationDirection;
            settings.contextAware = contextAware;
            settings.showOriginal = showOriginal;
            settings.showPinyin = showPinyin;
            settings.vocabularyLanguageFilter = vocabularyLanguageFilter;

            await chrome.storage.local.set({ settings });
            showNotification('设置已保存');
        } catch (error) {
            console.error('保存设置失败:', error);
            showNotification('保存失败: ' + error.message, true);
        }
    });
    
    // 导出词库
    document.getElementById('exportVocab').addEventListener('click', async () => {
        try {
            const result = await chrome.storage.local.get(['vocabulary']);
            const vocabulary = result.vocabulary || {};

            // 统计信息
            const totalCount = Object.keys(vocabulary).length;
            if (totalCount === 0) {
                showNotification('词库为空，无法导出', true);
                return;
            }

            const chineseCount = Object.values(vocabulary).filter(item => item.language === 'zh').length;
            const englishCount = Object.values(vocabulary).filter(item => item.language === 'en').length;

            // 创建导出数据，包含统计信息
            const exportData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                statistics: {
                    total: totalCount,
                    chinese: chineseCount,
                    english: englishCount
                },
                vocabulary: vocabulary
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vocabulary_${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);
            showNotification(`词库已导出：共${totalCount}个词汇（中文${chineseCount}，英文${englishCount}）`);
        } catch (error) {
            console.error('导出词库失败:', error);
            showNotification('导出失败: ' + error.message, true);
        }
    });
    
    // 导入词库
    document.getElementById('importVocab').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    
    document.getElementById('importFile').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedData = JSON.parse(text);

            // 支持新旧两种格式
            let importedVocabulary;
            if (importedData.vocabulary && typeof importedData.vocabulary === 'object') {
                // 新格式（包含统计信息）
                importedVocabulary = importedData.vocabulary;
                console.log('导入新格式词库，版本:', importedData.version);
            } else if (typeof importedData === 'object' && importedData !== null) {
                // 旧格式（直接是词库对象）
                importedVocabulary = importedData;
                console.log('导入旧格式词库');
            } else {
                throw new Error('无效的词库文件格式');
            }

            // 验证导入的数据格式
            if (typeof importedVocabulary !== 'object' || importedVocabulary === null) {
                throw new Error('词库数据格式错误');
            }

            // 获取现有词库
            const result = await chrome.storage.local.get(['vocabulary']);
            const existingVocabulary = result.vocabulary || {};

            // 统计信息
            const importedCount = Object.keys(importedVocabulary).length;
            let newCount = 0;
            let updatedCount = 0;

            // 合并词库，保留最新添加的词汇
            const mergedVocabulary = { ...existingVocabulary };
            for (const [key, value] of Object.entries(importedVocabulary)) {
                if (mergedVocabulary[key]) {
                    // 词汇已存在，保留最新的（比较添加时间）
                    const existingDate = new Date(mergedVocabulary[key].addedAt || 0);
                    const importedDate = new Date(value.addedAt || 0);
                    if (importedDate > existingDate) {
                        mergedVocabulary[key] = value;
                        updatedCount++;
                    }
                } else {
                    // 新词汇
                    mergedVocabulary[key] = value;
                    newCount++;
                }
            }

            // 保存合并后的词库
            await chrome.storage.local.set({ vocabulary: mergedVocabulary });
            await loadVocabulary();

            // 显示详细的导入结果
            let message = `导入完成！新增: ${newCount}`;
            if (updatedCount > 0) {
                message += `，更新: ${updatedCount}`;
            }
            showNotification(message);

            // 清空文件输入，允许重复导入同一文件
            event.target.value = '';
        } catch (error) {
            console.error('导入词库失败:', error);
            if (error instanceof SyntaxError) {
                showNotification('导入失败: JSON格式错误', true);
            } else {
                showNotification('导入失败: ' + error.message, true);
            }
        }
    });
    
    // 删除单词
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-word')) {
            const word = event.target.dataset.word;
            
            try {
                const result = await chrome.storage.local.get(['vocabulary']);
                const vocabulary = result.vocabulary || {};
                
                const lowerWord = word.toLowerCase();
                delete vocabulary[lowerWord];
                
                await chrome.storage.local.set({ vocabulary });
                await loadVocabulary();
                
                showNotification(`已删除单词: ${word}`);
            } catch (error) {
                console.error('删除单词失败:', error);
                showNotification('删除失败: ' + error.message, true);
            }
        }
    });

    // 词库语言筛选变化时重新加载词库
    document.getElementById('vocabularyLanguageFilter').addEventListener('change', loadVocabulary);
}

// 显示通知
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${isError ? '#dc3545' : '#28a745'};
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
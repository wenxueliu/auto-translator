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
        document.getElementById('contextAware').checked = settings.contextAware !== false;
        document.getElementById('showOriginal').checked = settings.showOriginal || false;
        
        console.log('设置已加载');
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 加载词库
async function loadVocabulary() {
    try {
        const result = await chrome.storage.local.get(['vocabulary']);
        const vocabulary = result.vocabulary || {};
        
        const vocabList = document.getElementById('vocabularyList');
        vocabList.innerHTML = '';
        
        const words = Object.values(vocabulary);
        if (words.length === 0) {
            vocabList.innerHTML = '<p style="color: #666; font-size: 12px;">词库为空</p>';
            return;
        }
        
        // 按添加时间排序
        words.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        
        words.forEach(item => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            const lowerWord = item.word.toLowerCase();
            const typeBadge = item.type === 'phrase' ? 
                '<span class="type-badge phrase">短语</span>' : 
                '<span class="type-badge word">单词</span>';
            
            wordItem.innerHTML = `
                <div>
                    <span class="word-text">${lowerWord}</span>
                    ${typeBadge}
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

// 设置事件监听器
function setupEventListeners() {
    // 保存API配置
    document.getElementById('saveApiConfig').addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const apiModel = document.getElementById('apiModel').value;
        
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};
            
            settings.apiKey = apiKey;
            settings.apiModel = apiModel;
            
            await chrome.storage.local.set({ settings });
            showNotification('API配置已保存');
        } catch (error) {
            console.error('保存API配置失败:', error);
            showNotification('保存失败: ' + error.message, true);
        }
    });
    
    // 保存其他设置
    document.getElementById('saveSettings').addEventListener('click', async () => {
        const contextAware = document.getElementById('contextAware').checked;
        const showOriginal = document.getElementById('showOriginal').checked;
        
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};
            
            settings.contextAware = contextAware;
            settings.showOriginal = showOriginal;
            
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
            
            const dataStr = JSON.stringify(vocabulary, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vocabulary_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            showNotification('词库已导出');
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
            const importedVocabulary = JSON.parse(text);
            
            // 合并现有词库
            const result = await chrome.storage.local.get(['vocabulary']);
            const existingVocabulary = result.vocabulary || {};
            
            const mergedVocabulary = { ...existingVocabulary, ...importedVocabulary };
            
            await chrome.storage.local.set({ vocabulary: mergedVocabulary });
            await loadVocabulary();
            
            showNotification(`已导入 ${Object.keys(importedVocabulary).length} 个单词`);
        } catch (error) {
            console.error('导入词库失败:', error);
            showNotification('导入失败: ' + error.message, true);
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
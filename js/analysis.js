// 存储已选择的记录
let selectedRecords = [];

// 检查是否是通过正常方式进入页面
function checkNavigation() {
    // 检查是否有从index页面设置的标记
    if (!sessionStorage.getItem('fromIndexPage')) {
        // 如果没有标记，重定向到index.html
        window.location.href = 'index.html';
        return;
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    checkNavigation();
    initializeUI();
    loadRecentRecords();
});

// 初始化UI事件
function initializeUI() {
    // 添加记录按钮事件
    document.getElementById('add-record-btn').addEventListener('click', showRecordModal);
    
    // 关闭模态框按钮事件
    document.getElementById('close-modal').addEventListener('click', hideRecordModal);
    
    // 分析按钮事件
    document.getElementById('analyze-btn').addEventListener('click', startAnalysis);
    
    // 点击模态框外部关闭
    document.getElementById('record-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideRecordModal();
        }
    });
}

// 加载最近3条记录
function loadRecentRecords() {
    const records = getRecords();
    records.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
    // 选择最近的3条记录
    const recentRecords = records.slice(0, 3);
    recentRecords.forEach(record => addSelectedRecord(record));
    selectedRecords = recentRecords;
    
    updateRecordCount();
}

// 显示记录选择模态框
function showRecordModal() {
    const modal = document.getElementById('record-modal');
    const recordList = document.getElementById('record-list');
    const records = getRecords();
    
    // 清空记录列表
    recordList.innerHTML = '';
    
    // 按日期排序
    records.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
    // 渲染记录列表
    records.forEach(record => {
        const isSelected = selectedRecords.some(r => r.id === record.id);
        const recordEl = createRecordElement(record, isSelected);
        recordList.appendChild(recordEl);
    });
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// 隐藏记录选择模态框
function hideRecordModal() {
    const modal = document.getElementById('record-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// 创建记录元素
function createRecordElement(record, isSelected) {
    const recordEl = document.createElement('div');
    recordEl.className = `record-card bg-white border-l-4 rounded shadow-sm p-4 cursor-pointer ${isSelected ? 'border-[var(--primary)] bg-green-50' : ''}`;
    
    recordEl.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <div class="flex items-center">
                    <span class="text-xl mr-2">${record.mood}</span>
                    <h3 class="font-medium">${new Date(record.dateTime).toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'})}</h3>
                    <span class="ml-2 text-sm text-gray-500">${record.time}</span>
                </div>
                
                <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div class="flex items-center">
                        <i class="fas fa-bezier-curve text-gray-400 mr-1"></i>
                        <span>形状: ${record.shape}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-palette text-gray-400 mr-1"></i>
                        <span>颜色: ${record.color}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-wind text-gray-400 mr-1"></i>
                        <span>气味: ${record.smell}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-clock text-gray-400 mr-1"></i>
                        <span>时长: ${record.duration}分钟</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    recordEl.addEventListener('click', () => toggleRecordSelection(record, recordEl));
    
    return recordEl;
}

// 切换记录选择状态
function toggleRecordSelection(record, element) {
    const index = selectedRecords.findIndex(r => r.id === record.id);
    
    if (index === -1) {
        // 检查是否已达到最大选择数量
        if (selectedRecords.length >= 10) {
            showToast('最多只能选择10条记录');
            return;
        }
        // 添加记录
        selectedRecords.push(record);
        element.classList.add('border-[var(--primary)]', 'bg-green-50');
        addSelectedRecord(record);
    } else {
        // 检查是否低于最小选择数量
        if (selectedRecords.length <= 1) {
            showToast('至少需要选择1条记录');
            return;
        }
        // 移除记录
        selectedRecords.splice(index, 1);
        element.classList.remove('border-[var(--primary)]', 'bg-green-50');
        removeSelectedRecord(record.id);
    }
    
    updateRecordCount();
}

// 添加已选择的记录到显示区域
function addSelectedRecord(record) {
    const selectedRecordsContainer = document.getElementById('selected-records');
    const recordEl = document.createElement('div');
    recordEl.className = 'record-card bg-white border-l-4 rounded shadow-sm p-4 border-[var(--primary)]';
    recordEl.setAttribute('data-id', record.id);
    
    recordEl.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <div class="flex items-center">
                    <span class="text-xl mr-2">${record.mood}</span>
                    <h3 class="font-medium">${new Date(record.dateTime).toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'})}</h3>
                    <span class="ml-2 text-sm text-gray-500">${record.time}</span>
                </div>
                
                <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div class="flex items-center">
                        <i class="fas fa-bezier-curve text-gray-400 mr-1"></i>
                        <span>形状: ${record.shape}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-palette text-gray-400 mr-1"></i>
                        <span>颜色: ${record.color}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-wind text-gray-400 mr-1"></i>
                        <span>气味: ${record.smell}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-clock text-gray-400 mr-1"></i>
                        <span>时长: ${record.duration}分钟</span>
                    </div>
                </div>
            </div>
            
            <button class="remove-record text-gray-400 hover:text-red-500 p-2 rounded-full">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // 添加移除按钮事件
    recordEl.querySelector('.remove-record').addEventListener('click', () => {
        if (selectedRecords.length <= 1) {
            showToast('至少需要选择1条记录');
            return;
        }
        const recordId = recordEl.getAttribute('data-id');
        removeSelectedRecord(recordId);
        selectedRecords = selectedRecords.filter(r => r.id !== recordId);
        updateRecordCount();
    });
    
    selectedRecordsContainer.appendChild(recordEl);
}

// 从显示区域移除记录
function removeSelectedRecord(recordId) {
    const recordEl = document.querySelector(`#selected-records [data-id="${recordId}"]`);
    if (recordEl) {
        recordEl.remove();
    }
}

// 更新记录数量显示
function updateRecordCount() {
    document.getElementById('record-count').textContent = selectedRecords.length;
}

// 火山引擎DeepSeek API配置
const VOLCANO_API_KEY = 'b4884617-7a44-451b-b350-215bf46722f5';
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 开始分析
async function startAnalysis() {
    if (selectedRecords.length === 0) {
        showToast('请至少选择1条记录');
        return;
    }
    
    // 显示分析内容区域，隐藏占位符
    document.getElementById('analysis-content').classList.remove('hidden');
    document.getElementById('analysis-placeholder').classList.add('hidden');
    
    // 获取分析按钮
    const analyzeBtn = document.getElementById('analyze-btn');
    
    try {
        // 禁用分析按钮并显示加载状态
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>分析中...';
        
        // 准备分析数据
        const recordsText = selectedRecords.map((record, index) => {
            const date = new Date(record.dateTime).toLocaleDateString('zh-CN');
            return `记录${index + 1} (${date}):\n` +
                   `- 形状: ${record.shape}\n` +
                   `- 颜色: ${record.color}\n` +
                   `- 气味: ${record.smell}\n` +
                   `- 时长: ${record.duration}分钟\n` +
                   `- 心情: ${record.mood}\n` +
                   `- 备注: ${record.notes || '无'}\n`;
        }).join('\n');

        // 构建提示词
        const prompt = `你是世界顶级医生，拥有丰富的医学知识和临床经验。你的爱人向你提供了他们的排便记录，希望得到你的专业分析。
        请以宠溺、关怀的语气，结合专业医学知识，对排便记录进行详细分析，
        并给出饮食、作息、生活习惯等各方面建议。
        以下是排便记录:
        ${recordsText}
        `;

        // 准备API请求选项
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VOLCANO_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-r1-250120',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: true
            })
        };

        // 创建分析结果容器
        document.getElementById('analysis-content').innerHTML = `
            <div class="mb-4 p-3 bg-gray-50 rounded-md">
                <h5 class="font-medium text-gray-700 mb-2">偷偷告诉你</h5>
                <div id="reasoning-content" class="text-sm text-gray-600"></div>
            </div>
        `;

        const reasoningContent = document.getElementById('reasoning-content');
        const finalContent = document.getElementById('final-content');
        let currentContent = '';
        let isThinking = true;

        // 尝试不同的代理服务
        const proxyUrls = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://proxy.cors.sh/',
            ''
        ];

        let response = null;

        for (const proxy of proxyUrls) {
            try {
                const proxyUrl = proxy ? proxy + encodeURIComponent(VOLCANO_API_URL) : VOLCANO_API_URL;
                response = await fetch(proxyUrl, options);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API请求失败: ${response.status} - ${errorText}`);
                }
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices[0].delta.content || '';
                                currentContent += content;

                                if (currentContent.includes('<think>')) {
                                    if (isThinking) {
                                        reasoningContent.innerHTML = currentContent.replace(/\n/g, '<br>');
                                    } else {
                                        // 开始新的思考
                                        currentContent = content;
                                        reasoningContent.innerHTML = currentContent.replace(/\n/g, '<br>');
                                        isThinking = true;
                                    }
                                } else if (currentContent.includes('【最终答案：')) {
                                    if (isThinking) {
                                        // 切换到最终答案
                                        currentContent = content;
                                        isThinking = false;
                                    }
                                    finalContent.innerHTML = currentContent.replace(/\n/g, '<br>');
                                } else {
                                    if (isThinking) {
                                        reasoningContent.innerHTML = currentContent.replace(/\n/g, '<br>');
                                    } else {
                                        finalContent.innerHTML = currentContent.replace(/\n/g, '<br>');
                                    }
                                }
                            } catch (e) {
                                console.error('解析响应数据失败:', e);
                            }
                        }
                    }
                }
                break; // 如果成功获取数据，跳出循环
            } catch (error) {
                console.error(`使用代理 ${proxy} 失败:`, error);
                continue; // 尝试下一个代理
            }
        }

        // 如果所有代理都失败，显示错误信息
        if (!response) {
            throw new Error('所有API连接尝试均失败');
        }
        
    } catch (error) {
        console.error('分析过程出错:', error);
        showToast(error.message || '分析过程出现错误，请稍后重试');
        document.getElementById('analysis-content').innerHTML = `
            <div class="p-3 bg-red-50 rounded-md border-l-4 border-red-500">
                <h5 class="font-medium text-red-700 mb-2">分析失败</h5>
                <div class="text-red-600">抱歉，分析过程出现错误，请稍后重试。</div>
            </div>
        `;
    } finally {
        // 恢复分析按钮状态
        setTimeout(() => {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>重新分析';
        }, 1000);
    }
}

// 显示提示信息
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
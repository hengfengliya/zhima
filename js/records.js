// 存储图表实例
let charts = {
    shape: null,
    color: null,
    smell: null,
    mood: null,
    frequency: null,
    duration: null
};

// 检查是否是通过正常方式进入页面
function checkNavigation() {
    // 检查是否有从index页面设置的标记
    if (!sessionStorage.getItem('fromIndexPage')) {
        // 如果没有标记，重定向到index.html
        window.location.href = 'index.html';
        return;
    }
}

// 渲染记录列表
function renderRecords(records = null) {
    const recordsContainer = document.getElementById('records-container');
    const noRecordsMessage = document.getElementById('no-records-message');
    
    if (!records) {
        records = getRecords();
    }
    
    records.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
    recordsContainer.innerHTML = '';
    
    if (records.length === 0) {
        recordsContainer.appendChild(noRecordsMessage);
        return;
    }
    
    records.forEach(record => {
        const recordEl = document.createElement('div');
        recordEl.className = 'record-card bg-white border-l-4 rounded shadow-sm p-4';
        
        const moodColors = {
            '😊': 'border-green-500',
            '😐': 'border-yellow-500',
            '😣': 'border-orange-500',
            '😡': 'border-red-500'
        };
        
        recordEl.classList.add(moodColors[record.mood] || 'border-[var(--primary)]');
        
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
                    
                    ${record.notes ? `<p class="mt-2 text-gray-600 italic text-sm">"${record.notes}"</p>` : ''}
                </div>
                
                <button class="delete-record text-gray-400 hover:text-red-500 p-2 rounded-full" data-id="${record.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        recordsContainer.appendChild(recordEl);
    });
    
    document.querySelectorAll('.delete-record').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('确定要删除这条记录吗?')) {
                deleteRecord(id);
                renderRecords();
                renderCharts();
                showToast('记录已删除');
            }
        });
    });
}

// 渲染图表
function renderCharts() {
    const records = getRecords();
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 图表配色
    const chartColors = {
        background: isDarkMode ? '#263238' : '#ffffff',
        text: isDarkMode ? '#C8E6C9' : '#2E7D32',
        border: isDarkMode ? '#4B5E4A' : '#e5e7eb',
        colors: ['#4CAF50', '#81C784', '#FFCA28', '#FFD54F', '#e57373', '#A5D6A7', '#C8E6C9']
    };

    // 销毁现有图表实例
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].destroy();
            charts[key] = null;
        }
    });

    // 1. 形状分布图
    const shapeCanvas = document.getElementById('shape-chart');
    const shapeEmpty = document.getElementById('shape-chart-empty');
    const shapeData = {};
    records.forEach(record => {
        shapeData[record.shape] = (shapeData[record.shape] || 0) + 1;
    });
    if (Object.keys(shapeData).length > 0) {
        shapeCanvas.classList.remove('hidden');
        shapeEmpty.classList.add('hidden');
        charts.shape = new Chart(shapeCanvas, {
            type: 'pie',
            data: {
                labels: Object.keys(shapeData),
                datasets: [{
                    data: Object.values(shapeData),
                    backgroundColor: chartColors.colors,
                    borderColor: chartColors.border,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: chartColors.text } },
                    title: { display: false }
                }
            }
        });
    } else {
        shapeCanvas.classList.add('hidden');
        shapeEmpty.classList.remove('hidden');
    }

    // 2. 颜色分布图
    const colorCanvas = document.getElementById('color-chart');
    const colorEmpty = document.getElementById('color-chart-empty');
    const colorData = {};
    records.forEach(record => {
        colorData[record.color] = (colorData[record.color] || 0) + 1;
    });
    if (Object.keys(colorData).length > 0) {
        colorCanvas.classList.remove('hidden');
        colorEmpty.classList.add('hidden');
        charts.color = new Chart(colorCanvas, {
            type: 'pie',
            data: {
                labels: Object.keys(colorData),
                datasets: [{
                    data: Object.values(colorData),
                    backgroundColor: chartColors.colors,
                    borderColor: chartColors.border,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: chartColors.text } },
                    title: { display: false }
                }
            }
        });
    } else {
        colorCanvas.classList.add('hidden');
        colorEmpty.classList.remove('hidden');
    }

    // 3. 气味分布图
    const smellCanvas = document.getElementById('smell-chart');
    const smellEmpty = document.getElementById('smell-chart-empty');
    const smellData = {};
    records.forEach(record => {
        smellData[record.smell] = (smellData[record.smell] || 0) + 1;
    });
    if (Object.keys(smellData).length > 0) {
        smellCanvas.classList.remove('hidden');
        smellEmpty.classList.add('hidden');
        charts.smell = new Chart(smellCanvas, {
            type: 'pie',
            data: {
                labels: Object.keys(smellData),
                datasets: [{
                    data: Object.values(smellData),
                    backgroundColor: chartColors.colors,
                    borderColor: chartColors.border,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: chartColors.text } },
                    title: { display: false }
                }
            }
        });
    } else {
        smellCanvas.classList.add('hidden');
        smellEmpty.classList.remove('hidden');
    }

    // 4. 心情趋势图（散点图）
    const moodCanvas = document.getElementById('mood-chart');
    const moodEmpty = document.getElementById('mood-chart-empty');
    const moodOrder = { '😊': 4, '😐': 3, '😣': 2, '😡': 1 };
    const moodData = records.map(record => ({
        x: new Date(record.dateTime).getTime(),
        y: moodOrder[record.mood]
    })).sort((a, b) => a.x - b.x);
    if (moodData.length > 0) {
        moodCanvas.classList.remove('hidden');
        moodEmpty.classList.add('hidden');
        charts.mood = new Chart(moodCanvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: '心情趋势',
                    data: moodData,
                    backgroundColor: chartColors.colors[0],
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day', displayFormats: { day: 'yyyy-MM-dd' } },
                        title: { display: true, text: '日期', color: chartColors.text },
                        ticks: { color: chartColors.text }
                    },
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            callback: value => ['😡', '😣', '😐', '😊', ''][value - 1],
                            color: chartColors.text
                        },
                        title: { display: true, text: '心情', color: chartColors.text }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const date = new Date(context.raw.x);
                                const mood = ['😡', '😣', '😐', '😊', ''][context.raw.y - 1];
                                return `${date.toLocaleDateString('zh-CN')} - 心情: ${mood}`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        moodCanvas.classList.add('hidden');
        moodEmpty.classList.remove('hidden');
    }

    // 5. 每日排便次数图（折线图）
    const frequencyCanvas = document.getElementById('frequency-chart');
    const frequencyEmpty = document.getElementById('frequency-chart-empty');
    const frequencyData = {};
    records.forEach(record => {
        const date = formatDate(new Date(record.dateTime));
        frequencyData[date] = (frequencyData[date] || 0) + 1;
    });
    const frequencyDates = Object.keys(frequencyData).sort();
    const frequencyValues = frequencyDates.map(date => frequencyData[date]);
    if (frequencyDates.length > 0) {
        frequencyCanvas.classList.remove('hidden');
        frequencyEmpty.classList.add('hidden');
        charts.frequency = new Chart(frequencyCanvas, {
            type: 'line',
            data: {
                labels: frequencyDates,
                datasets: [{
                    label: '每日次数',
                    data: frequencyValues,
                    borderColor: chartColors.colors[0],
                    backgroundColor: chartColors.colors[0] + '50',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: '日期', color: chartColors.text }, ticks: { color: chartColors.text } },
                    y: { beginAtZero: true, title: { display: true, text: '次数', color: chartColors.text }, ticks: { color: chartColors.text } }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                }
            }
        });
    } else {
        frequencyCanvas.classList.add('hidden');
        frequencyEmpty.classList.remove('hidden');
    }
    
    // 6. 排便时长趋势图（折线图）
    const durationCanvas = document.getElementById('duration-chart');
    const durationEmpty = document.getElementById('duration-chart-empty');
    const durationData = records.map(record => ({
        x: new Date(record.dateTime).getTime(),
        y: record.duration
    })).sort((a, b) => a.x - b.x);
    
    if (durationData.length > 0) {
        durationCanvas.classList.remove('hidden');
        durationEmpty.classList.add('hidden');
        charts.duration = new Chart(durationCanvas, {
            type: 'line',
            data: {
                datasets: [{
                    label: '排便时长(分钟)',
                    data: durationData,
                    borderColor: chartColors.colors[5],
                    backgroundColor: chartColors.colors[5] + '50',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day', displayFormats: { day: 'yyyy-MM-dd' } },
                        title: { display: true, text: '日期', color: chartColors.text },
                        ticks: { color: chartColors.text }
                    },
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: '时长(分钟)', color: chartColors.text },
                        ticks: { color: chartColors.text }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const date = new Date(context.raw.x);
                                return `${date.toLocaleDateString('zh-CN')}: ${context.raw.y}分钟`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        durationCanvas.classList.add('hidden');
        durationEmpty.classList.remove('hidden');
    }
}

// 表单提交处理
function handleFormSubmit(event) {
    event.preventDefault();
    
    const date = document.getElementById('poop-date').value;
    const time = document.getElementById('poop-time').value;
    const shape = document.getElementById('poop-shape').value;
    const color = document.getElementById('poop-color').value;
    const smell = document.getElementById('poop-smell').value;
    const duration = document.getElementById('poop-duration').value;
    const mood = document.getElementById('poop-mood').value;
    const notes = document.getElementById('poop-notes').value;
    
    if (!date || !time || !shape || !color || !smell || !duration || !mood) {
        showToast('请填写所有必填字段', false);
        return;
    }
    
    const record = {
        id: Date.now().toString(),
        dateTime: `${date}T${time}:00`,
        date: date,
        time: time,
        shape: shape,
        color: color,
        smell: smell,
        duration: parseInt(duration),
        mood: mood,
        notes: notes
    };
    
    saveRecord(record);
    renderRecords();
    renderCharts();
    
    document.getElementById('poop-form').reset();
    document.querySelectorAll('.mood-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('notes-count').textContent = '0';
    
    const poopDateInput = document.getElementById('poop-date');
    const poopTimeInput = document.getElementById('poop-time');
    const poopDurationInput = document.getElementById('poop-duration');
    const durationSelect = document.getElementById('duration-select');
    
    poopDateInput.value = formatDate(new Date());
    poopTimeInput.value = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    poopDurationInput.value = 10; // 重置为默认10分钟
    durationSelect.value = 10;
    
    const encouragements = [
        "排便顺畅，心情愉快！", 
        "好的排便，好的心情！", 
        "肠道舒适，一天轻松！",
        "成功记录，健康生活！",
        "规律排便，健康保证！"
    ];
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    showToast(randomEncouragement);
}

// 导出数据为CSV
function exportToCSV(records) {
    const headers = ['日期', '时间', '形状', '颜色', '气味', '时长(分钟)', '心情', '备注'];
    const rows = records.map(record => [
        record.date,
        record.time,
        record.shape,
        record.color,
        record.smell,
        record.duration,
        record.mood,
        record.notes
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + 
        headers.join(",") + "\n" + 
        rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `拉屎日记_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 导出数据为JSON
function exportToJSON(records) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `拉屎日记_${formatDate(new Date())}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是通过正常方式进入页面
    checkNavigation();
    
    // 设置当前日期
    setCurrentDate();
    
    // 初始化表单日期和时间
    const poopDateInput = document.getElementById('poop-date');
    const poopTimeInput = document.getElementById('poop-time');
    
    poopDateInput.value = formatDate(new Date());
    poopTimeInput.value = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    
    // 初始化提示框
    tippy('[data-tippy-content]', {
        theme: 'light',
        placement: 'top',
        arrow: true,
        animation: 'scale'
    });
    
    // 为下拉选项添加提示框
    document.querySelectorAll('select option').forEach(option => {
        if (option.getAttribute('data-tooltip')) {
            option.setAttribute('data-tippy-content', option.getAttribute('data-tooltip'));
            option.removeAttribute('data-tooltip');
        }
    });
    
    // 初始化提示框时使用这个配置
    tippy('select option', {
        theme: 'light',
        placement: 'top',
        arrow: true,
        animation: 'scale',
        trigger: 'mouseenter', // 确保鼠标悬停时触发
        appendTo: () => document.body // 确保提示框附加到body上
    });
    
    // 心情选择
    document.querySelectorAll('.mood-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.mood-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('poop-mood').value = this.getAttribute('data-mood');
        });
    });
    
    // 默认选中第二个心情选项
    const secondMoodOption = document.querySelectorAll('.mood-option')[1];
    if (secondMoodOption) {
        secondMoodOption.classList.add('selected');
        document.getElementById('poop-mood').value = secondMoodOption.getAttribute('data-mood');
    };
    
    // 备注字数统计
    const notesTextarea = document.getElementById('poop-notes');
    const notesCount = document.getElementById('notes-count');
    
    notesTextarea.addEventListener('input', function() {
        notesCount.textContent = this.value.length;
    });
    
    // 时长选择器联动
    const durationInput = document.getElementById('poop-duration');
    const durationSelect = document.getElementById('duration-select');
    
    durationSelect.addEventListener('change', function() {
        durationInput.value = this.value;
    });
    
    durationInput.addEventListener('input', function() {
        if (this.value === '5' || this.value === '10' || this.value === '15' || this.value === '20' || this.value === '30') {
            durationSelect.value = this.value;
        }
    });
    
    // 表单提交
    document.getElementById('poop-form').addEventListener('submit', handleFormSubmit);
    
    // 搜索和过滤
    const searchInput = document.getElementById('search-input');
    const filterMood = document.getElementById('filter-mood');
    
    function filterRecords() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedMood = filterMood.value;
        
        let records = getRecords();
        
        if (searchTerm) {
            records = records.filter(record => 
                record.date.includes(searchTerm) || 
                record.notes.toLowerCase().includes(searchTerm) ||
                record.shape.toLowerCase().includes(searchTerm) ||
                record.color.toLowerCase().includes(searchTerm) ||
                record.smell.toLowerCase().includes(searchTerm)
            );
        }
        
        if (selectedMood) {
            records = records.filter(record => record.mood === selectedMood);
        }
        
        renderRecords(records);
    }
    
    searchInput.addEventListener('input', filterRecords);
    filterMood.addEventListener('change', filterRecords);
    
    // 导出功能
    const exportDataBtn = document.getElementById('export-data');
    const exportModal = document.getElementById('export-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const exportCSVBtn = document.getElementById('export-csv');
    const exportJSONBtn = document.getElementById('export-json');
    
    exportDataBtn.addEventListener('click', function() {
        exportModal.classList.remove('hidden');
    });
    
    closeModalBtn.addEventListener('click', function() {
        exportModal.classList.add('hidden');
    });
    
    exportCSVBtn.addEventListener('click', function() {
        const records = getRecords();
        if (records.length > 0) {
            exportToCSV(records);
            exportModal.classList.add('hidden');
            showToast('CSV文件导出成功');
        } else {
            showToast('没有记录可导出', false);
        }
    });
    
    exportJSONBtn.addEventListener('click', function() {
        const records = getRecords();
        if (records.length > 0) {
            exportToJSON(records);
            exportModal.classList.add('hidden');
            showToast('JSON文件导出成功');
        } else {
            showToast('没有记录可导出', false);
        }
    });
    
    // 健康分析功能
    const healthAnalysisBtn = document.getElementById('health-analysis');
    
    healthAnalysisBtn.addEventListener('click', async function() {
        const records = getRecords();
        if (records.length < 3) {
            showToast('需要至少3条记录才能进行健康分析', false);
            return;
        }
        // 设置标记，表示从records页面正常进入analysis页面
        sessionStorage.setItem('fromIndexPage', 'true');
        window.location.href = 'analysis.html';
    });
    
    // 点击模态框外部关闭
    exportModal.addEventListener('click', function(e) {
        if (e.target === exportModal) {
            exportModal.classList.add('hidden');
        }
    });
    
    // 深色模式变化时重新渲染图表
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        renderCharts();
    });
    
    // 渲染记录和图表
    renderRecords();
    renderCharts();
}); 

// 获取文言API内容
async function fetchJinwen() {
    try {
        const response = await fetch('https://v1.jinrishici.com/all.json');
        const data = await response.json();
        document.getElementById('jinwen-text').textContent = data.content;
    } catch (error) {
        console.error('获取文言失败:', error);
        document.getElementById('jinwen-text').textContent = '静待君来，记录点滴';
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取文言内容
    fetchJinwen();
    document.querySelectorAll('.mood-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.mood-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('poop-mood').value = this.getAttribute('data-mood');
        });
    });
    
    // 备注字数统计
    const notesTextarea = document.getElementById('poop-notes');
    const notesCount = document.getElementById('notes-count');
    
    notesTextarea.addEventListener('input', function() {
        notesCount.textContent = this.value.length;
    });
    
    // 时长选择器联动
    const durationInput = document.getElementById('poop-duration');
    const durationSelect = document.getElementById('duration-select');
    
    durationSelect.addEventListener('change', function() {
        durationInput.value = this.value;
    });
    
    durationInput.addEventListener('input', function() {
        if (this.value === '5' || this.value === '10' || this.value === '15' || this.value === '20' || this.value === '30') {
            durationSelect.value = this.value;
        }
    });
    
    // 表单提交
    document.getElementById('poop-form').addEventListener('submit', handleFormSubmit);
    
    // 搜索和过滤
    const searchInput = document.getElementById('search-input');
    const filterMood = document.getElementById('filter-mood');
    
    function filterRecords() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedMood = filterMood.value;
        
        let records = getRecords();
        
        if (searchTerm) {
            records = records.filter(record => 
                record.date.includes(searchTerm) || 
                record.notes.toLowerCase().includes(searchTerm) ||
                record.shape.toLowerCase().includes(searchTerm) ||
                record.color.toLowerCase().includes(searchTerm) ||
                record.smell.toLowerCase().includes(searchTerm)
            );
        }
        
        if (selectedMood) {
            records = records.filter(record => record.mood === selectedMood);
        }
        
        renderRecords(records);
    }
    
    searchInput.addEventListener('input', filterRecords);
    filterMood.addEventListener('change', filterRecords);
    
    // 导出功能
    const exportDataBtn = document.getElementById('export-data');
    const exportModal = document.getElementById('export-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const exportCSVBtn = document.getElementById('export-csv');
    const exportJSONBtn = document.getElementById('export-json');
    
    exportDataBtn.addEventListener('click', function() {
        exportModal.classList.remove('hidden');
    });
    
    closeModalBtn.addEventListener('click', function() {
        exportModal.classList.add('hidden');
    });
    
    exportCSVBtn.addEventListener('click', function() {
        const records = getRecords();
        if (records.length > 0) {
            exportToCSV(records);
            exportModal.classList.add('hidden');
            showToast('CSV文件导出成功');
        } else {
            showToast('没有记录可导出', false);
        }
    });
    
    exportJSONBtn.addEventListener('click', function() {
        const records = getRecords();
        if (records.length > 0) {
            exportToJSON(records);
            exportModal.classList.add('hidden');
            showToast('JSON文件导出成功');
        } else {
            showToast('没有记录可导出', false);
        }
    });
    
    // 健康分析功能
    const healthAnalysisBtn = document.getElementById('health-analysis');
    
    healthAnalysisBtn.addEventListener('click', async function() {
        const records = getRecords();
        if (records.length < 3) {
            showToast('需要至少3条记录才能进行健康分析', false);
            return;
        }
        
        try {
            // 直接调用分析函数，模态框的创建和更新已经在函数内部处理
            await analyzeRecentRecords();
        } catch (error) {
            console.error('健康分析失败:', error);
            showToast('健康分析失败，请稍后再试', false);
        }
    });
    
    // 点击模态框外部关闭
    exportModal.addEventListener('click', function(e) {
        if (e.target === exportModal) {
            exportModal.classList.add('hidden');
        }
    });
    
    // 深色模式变化时重新渲染图表
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        renderCharts();
    });
    
    // 渲染记录和图表
    renderRecords();
    renderCharts();
});
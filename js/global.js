// 格式化日期为YYYY-MM-DD格式
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 显示提示信息
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    toast.className = `fixed bottom-5 right-5 px-4 py-2 rounded-md shadow-lg transform transition-all duration-300 flex items-center ${isSuccess ? 'bg-[var(--accent)]' : 'bg-red-500'} text-white`;
    toastMessage.textContent = message;
    
    setTimeout(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    }, 100);
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// 本地存储操作
const STORAGE_KEY = 'poop_records';

function saveRecord(record) {
    let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function deleteRecord(id) {
    let records = getRecords();
    records = records.filter(record => record.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 生成随机琉璃渐变色（浅绿色系列）
function generateGlassGradient() {
    const colors = [
        '#e0f2f1', '#b2dfdb', '#80cbc4', '#a5d6a7', 
        '#c8e6c9', '#dcedc8', '#f1f8e9', '#d7ccc8',
        '#e8f5e9', '#c5e1a5', '#e6ee9c', '#d4e157'
    ];
    const angle = Math.floor(Math.random() * 360);
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    let color2 = colors[Math.floor(Math.random() * colors.length)];
    while (color2 === color1) {
        color2 = colors[Math.floor(Math.random() * colors.length)];
    }
    return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
}

// 获取一言API
async function fetchHitokoto() {
    try {
        const response = await fetch('https://v1.hitokoto.cn');
        const data = await response.json();
        
        let text = data.hitokoto;
        const replacements = {
            '生活': '拉屎',
            '道路': '厕所之路',
            '旅程': '如厕之旅',
            '努力': '用力',
            '坚持': '蹲坐',
            '成功': '顺畅排便',
            '人生': '如厕人生',
            '精彩': '舒适',
            '快乐': '排便后的轻松',
            '幸福': '排便的舒适感'
        };
        
        for (const [original, replacement] of Object.entries(replacements)) {
            text = text.replace(new RegExp(original, 'g'), replacement);
        }
        
        const hitokoText = document.getElementById('hitokoto-text');
        const hitokoSource = document.getElementById('hitokoto-source');
        
        if (hitokoText) hitokoText.innerText = text;
        if (hitokoSource) hitokoSource.innerText = `——${data.from_who || '佚名'} 《${data.from || '拉屎的艺术'}》`;
    } catch (error) {
        const hitokoText = document.getElementById('hitokoto-text');
        const hitokoSource = document.getElementById('hitokoto-source');
        
        if (hitokoText) hitokoText.innerText = "厕上读书，日子不慌。";
        if (hitokoSource) hitokoSource.innerText = "——佚名 《拉屎的艺术》";
    }
}

// 设置当前日期
function setCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const now = new Date();
        currentDateElement.innerText = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }
    
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.innerText = new Date().getFullYear();
    }
} 
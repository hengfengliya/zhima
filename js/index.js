// 创建表情雨
function createEmojiRain() {
    const emojiContainer = document.querySelector('.emoji-rain');
    const emojis = ['💩', '🚽', '🧻', '📱', '📖', '💭', '🌈'];
    
    for (let i = 0; i < 20; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        const left = Math.random() * 100;
        const size = Math.random() * 20 + 14;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        
        emoji.style.left = `${left}%`;
        emoji.style.fontSize = `${size}px`;
        emoji.style.animationDuration = `${duration}s`;
        emoji.style.animationDelay = `${delay}s`;
        
        emojiContainer.appendChild(emoji);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 设置加载动画背景
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.background = generateGlassGradient();
    loadingScreen.style.backgroundSize = '200% 100%';
    loadingScreen.style.animation = 'flow 4s ease infinite';
    
    // 创建表情雨
    createEmojiRain();
    
    // 设置当前日期
    setCurrentDate();
    
    // 获取一言
    fetchHitokoto();
    
    // 设置标记，表示用户从index.html正常进入
    sessionStorage.setItem('fromIndexPage', 'true');
    
    // 3秒后跳转到记录页面
    setTimeout(() => {
        window.location.href = 'records.html';
    }, 3000);
}); 
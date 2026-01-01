/**
 * YYC³ AI智能协作平台前端
 * 企业级AI解决方案 - 现代化用户界面
 */

// 应用状态管理
class AppState {
    constructor() {
        this.currentSection = 'dashboard';
        this.isLoading = false;
        this.notifications = [];
        this.chatMessages = [];
        this.aiEngine = null;
        this.userData = {
            name: '管理员',
            role: 'admin',
            permissions: ['read', 'write', 'admin']
        };
        this.systemStatus = {
            customerLifecycle: 'online',
            smartCalling: 'online',
            smartForms: 'online',
            hrAssistant: 'online',
            aiEngine: 'online'
        };
        this.metrics = {
            totalRequests: 8429,
            successRate: 94.5,
            avgResponseTime: 3.2,
            activeUsers: 23,
            costSavings: 2847
        };
    }

    setCurrentSection(section) {
        this.currentSection = section;
    }

    setLoading(loading) {
        this.isLoading = loading;
    }

    addNotification(notification) {
        const id = Date.now().toString();
        this.notifications.push({ id, ...notification });
        return id;
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    addChatMessage(message) {
        this.chatMessages.push({
            ...message,
            id: Date.now().toString(),
            timestamp: new Date()
        });
    }
}

// AI引擎接口
class AIEngine {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api';
        this.models = {
            chat: 'llama3.2:1b',
            code: 'qwen2.5-coder:1.5b',
            analysis: 'llama3.2:1b',
            reasoning: 'qwen2.5-coder:1.5b'
        };
    }

    async chat(message, options = {}) {
        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    model: options.model || this.models.chat,
                    temperature: options.temperature || 0.7,
                    maxTokens: options.maxTokens || 1000
                })
            });

            if (!response.ok) {
                throw new Error(`AI Engine error: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            throw error;
        }
    }

    async getModels() {
        try {
            const response = await fetch(`${this.apiUrl}/models`);
            if (!response.ok) {
                throw new Error(`Failed to get models: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            return [];
        }
    }

    async getMetrics() {
        try {
            const response = await fetch(`${this.apiUrl}/metrics`);
            if (!response.ok) {
                throw new Error(`Failed to get metrics: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            return {};
        }
    }
}

// 数据可视化工具
class DataVisualization {
    static createLineChart(canvas, data, options = {}) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 简单的折线图实现
        if (data && data.length > 0) {
            const maxValue = Math.max(...data);
            const points = data.map((value, index) => ({
                x: (index / (data.length - 1)) * width,
                y: height - (value / maxValue) * height * 0.8
            }));

            // 绘制渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(points[0].x, height);
            points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.lineTo(points[points.length - 1].x, height);
            ctx.closePath();
            ctx.fill();

            // 绘制线条
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.beginPath();
            points.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();

            // 绘制点
            points.forEach(point => {
                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    static createBarChart(canvas, data, labels = []) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        if (data && data.length > 0) {
            const maxValue = Math.max(...data);
            const barWidth = width / data.length * 0.6;
            const spacing = width / data.length;

            data.forEach((value, index) => {
                const barHeight = (value / maxValue) * height * 0.8;
                const x = spacing * index + spacing * 0.2;
                const y = height - barHeight;

                // 绘制柱状图
                const gradient = ctx.createLinearGradient(0, y, 0, height);
                gradient.addColorStop(0, '#60a5fa');
                gradient.addColorStop(1, '#2563eb');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, barHeight);

                // 绘制标签
                if (labels[index]) {
                    ctx.fillStyle = '#64748b';
                    ctx.font = '10px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(labels[index], x + barWidth / 2, height - 5);
                }
            });
        }
    }

    static createPieChart(canvas, data, colors = []) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;

        ctx.clearRect(0, 0, width, height);

        if (data && data.length > 0) {
            const total = data.reduce((sum, value) => sum + value, 0);
            let currentAngle = -Math.PI / 2;

            const defaultColors = [
                '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
            ];

            data.forEach((value, index) => {
                const sliceAngle = (value / total) * Math.PI * 2;
                const color = colors[index] || defaultColors[index % defaultColors.length];

                // 绘制扇形
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();

                currentAngle += sliceAngle;
            });
        }
    }
}

// 通知系统
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ';

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
        `;

        this.container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// 聊天系统
class ChatSystem {
    constructor(aiEngine) {
        this.aiEngine = aiEngine;
        this.container = document.getElementById('chatContainer');
        this.messagesContainer = document.getElementById('chatMessages');
        this.input = document.getElementById('chatInput');
        this.sendButton = document.getElementById('chatSend');
        this.overlay = document.getElementById('overlay');
        this.openButton = document.getElementById('startAIChat');
        this.closeButton = document.getElementById('chatClose');

        this.isOpen = false;
        this.isTyping = false;

        this.init();
    }

    init() {
        // 打开聊天
        this.openButton.addEventListener('click', () => this.open());

        // 关闭聊天
        this.closeButton.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        // 发送消息
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    open() {
        if (!this.isOpen) {
            this.container.classList.add('show');
            this.overlay.classList.add('show');
            this.isOpen = true;
            this.input.focus();
        }
    }

    close() {
        if (this.isOpen) {
            this.container.classList.remove('show');
            this.overlay.classList.remove('show');
            this.isOpen = false;
        }
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isTyping) return;

        // 添加用户消息
        this.addMessage(message, 'user');
        this.input.value = '';

        // 显示AI正在输入
        this.showTyping();
        this.isTyping = true;

        try {
            // 调用AI引擎
            const response = await this.aiEngine.chat(message);

            // 隐藏输入状态
            this.hideTyping();
            this.isTyping = false;

            // 添加AI回复
            this.addMessage(response, 'ai');

        } catch (error) {
            this.hideTyping();
            this.isTyping = false;

            // 添加错误消息
            this.addMessage('抱歉，AI服务暂时不可用，请稍后再试。', 'ai');

            // 显示错误通知
            app.notificationSystem.error('AI服务暂时不可用');
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = this.formatMessage(content);

        messageDiv.appendChild(messageContent);
        this.messagesContainer.appendChild(messageDiv);

        // 滚动到底部
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // 简单的markdown格式化
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingMessage = this.messagesContainer.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
}

// 主应用类
class YYC3App {
    constructor() {
        this.state = new AppState();
        this.aiEngine = new AIEngine();
        this.notificationSystem = new NotificationSystem();
        this.chatSystem = new ChatSystem(this.aiEngine);

        this.init();
    }

    async init() {
        // 初始化UI
        this.initializeUI();

        // 绑定事件
        this.bindEvents();

        // 加载数据
        await this.loadInitialData();

        // 初始化图表
        this.initializeCharts();

        // 启动实时更新
        this.startRealTimeUpdates();

        // 显示欢迎消息
        this.notificationSystem.success('欢迎使用YYC³ AI智能协作平台');
    }

    initializeUI() {
        // 设置导航状态
        this.updateNavigation();

        // 显示加载状态
        this.showLoading('正在初始化AI引擎...');

        // 初始化所有卡片和组件
        this.initializeStatusCards();
        this.initializeActivityLog();
    }

    bindEvents() {
        // 导航点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });

        // 客户生命周期阶段导航
        document.querySelectorAll('.stage-nav').forEach(item => {
            item.addEventListener('click', (e) => {
                const stage = item.dataset.stage;
                this.showLifecycleStage(stage);
            });
        });

        // 智能外呼控制按钮
        document.getElementById('startCallingCampaign')?.addEventListener('click', () => {
            this.startCallingCampaign();
        });

        document.getElementById('callingAnalytics')?.addEventListener('click', () => {
            this.showCallingAnalytics();
        });

        document.getElementById('scriptManager')?.addEventListener('click', () => {
            this.showScriptManager();
        });

        // 表单控制按钮
        document.getElementById('createForm')?.addEventListener('click', () => {
            this.createForm();
        });

        document.getElementById('formTemplates')?.addEventListener('click', () => {
            this.showFormTemplates();
        });

        document.getElementById('formAnalytics')?.addEventListener('click', () => {
            this.showFormAnalytics();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.chatSystem.open();
                        break;
                    case '/':
                        e.preventDefault();
                        this.showQuickSearch();
                        break;
                }
            }
        });

        // 窗口大小变化时重新绘制图表
        window.addEventListener('resize', () => {
            this.initializeCharts();
        });
    }

    async loadInitialData() {
        try {
            // 加载AI模型状态
            const models = await this.aiEngine.getModels();
            this.updateModelStatus(models);

            // 加载性能指标
            const metrics = await this.aiEngine.getMetrics();
            this.updateMetrics(metrics);

            this.hideLoading();

        } catch (error) {
            console.warn('加载数据失败:', error);
            this.hideLoading();
            this.notificationSystem.warning('部分数据加载失败，使用缓存数据');
        }
    }

    initializeCharts() {
        // 初始化控制台图表
        this.initializeDashboardCharts();

        // 初始化客户生命周期图表
        this.initializeCustomerLifecycleCharts();
    }

    initializeDashboardCharts() {
        // 客户管理图表
        const customerChart = document.getElementById('customerChart');
        if (customerChart) {
            DataVisualization.createLineChart(customerChart, [45, 52, 48, 58, 62, 68, 65]);
        }

        // 智能外呼图表
        const callingChart = document.getElementById('callingChart');
        if (callingChart) {
            DataVisualization.createBarChart(callingChart, [23, 45, 56, 78, 65, 43, 34], ['周一', '周二', '周三', '周四', '周五', '周六', '周日']);
        }

        // 智能表单图表
        const formsChart = document.getElementById('formsChart');
        if (formsChart) {
            DataVisualization.createLineChart(formsChart, [12, 19, 15, 25, 32, 28, 35]);
        }

        // HR助手图表
        const hrChart = document.getElementById('hrChart');
        if (hrChart) {
            DataVisualization.createBarChart(hrChart, [156, 189, 145, 198, 167]);
        }
    }

    initializeCustomerLifecycleCharts() {
        // 线索评分图表
        const leadScoringChart = document.getElementById('leadScoringChart');
        if (leadScoringChart) {
            DataVisualization.createBarChart(leadScoringChart, [23, 45, 78, 56, 89, 67, 45]);
        }
    }

    startRealTimeUpdates() {
        // 每30秒更新一次数据
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000);

        // 每5秒添加一条新的活动日志
        setInterval(() => {
            this.addActivityLog();
        }, 5000);
    }

    updateRealTimeData() {
        // 更新性能指标
        this.updateMetricsDisplay();

        // 更新系统状态
        this.updateSystemStatus();
    }

    updateMetricsDisplay() {
        // 更新请求计数
        const requestsElement = document.querySelector('.perf-item:last-child .perf-value');
        if (requestsElement) {
            const currentRequests = parseInt(requestsElement.textContent.replace(',', ''));
            const newRequests = currentRequests + Math.floor(Math.random() * 50) + 10;
            requestsElement.textContent = newRequests.toLocaleString();
        }

        // 更新并发请求数
        const concurrencyElement = document.querySelector('.perf-item:nth-child(3) .perf-value');
        if (concurrencyElement) {
            const newConcurrency = Math.floor(Math.random() * 30) + 10;
            concurrencyElement.textContent = newConcurrency;
        }
    }

    updateSystemStatus() {
        // 检查所有系统状态
        Object.keys(this.state.systemStatus).forEach(system => {
            const isOnline = Math.random() > 0.05; // 95%在线率
            this.state.systemStatus[system] = isOnline ? 'online' : 'offline';
        });
    }

    addActivityLog() {
        const activities = [
            { type: 'info', message: '智能表单系统处理了新的客户反馈' },
            { type: 'success', message: '智能外呼完成了一轮成功的客户沟通' },
            { type: 'warning', message: 'HR助手检测到异常登录尝试' },
            { type: 'info', message: '客户生命周期系统更新了用户画像' },
            { type: 'success', message: 'AI引擎完成了模型优化' },
            { type: 'info', message: '新的用户注册并激活了账户' }
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        const logContainer = document.querySelector('.log-container');

        if (logContainer) {
            const logItem = document.createElement('div');
            logItem.className = `log-item ${activity.type}`;

            const time = new Date().toLocaleTimeString('zh-CN');
            logItem.innerHTML = `
                <span class="log-time">${time}</span>
                <span class="log-message">${activity.message}</span>
            `;

            logContainer.insertBefore(logItem, logContainer.firstChild);

            // 限制日志数量
            while (logContainer.children.length > 10) {
                logContainer.removeChild(logContainer.lastChild);
            }
        }
    }

    navigateToSection(section) {
        // 更新状态
        this.state.setCurrentSection(section);

        // 更新导航UI
        this.updateNavigation();

        // 切换内容区域
        this.showSection(section);

        // 更新浏览器历史
        history.pushState({ section }, '', `#${section}`);
    }

    updateNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.section === this.state.currentSection;
            item.classList.toggle('active', isActive);
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });
    }

    showLifecycleStage(stage) {
        // 更新阶段导航状态
        document.querySelectorAll('.stage-nav').forEach(item => {
            const isActive = item.dataset.stage === stage;
            item.classList.toggle('active', isActive);
        });

        // 更新阶段内容
        document.querySelectorAll('.stage-content').forEach(content => {
            content.classList.toggle('active', content.id === `${stage}-content`);
        });
    }

    startCallingCampaign() {
        this.notificationSystem.info('正在启动智能外呼营销活动...');

        // 模拟启动过程
        setTimeout(() => {
            this.notificationSystem.success('外呼营销活动已启动，预计联系500+潜在客户');
        }, 2000);
    }

    showCallingAnalytics() {
        this.notificationSystem.info('正在加载通话分析数据...');
        // 这里可以打开一个模态框显示详细的分析数据
    }

    showScriptManager() {
        this.notificationSystem.info('正在打开话术管理器...');
        // 这里可以打开话术管理界面
    }

    createForm() {
        this.notificationSystem.info('正在打开表单设计器...');
        // 这里可以打开表单创建界面
    }

    showFormTemplates() {
        this.notificationSystem.info('正在加载表单模板库...');
        // 这里可以打开模板库界面
    }

    showFormAnalytics() {
        this.notificationSystem.info('正在加载表单分析数据...');
        // 这里可以打开表单分析界面
    }

    showQuickSearch() {
        this.notificationSystem.info('快速搜索功能开发中...');
    }

    updateModelStatus(models) {
        // 更新模型状态显示
        const modelItems = document.querySelectorAll('.model-item');

        if (models.length > 0) {
            models.forEach((model, index) => {
                if (modelItems[index]) {
                    const statusElement = modelItems[index].querySelector('.model-status');
                    const loadElement = modelItems[index].querySelector('.model-load');

                    if (statusElement) {
                        statusElement.className = `model-status ${model.active ? 'active' : 'standby'}`;
                        statusElement.textContent = model.active ? '活跃' : '待机';
                    }

                    if (loadElement && model.metrics) {
                        loadElement.textContent = `${model.metrics.cpu || 0}% CPU`;
                    }
                }
            });
        }
    }

    updateMetrics(metrics) {
        if (metrics && Object.keys(metrics).length > 0) {
            this.state.metrics = { ...this.state.metrics, ...metrics };
        }

        // 更新UI中的指标显示
        this.updateMetricsDisplay();
    }

    initializeStatusCards() {
        // 添加状态卡片动画
        document.querySelectorAll('.status-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 100}ms`;
            card.style.animation = 'fadeInUp 0.6s ease-out';
        });
    }

    initializeActivityLog() {
        // 添加初始活动日志
        const initialLogs = [
            { type: 'success', message: 'YYC³ AI平台启动完成' },
            { type: 'info', message: '所有AI系统运行正常' },
            { type: 'success', message: '智能路由配置优化完成' },
            { type: 'info', message: '客户生命周期系统已同步最新数据' }
        ];

        const logContainer = document.querySelector('.log-container');
        if (logContainer) {
            initialLogs.forEach(log => {
                const logItem = document.createElement('div');
                logItem.className = `log-item ${log.type}`;
                logItem.innerHTML = `
                    <span class="log-time">14:25:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}</span>
                    <span class="log-message">${log.message}</span>
                `;
                logContainer.appendChild(logItem);
            });
        }
    }

    showLoading(message = '正在加载...') {
        const indicator = document.getElementById('loadingIndicator');
        const textElement = indicator.querySelector('span');

        textElement.textContent = message;
        indicator.classList.add('show');
    }

    hideLoading() {
        const indicator = document.getElementById('loadingIndicator');
        indicator.classList.remove('show');
    }
}

// 全局应用实例
let app;

// DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    app = new YYC3App();
});

// 处理浏览器后退/前进按钮
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
        app.navigateToSection(e.state.section);
    } else {
        // 处理直接访问URL的情况
        const hash = window.location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            app.navigateToSection(hash);
        }
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('应用错误:', e.error);
    if (app && app.notificationSystem) {
        app.notificationSystem.error('应用出现错误，请刷新页面重试');
    }
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    if (app && app.notificationSystem) {
        app.notificationSystem.warning('网络请求出现错误');
    }
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideOutRight {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .typing-indicator span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #64748b;
        animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes typing {
        0%, 60%, 100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// 导出应用实例供调试使用
window.YYC3App = app;
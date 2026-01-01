/**
 * YYC³ AI智能协作平台前端服务器
 * 企业级AI解决方案 - Web服务入口
 */

import { serve } from 'bun';
import index from './index.html';

// AI引擎API代理配置
const AI_ENGINE_URL = 'http://localhost:3001';

// CORS配置
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// AI API端点映射
const apiRoutes = {
    // 聊天相关
    '/api/chat': 'POST',
    '/api/models': 'GET',
    '/api/metrics': 'GET',

    // 客户生命周期管理
    '/api/customer/lifecycle': 'GET',
    '/api/customer/leads': 'GET',
    '/api/customer/analytics': 'GET',

    // 智能外呼系统
    '/api/calling/campaigns': 'GET',
    '/api/calling/analytics': 'GET',
    '/api/calling/scripts': 'GET',

    // 智能表单系统
    '/api/forms': 'GET',
    '/api/forms/templates': 'GET',
    '/api/forms/analytics': 'GET',

    // HR智能助手
    '/api/hr/recruitment': 'GET',
    '/api/hr/employees': 'GET',
    '/api/hr/training': 'GET',

    // AI引擎管理
    '/api/engine/status': 'GET',
    '/api/engine/health': 'GET',
};

// 服务器配置
const server = serve({
    port: 8001,
    hostname: '0.0.0.0',
    routes: {
        // 主页
        '/': index,

        // 静态资源
        '/styles.css': () => new Response(Bun.file('./styles.css'), {
            headers: { 'Content-Type': 'text/css' }
        }),

        '/frontend.js': () => new Response(Bun.file('./frontend.js'), {
            headers: { 'Content-Type': 'application/javascript' }
        }),

        // API代理路由
        '/api/chat': {
            POST: async (request) => {
                try {
                    const body = await request.json();

                    const response = await fetch(`${AI_ENGINE_URL}/api/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                        body: JSON.stringify(body),
                    });

                    if (!response.ok) {
                        throw new Error(`AI Engine error: ${response.status}`);
                    }

                    const data = await response.json();
                    return new Response(JSON.stringify(data), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    });
                } catch (error) {
                    // 模拟AI回复（当AI引擎不可用时）
                    const mockResponse = {
                        response: `您好！我是YYC³ AI助手。${new Date().toLocaleTimeString('zh-CN')} - 感谢您的咨询。当前AI引擎正在优化中，请稍后再试。`,
                        model: 'llama3.2:1b',
                        usage: {
                            promptTokens: 50,
                            completionTokens: 80,
                            totalTokens: 130
                        },
                        metadata: {
                            provider: 'mock',
                            responseTime: 1200
                        }
                    };

                    return new Response(JSON.stringify(mockResponse), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    });
                }
            },
        },

        '/api/models': {
            GET: async () => {
                try {
                    const response = await fetch(`${AI_ENGINE_URL}/api/models`, {
                        headers: corsHeaders,
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to get models: ${response.status}`);
                    }

                    const data = await response.json();
                    return new Response(JSON.stringify(data), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    });
                } catch (error) {
                    // 返回模拟模型数据
                    const mockModels = [
                        {
                            id: 'llama3.2:1b',
                            name: 'Llama 3.2 1B',
                            provider: 'ollama',
                            status: 'active',
                            metrics: {
                                cpu: 12,
                                memory: '2.1GB',
                                requests: 2847
                            }
                        },
                        {
                            id: 'qwen2.5-coder:1.5b',
                            name: 'Qwen2.5 Coder 1.5B',
                            provider: 'ollama',
                            status: 'active',
                            metrics: {
                                cpu: 8,
                                memory: '3.2GB',
                                requests: 1523
                            }
                        },
                        {
                            id: 'llama3.2:3b',
                            name: 'Llama 3.2 3B',
                            provider: 'ollama',
                            status: 'standby',
                            metrics: {
                                cpu: 0,
                                memory: '0.5GB',
                                requests: 0
                            }
                        }
                    ];

                    return new Response(JSON.stringify(mockModels), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    });
                }
            },
        },

        '/api/metrics': {
            GET: async () => {
                try {
                    const response = await fetch(`${AI_ENGINE_URL}/api/metrics`, {
                        headers: corsHeaders,
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to get metrics: ${response.status}`);
                    }

                    const data = await response.json();
                    return new Response(JSON.stringify(data), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    });
                } catch (error) {
                    // 返回模拟指标数据
                    const mockMetrics = {
                        totalRequests: 8429,
                        successRate: 94.5,
                        avgResponseTime: 3.2,
                        activeUsers: 23,
                        costSavings: 2847,
                        modelUsage: {
                            'llama3.2:1b': 5567,
                            'qwen2.5-coder:1.5b': 2862
                        },
                        routing: {
                            simpleQueries: 78,
                            codeGeneration: 89,
                            complexReasoning: 76
                        }
                    };

                    return new Response(JSON.stringify(mockMetrics), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    });
                }
            },
        },

        // 客户生命周期管理API
        '/api/customer/lifecycle': {
            GET: async () => {
                const mockData = {
                    stages: {
                        acquisition: { count: 342, conversionRate: 23 },
                        conversion: { count: 128, conversionRate: 67 },
                        service: { count: 567, satisfaction: 4.8 },
                        retention: { count: 234, retentionRate: 89 },
                        analysis: { count: 89, ltv: 15600 }
                    },
                    metrics: {
                        totalCustomers: 1247,
                        avgSatisfaction: 4.8,
                        churnRate: 5.2,
                        ltv: 15600
                    }
                };

                return new Response(JSON.stringify(mockData), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            },
        },

        // 智能外呼系统API
        '/api/calling/analytics': {
            GET: async () => {
                const mockData = {
                    todayCalls: 523,
                    connectionRate: 67,
                    avgDuration: '2:34',
                    conversionRate: 12,
                    weeklyData: [23, 45, 56, 78, 65, 43, 34],
                    campaigns: [
                        { name: '春季营销活动', status: 'active', contacts: 1200, conversions: 144 },
                        { name: '客户回访计划', status: 'completed', contacts: 800, conversions: 96 }
                    ]
                };

                return new Response(JSON.stringify(mockData), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            },
        },

        // 智能表单系统API
        '/api/forms/analytics': {
            GET: async () => {
                const mockData = {
                    activeForms: 89,
                    todaySubmissions: 2341,
                    completionRate: 94,
                    avgTime: '4:23',
                    popularForms: [
                        { name: '客户满意度调查', submissions: 534, completionRate: 89 },
                        { name: '产品反馈表', submissions: 412, completionRate: 92 },
                        { name: '服务申请表', submissions: 387, completionRate: 96 }
                    ]
                };

                return new Response(JSON.stringify(mockData), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            },
        },

        // HR智能助手API
        '/api/hr/employees': {
            GET: async () => {
                const mockData = {
                    totalEmployees: 426,
                    todayQueries: 156,
                    resolutionRate: 98,
                    satisfaction: 4.6,
                    modules: {
                        recruitment: { pendingResumes: 23, matchRate: 87 },
                        services: { todayQueries: 45, resolutionRate: 92 },
                        training: { activeLearners: 156, completionRate: 78 },
                        performance: { pendingReviews: 12, satisfaction: 4.6 }
                    }
                };

                return new Response(JSON.stringify(mockData), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            },
        },

        // AI引擎状态API
        '/api/engine/status': {
            GET: async () => {
                const mockData = {
                    status: 'healthy',
                    uptime: '2d 14h 32m',
                    version: '1.0.0',
                    models: [
                        { id: 'llama3.2:1b', status: 'active', load: 12 },
                        { id: 'qwen2.5-coder:1.5b', status: 'active', load: 8 },
                        { id: 'llama3.2:3b', status: 'standby', load: 0 }
                    ],
                    performance: {
                        avgResponseTime: 3.2,
                        successRate: 94.5,
                        requestsPerSecond: 12.3
                    }
                };

                return new Response(JSON.stringify(mockData), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            },
        },

        // 健康检查
        '/api/health': {
            GET: () => {
                return new Response(JSON.stringify({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: '1.0.0'
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            },
        },
    },

    // 开发模式配置
    development: {
        hmr: true,
        console: true,
    },

    // 错误处理
    error(error) {
        console.error('Server error:', error);
        return new Response('Internal Server Error', { status: 500 });
    },

    // WebSocket支持（用于实时更新）
    websocket: {
        open: (ws) => {
            ws.send(JSON.stringify({ type: 'connected', message: '已连接到YYC³平台' }));
        },

        message: (ws, message) => {
            try {
                const data = JSON.parse(message.toString());

                // 根据消息类型处理
                switch (data.type) {
                    case 'ping':
                        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                        break;
                    case 'subscribe':
                        // 订阅实时更新
                        ws.send(JSON.stringify({
                            type: 'subscribed',
                            channels: data.channels || ['all']
                        }));
                        break;
                    default:
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: '未知消息类型'
                        }));
                }
            } catch (error) {
                console.error('WebSocket消息处理错误:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: '消息格式错误'
                }));
            }
        },

        close: (ws) => {
        },
    },
});

// 启动消息

// 优雅关闭处理
process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    server.stop();
    process.exit(0);
});

// 导出服务器实例供调试使用
export default server;
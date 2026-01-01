"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ArrowLeft, 
  Download, 
  Filter, 
  RefreshCw, 
  BarChart2, 
  PieChart,  // 未使用，可考虑删除
  Star, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  BookOpen,
  ArrowRight  // 补充缺失的导入
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // 学习时长数据
  const studyTimeData = [
    { date: '03-01', hours: 2.5 },
    { date: '03-02', hours: 3.2 },
    { date: '03-03', hours: 1.8 },
    { date: '03-04', hours: 4.1 },
    { date: '03-05', hours: 2.9 },
    { date: '03-06', hours: 3.7 },
    { date: '03-07', hours: 2.3 },
    { date: '03-08', hours: 3.8 },
    { date: '03-09', hours: 2.1 },
    { date: '03-10', hours: 4.5 },
    { date: '03-11', hours: 3.3 },
    { date: '03-12', hours: 2.7 },
    { date: '03-13', hours: 3.9 },
    { date: '03-14', hours: 2.4 },
  ];

  // 课程完成度数据
  const courseProgressData = [
    { name: 'GPT基础应用', progress: 100, category: '基础' },
    { name: 'Prompt工程', progress: 85, category: '进阶' },
    { name: '多模态AI', progress: 60, category: '高级' },
    { name: 'AI伦理', progress: 45, category: '理论' },
    { name: '计算机视觉', progress: 30, category: '专业' },
    { name: '自然语言处理', progress: 75, category: '专业' },
  ];

  // 技能分布数据
  const skillDistributionData = [
    { name: '机器学习', value: 85, color: '#3b82f6' },
    { name: '深度学习', value: 70, color: '#8b5cf6' },
    { name: 'Prompt工程', value: 90, color: '#10b981' },
    { name: '数据分析', value: 65, color: '#f59e0b' },
    { name: 'AI伦理', value: 55, color: '#ef4444' },
  ];

  // 学习效率数据
  const efficiencyData = [
    { week: '第1周', efficiency: 75, focus: 80, retention: 70 },
    { week: '第2周', efficiency: 82, focus: 85, retention: 78 },
    { week: '第3周', efficiency: 78, focus: 82, retention: 75 },
    { week: '第4周', efficiency: 88, focus: 90, retention: 85 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="inline-flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="h-8 w-8 mr-3 text-blue-600" />
                学习数据分析
              </h1>
              <p className="text-gray-600 mt-1">深度洞察您的学习表现和成长轨迹</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 时间范围选择 */}
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm font-medium text-gray-700">时间范围:</span>
          <Button 
            variant={timeRange === '7d' ? 'solid' : 'outline'} 
            size="sm" 
            onClick={() => setTimeRange('7d')}
          >
            7天
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'solid' : 'outline'} 
            size="sm" 
            onClick={() => setTimeRange('30d')}
          >
            30天
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'solid' : 'outline'} 
            size="sm" 
            onClick={() => setTimeRange('90d')}
          >
            90天
          </Button>
          <Button 
            variant={timeRange === 'all' ? 'solid' : 'outline'} 
            size="sm" 
            onClick={() => setTimeRange('all')}
          >
            全部
          </Button>
        </div>

        {/* 数据概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 总学习时长 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">总学习时长</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">48.5小时</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  较上周增长12%
                </p>
              </div>
              <div className="text-4xl text-gray-200">
                <Clock />
              </div>
            </div>
          </div>

          {/* 已完成课程 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">已完成课程</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">8门</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  较上月增长2门
                </p>
              </div>
              <div className="text-4xl text-gray-200">
                <BookOpen />
              </div>
            </div>
          </div>

          {/* 获得技能点 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">获得技能点</h3>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">342点</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  较上周增长45点
                </p>
              </div>
              <div className="text-4xl text-gray-200">
                <Star />
              </div>
            </div>
          </div>

          {/* 学习效率 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">学习效率</h3>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart2 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">85%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  较上周提升5%
                </p>
              </div>
              <div className="text-4xl text-gray-200">
                <BarChart2 />
              </div>
            </div>
          </div>
        </div>

        {/* 学习时长趋势图 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">学习时长趋势</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">日</Button>
              <Button variant="solid" size="sm">周</Button>
              <Button variant="outline" size="sm">月</Button>
            </div>
          </div>
          <div className="h-80">
            <div className="flex items-center justify-center h-full">
              <svg viewBox="0 0 600 300" className="w-full h-full">
                {/* 坐标轴 */}
                <line x1="50" y1="250" x2="550" y2="250" stroke="#e5e7eb" strokeWidth="2" />
                <line x1="50" y1="50" x2="50" y2="250" stroke="#e5e7eb" strokeWidth="2" />
                
                {/* Y轴刻度 */}
                {[0, 1, 2, 3, 4, 5].map(hour => (
                  <g key={hour}>
                    <line x1="45" y1={250 - hour * 40} x2="50" y2={250 - hour * 40} stroke="#e5e7eb" />
                    <text x="40" y={250 - hour * 40 + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{hour}h</text>
                  </g>
                ))}
                
                {/* X轴刻度和标签 */}
                {studyTimeData.map((data, index) => {
                  const x = 50 + index * 35;
                  const y = 250 - data.hours * 40;
                  return (
                    <g key={index}>
                      <line x1={x} y1={250} x2={x} y2={255} stroke="#e5e7eb" />
                      <text x={x} y={270} fontSize="10" fill="#9ca3af" textAnchor="middle">{data.date}</text>
                      
                      {/* 柱状图 */}
                      <rect x={x - 10} y={y} width={20} height={250 - y} fill="#3b82f6" rx="2" opacity="0.7" />
                      <circle cx={x} cy={y} r={4} fill="#3b82f6" />
                    </g>
                  );
                })}
                
                {/* 趋势线 */}
                <path 
                  d={studyTimeData.map((data, index) => `M${50 + index * 35},${250 - data.hours * 40}`).join(' L')} 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  fill="none" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 课程完成度和技能分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 课程完成度 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">课程完成度</h2>
              <Button variant="ghost" size="sm">
                查看全部
              </Button>
            </div>
            <div className="space-y-6">
              {courseProgressData.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{course.name}</h4>
                        <p className="text-xs text-gray-500">{course.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 技能分布 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">技能分布</h2>
              <Button variant="ghost" size="sm">
                查看详情
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 240 240" className="w-full h-64">
                {/* 技能圆环图 */}
                {skillDistributionData.map((skill, index) => {
                  const startAngle = index === 0 
                    ? 0 
                    : skillDistributionData.slice(0, index).reduce((sum, s) => sum + s.value, 0) * 3.6;
                  const endAngle = startAngle + skill.value * 3.6;
                  
                  const startX = 120 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const startY = 120 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const endX = 120 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const endY = 120 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArcFlag = skill.value > 50 ? 1 : 0;
                  
                  return (
                    <g key={index}>
                      <path 
                        d={`M 120,120 L ${startX},${startY} A 80,80 0 ${largeArcFlag},1 ${endX},${endY} Z`} 
                        fill={skill.color} 
                        opacity="0.8"
                      />
                      <circle cx="120" cy="120" r="40" fill="white" />
                    </g>
                  );
                })}
                
                {/* 技能圆环中心文字 */}
                <text x="120" y="110" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#334155">技能水平</text>
                <text x="120" y="135" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#1e40af">中级</text>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {skillDistributionData.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: skill.color }}></div>
                  <span className="text-sm text-gray-700">{skill.name}</span>
                  <span className="ml-auto text-sm font-medium text-gray-900">{skill.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 学习效率分析 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">学习效率分析</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">周</Button>
              <Button variant="solid" size="sm">月</Button>
              <Button variant="outline" size="sm">季度</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">周期</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">效率指数</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">专注度</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">知识保留率</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {efficiencyData.map((week, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{week.week}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${week.efficiency}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{week.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${week.focus}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{week.focus}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${week.retention}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{week.retention}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        week.efficiency > 80 ? 'bg-green-100 text-green-800' : 
                        week.efficiency > 60 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {week.efficiency > 80 ? '优秀' : week.efficiency > 60 ? '良好' : '需提高'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 学习建议 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">学习建议</h2>
            <Button variant="ghost" size="sm">
              查看全部
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 建议卡片 1 */}
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-800">深入学习</h3>
                  <p className="mt-1 text-sm text-blue-700">根据您的技能分布，建议深入学习深度学习相关课程</p>
                  <a href="#" className="mt-2 inline-flex items-center text-sm font-medium text-blue-600">
                    查看推荐课程
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* 建议卡片 2 */}
            <div className="p-5 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-green-800">保持良好状态</h3>
                  <p className="mt-1 text-sm text-green-700">您的学习效率持续提升，继续保持当前学习节奏</p>
                  <a href="#" className="mt-2 inline-flex items-center text-sm font-medium text-green-600">
                    查看学习计划
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* 建议卡片 3 */}
            <div className="p-5 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-purple-800">技能突破</h3>
                  <p className="mt-1 text-sm text-purple-700">AI伦理技能点较低，建议完成相关理论课程</p>
                  <a href="#" className="mt-2 inline-flex items-center text-sm font-medium text-purple-600">
                    推荐理论课程
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

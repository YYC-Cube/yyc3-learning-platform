import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Lock, Users, Mail, Phone } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">隐私政策</h1>
          <p className="text-gray-600">YanYu Smart Cloud³ Learning Hub 致力于保护您的隐私权益</p>
          <p className="text-sm text-gray-500 mt-2">最后更新时间：2024年3月1日</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                信息收集
              </CardTitle>
              <CardDescription>我们收集的信息类型及收集方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">个人信息</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>注册时提供的姓名、邮箱地址</li>
                  <li>个人资料信息（头像、学习偏好等）</li>
                  <li>联系方式（可选）</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">学习数据</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>课程学习进度和完成情况</li>
                  <li>考试成绩和答题记录</li>
                  <li>学习时长和活跃度统计</li>
                  <li>互动评论和讨论内容</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">技术信息</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>设备信息（浏览器类型、操作系统）</li>
                  <li>访问日志（IP地址、访问时间）</li>
                  <li>Cookie和本地存储数据</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                信息使用
              </CardTitle>
              <CardDescription>我们如何使用收集到的信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">服务提供</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>提供个性化学习体验</li>
                  <li>跟踪学习进度和成就</li>
                  <li>生成学习报告和建议</li>
                  <li>提供技术支持和客户服务</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">服务改进</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>分析用户行为以优化产品功能</li>
                  <li>开发新的学习工具和内容</li>
                  <li>提升平台性能和稳定性</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">沟通联系</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>发送重要通知和更新</li>
                  <li>提供学习提醒和建议</li>
                  <li>回应用户咨询和反馈</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                信息共享
              </CardTitle>
              <CardDescription>我们在什么情况下会共享您的信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>重要声明：</strong>
                  我们不会出售、租赁或以其他方式向第三方披露您的个人信息，除非获得您的明确同意或法律要求。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">有限共享情况</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>与服务提供商共享必要的技术数据（如云存储服务）</li>
                  <li>遵守法律法规要求或政府部门要求</li>
                  <li>保护我们或他人的权利、财产或安全</li>
                  <li>经您明确同意的其他情况</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                数据安全
              </CardTitle>
              <CardDescription>我们如何保护您的信息安全</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">技术保护措施</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>使用SSL/TLS加密传输数据</li>
                  <li>数据库加密存储敏感信息</li>
                  <li>定期进行安全漏洞扫描和修复</li>
                  <li>实施访问控制和权限管理</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">管理保护措施</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>员工签署保密协议</li>
                  <li>定期进行安全培训</li>
                  <li>建立数据泄露应急响应机制</li>
                  <li>定期备份和恢复测试</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>您的权利</CardTitle>
              <CardDescription>您对个人信息享有的权利</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">访问权</h4>
                  <p className="text-sm text-gray-600">您有权了解我们收集、使用您个人信息的情况</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">更正权</h4>
                  <p className="text-sm text-gray-600">您有权要求我们更正或补充您的个人信息</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">删除权</h4>
                  <p className="text-sm text-gray-600">在特定情况下，您有权要求我们删除您的个人信息</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">撤回同意</h4>
                  <p className="text-sm text-gray-600">您有权随时撤回对个人信息处理的同意</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie政策</CardTitle>
              <CardDescription>我们如何使用Cookie和类似技术</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cookie类型</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">必要Cookie</span>
                    <span className="text-xs text-gray-500">维持网站基本功能</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">功能Cookie</span>
                    <span className="text-xs text-gray-500">记住您的偏好设置</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">分析Cookie</span>
                    <span className="text-xs text-gray-500">帮助我们改进服务</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                您可以通过浏览器设置管理Cookie偏好，但禁用某些Cookie可能影响网站功能。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>联系我们</CardTitle>
              <CardDescription>如有隐私相关问题，请联系我们</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">邮箱</p>
                    <p className="text-sm text-gray-600">privacy@yanyu.ai</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">客服热线</p>
                    <p className="text-sm text-gray-600">400-123-4567</p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-gray-500">
                我们将在收到您的请求后15个工作日内回复。对于复杂问题，我们可能需要更长时间处理，但不会超过30个工作日。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-soft">
            <p className="text-sm text-gray-600 mb-4">
              本隐私政策的解释权归YanYu Smart Cloud³ Learning
              Hub所有。我们保留随时修改本政策的权利，任何重大变更将通过网站公告或邮件通知您。
            </p>
            <p className="text-xs text-gray-500">继续使用我们的服务即表示您同意本隐私政策的条款。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

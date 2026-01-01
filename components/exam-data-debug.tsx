"use client"

import { getAllExams, getExamById } from "@/data/exam-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExamDataDebug() {
  const allExams = getAllExams()

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>考试数据调试信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allExams.map((exam) => {
              const examDetail = getExamById(exam.id)
              return (
                <div key={exam.id} className="border p-4 rounded">
                  <h3 className="font-bold">{exam.title}</h3>
                  <p>考试ID: {exam.id}</p>
                  <p>预期题目数量: {exam.id === "1" ? "30题" : exam.id === "2" ? "20题" : "28题"}</p>
                  <p>实际题目数量: {exam.questions?.length || 0}题</p>
                  <p>详情页题目数量: {examDetail?.questions?.length || 0}题</p>
                  <p
                    className={
                      exam.questions?.length === (exam.id === "1" ? 30 : exam.id === "2" ? 20 : 28)
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    状态:{" "}
                    {exam.questions?.length === (exam.id === "1" ? 30 : exam.id === "2" ? 20 : 28)
                      ? "✅ 正确"
                      : "❌ 错误"}
                  </p>

                  {/* 显示前5题的ID来验证数据 */}
                  <div className="mt-2">
                    <p className="text-sm font-medium">前5题ID:</p>
                    <ul className="text-xs text-gray-600">
                      {exam.questions?.slice(0, 5).map((q, index) => (
                        <li key={index}>
                          {q.id}: {q.question.substring(0, 50)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

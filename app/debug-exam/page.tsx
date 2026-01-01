import { getAllExams } from "@/data/exam-data"

async function DebugExamPage() {
  const exams = await getAllExams()

  return (
    <div>
      <h1>Debug Exam Page</h1>
      <pre>{JSON.stringify(exams, null, 2)}</pre>
    </div>
  )
}

export default DebugExamPage

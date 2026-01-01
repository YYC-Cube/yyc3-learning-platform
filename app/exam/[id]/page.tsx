import { getExamById } from "@/data/exam-data"

interface Props {
  params: { id: string }
}

async function ExamPage({ params }: Props) {
  const { id } = params
  const exam = await getExamById(id)

  if (!exam) {
    return <div>Exam not found</div>
  }

  return (
    <div>
      <h1>Exam: {exam.title}</h1>
      <p>Description: {exam.description}</p>
      {/* Display other exam details here */}
    </div>
  )
}

export default ExamPage

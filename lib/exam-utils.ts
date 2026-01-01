export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  explanation?: string
  difficulty?: "easy" | "medium" | "hard"
  category?: string
}

export interface ExamResult {
  score: number
  total: number
  percentage: number
  passed: boolean
  timeSpent: number
  correctAnswers: number
  incorrectAnswers: number
  skippedAnswers: number
}

export function calculateScore(questions: Question[], answers: Record<number, string>): ExamResult {
  let correctAnswers = 0
  let incorrectAnswers = 0
  let skippedAnswers = 0

  questions.forEach((question, index) => {
    const userAnswer = answers[index]
    if (!userAnswer) {
      skippedAnswers++
    } else if (userAnswer === question.correctAnswer) {
      correctAnswers++
    } else {
      incorrectAnswers++
    }
  })

  const total = questions.length
  const percentage = (correctAnswers / total) * 100

  return {
    score: correctAnswers,
    total,
    percentage,
    passed: percentage >= 60,
    timeSpent: 0,
    correctAnswers,
    incorrectAnswers,
    skippedAnswers,
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function getQuestionsByDifficulty(questions: Question[], difficulty: "easy" | "medium" | "hard"): Question[] {
  return questions.filter((q) => q.difficulty === difficulty)
}

export function getQuestionsByCategory(questions: Question[], category: string): Question[] {
  return questions.filter((q) => q.category === category)
}

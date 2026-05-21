import { Exam } from '../app/types.d';

export const exams: Exam[] = [];

export function getExamById(id: string): Exam | undefined {
  return exams.find((exam) => exam.id === id);
}

export function getAllExams(): Exam[] {
  return exams;
}

export function getExamsByCategory(category: string): Exam[] {
  return exams.filter((exam) => exam.category === category);
}

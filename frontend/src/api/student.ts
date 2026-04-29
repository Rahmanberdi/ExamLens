import { client } from './client';
import type { Question } from './admin';

export interface StudentExam {
  id: number;
  subject: number;
  subject_name: string;
  name: string;
  exam_date: string;
  total_score: string;
  score_obtained: number;
}

export interface StudentAnswerDetail {
  id: number;
  question: Omit<Question, 'correct_answer'>;
  selected_answer: (string | boolean)[];
  is_correct: boolean;
  score_obtained: string;
  submitted_at: string;
}

export const studentApi = {
  getExams: () => client.get<StudentExam[]>('/student/exams/').then((r) => r.data),
  getExamQuestions: (examId: number) =>
    client.get<StudentAnswerDetail[]>(`/student/exams/${examId}/questions/`).then((r) => r.data),
  getWrongQuestions: () =>
    client.get<StudentAnswerDetail[]>('/student/wrong-questions/').then((r) => r.data),
};
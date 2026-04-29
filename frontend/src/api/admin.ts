import { client } from './client';

export interface Subject {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Exam {
  id: number;
  subject: number;
  name: string;
  exam_date: string;
  total_score: string;
  created_at: string;
}

export interface Question {
  id: number;
  exam: number;
  question_number: number;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank';
  content: string;
  options: Record<string, string>;
  correct_answer: (string | boolean)[];
  max_score: string;
}

export interface StudentAnswer {
  id: number;
  question: number;
  student: number;
  selected_answer: (string | boolean)[];
  is_correct: boolean;
  score_obtained: string;
  submitted_at: string;
}

export interface Student {
  id: number;
  username: string;
  real_name: string;
  role: string;
  class_number: string;
}

export const adminApi = {
  getSubjects: () => client.get<Subject[]>('/admin/subjects/').then((r) => r.data),
  createSubject: (data: { name: string; description: string }) =>
    client.post<Subject>('/admin/subjects/', data).then((r) => r.data),

  getExams: () => client.get<Exam[]>('/admin/exams/').then((r) => r.data),
  createExam: (data: { subject: number; name: string; exam_date: string; total_score: string }) =>
    client.post<Exam>('/admin/exams/', data).then((r) => r.data),

  getQuestions: () => client.get<Question[]>('/admin/questions/').then((r) => r.data),
  createQuestion: (data: Omit<Question, 'id'>) =>
    client.post<Question>('/admin/questions/', data).then((r) => r.data),
  updateQuestion: (id: number, data: Omit<Question, 'id'>) =>
    client.put<Question>(`/admin/questions/${id}/`, data).then((r) => r.data),

  getAnswers: () => client.get<StudentAnswer[]>('/admin/answers/').then((r) => r.data),
  createAnswer: (data: { question: number; student: number; selected_answer: (string | boolean)[] }) =>
    client.post<StudentAnswer>('/admin/answers/', data).then((r) => r.data),

  getStudents: () => client.get<Student[]>('/admin/students/').then((r) => r.data),
  createStudent: (data: {
    username: string;
    password: string;
    real_name: string;
    role: string;
    class_number: string;
  }) => client.post<Student>('/admin/students/', data).then((r) => r.data),
};
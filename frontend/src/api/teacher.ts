import { client } from './client';
import type { Question, Subject, Exam } from './admin';

/** One student's answer for a question — used in the teacher question detail. */
export interface TeacherStudentAnswer {
  /** StudentAnswer row id */
  id: number;
  student_id: number;
  username: string;
  real_name: string;
  class_number: string;
  selected_answer: (string | boolean)[];
  is_correct: boolean;
  score_obtained: string;
  submitted_at: string;
}

export interface QuestionWithAnswers extends Question {
  student_answers: TeacherStudentAnswer[];
}

export interface TeacherQuestionListItem extends Question {
  wrong_count: number;
  correct_count: number;
  total_count: number;
}

export type TeacherQuestionStatus = 'all' | 'wrong' | 'correct';

export interface TeacherQuestionFilters {
  keyword?: string;
  exam?: number | string;
  subject?: number | string;
  status?: TeacherQuestionStatus;
}

export const teacherApi = {
  getQuestions: (filters: TeacherQuestionFilters = {}) => {
    const params: Record<string, string> = {};
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.exam) params.exam = String(filters.exam);
    if (filters.subject) params.subject = String(filters.subject);
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    return client
      .get<TeacherQuestionListItem[]>('/teacher/questions/', { params })
      .then((r) => r.data);
  },

  getQuestionDetail: (id: number) =>
    client.get<QuestionWithAnswers>(`/teacher/questions/${id}/`).then((r) => r.data),

  // Read-only browse — backed by the admin viewsets, gated server-side via IsAdminOrTeacherReadOnly
  getSubjects: () => client.get<Subject[]>('/admin/subjects/').then((r) => r.data),
  getExams: () => client.get<Exam[]>('/admin/exams/').then((r) => r.data),

  getExamAiSummary: (examId: number, lang: string) =>
    client.get<{ summary: string }>(`/teacher/exams/${examId}/ai-summary/`, { params: { lang } }).then((r) => r.data),
};

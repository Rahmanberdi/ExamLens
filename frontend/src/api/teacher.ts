import { client } from './client';
import type { Question } from './admin';

export interface WrongStudent {
  id: number;
  username: string;
  real_name: string;
}

export interface QuestionWithWrong extends Question {
  wrong_answer_students: WrongStudent[];
}

export const teacherApi = {
  getWrongQuestions: (keyword?: string) =>
    client
      .get<Question[]>('/teacher/wrong-questions/', { params: keyword ? { keyword } : {} })
      .then((r) => r.data),

  getQuestionDetail: (id: number) =>
    client.get<QuestionWithWrong>(`/teacher/questions/${id}/`).then((r) => r.data),
};
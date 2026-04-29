import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { LoginPage } from '../features/auth/LoginPage';
import { AdminOverview } from '../features/admin/AdminOverview';
import { AdminSubjects } from '../features/admin/AdminSubjects';
import { AdminExams } from '../features/admin/AdminExams';
import { AdminQuestions } from '../features/admin/AdminQuestions';
import { AdminQuestionEditor } from '../features/admin/AdminQuestionEditor';
import { AdminAnswers } from '../features/admin/AdminAnswers';
import { AdminStudents } from '../features/admin/AdminStudents';
import { TeacherWrongQuestions } from '../features/teacher/TeacherWrongQuestions';
import { StudentExams } from '../features/student/StudentExams';
import { StudentExamDetail } from '../features/student/StudentExamDetail';
import { StudentWrong } from '../features/student/StudentWrong';
import { getPayload } from '../api/auth';

function RootRedirect() {
  const p = getPayload();
  if (!p) return <Navigate to="/login" replace />;
  if (p.role === 'admin') return <Navigate to="/admin" replace />;
  if (p.role === 'teacher') return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/admin" element={<AuthGuard role="admin"><AdminOverview /></AuthGuard>} />
      <Route path="/admin/subjects" element={<AuthGuard role="admin"><AdminSubjects /></AuthGuard>} />
      <Route path="/admin/exams" element={<AuthGuard role="admin"><AdminExams /></AuthGuard>} />
      <Route path="/admin/questions" element={<AuthGuard role="admin"><AdminQuestions /></AuthGuard>} />
      <Route path="/admin/questions/new" element={<AuthGuard role="admin"><AdminQuestionEditor /></AuthGuard>} />
      <Route path="/admin/questions/:id/edit" element={<AuthGuard role="admin"><AdminQuestionEditor /></AuthGuard>} />
      <Route path="/admin/answers" element={<AuthGuard role="admin"><AdminAnswers /></AuthGuard>} />
      <Route path="/admin/students" element={<AuthGuard role="admin"><AdminStudents /></AuthGuard>} />

      <Route path="/teacher" element={<AuthGuard role="teacher"><TeacherWrongQuestions /></AuthGuard>} />
      <Route path="/teacher/questions/:id" element={<AuthGuard role="teacher"><TeacherWrongQuestions /></AuthGuard>} />

      <Route path="/student" element={<AuthGuard role="student"><StudentExams /></AuthGuard>} />
      <Route path="/student/exams/:examId" element={<AuthGuard role="student"><StudentExamDetail /></AuthGuard>} />
      <Route path="/student/wrong" element={<AuthGuard role="student"><StudentWrong /></AuthGuard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Navigate } from 'react-router-dom';
import { getPayload } from '../api/auth';

interface AuthGuardProps {
  role: 'admin' | 'teacher' | 'student';
  children: React.ReactNode;
}

export function AuthGuard({ role, children }: AuthGuardProps) {
  const payload = getPayload();
  if (!payload) return <Navigate to="/login" replace />;
  if (payload.role !== role) {
    const home = payload.role === 'admin' ? '/admin' : payload.role === 'teacher' ? '/teacher' : '/student';
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}
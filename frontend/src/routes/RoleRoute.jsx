import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/participant'} replace />;
  }

  return <Outlet />;
}

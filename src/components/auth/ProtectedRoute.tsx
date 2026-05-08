import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

export default function ProtectedRoute() {
  const { user, initialized, loading } = useAuthStore();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] dark">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm">Loading Nexus TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

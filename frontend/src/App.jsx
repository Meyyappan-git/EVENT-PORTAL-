import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AdminLogin from './pages/auth/AdminLogin';
import ParticipantLogin from './pages/auth/ParticipantLogin';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/participant'} replace />;
}

function AuthLanding() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-violet-950/30 backdrop-blur-xl">
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 p-8 text-center sm:p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-50/80">CSEA</div>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">Choose your portal</h1>
          <p className="mt-3 text-sm text-violet-50/85 sm:text-base">
            Sign in or create an account for the right event role.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <Link
            to="/auth/login/participant"
            className="group rounded-3xl border border-cyan-500/40 bg-cyan-500/10 p-6 text-left transition hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-500/15"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Participant</div>
            <h2 className="mt-4 text-2xl font-bold text-white">Join a team</h2>
            <p className="mt-2 text-sm text-slate-300">Compete in live rounds and track your score in real time.</p>
            <div className="mt-6 inline-flex rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-medium text-cyan-100">
              Sign in as participant
            </div>
          </Link>

          <Link
            to="/auth/login/admin"
            className="group rounded-3xl border border-violet-500/40 bg-violet-500/10 p-6 text-left transition hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-500/15"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-300">Admin</div>
            <h2 className="mt-4 text-2xl font-bold text-white">Manage the event</h2>
            <p className="mt-2 text-sm text-slate-300">Control rounds, teams, questions, and live leaderboard visibility.</p>
            <div className="mt-6 inline-flex rounded-full bg-violet-500/20 px-3 py-1 text-sm font-medium text-violet-100">
              Sign in as admin
            </div>
          </Link>
        </div>

        <div className="border-t border-white/10 bg-slate-950/50 p-6 text-center text-sm text-slate-300 sm:p-8">
          Need a new account?{' '}
          <Link to="/auth/register/participant" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Participant signup
          </Link>{' '}
          or{' '}
          <Link to="/auth/register/admin" className="font-semibold text-violet-300 hover:text-violet-200">
            Admin signup
          </Link>
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<AuthLanding />} />
            <Route path="/auth/login/participant" element={<ParticipantLogin />} />
            <Route path="/auth/login/admin" element={<AdminLogin />} />
            <Route path="/auth/register" element={<Navigate to="/auth/register/participant" replace />} />
            <Route path="/auth/register/participant" element={<Register role="PARTICIPANT" />} />
            <Route path="/auth/register/admin" element={<Register role="ADMIN" />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={['PARTICIPANT']} />}>
                <Route path="/participant" element={<ParticipantDashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppShell />;
}

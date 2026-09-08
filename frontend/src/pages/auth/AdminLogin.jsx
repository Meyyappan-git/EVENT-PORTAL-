import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', role: 'ADMIN' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'ADMIN' ? '/admin' : '/participant';
    return <Navigate to={location.state?.from?.pathname || redirectPath} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = await login(form);
      const destination = payload.user.role === 'ADMIN' ? '/admin' : '/participant';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { label: 'Participant', path: '/auth/login/participant', active: false },
    { label: 'Admin', path: '/auth/login/admin', active: true },
  ];

  return (
    <div className="auth-page flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-violet-950/30 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 p-10 lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_22%)]" />
          <div className="relative z-10 text-center">
            <div className="text-[4.3rem] font-[700] uppercase tracking-[0.22em] text-white drop-shadow-[0_10px_30px_rgba(15,23,42,0.45)] [letter-spacing:0.22em]">
              CSEA
            </div>
            <div className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.55em] text-violet-50/80">
              Admin portal
            </div>
          </div>
        </div>

        <div className="bg-slate-950/50 p-6 sm:p-8 lg:p-10">
          <div className="mb-6 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Welcome back</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Admin sign in</h2>
          </div>

          <div className="mb-6 rounded-2xl border border-violet-500/30 bg-slate-900/70 p-2">
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((option) => (
                <Link
                  key={option.label}
                  to={option.path}
                  className={`rounded-xl px-3 py-2 text-center text-sm font-semibold transition ${
                    option.active
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-slate-950/40 text-slate-300 hover:text-white'
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in as admin'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Need an admin account?{' '}
            <Link to="/auth/register/admin" className="font-semibold text-violet-300 hover:text-violet-200">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

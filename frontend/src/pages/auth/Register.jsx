import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'PARTICIPANT',
};

export default function Register({ role = 'PARTICIPANT' }) {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...initialState, role });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((previous) => ({ ...previous, role }));
  }, [role]);

  if (isAuthenticated && user) {
    const destination = user.role === 'ADMIN' ? '/admin' : '/participant';
    return <Navigate to={destination} replace />;
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
      const payload = await register({ ...form, role });
      const destination = payload.user.role === 'ADMIN' ? '/admin' : '/participant';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'ADMIN';
  const roleLabel = isAdmin ? 'Admin' : 'Participant';
  const accentClass = isAdmin
    ? 'border-violet-400 bg-violet-500/10 text-violet-100'
    : 'border-cyan-400 bg-cyan-500/10 text-cyan-100';
  const buttonClass = isAdmin
    ? 'from-violet-500 to-fuchsia-500 shadow-violet-500/30'
    : 'from-cyan-500 to-sky-500 shadow-cyan-500/30';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-violet-950/30 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className={`relative hidden overflow-hidden bg-gradient-to-br ${isAdmin ? 'from-violet-600 via-fuchsia-600 to-cyan-500' : 'from-cyan-500 via-sky-600 to-violet-700'} p-10 lg:flex lg:flex-col lg:justify-between`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_22%)]" />
          <div className="relative z-10">
            <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-50 backdrop-blur-sm">
              CSEA
            </div>
            <h1 className="mt-8 max-w-sm text-4xl font-black leading-tight text-white">
              {isAdmin ? 'Create your admin account.' : 'Create your participant account.'}
            </h1>
            <p className="mt-4 max-w-md text-base text-violet-50/85">
              {isAdmin
                ? 'Launch and manage rounds, scoreboards, and event workflow from the admin portal.'
                : 'Join the competition, form your team, and track your progress in real time.'}
            </p>
          </div>

          <div className="relative z-10 grid gap-3 text-sm text-violet-50/90 sm:grid-cols-2">
            {['Fast onboarding', isAdmin ? 'Event setup' : 'Team creation', isAdmin ? 'Leaderboard control' : 'Live analytics', 'Secure access'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/50 p-6 sm:p-8 lg:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Create account</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{roleLabel} access</h2>
          </div>

          <div className="mb-6">
            <div className={`inline-flex w-full rounded-2xl border p-1 ${accentClass}`}>
              <span className="flex w-full items-center justify-center rounded-xl bg-slate-950/40 px-4 py-2 text-sm font-semibold">
                {roleLabel} account
              </span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-gray-800 px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                placeholder="Alex Morgan"
                required
              />
            </div>

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
                className="w-full rounded-2xl border border-slate-200 bg-gray-800 px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                placeholder="you@example.com"
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
                className="w-full rounded-2xl border border-slate-200 bg-gray-800 px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl bg-gradient-to-r px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 ${buttonClass}`}
            >
              {loading ? 'Creating account...' : `Create ${roleLabel.toLowerCase()} account`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Already have an account?{' '}
            <Link to={isAdmin ? '/auth/login/admin' : '/auth/login/participant'} className="font-semibold text-violet-300 hover:text-violet-200">
              Sign in
            </Link>
          </p>

          <p className="mt-3 text-center text-xs text-slate-400">
            Need a different account type?{' '}
            <Link to={isAdmin ? '/auth/register/participant' : '/auth/register/admin'} className="font-semibold text-cyan-300 hover:text-cyan-200">
              Switch here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

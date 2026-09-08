import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import LeaderboardTable from '../../components/LeaderboardTable';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const emptyForm = { name: '', code: '' };

export default function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [activeModule, setActiveModule] = useState('overview');
  const [team, setTeam] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasCompetitionData = Boolean(currentQuestion || events.length);

  const loadTeam = async () => {
    try {
      const response = await axiosInstance.get('/api/teams/me');
      setTeam(response.data.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.error || 'Unable to load team data');
      }
      setTeam(null);
    }
  };

  const loadCurrentQuestion = async () => {
    try {
      const response = await axiosInstance.get('/api/questions/current');
      setCurrentQuestion(response.data.data);
    } catch (err) {
      if (err.response?.status !== 400 && err.response?.status !== 404) {
        setError(err.response?.data?.error || 'Unable to load current question');
      }
      setCurrentQuestion(null);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await axiosInstance.get('/api/leaderboard');
      setLeaderboard(response.data.data || []);
    } catch (err) {
      setLeaderboard([]);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await axiosInstance.get('/api/events');
      setEvents(response.data.data || []);
    } catch (err) {
      setEvents([]);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([loadTeam(), loadCurrentQuestion(), loadLeaderboard(), loadEvents()]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const handleLeaderboardUpdate = (data) => {
      setLeaderboard(data || []);
    };

    socket.on('leaderboard:update', handleLeaderboardUpdate);
    const handlePortalUpdate = () => {
      loadEvents();
      loadCurrentQuestion();
      loadLeaderboard();
    };

    socket.on('portal-updated', handlePortalUpdate);
    return () => {
      socket.off('leaderboard:update', handleLeaderboardUpdate);
      socket.off('portal-updated', handlePortalUpdate);
    };
  }, [socket]);

  const teamStats = useMemo(() => {
    const members = team?.members?.length ?? 0;
    return [
      { label: 'Team score', value: team?.score ?? 0, accent: 'cyan' },
      { label: 'Members', value: members, accent: 'purple' },
      { label: 'Question', value: currentQuestion ? currentQuestion.title : 'None', accent: 'emerald' },
    ];
  }, [team, currentQuestion]);

  const handleCreateTeam = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setTeamLoading(true);

    try {
      await axiosInstance.post('/api/teams/create', { name: form.name });
      setSuccess('Team created successfully');
      setForm(emptyForm);
      await loadTeam();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create team');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleJoinTeam = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setTeamLoading(true);

    try {
      await axiosInstance.post('/api/teams/join', { code: form.code });
      setSuccess('Joined team successfully');
      setForm(emptyForm);
      await loadTeam();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to join team');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleSubmitAnswer = async (event) => {
    event.preventDefault();
    if (!currentQuestion) return;

    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/api/submissions', {
        questionId: currentQuestion._id,
        answer,
      });
      setSuccess('Answer submitted');
      setAnswer('');
      await loadCurrentQuestion();
      await loadLeaderboard();
      await loadTeam();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit answer');
    }
  };

  const participantModules = [
    { id: 'overview', label: 'Overview', disabled: false },
    { id: 'team', label: 'Team', disabled: false },
    { id: 'question', label: 'Question', disabled: !hasCompetitionData },
    { id: 'leaderboard', label: 'Leaderboard', disabled: !hasCompetitionData },
  ];

  const renderModule = () => {
    if (!hasCompetitionData && activeModule !== 'team') {
      return (
        <div className="rounded-[26px] border border-dashed border-cyan-500/40 bg-slate-900/70 p-8 text-center shadow-xl shadow-slate-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Competition not started</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Waiting for admin setup</h2>
          <p className="mt-3 text-sm text-slate-300">
            The event details and questions will appear here only after the admin creates the event, round, and question.
          </p>
        </div>
      );
    }

    if (activeModule === 'team') {
      return (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Team status</h2>
          {team ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Team name</p>
                <p className="text-lg font-semibold text-white">{team.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Team code</p>
                <p className="text-lg font-semibold tracking-[0.25em] text-cyan-300">{team.code}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {team.members?.map((member) => (
                  <span key={member._id} className="rounded-full bg-slate-950 px-3 py-1 text-sm text-slate-200">
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <form onSubmit={handleCreateTeam} className="space-y-3">
                <input
                  value={form.name}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                  placeholder="New team name"
                  required
                />
                <button type="submit" disabled={teamLoading} className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60">
                  {teamLoading ? 'Working...' : 'Create team'}
                </button>
              </form>

              <div className="flex items-center gap-3 text-slate-500">
                <span className="h-px flex-1 bg-slate-700" />
                <span className="text-xs uppercase tracking-[0.2em]">Or</span>
                <span className="h-px flex-1 bg-slate-700" />
              </div>

              <form onSubmit={handleJoinTeam} className="space-y-3">
                <input
                  value={form.code}
                  onChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                  placeholder="Enter team code"
                  required
                />
                <button type="submit" disabled={teamLoading} className="w-full rounded-2xl border border-cyan-500 bg-cyan-500/10 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60">
                  {teamLoading ? 'Working...' : 'Join team'}
                </button>
              </form>
            </div>
          )}
        </div>
      );
    }

    if (activeModule === 'question') {
      return (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Current question</h2>
          {currentQuestion ? (
            <form onSubmit={handleSubmitAnswer} className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">{currentQuestion.title}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{currentQuestion.description}</h3>
              </div>

              {currentQuestion.options?.length ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-slate-200 transition hover:border-cyan-400">
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={answer === option}
                        onChange={(event) => setAnswer(event.target.value)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Your answer</label>
                  <input
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Type your answer"
                  />
                </div>
              )}

              <button className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400" type="submit">
                Submit answer
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-sm text-slate-400">
              No active question is currently unlocked for this team.
            </div>
          )}
        </div>
      );
    }

    if (activeModule === 'leaderboard') {
      return (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-0 shadow-xl shadow-slate-950/20">
          <LeaderboardTable rows={leaderboard} title="Live leaderboard" />
        </div>
      );
    }

    return (
      <>
        <div className="mb-6 rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Event overview</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Available events</h2>
          {events.length === 0 ? (
            <p className="mt-4 text-sm text-slate-300">No events have been created yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {events.map((event) => (
                <div key={event._id} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white">{event.name}</h3>
                    <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">{event.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{event.currentRoundId ? 'Round in progress' : 'Waiting for a round'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {teamStats.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} accent={item.accent} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Current question</h2>
            {currentQuestion ? (
              <form onSubmit={handleSubmitAnswer} className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">{currentQuestion.title}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{currentQuestion.description}</h3>
                </div>

                {currentQuestion.options?.length ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <label key={option} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-slate-200 transition hover:border-cyan-400">
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={answer === option}
                          onChange={(event) => setAnswer(event.target.value)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Your answer</label>
                    <input
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                      placeholder="Type your answer"
                    />
                  </div>
                )}

                <button className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400" type="submit">
                  Submit answer
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-sm text-slate-400">
                No active question is currently unlocked for this team.
              </div>
            )}
          </div>

          <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Team status</h2>
            {team ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Team name</p>
                  <p className="text-lg font-semibold text-white">{team.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Team code</p>
                  <p className="text-lg font-semibold tracking-[0.25em] text-cyan-300">{team.code}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.members?.map((member) => (
                    <span key={member._id} className="rounded-full bg-slate-950 px-3 py-1 text-sm text-slate-200">
                      {member.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <form onSubmit={handleCreateTeam} className="space-y-3">
                  <input
                    value={form.name}
                    onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="New team name"
                    required
                  />
                  <button type="submit" disabled={teamLoading} className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60">
                    {teamLoading ? 'Working...' : 'Create team'}
                  </button>
                </form>

                <div className="flex items-center gap-3 text-slate-500">
                  <span className="h-px flex-1 bg-slate-700" />
                  <span className="text-xs uppercase tracking-[0.2em]">Or</span>
                  <span className="h-px flex-1 bg-slate-700" />
                </div>

                <form onSubmit={handleJoinTeam} className="space-y-3">
                  <input
                    value={form.code}
                    onChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Enter team code"
                    required
                  />
                  <button type="submit" disabled={teamLoading} className="w-full rounded-2xl border border-cyan-500 bg-cyan-500/10 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60">
                    {teamLoading ? 'Working...' : 'Join team'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Loading participant dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-6 shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Participant Arena</p>
              <h1 className="mt-2 text-3xl font-black text-white">Welcome, {user?.name}</h1>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 font-medium text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3 rounded-[24px] border border-white/10 bg-slate-900/60 p-3">
          {participantModules.map((module) => (
            <button
              key={module.id}
              type="button"
              disabled={module.disabled}
              onClick={() => !module.disabled && setActiveModule(module.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${module.disabled ? 'cursor-not-allowed bg-slate-800/60 text-slate-500' : activeModule === module.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            >
              {module.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
        {success && <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}

        {renderModule()}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import LeaderboardTable from '../../components/LeaderboardTable';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const emptyEventForm = { name: '' };
const emptyRoundForm = { eventId: '', name: '', status: 'OPEN' };
const emptyQuestionForm = {
  roundId: '',
  title: '',
  description: '',
  type: 'MCQ',
  options: '',
  correctAnswer: '',
  points: 10,
  order: 1,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('overview');
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [roundForm, setRoundForm] = useState(emptyRoundForm);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [events, setEvents] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadLeaderboard = async () => {
    try {
      const response = await axiosInstance.get('/api/leaderboard');
      setLeaderboard(response.data.data || []);
    } catch (err) {
      setLeaderboard([]);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await axiosInstance.get('/api/submissions');
      setSubmissions(response.data.data || []);
    } catch (err) {
      setSubmissions([]);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await axiosInstance.get('/api/events');
      setEvents(response.data.data || []);
      if (response.data.data?.[0]) {
        setRoundForm((previous) => ({ ...previous, eventId: response.data.data[0]._id }));
        setQuestionForm((previous) => ({ ...previous, roundId: response.data.data[0].currentRoundId || '' }));
      }
    } catch (err) {
      setEvents([]);
    }
  };

  const loadRounds = async () => {
    try {
      const response = await axiosInstance.get('/api/rounds');
      setRounds(response.data.data || []);
      if (response.data.data?.[0]) {
        setQuestionForm((previous) => ({ ...previous, roundId: previous.roundId || response.data.data[0]._id }));
      }
    } catch (err) {
      setRounds([]);
    }
  };

  useEffect(() => {
    const boot = async () => {
      await Promise.all([loadLeaderboard(), loadSubmissions(), loadEvents(), loadRounds()]);
    };

    boot();
  }, []);

  const handleEventSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/api/events', { name: eventForm.name });
      setSuccess('Event created successfully');
      setEventForm(emptyEventForm);
      await Promise.all([loadEvents(), loadRounds()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create event');
    }
  };

  const handleRoundSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/api/rounds', {
        eventId: roundForm.eventId,
        name: roundForm.name,
        status: roundForm.status,
      });
      setSuccess('Round created successfully');
      setRoundForm({ ...emptyRoundForm, eventId: roundForm.eventId });
      await loadRounds();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create round');
    }
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/api/questions', {
        ...questionForm,
        options: questionForm.options.split(',').map((option) => option.trim()).filter(Boolean),
      });
      setSuccess('Question created successfully');
      setQuestionForm(emptyQuestionForm);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create question');
    }
  };

  const handleSetCurrentRound = async (roundId) => {
    const eventId = roundForm.eventId || events[0]?._id;
    if (!eventId) return;

    try {
      await axiosInstance.patch(`/api/events/${eventId}/current-round`, { roundId });
      setSuccess('Active round updated');
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update active round');
    }
  };

  const adminModules = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events' },
    { id: 'rounds', label: 'Rounds' },
    { id: 'questions', label: 'Questions' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'submissions', label: 'Submissions' },
  ];

  const renderModule = () => {
    if (activeModule === 'events') {
      return (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Create event</h2>
          <form onSubmit={handleEventSubmit} className="mt-5 space-y-4">
            <input
              value={eventForm.name}
              onChange={(event) => setEventForm({ name: event.target.value })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Event name"
              required
            />
            <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
              Create event
            </button>
          </form>
        </div>
      );
    }

    if (activeModule === 'rounds') {
      return (
        <div className="space-y-6">
          <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Create round</h2>
            <form onSubmit={handleRoundSubmit} className="mt-5 space-y-4">
              <select
                value={roundForm.eventId}
                onChange={(event) => setRoundForm((previous) => ({ ...previous, eventId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>{event.name}</option>
                ))}
              </select>
              <input
                value={roundForm.name}
                onChange={(event) => setRoundForm((previous) => ({ ...previous, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                placeholder="Round name"
                required
              />
              <select
                value={roundForm.status}
                onChange={(event) => setRoundForm((previous) => ({ ...previous, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="OPEN">Open</option>
                <option value="LOCKED">Locked</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button type="submit" className="rounded-2xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400">
                Create round
              </button>
            </form>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Round controls</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {rounds.map((round) => (
                <button
                  key={round._id}
                  type="button"
                  onClick={() => handleSetCurrentRound(round._id)}
                  className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-400"
                >
                  <div className="font-semibold text-white">{round.name}</div>
                  <div className="text-slate-400">{round.status}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeModule === 'questions') {
      return (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Create question</h2>
          <form onSubmit={handleQuestionSubmit} className="mt-5 space-y-4">
            <select
              value={questionForm.roundId}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, roundId: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
            >
              <option value="">Select round</option>
              {rounds.map((round) => (
                <option key={round._id} value={round._id}>{round.name}</option>
              ))}
            </select>
            <input
              value={questionForm.title}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Question title"
              required
            />
            <textarea
              value={questionForm.description}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, description: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Question description"
              rows="3"
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={questionForm.type}
                onChange={(event) => setQuestionForm((previous) => ({ ...previous, type: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="MCQ">Multiple choice</option>
                <option value="RIDDLE">Riddle</option>
              </select>
              <input
                type="number"
                value={questionForm.points}
                onChange={(event) => setQuestionForm((previous) => ({ ...previous, points: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                placeholder="Points"
                min="1"
              />
            </div>
            <input
              value={questionForm.options}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, options: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Options separated by commas"
            />
            <input
              value={questionForm.correctAnswer}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, correctAnswer: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Correct answer"
              required
            />
            <input
              type="number"
              value={questionForm.order}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, order: Number(event.target.value) }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Order"
              min="1"
            />
            <button type="submit" className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Save question
            </button>
          </form>
        </div>
      );
    }

    if (activeModule === 'leaderboard') {
      return (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-0 shadow-xl shadow-slate-950/20">
          <LeaderboardTable rows={leaderboard} title="Leaderboard" />
        </div>
      );
    }

    if (activeModule === 'submissions') {
      return (
        <div className="rounded-[26px] border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/20">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="text-lg font-semibold text-white">Recent submissions</h3>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-white/10">
            {submissions.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-400">No submissions yet.</div>
            ) : (
              submissions.map((submission) => (
                <div key={submission._id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white">{submission.teamId?.name}</div>
                      <div className="text-sm text-slate-400">Q: {submission.questionId?.title}</div>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submission.isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                      {submission.isCorrect ? 'Correct' : 'Wrong'}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">Answer: {submission.answer}</div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Teams on board" value={leaderboard.length} accent="cyan" />
          <StatCard label="Live submissions" value={submissions.length} accent="purple" />
          <StatCard label="Active event" value={events[0]?.name || 'N/A'} accent="emerald" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[26px] border border-white/10 bg-slate-900/70 p-0 shadow-xl shadow-slate-950/20">
            <LeaderboardTable rows={leaderboard} title="Leaderboard" />
          </div>
          <div className="rounded-[26px] border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/20">
            <div className="border-b border-white/10 px-5 py-4">
              <h3 className="text-lg font-semibold text-white">Recent submissions</h3>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-white/10">
              {submissions.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-400">No submissions yet.</div>
              ) : (
                submissions.map((submission) => (
                  <div key={submission._id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">{submission.teamId?.name}</div>
                        <div className="text-sm text-slate-400">Q: {submission.questionId?.title}</div>
                      </div>
                      <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submission.isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                        {submission.isCorrect ? 'Correct' : 'Wrong'}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Answer: {submission.answer}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Admin Console</p>
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
          {adminModules.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => setActiveModule(module.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${activeModule === module.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
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

export default function LeaderboardTable({ rows = [], title = 'Leaderboard' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Rank</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Team</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Members</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-6 text-center text-sm text-slate-500">
                  No leaderboard entries yet.
                </td>
              </tr>
            ) : (
              rows.map((team) => (
                <tr key={team.teamId} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-semibold text-slate-800">#{team.rank}</td>
                  <td className="px-5 py-3 text-sm text-slate-800">{team.name}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{team.code}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{team.members?.length ?? 0}</td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-900">{team.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

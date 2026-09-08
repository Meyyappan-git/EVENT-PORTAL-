export default function LeaderboardTable({ rows = [], title = 'Leaderboard' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#001f3f] via-[#083358] to-[#0da574] shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-indigo-800">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#031326] text-emerald-400 border-b border-[#0da574]/40 text-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Team</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Members</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-6 text-center text-sm font-bold">
                  No leaderboard entries yet.
                </td>
              </tr>
            ) : (
              rows.map((team) => (
                <tr key={team.teamId} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-semibold">#{team.rank}</td>
                  <td className="px-5 py-3 text-sm">{team.name}</td>
                  <td className="px-5 py-3 text-sm">{team.code}</td>
                  <td className="px-5 py-3 text-sm">{team.members?.length ?? 0}</td>
                  <td className="px-5 py-3 text-sm font-bold">{team.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

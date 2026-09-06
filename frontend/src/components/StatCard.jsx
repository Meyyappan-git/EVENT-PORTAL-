export default function StatCard({ label, value, accent = 'cyan' }) {
  const accentClasses = {
    cyan: 'bg-cyan-50 text-cyan-700',
    purple: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${accentClasses[accent] || accentClasses.cyan}`}>
        {label}
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

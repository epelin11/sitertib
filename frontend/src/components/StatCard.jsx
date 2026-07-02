export default function StatCard({ icon: Icon, label, value, sublabel, accent = "ink" }) {
  const accentClasses = {
    ink: "bg-ink-800 text-white",
    brass: "bg-brass-500 text-ink-900",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <div className="card flex items-start gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-400">{label}</p>
        <p className="font-display text-2xl font-bold text-ink-800">{value}</p>
        {sublabel && <p className="mt-0.5 text-xs text-ink-400">{sublabel}</p>}
      </div>
    </div>
  );
}

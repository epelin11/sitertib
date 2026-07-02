export default function PercentBar({ value }) {
  let colorClass = "bg-success";
  if (value >= 70) colorClass = "bg-danger";
  else if (value >= 40) colorClass = "bg-brass-500";

  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-ink-50">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 font-mono text-xs font-medium text-ink-700">{value}%</span>
    </div>
  );
}

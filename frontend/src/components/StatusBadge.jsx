export default function StatusBadge({ status }) {
  const s = status || "Open";
  const cls =
    s.toLowerCase().includes("secure") || s.toLowerCase().includes("completed")
      ? "bg-emerald-600/20 text-emerald-400"
      : s.toLowerCase().includes("critical")
      ? "bg-red-600/20 text-red-400"
      : "bg-yellow-500/20 text-yellow-300";
  return <span className={`px-2 py-1 rounded-md text-xs font-semibold ${cls}`}>{s}</span>;
}

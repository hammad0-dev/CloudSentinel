export default function StatusBadge({ status }) {
  const s = status || "Open";
  const cls =
    s.toLowerCase().includes("secure") || s.toLowerCase().includes("completed")
      ? "border-[var(--accent-green)] text-[var(--accent-green)]"
      : s.toLowerCase().includes("critical")
      ? "border-[var(--accent-red)] text-[var(--accent-red)]"
      : "border-[var(--accent-yellow)] text-[var(--accent-yellow)]";
  return <span className={`pill-badge ${cls}`}>{s}</span>;
}

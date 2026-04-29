export default function SeverityBadge({ severity }) {
  const value = (severity || "INFO").toUpperCase();
  const cls =
    value === "CRITICAL"
      ? "bg-red-600 text-white"
      : value === "MAJOR" || value === "HIGH"
      ? "bg-orange-500 text-white"
      : value === "MEDIUM"
      ? "bg-yellow-500 text-black"
      : value === "MINOR" || value === "LOW"
      ? "bg-blue-500 text-white"
      : "bg-gray-500 text-white";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${cls}`}>{value}</span>;
}

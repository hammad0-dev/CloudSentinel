export default function StatCard({ label, value, trend, color = "blue", icon: Icon }) {
  return (
    <div className={`card p-4 border-l-4 border-l-${color}-500`}>
      <div className="flex items-center justify-between">
        <p className="text-[#64748b] text-sm">{label}</p>
        {Icon ? <Icon size={16} /> : null}
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {trend ? <p className="text-xs text-[#64748b] mt-1">{trend}</p> : null}
    </div>
  );
}

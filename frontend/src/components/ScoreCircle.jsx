export default function ScoreCircle({ score = 0, size = 64 }) {
  const color = score > 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div
      className="rounded-full border-4 flex items-center justify-center font-bold"
      style={{ width: size, height: size, borderColor: color, color }}
    >
      {score}
    </div>
  );
}

export default function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-8 rounded-lg bg-slate-700/40 animate-pulse" />
      ))}
    </div>
  );
}

export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-3">
      {Icon ? <Icon className="w-10 h-10 text-slate-500" /> : null}
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-[#64748b]">{message}</p>
      {actionLabel ? (
        <button onClick={onAction} className="primary-btn mt-2">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

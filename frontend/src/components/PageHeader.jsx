export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="text-[#64748b] mt-1">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

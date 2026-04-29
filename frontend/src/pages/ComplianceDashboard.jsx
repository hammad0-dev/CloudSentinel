import PageHeader from "../components/PageHeader";

export default function ComplianceDashboard() {
  const frameworks = [
    ["OWASP Top 10", 70, "7/10 passed", "Partial"],
    ["ISO 27001", 85, "93/110 passed", "Compliant"],
    ["SOC 2 Type II", 65, "52/80 passed", "Partial"],
    ["GDPR", 90, "18/20 passed", "Compliant"],
    ["PCI DSS", 55, "44/80 passed", "Non-Compliant"],
    ["NIST CSF", 75, "60/80 passed", "Partial"],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Compliance Dashboard" subtitle="Last updated: Today at 09:30 AM" actions={<><button className="primary-btn">Export PDF Report</button><button className="primary-btn">Schedule Report</button></>} />
      <div className="card p-6 text-center">
        <p className="text-5xl font-bold">78%</p>
        <p className="text-[#64748b] mt-1">Partially Compliant • +5% from last month</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map(([name, score, controls, status]) => (
          <div key={name} className="card p-4">
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-[#64748b] mt-1">{controls}</p>
            <div className="h-2 bg-slate-700/50 rounded mt-3">
              <div className="h-2 rounded bg-blue-500 progress-anim" style={{ width: `${score}%` }} />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm">{score}%</p>
              <span className="text-xs text-[#64748b]">{status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-5 overflow-auto">
        <h3 className="font-bold mb-3">Failed Controls</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#64748b]"><th>Control ID</th><th>Framework</th><th>Description</th><th>Severity</th><th>Status</th><th>Fix</th></tr></thead>
          <tbody>
            <tr className="border-t border-[#1e2d4a]"><td>OWASP-A03</td><td>OWASP</td><td>Injection vulnerabilities found</td><td>Critical</td><td>Failed</td><td>Guide</td></tr>
            <tr className="border-t border-[#1e2d4a]"><td>OWASP-A07</td><td>OWASP</td><td>Missing authentication controls</td><td>High</td><td>Failed</td><td>Guide</td></tr>
            <tr className="border-t border-[#1e2d4a]"><td>PCI-6.5</td><td>PCI DSS</td><td>Insecure code practices</td><td>Critical</td><td>Failed</td><td>Guide</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

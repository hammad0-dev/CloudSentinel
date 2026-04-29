import PageHeader from "../components/PageHeader";
import SeverityBadge from "../components/SeverityBadge";

export default function MonitoringAlerts() {
  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring & Alerts" subtitle="All Systems Operational" actions={<button className="primary-btn">+ Create Alert Rule</button>} />
      <div className="grid gap-3">
        <div className="card p-4 border-l-4 border-l-red-600"><SeverityBadge severity="CRITICAL" /> SQL Injection vulnerability found in production code <span className="text-xs text-[#64748b]">• 5 min ago</span></div>
        <div className="card p-4 border-l-4 border-l-orange-500"><SeverityBadge severity="HIGH" /> Exposed GitHub API key detected in latest commit <span className="text-xs text-[#64748b]">• 23 min ago</span></div>
        <div className="card p-4 border-l-4 border-l-yellow-500"><SeverityBadge severity="MEDIUM" /> lodash package CVE-2021-23337 affects your project <span className="text-xs text-[#64748b]">• 1h ago</span></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">SonarQube API: Online • 45ms</div>
        <div className="card p-4">PostgreSQL: Online • 1,247 queries/hr</div>
        <div className="card p-4">GitHub API: 4,832/5000/hr</div>
        <div className="card p-4">Backend API: 99.9% uptime</div>
      </div>
      <div className="card p-4 overflow-auto">
        <h3 className="font-bold mb-3">Alerts History</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#64748b]"><th>Severity</th><th>Message</th><th>Project</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{Array.from({ length: 8 }).map((_, i) => <tr key={i} className="border-t border-[#1e2d4a]"><td>{i % 3 === 0 ? "Critical" : "High"}</td><td>Security event #{i + 1}</td><td>E-Commerce API</td><td>{i + 1}h ago</td><td>{i % 2 === 0 ? "Resolved" : "Active"}</td><td>View</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

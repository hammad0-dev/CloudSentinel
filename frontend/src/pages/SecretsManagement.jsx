import PageHeader from "../components/PageHeader";
import SeverityBadge from "../components/SeverityBadge";

export default function SecretsManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Secrets & Credentials Detection" subtitle="2 exposed secrets require immediate rotation" />
      <div className="card p-4 border border-red-600/50 bg-red-950/20 text-red-300">2 exposed secrets require immediate rotation</div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4">Exposed in Code: 2</div>
        <div className="card p-4">In Git History: 1</div>
        <div className="card p-4">In Config Files: 1</div>
        <div className="card p-4">Resolved: 12</div>
      </div>
      <div className="card p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#64748b]"><th className="p-2">Type</th><th>Preview</th><th>File</th><th>Line</th><th>Commit</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr className="border-t border-[#1e2d4a]"><td className="p-2">GitHub Token</td><td>ghp_****xyz</td><td>src/config.js</td><td>12</td><td>a3f8d92</td><td><SeverityBadge severity="CRITICAL" /></td><td>Active</td><td><button className="text-blue-400 mr-2">Rotate</button><button className="text-[#64748b]">Mark Safe</button></td></tr>
            <tr className="border-t border-[#1e2d4a]"><td className="p-2">DB Password</td><td>pass****word</td><td>.env.backup</td><td>3</td><td>b2e7c81</td><td><SeverityBadge severity="CRITICAL" /></td><td>Active</td><td><button className="text-blue-400 mr-2">Rotate</button><button className="text-[#64748b]">Mark Safe</button></td></tr>
            <tr className="border-t border-[#1e2d4a]"><td className="p-2">AWS Access Key</td><td>AKIA****MPLE</td><td>deploy.sh</td><td>45</td><td>c1d6b70</td><td><SeverityBadge severity="HIGH" /></td><td>Active</td><td><button className="text-blue-400 mr-2">Rotate</button><button className="text-[#64748b]">Mark Safe</button></td></tr>
          </tbody>
        </table>
      </div>
      <div className="card p-4">
        <h3 className="font-bold mb-2">Secret Context & Remediation</h3>
        <pre className="bg-[#0a0e1a] border border-[#1e2d4a] rounded-lg p-3 text-xs overflow-auto">{`Line 10: const config = {
Line 11:   database: {
Line 12:     password: "SuperSecret123!" ← EXPOSED HERE
Line 13:   }
Line 14: }`}</pre>
        <ol className="list-decimal pl-5 mt-3 text-sm text-[#94a3b8] space-y-1">
          <li>Rotate this credential immediately</li>
          <li>Remove from source code</li>
          <li>Add to .gitignore</li>
          <li>Use environment variables or secrets manager</li>
        </ol>
        <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs">
          <pre className="bg-[#111827] border border-[#1e2d4a] rounded p-2">{`// Bad
const dbPassword = "SuperSecret123!";`}</pre>
          <pre className="bg-[#111827] border border-[#1e2d4a] rounded p-2">{`// Good
const dbPassword = process.env.DB_PASSWORD;`}</pre>
        </div>
      </div>
      <div className="card p-4">
        <h3 className="font-bold mb-3">Git History Timeline</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="w-3 h-3 rounded-full bg-red-500" /> a3f8d92
          <span className="w-3 h-3 rounded-full bg-red-500" /> b2e7c81
          <span className="w-3 h-3 rounded-full bg-orange-500" /> c1d6b70
          <span className="w-3 h-3 rounded-full bg-yellow-500" /> d0c5a69
        </div>
      </div>
    </div>
  );
}

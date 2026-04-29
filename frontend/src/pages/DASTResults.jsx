import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import SeverityBadge from "../components/SeverityBadge";

const vulns = [
  { risk: "HIGH", alert: "Cross Site Scripting (XSS)", url: "/search?q=<script>", method: "GET", param: "q", description: "XSS allows attackers to inject malicious scripts", solution: "Validate and encode all user inputs", cwe: "CWE-79" },
  { risk: "HIGH", alert: "SQL Injection", url: "/api/users?id=1", method: "GET", param: "id", description: "SQL injection can expose entire database", solution: "Use parameterized queries", cwe: "CWE-89" },
  { risk: "MEDIUM", alert: "Missing Security Headers", url: "All pages", method: "-", param: "Header", description: "Missing Content-Security-Policy header", solution: "Add security headers via helmet.js", cwe: "CWE-693" },
  { risk: "MEDIUM", alert: "Insecure Cookie", url: "/api/login", method: "POST", param: "session", description: "Session cookie missing HttpOnly flag", solution: "Set HttpOnly and Secure flags on cookies", cwe: "CWE-614" },
  { risk: "MEDIUM", alert: "CSRF Token Missing", url: "/api/transfer", method: "POST", param: "form", description: "No CSRF protection on state-changing endpoint", solution: "Implement CSRF tokens", cwe: "CWE-352" },
  { risk: "LOW", alert: "Directory Browsing Enabled", url: "/uploads/", method: "GET", param: "-", description: "Directory listing exposes file structure", solution: "Disable directory browsing in server config", cwe: "CWE-548" },
  { risk: "LOW", alert: "Server Version Disclosed", url: "All pages", method: "GET", param: "Server Header", description: "Server header reveals version information", solution: "Remove or obscure server version header", cwe: "CWE-200" },
];

export default function DASTResults() {
  return (
    <div className="space-y-6">
      <PageHeader title="DAST Scan Results" subtitle="Dynamic Application Security Testing" actions={<button onClick={() => toast("DAST coming soon")} className="primary-btn">Run DAST Scan</button>} />
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4">URLs Crawled: 47</div>
        <div className="card p-4">Forms Tested: 12</div>
        <div className="card p-4">Requests Made: 1,247</div>
        <div className="card p-4">Duration: 4m 32s</div>
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#64748b]"><th className="p-3">Risk</th><th>Alert</th><th>URL</th><th>Method</th><th>Param</th><th>Description</th><th>Fix</th><th>CWE</th></tr></thead>
          <tbody>{vulns.map((v, i) => <tr key={i} className="border-t border-[#1e2d4a]"><td className="p-3"><SeverityBadge severity={v.risk} /></td><td>{v.alert}</td><td>{v.url}</td><td>{v.method}</td><td>{v.param}</td><td>{v.description}</td><td>{v.solution}</td><td>{v.cwe}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

import PageHeader from "../components/PageHeader";

export default function CloudDeployment() {
  const findings = [
    ["AWS", "S3", "prod-data-bucket", "us-east-1", "Public access enabled", "CRITICAL", "Open"],
    ["AWS", "IAM", "AdminRole", "Global", "Overly permissive policy", "HIGH", "Open"],
    ["AWS", "EC2", "i-0abc123", "us-east-1", "Security group too open", "MEDIUM", "Open"],
    ["GCP", "Storage", "backup-bucket", "us-central1", "Uniform access disabled", "LOW", "Open"],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Cloud Security Posture" subtitle="Monitor and secure your cloud infrastructure" />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">AWS: 3 issues | Connected</div>
        <div className="card p-4">GCP: 1 issue | Connected</div>
        <div className="card p-4">Azure: Not connected</div>
      </div>
      <div className="card p-5 overflow-auto">
        <h3 className="font-bold mb-3">Findings</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#64748b]"><th>Provider</th><th>Service</th><th>Resource</th><th>Region</th><th>Issue</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>{findings.map((f) => <tr key={`${f[0]}-${f[2]}`} className="border-t border-[#1e2d4a]"><td>{f[0]}</td><td>{f[1]}</td><td>{f[2]}</td><td>{f[3]}</td><td>{f[4]}</td><td>{f[5]}</td><td>{f[6]}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

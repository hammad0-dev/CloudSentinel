import PageHeader from "../components/PageHeader";
import SeverityBadge from "../components/SeverityBadge";

export default function IaCSecurity() {
  const rows = [
    ["CRITICAL", "main.tf", 23, "aws_s3_bucket", "S3 bucket has public read access enabled"],
    ["HIGH", "main.tf", 45, "aws_security_group", "Inbound rule allows 0.0.0.0/0 on all ports"],
    ["HIGH", "Dockerfile", 12, "RUN command", "Container running as root user"],
    ["MEDIUM", "k8s-deploy.yml", 34, "Deployment", "No CPU/memory resource limits set"],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="IaC Security Scanner" subtitle="Terraform · Docker · Kubernetes · CloudFormation" />
      <div className="card p-4">
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <div className="card p-3">Files Scanned: 12</div><div className="card p-3">Misconfigs: 6</div><div className="card p-3">Passed: 47</div><div className="card p-3">Pass Rate: 89%</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#64748b]"><th>Severity</th><th>File</th><th>Line</th><th>Resource</th><th>Issue</th><th>Action</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={`${r[1]}-${r[2]}`} className="border-t border-[#1e2d4a]"><td><SeverityBadge severity={r[0]} /></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td><button className="text-blue-400">Fix Guide</button></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

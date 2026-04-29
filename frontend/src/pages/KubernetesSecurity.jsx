import PageHeader from "../components/PageHeader";
import SeverityBadge from "../components/SeverityBadge";

export default function KubernetesSecurity() {
  const issues = [
    ["CRITICAL", "production", "api-server", "Pod", "Container runs as root", "Add runAsNonRoot: true"],
    ["HIGH", "production", "web-app", "Deployment", "Privileged container", "Set privileged: false"],
    ["HIGH", "default", "data-processor", "Pod", "No resource limits", "Add CPU/memory limits"],
    ["MEDIUM", "default", "cache", "Deployment", "Latest image tag used", "Pin specific image version"],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Kubernetes Security" subtitle="Cluster security posture and compliance" />
      <div className="card p-4 space-y-2">
        <p>Namespaces: 4 | Pods Running: 18 | Issues: 7 | Compliance: 71%</p>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#64748b]"><th>Severity</th><th>Namespace</th><th>Resource</th><th>Kind</th><th>Issue</th><th>Recommendation</th></tr></thead>
            <tbody>{issues.map((i) => <tr key={`${i[1]}-${i[2]}`} className="border-t border-[#1e2d4a]"><td><SeverityBadge severity={i[0]} /></td><td>{i[1]}</td><td>{i[2]}</td><td>{i[3]}</td><td>{i[4]}</td><td>{i[5]}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";

export default function CICDPipeline() {
  const [tab, setTab] = useState("GitHub Actions");
  const stages = [
    ["Commit", "Pass", "0m 01s"],
    ["Build", "Pass", "2m 14s"],
    ["Unit Tests", "Pass", "1m 47s"],
    ["SAST Scan", "Warn", "3m 22s"],
    ["Dependency Check", "Pass", "0m 45s"],
    ["DAST Scan", "Running", "..."],
    ["Deploy", "Pending", "-"],
  ];
  const runs = [
    ["#47", "main", "a3f8d92", "John", "Running", "-", "Running"],
    ["#46", "main", "b2e7c81", "John", "8m 12s", "2", "Warned"],
    ["#45", "feature/auth", "c1d6b70", "Sarah", "6m 45s", "0", "Passed"],
    ["#44", "main", "d0c5a69", "Mike", "5m 33s", "5", "Blocked"],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="CI/CD Pipeline" subtitle="Pipeline #47 | Branch: main | Status: In Progress" />
      <div className="card p-6 overflow-auto">
        <div className="flex gap-3 min-w-max">
          {stages.map(([name, status, duration], i) => <div key={name} className="w-32 h-24 rounded-lg border border-[#1e2d4a] bg-[#111827] grid place-items-center text-sm text-center"><div>{name}</div><div className="text-xs text-[#64748b]">{status}</div><div className="text-xs text-[#64748b]">{duration}</div>{i < stages.length - 1 ? "→" : ""}</div>)}
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-bold mb-3">SAST Scan Details</h3>
        <pre className="bg-[#0a0e1a] border border-[#1e2d4a] rounded-lg p-3 text-xs overflow-auto">[INFO] Scanning 47 files...
[WARN] SQL Injection found: src/routes/users.js:45
[WARN] Hardcoded password: src/config.js:12
[INFO] Scan complete. 2 warnings found.</pre>
      </div>
      <div className="card p-5 overflow-auto">
        <h3 className="font-bold mb-3">Recent Runs</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#64748b]"><th>Run#</th><th>Branch</th><th>Commit</th><th>Author</th><th>Duration</th><th>Issues</th><th>Status</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r[0]} className="border-t border-[#1e2d4a]"><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td>{r[6]}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="card p-5">
        <h3 className="font-bold mb-3">Security Gates Configuration</h3>
        <p>Block deployment if: Critical vulnerabilities &gt; 0</p>
        <p>Warn if: High vulnerabilities &gt; 5</p>
        <p>Allow if: Security score &gt; 70</p>
        <p className="text-yellow-300 mt-2">Current status: Warning - 2 high issues found</p>
      </div>
      <div className="card p-5">
        <div className="flex gap-2 mb-3">
          {["GitHub Actions", "GitLab CI", "Jenkins"].map((t) => <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg border ${tab === t ? "bg-blue-600 border-blue-500" : "border-[#1e2d4a]"}`}>{t}</button>)}
        </div>
        <div className="relative">
          <button className="absolute right-2 top-2 text-xs border border-[#1e2d4a] rounded px-2 py-1" onClick={() => { navigator.clipboard.writeText(`name: CloudSentinel Security Scan\non: [push]`); toast.success("Copied"); }}>Copy</button>
          <pre className="bg-[#0a0e1a] border border-[#1e2d4a] rounded-lg p-3 text-xs overflow-auto">{`name: CloudSentinel Security Scan
on: [push]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: SAST Scan
        run: |
          sonar-scanner \\
            -Dsonar.projectKey=$PROJECT_KEY \\
            -Dsonar.host.url=$SONAR_URL \\
            -Dsonar.token=$SONAR_TOKEN`}</pre>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import PageHeader from "../components/PageHeader";
import SeverityBadge from "../components/SeverityBadge";

const rows = [
  ["lodash", "4.17.11", "4.17.21", "CVE-2021-23337", "HIGH", "7.2"],
  ["express", "4.17.1", "4.18.2", "CVE-2022-24999", "MEDIUM", "5.3"],
  ["jsonwebtoken", "8.5.1", "9.0.0", "CVE-2022-23529", "HIGH", "8.1"],
  ["axios", "0.21.1", "0.21.4", "CVE-2021-3749", "MEDIUM", "6.5"],
  ["minimist", "1.2.5", "1.2.6", "CVE-2021-44906", "CRITICAL", "9.8"],
  ["node-fetch", "2.6.1", "2.6.7", "CVE-2022-0235", "HIGH", "8.8"],
  ["qs", "6.5.2", "6.5.3", "CVE-2022-24999", "HIGH", "7.5"],
  ["debug", "2.6.8", "2.6.9", "CVE-2017-16137", "LOW", "3.7"],
];

export default function Dependencies() {
  const [tab, setTab] = useState("Vulnerabilities");
  const licenses = [
    { name: "MIT", value: 98, color: "#10b981" },
    { name: "Apache 2.0", value: 31, color: "#22c55e" },
    { name: "BSD-3", value: 8, color: "#34d399" },
    { name: "GPL-3.0", value: 2, color: "#ef4444" },
    { name: "ISC", value: 3, color: "#4ade80" },
    { name: "Unknown", value: 3, color: "#f59e0b" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Dependencies & SBOM" subtitle="Software Bill of Materials" actions={<><button className="primary-btn">Export SBOM JSON</button><button className="primary-btn">Scan Now</button></>} />
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4">Total: 142</div>
        <div className="card p-4">Vulnerable: 8</div>
        <div className="card p-4">Outdated: 23</div>
        <div className="card p-4">License Types: 6</div>
      </div>
      <div className="flex gap-2">
        {["Vulnerabilities", "All Packages", "Licenses", "Tree View"].map((t) => <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg border ${tab === t ? "bg-blue-600 border-blue-500" : "border-[#1e2d4a]"}`}>{t}</button>)}
      </div>
      {tab === "Vulnerabilities" ? (
        <div className="card p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#64748b]"><th className="p-2">Package</th><th>Current</th><th>Safe</th><th>CVE</th><th>Severity</th><th>CVSS</th><th>Fix</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-[#1e2d4a]"><td className="p-2">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><SeverityBadge severity={r[4]} /></td><td>{r[5]}</td><td><button className="text-blue-400">Update</button></td></tr>)}</tbody>
          </table>
        </div>
      ) : null}
      {tab === "All Packages" ? <div className="card p-4"><input className="input w-full md:w-80 mb-3" placeholder="Search packages..." /><p className="text-sm text-[#64748b]">Showing all 142 packages</p></div> : null}
      {tab === "Licenses" ? (
        <div className="card p-4 grid md:grid-cols-2 gap-4">
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={licenses} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>{licenses.map((l) => <Cell key={l.name} fill={l.color} />)}</Pie></PieChart></ResponsiveContainer></div>
          <div className="space-y-2">{licenses.map((l) => <p key={l.name}>{l.name}: {l.value}</p>)}<div className="p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 text-yellow-200 text-sm">2 GPL packages may require code disclosure</div></div>
        </div>
      ) : null}
      {tab === "Tree View" ? <pre className="card p-4 text-sm overflow-auto">{`myapp@1.0.0
├── express@4.18.2
│   ├── body-parser@1.20.1
│   ├── cors@2.8.5
│   └── compression@1.7.4
├── mongoose@7.0.0
└── jsonwebtoken@9.0.0`}</pre> : null}
    </div>
  );
}

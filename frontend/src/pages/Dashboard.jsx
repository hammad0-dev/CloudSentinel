import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import PageHeader from "../components/PageHeader";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { readLocalProjects, writeLocalProjects } from "../lib/projectStorage";

const trend = [
  { day: "Mon", critical: 5, high: 8, medium: 15 },
  { day: "Tue", critical: 4, high: 9, medium: 13 },
  { day: "Wed", critical: 6, high: 7, medium: 14 },
  { day: "Thu", critical: 3, high: 8, medium: 12 },
  { day: "Fri", critical: 4, high: 6, medium: 11 },
  { day: "Sat", critical: 2, high: 7, medium: 10 },
  { day: "Sun", critical: 3, high: 7, medium: 12 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api
      .get("/projects")
      .then((r) => {
        const list = r.data.projects || [];
        setProjects(list);
        writeLocalProjects(list);
      })
      .catch(() => setProjects(readLocalProjects()));
  }, []);
  const avgScore = useMemo(() => (projects.length ? Math.round(projects.reduce((a, p) => a + (p.security_score || 0), 0) / projects.length) : 74), [projects]);
  const vulnTypes = [
    { name: "SQL Injection", value: 8 },
    { name: "XSS", value: 6 },
    { name: "Hardcoded Secrets", value: 4 },
    { name: "Broken Auth", value: 3 },
    { name: "CSRF", value: 2 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Good evening, ${user?.fullName || "Developer"} 👋`} subtitle="Here is your security overview" actions={<Link className="primary-btn" to="/projects">+ Run New Scan</Link>} />
      <div className="card p-6 bg-gradient-to-r from-[#0f1629] to-[#0a1628]">
        <p className="text-sm text-[#64748b]">Security Score</p>
        <h2 className="text-5xl font-bold mt-2">{avgScore}/100</h2>
        <p className="text-[#64748b] mt-2">Fix 3 critical issues to reach A grade</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-red-600"><p className="text-sm text-[#64748b]">Critical Issues</p><p className="text-3xl font-bold">3</p><p className="text-xs text-red-400">+2 from last week</p></div>
        <div className="card p-4 border-l-4 border-l-orange-500"><p className="text-sm text-[#64748b]">High Issues</p><p className="text-3xl font-bold">7</p><p className="text-xs text-emerald-400">-3 from last week</p></div>
        <div className="card p-4 border-l-4 border-l-yellow-500"><p className="text-sm text-[#64748b]">Medium Issues</p><p className="text-3xl font-bold">12</p><p className="text-xs text-[#64748b]">No change</p></div>
        <div className="card p-4 border-l-4 border-l-emerald-500"><p className="text-sm text-[#64748b]">Projects Secured</p><p className="text-3xl font-bold">{projects.length}</p><p className="text-xs text-emerald-400">From registered projects</p></div>
      </div>
      <div className="card p-6 h-80">
        <h3 className="font-bold mb-4">Vulnerability Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <CartesianGrid stroke="#1e2d4a" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Line type="monotone" dataKey="critical" stroke="#dc2626" />
            <Line type="monotone" dataKey="high" stroke="#f59e0b" />
            <Line type="monotone" dataKey="medium" stroke="#eab308" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 h-80">
          <h3 className="font-bold mb-4">Top Vulnerabilities by Type</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={vulnTypes} layout="vertical">
              <XAxis type="number" stroke="#64748b" />
              <YAxis type="category" dataKey="name" stroke="#64748b" width={120} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-bold mb-4">Compliance Overview</h3>
          {[
            ["OWASP Top 10", 70, "bg-yellow-500"],
            ["ISO 27001", 85, "bg-emerald-500"],
            ["SOC 2", 65, "bg-yellow-500"],
            ["GDPR", 90, "bg-emerald-500"],
            ["PCI DSS", 55, "bg-red-500"],
          ].map(([name, val, c]) => (
            <div key={name} className="mb-3">
              <div className="flex justify-between text-sm"><span>{name}</span><span>{val}%</span></div>
              <div className="h-2 bg-slate-700/50 rounded mt-1"><div className={`h-2 rounded ${c} progress-anim`} style={{ width: `${val}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="grid gap-2">
            <Link className="primary-btn text-center" to="/projects">Run SAST Scan</Link>
            <Link className="primary-btn text-center" to="/projects">Run DAST Scan</Link>
            <Link className="primary-btn text-center" to="/compliance">View Report</Link>
            <Link className="primary-btn text-center" to="/projects">Add Project</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { readLocalProjects, writeLocalProjects } from "../lib/projectStorage";

const trend = [
  { day: "Mon", critical: 0, high: 0, medium: 0 },
  { day: "Tue", critical: 0, high: 0, medium: 0 },
  { day: "Wed", critical: 0, high: 0, medium: 0 },
  { day: "Thu", critical: 0, high: 0, medium: 0 },
  { day: "Fri", critical: 0, high: 0, medium: 0 },
  { day: "Sat", critical: 0, high: 0, medium: 0 },
  { day: "Sun", critical: 0, high: 0, medium: 0 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [now, setNow] = useState(new Date());

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

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const totalScans = useMemo(
    () => projects.reduce((acc, p) => acc + (Number(p.latestScan?.id ? 1 : 0) || 0), 0),
    [projects]
  );
  const criticalCount = useMemo(
    () => projects.reduce((acc, p) => acc + (Number(p.latestScan?.critical) || 0), 0),
    [projects]
  );
  const highCount = useMemo(
    () => projects.reduce((acc, p) => acc + (Number(p.latestScan?.high) || 0), 0),
    [projects]
  );
  const mediumCount = useMemo(
    () => projects.reduce((acc, p) => acc + (Number(p.latestScan?.medium) || 0), 0),
    [projects]
  );

  const lowCount = useMemo(
    () => projects.reduce((acc, p) => acc + (Number(p.latestScan?.low) || 0), 0),
    [projects]
  );
  const totalFindings = useMemo(
    () => criticalCount + highCount + mediumCount + lowCount,
    [criticalCount, highCount, mediumCount, lowCount]
  );
  const findingsColor =
    criticalCount > 0 ? "var(--accent-red)" : highCount > 0 ? "var(--accent-yellow)" : "var(--accent-green)";
  const statusMessage =
    criticalCount > 0
      ? "Critical findings require immediate remediation"
      : highCount > 0
        ? "High severity findings need focused hardening"
        : "No critical or high findings in latest scans";
  const gaugeData = [{ name: "findings", value: totalFindings, fill: findingsColor }];
  const progressWidth = `${Math.min(100, Math.max(4, totalFindings))}%`;
  const vulnTypes = useMemo(
    () => [
      { name: "Critical", value: criticalCount },
      { name: "High", value: highCount },
      { name: "Medium", value: mediumCount },
      { name: "Low", value: lowCount },
    ],
    [criticalCount, highCount, mediumCount, lowCount]
  );
  const trendData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const seed = trend.map((d) => ({ ...d }));
    const byDay = Object.fromEntries(seed.map((d) => [d.day, d]));
    projects.forEach((p) => {
      const t = p.latestScan?.completed_at || p.latestScan?.started_at;
      if (!t) return;
      const day = dayNames[new Date(t).getDay()];
      if (!byDay[day]) return;
      byDay[day].critical += Number(p.latestScan?.critical || 0);
      byDay[day].high += Number(p.latestScan?.high || 0);
      byDay[day].medium += Number(p.latestScan?.medium || 0);
    });
    return seed;
  }, [projects]);
  const activity = [
    { color: "var(--accent-red)", msg: "Critical issue found in API gateway", time: "2m ago" },
    { color: "var(--accent-green)", msg: "2 vulnerabilities fixed in team-project", time: "18m ago" },
    { color: "var(--accent-yellow)", msg: "Compliance drift detected in IaC scan", time: "1h ago" },
    { color: "var(--accent-purple)", msg: "New repository linked for monitoring", time: "3h ago" },
    { color: "var(--accent-blue)", msg: "SAST scan completed for maven_project_for_devops", time: "5h ago" },
  ];

  const projectRows = projects.slice(0, 6).map((p) => {
    const critical = Number(p.latestScan?.critical || 0);
    const high = Number(p.latestScan?.high || 0);
    const state = critical > 0 ? "Critical" : high > 0 ? "At Risk" : "Secure";
    const stateClass =
      state === "Secure"
        ? "border-[var(--accent-green)] text-[var(--accent-green)]"
        : state === "At Risk"
          ? "border-[var(--accent-yellow)] text-[var(--accent-yellow)]"
          : "border-[var(--accent-red)] text-[var(--accent-red)]";
    return {
      id: p.id,
      name: p.name,
      language: p.language || "Unknown",
      critical,
      high,
      lastScan: p.latestScan?.completed_at ? new Date(p.latestScan.completed_at).toLocaleString() : "Never",
      state,
      stateClass,
    };
  });

  const radialTrend = [
    { label: "Critical", count: criticalCount, color: "var(--accent-red)", delta: "+1.2%" },
    { label: "High", count: highCount, color: "var(--accent-yellow)", delta: "-2.5%" },
    { label: "Medium", count: mediumCount, color: "var(--accent-blue)", delta: "-0.4%" },
    { label: "Projects", count: projects.length, color: "var(--accent-green)", delta: "+3.1%" },
  ];

  const quickActions = [
    { label: "Run SAST", to: "/projects", icon: ShieldAlert },
    { label: "Compliance", to: "/compliance", icon: ShieldCheck },
    { label: "Dependencies", to: "/dependencies", icon: Wrench },
    { label: "Monitoring", to: "/monitoring", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Overview"
        subtitle={`Last updated: ${now.toLocaleString()}`}
        actions={
          <Link className="primary-btn inline-flex items-center gap-2 text-sm" to="/projects">
            <Plus size={14} />
            New Scan
          </Link>
        }
      />

      <div className="card p-5">
        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-5 items-center">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={gaugeData}
                innerRadius="68%"
                outerRadius="100%"
                barSize={16}
                startAngle={210}
                endAngle={-30}
              >
                <RadialBar dataKey="value" cornerRadius={8} />
                <text x="50%" y="46%" textAnchor="middle" fill="var(--text-primary)" style={{ fontSize: "32px", fontWeight: 700 }}>
                  {totalFindings}
                </text>
                <text x="50%" y="58%" textAnchor="middle" fill="var(--text-secondary)" style={{ fontSize: "12px" }}>
                  findings
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-[42px] font-semibold leading-none">{totalFindings}</p>
            <p className="text-[var(--text-secondary)] mt-1">{statusMessage}</p>
            <div className="mt-4 h-2 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="h-full progress-anim" style={{ width: progressWidth, background: findingsColor }} />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">{user?.fullName || "Developer"} • open finding trend snapshot</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]"><Clock3 size={15} /> Last Scan</div>
              <span className="text-[var(--text-primary)]">{projects[0]?.latestScan?.completed_at ? new Date(projects[0].latestScan.completed_at).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]"><BarChart3 size={15} /> Total Scans</div>
              <span className="text-[var(--text-primary)]">{totalScans}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]"><CheckCircle2 size={15} /> Fixed This Week</div>
              <span className="text-[var(--text-primary)]">{Math.max(1, Math.round(totalScans * 0.4))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {radialTrend.map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs text-[var(--text-secondary)] inline-flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: item.color }} />
              {item.label}
            </p>
            <p className="text-3xl font-semibold mt-2">{item.count}</p>
            <p className="text-xs mt-2" style={{ color: item.color }}>{item.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[3fr_2fr] gap-4">
        <div className="card p-4 h-80">
          <h3 className="font-semibold mb-3">Vulnerability Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-yellow)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent-yellow)" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-subtle)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }} />
              <Area type="monotone" dataKey="critical" stroke="var(--accent-red)" fill="url(#gCritical)" />
              <Area type="monotone" dataKey="high" stroke="var(--accent-yellow)" fill="url(#gHigh)" />
              <Area type="monotone" dataKey="medium" stroke="var(--accent-blue)" fill="url(#gMedium)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 h-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Activity</h3>
            <Link to="/monitoring" className="text-xs text-[var(--accent-blue)] hover:underline">View all</Link>
          </div>
          <div className="max-h-[250px] overflow-auto pr-1">
            {projects.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] py-4">No project activity yet.</p>
            ) : (
              projects.slice(0, 8).map((p) => {
                const sev = Number(p.latestScan?.critical || 0) > 0 ? "var(--accent-red)" : Number(p.latestScan?.high || 0) > 0 ? "var(--accent-yellow)" : "var(--accent-green)";
                const when = p.latestScan?.completed_at ? new Date(p.latestScan.completed_at).toLocaleString() : "Not scanned";
                return (
                  <div key={`act-${p.id}`} className="flex gap-3 py-2 border-b border-[var(--border-subtle)] last:border-b-0">
                    <span className="w-2 h-2 rounded-full mt-1.5" style={{ background: sev }} />
                    <div className="flex-1">
                      <p className="text-sm">{p.name || "Project"} latest scan: C:{Number(p.latestScan?.critical || 0)} H:{Number(p.latestScan?.high || 0)} M:{Number(p.latestScan?.medium || 0)}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{when}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="gh-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Language</th>
              <th>Critical</th>
              <th>High</th>
              <th>Last Scan</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projectRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-[var(--text-secondary)] py-8">
                  No projects yet. Add your first project to start scanning.
                </td>
              </tr>
            ) : (
              projectRows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td className="text-[var(--text-secondary)]">{r.language}</td>
                  <td>{r.critical}</td>
                  <td>{r.high}</td>
                  <td className="text-[var(--text-secondary)]">{r.lastScan}</td>
                  <td><span className={`pill-badge ${r.stateClass}`}>{r.state}</span></td>
                  <td>
                    <Link to={`/projects/${r.id}`} className="secondary-btn py-1 px-2 text-xs">Scan</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-3 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">Page 1 of 1</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 h-80">
          <h3 className="font-semibold mb-4">Top Vulnerabilities</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={vulnTypes} layout="vertical">
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={120} />
              <Tooltip contentStyle={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }} />
              <Bar dataKey="value" fill="var(--accent-blue)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5 h-80">
          <h3 className="font-semibold mb-4">Compliance</h3>
          {[
            ["OWASP Top 10", 70, "var(--accent-yellow)"],
            ["ISO 27001", 85, "var(--accent-green)"],
            ["SOC 2", 65, "var(--accent-yellow)"],
            ["GDPR", 90, "var(--accent-green)"],
            ["PCI DSS", 55, "var(--accent-red)"],
          ].map(([name, val, c]) => (
            <div key={name} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="text-[var(--text-secondary)]">{val}%</span>
              </div>
              <div className="h-2 bg-[var(--bg-tertiary)] rounded mt-1 border border-[var(--border-subtle)]">
                <div className="h-full rounded progress-anim" style={{ width: `${val}%`, background: c }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card p-5 h-80">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((a) => (
              <Link key={a.label} className="secondary-btn text-center h-16 inline-flex flex-col items-center justify-center gap-1 text-xs" to={a.to}>
                <a.icon size={16} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

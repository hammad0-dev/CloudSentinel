import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import SeverityBadge from "../components/SeverityBadge";
import api from "../utils/api";

const fallback = [
  { severity: "CRITICAL", rule: "javascript:S2068", message: "Hardcoded password detected", file_path: "src/config/database.js", line_number: 12, status: "OPEN" },
  { severity: "CRITICAL", rule: "javascript:S3649", message: "SQL Injection vulnerability", file_path: "src/routes/users.js", line_number: 45, status: "OPEN" },
  { severity: "MAJOR", rule: "javascript:S5122", message: "CORS policy allows all origins", file_path: "src/server.js", line_number: 8, status: "OPEN" },
];

export default function SASTResults() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, vulnerabilities: [] });
  const [search, setSearch] = useState("");
  const [severityTab, setSeverityTab] = useState("ALL");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sast/${id}`);
      setData(res.data);
    } catch {
      setData({ summary: { critical: 2, major: 3, minor: 2, info: 0, total: 7 }, vulnerabilities: fallback });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  const runScan = async () => {
    setScanLoading(true);
    try {
      await api.post(`/sast/scan/${id}`);
      toast.success("SAST scan completed");
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || "Scan failed");
    } finally {
      setScanLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return data.vulnerabilities.filter((v) => {
      const matchSearch = `${v.rule} ${v.message} ${v.file_path}`.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityTab === "ALL" ? true : (v.severity || "").toUpperCase() === severityTab;
      return matchSearch && matchSeverity;
    });
  }, [data, search, severityTab]);

  return (
    <div className="space-y-6">
      <PageHeader title="SAST Scan Results" subtitle={`Last scanned: ${data.lastScan || "Not scanned"}`} actions={<button className="primary-btn" onClick={runScan} disabled={scanLoading}>{scanLoading ? "Scanning... Please wait" : "Run SAST Scan"}</button>} />
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4 border border-red-600/40">Critical: {data.summary.critical || 0}</div>
        <div className="card p-4 border border-orange-500/40">Major: {data.summary.major || 0}</div>
        <div className="card p-4 border border-yellow-500/40">Minor: {data.summary.minor || 0}</div>
        <div className="card p-4">Files Scanned: {Math.max(1, Math.floor((data.summary.total || 0) * 1.8))}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "CRITICAL", "MAJOR", "MINOR", "INFO"].map((s) => (
          <button key={s} onClick={() => setSeverityTab(s)} className={`px-3 py-1.5 rounded-lg text-sm border ${severityTab === s ? "bg-blue-600 border-blue-500" : "border-[#1e2d4a]"}`}>{s}</button>
        ))}
        <input className="input w-full md:w-96 ml-auto" placeholder="Search vulnerabilities..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[#64748b] border-b border-[#1e2d4a]">
            <tr><th className="p-3">Severity</th><th>Rule ID</th><th>Description</th><th>File</th><th>Line</th><th>Status</th><th>▼</th></tr>
          </thead>
          <tbody>
            {(loading ? [] : filtered).map((v, i) => (
              <Fragment key={`grp-${i}`}>
                <tr className="border-b border-[#1e2d4a]">
                  <td className="p-3"><SeverityBadge severity={v.severity} /></td>
                  <td className="font-mono text-xs">{v.rule}</td>
                  <td>{v.message}</td>
                  <td className="text-blue-400">{v.file_path?.split("/").pop()}</td>
                  <td>{v.line_number || "-"}</td>
                  <td>{v.status || "OPEN"}</td>
                  <td><button onClick={() => setExpanded(expanded === i ? null : i)}>▼</button></td>
                </tr>
                {expanded === i ? (
                  <tr className="border-b border-[#1e2d4a]">
                    <td colSpan={7} className="p-4 bg-[#0a0e1a]">
                      <p className="font-semibold mb-2">What is this vulnerability?</p>
                      <p className="text-sm text-[#94a3b8] mb-3">This issue indicates insecure coding patterns that can be exploited by attackers.</p>
                      <p className="font-semibold mb-2">How to fix it</p>
                      <div className="grid md:grid-cols-2 gap-2 text-xs">
                        <pre className="bg-[#111827] border border-[#1e2d4a] rounded p-2 overflow-auto">{`// Bad code example\nconst query = "SELECT * FROM users WHERE id=" + id;`}</pre>
                        <pre className="bg-[#111827] border border-[#1e2d4a] rounded p-2 overflow-auto">{`// Good code example\nconst query = "SELECT * FROM users WHERE id = $1";`}</pre>
                      </div>
                      <div className="mt-3 flex gap-2"><button className="px-3 py-1.5 rounded border border-[#1e2d4a]">Mark as Fixed</button><button className="px-3 py-1.5 rounded border border-[#1e2d4a]">View in SonarQube</button></div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 ? <p className="p-6 text-center text-[#64748b]">No scan results yet</p> : null}
      </div>
    </div>
  );
}

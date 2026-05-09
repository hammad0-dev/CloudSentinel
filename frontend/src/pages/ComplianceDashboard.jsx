import { useEffect, useMemo, useState } from "react";
import { Download, FileCode2, ShieldCheck } from "lucide-react";
import PageHeader from "../components/PageHeader";
import api from "../lib/api";

export default function ComplianceDashboard() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    api
      .get("/projects")
      .then((r) => {
        const list = r.data.projects || [];
        setProjects(list);
        if (list.length) setSelected(String(list[0].id));
      })
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api
      .get(`/sast/compliance/${selected}`)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selected]);

  const frameworks = useMemo(() => {
    if (!data) return [];
    const owaspFailed = data.owasp.length;
    const owaspPass = Math.max(0, 10 - owaspFailed);
    const owaspPct = Math.round((owaspPass / 10) * 100);
    const cisFailed = data.cis.length;
    const cisTotal = 18;
    const cisPass = Math.max(0, cisTotal - cisFailed);
    const cisPct = Math.round((cisPass / cisTotal) * 100);
    return [
      ["OWASP Top 10", owaspPct, `${owaspPass}/10 passed`, owaspPct >= 80 ? "Compliant" : "Partial"],
      ["CIS Controls", cisPct, `${cisPass}/${cisTotal} passed`, cisPct >= 80 ? "Compliant" : "Partial"],
    ];
  }, [data]);

  const buildHtmlReport = (report) => {
    const owaspRows = (report.compliance?.owasp || [])
      .map(
        (x) => `<tr><td>${x.id}</td><td>${x.name}</td><td>${x.findings}</td><td>${x.critical}</td><td>${x.high}</td><td>${x.medium}</td><td>${x.low}</td></tr>`
      )
      .join("");
    const cisRows = (report.compliance?.cis || [])
      .map(
        (x) => `<tr><td>${x.id}</td><td>${x.name}</td><td>${x.findings}</td><td>${x.critical}</td><td>${x.high}</td><td>${x.medium}</td><td>${x.low}</td></tr>`
      )
      .join("");
    return `<!doctype html><html><head><meta charset="utf-8" /><title>CloudSentinel Security Report</title><style>
      body { font-family: Inter, system-ui, sans-serif; background:#0f1412; color:#e7efe9; margin:24px; }
      h1,h2 { margin:0 0 8px; } .muted { color:#a9b4ad; }
      .card { background:#1a211e; border:1px solid #2f3934; border-radius:8px; padding:14px; margin:14px 0; }
      .grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:10px; }
      .kpi { background:#232b27; border:1px solid #3a4740; border-radius:8px; padding:10px; }
      table { width:100%; border-collapse: collapse; font-size:13px; } th, td { border:1px solid #2f3934; padding:8px; text-align:left; } th { background:#232b27; }
    </style></head><body>
      <h1>CloudSentinel Security Report</h1>
      <p class="muted">Generated at: ${new Date(report.generatedAt).toLocaleString()}</p>
      <div class="card"><h2>Project</h2>
        <p><strong>Name:</strong> ${report.project?.name || "-"}</p>
        <p><strong>Repository:</strong> ${report.project?.repo_url || "-"}</p>
        <p><strong>Language:</strong> ${report.project?.language || "Unknown"}</p>
      </div>
      <div class="card"><h2>Key Metrics</h2><div class="grid">
        <div class="kpi"><div class="muted">Issues</div><div>${report.totals?.issues ?? 0}</div></div>
        <div class="kpi"><div class="muted">Critical</div><div>${report.totals?.critical ?? 0}</div></div>
        <div class="kpi"><div class="muted">High</div><div>${report.totals?.high ?? 0}</div></div>
        <div class="kpi"><div class="muted">Medium/Low</div><div>${report.totals?.medium ?? 0}</div></div>
      </div></div>
      <div class="card"><h2>OWASP Top 10 Mapping</h2><table><thead><tr><th>ID</th><th>Control</th><th>Findings</th><th>Critical</th><th>High</th><th>Medium</th><th>Low</th></tr></thead><tbody>${owaspRows || '<tr><td colspan="7">No mapped findings</td></tr>'}</tbody></table></div>
      <div class="card"><h2>CIS Controls Mapping</h2><table><thead><tr><th>ID</th><th>Control</th><th>Findings</th><th>Critical</th><th>High</th><th>Medium</th><th>Low</th></tr></thead><tbody>${cisRows || '<tr><td colspan="7">No mapped findings</td></tr>'}</tbody></table></div>
    </body></html>`;
  };

  const downloadBlob = (content, mimeType, filename) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = async (format = "html") => {
    if (!selected) return;
    setReportLoading(true);
    try {
      const res = await api.get(`/sast/report/${selected}`);
      if (format === "json") {
        downloadBlob(
          JSON.stringify(res.data, null, 2),
          "application/json",
          `cloudsentinel-security-report-${selected}.json`
        );
      } else {
        downloadBlob(
          buildHtmlReport(res.data),
          "text/html",
          `cloudsentinel-security-report-${selected}.html`
        );
      }
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Dashboard"
        subtitle="OWASP Top 10 and CIS benchmark mapping from combined SAST and dependency findings"
        actions={
          <div className="flex items-center gap-2">
            <select className="input min-w-64" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="primary-btn inline-flex items-center gap-2" onClick={() => exportReport("html")} disabled={!selected || reportLoading}>
              <Download size={14} />
              {reportLoading ? "Generating..." : "Export Readable Report"}
            </button>
            <button className="secondary-btn inline-flex items-center gap-2" onClick={() => exportReport("json")} disabled={!selected || reportLoading}>
              <FileCode2 size={14} />
              Export JSON
            </button>
          </div>
        }
      />
      {loading ? <div className="card p-6">Loading compliance data...</div> : null}
      {!loading && !data ? (
        <div className="card p-10 text-center">
          <ShieldCheck className="mx-auto mb-2 text-[var(--accent-green)]" />
          <p className="text-[var(--text-secondary)]">No mapped findings yet. Run a scan and choose a project.</p>
        </div>
      ) : null}
      {data ? (
        <>
      <div className="card p-6 text-center">
        <p className="text-5xl font-bold">{data.summary.complianceScore}%</p>
        <p className="text-[var(--text-secondary)] mt-1">
          Compliance score • Failed controls: {data.summary.failedControls} • Unmapped findings: {data.summary.unmappedCount}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Sources: SAST {data.summary.sastFindings ?? 0} + Dependencies {data.summary.dependencyFindings ?? 0}
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map(([name, score, controls, status]) => (
          <div key={name} className="card p-4">
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{controls}</p>
            <div className="h-2 bg-[var(--bg-tertiary)] rounded mt-3 border border-[var(--border-subtle)]">
              <div className="h-2 rounded progress-anim" style={{ width: `${score}%`, background: score >= 80 ? "var(--accent-green)" : "var(--accent-yellow)" }} />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm">{score}%</p>
              <span className="text-xs text-[var(--text-secondary)]">{status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-5 overflow-auto">
        <h3 className="font-bold mb-3">Mapped OWASP Controls</h3>
        <table className="gh-table text-sm">
          <thead><tr><th>Control ID</th><th>Framework</th><th>Description</th><th>Findings</th><th>Critical</th><th>High</th></tr></thead>
          <tbody>
            {data.owasp.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-[var(--text-secondary)] py-6">No OWASP-mapped findings</td></tr>
            ) : (
              data.owasp.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>OWASP Top 10</td>
                  <td>{c.name}</td>
                  <td>{c.findings}</td>
                  <td>{c.critical}</td>
                  <td>{c.high}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="card p-5 overflow-auto">
        <h3 className="font-bold mb-3">Mapped CIS Controls</h3>
        <table className="gh-table text-sm">
          <thead><tr><th>Control ID</th><th>Framework</th><th>Description</th><th>Findings</th><th>Critical</th><th>High</th></tr></thead>
          <tbody>
            {data.cis.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-[var(--text-secondary)] py-6">No CIS-mapped findings</td></tr>
            ) : (
              data.cis.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>CIS Controls</td>
                  <td>{c.name}</td>
                  <td>{c.findings}</td>
                  <td>{c.critical}</td>
                  <td>{c.high}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      ) : null}
    </div>
  );
}

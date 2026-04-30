const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

const severityOrder = { CRITICAL: 1, MAJOR: 2, HIGH: 2, MINOR: 3, LOW: 3, INFO: 4 };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldKeepClone = () => /^true$/i.test((process.env.SAST_KEEP_CLONE || "").trim());
const shouldUseSonarBranchAnalysis = () =>
  /^true$/i.test((process.env.SONAR_ENABLE_BRANCH_ANALYSIS || "").trim());

function sonarBaseUrl() {
  const raw = process.env.SONAR_HOST || process.env.SONAR_URL || "http://localhost:9000";
  return raw.replace(/\/$/, "");
}

function isUsableGithubToken(token) {
  if (!token || typeof token !== "string") return false;
  const t = token.trim();
  if (!t) return false;
  if (t.includes("your_github_pat_token_here")) return false;
  if (t.startsWith("ghp_your_")) return false;
  return true;
}

/** HTTPS clone URL with GitHub PAT (x-access-token form) so git never prompts on the server. */
function githubHttpsCloneUrl(repoUrl, token) {
  if (!token) return repoUrl;
  try {
    const u = new URL(repoUrl);
    if (!/^github\.com$/i.test(u.hostname.replace(/^www\./, ""))) return repoUrl;
    u.username = "x-access-token";
    u.password = token;
    return u.href;
  } catch {
    return repoUrl;
  }
}

function resolveCloneUrl(project) {
  const raw = project.repo_url?.trim?.() || "";
  const token =
    (isUsableGithubToken(project.github_token) ? project.github_token.trim() : null) ||
    (isUsableGithubToken(process.env.GITHUB_TOKEN) ? process.env.GITHUB_TOKEN.trim() : null);
  if (/^https:\/\/(www\.)?github\.com\//i.test(raw) && token) return githubHttpsCloneUrl(raw, token);
  return raw;
}

const gitEnv = () => {
  const base = {
    ...process.env,
    GIT_TERMINAL_PROMPT: "0",
  };
  if (process.platform !== "win32") {
    base.GIT_ASKPASS = "/bin/false";
  }
  return base;
};

function gitCloneArgs(repoUrl, targetDir) {
  const branch = process.env.GIT_CLONE_BRANCH?.trim();
  if (branch)
    return ["clone", "-b", branch, "--single-branch", repoUrl, targetDir];
  return ["clone", repoUrl, targetDir];
}

function gitCloneAsync(repoUrl, targetDir) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", gitCloneArgs(repoUrl, targetDir), {
      env: gitEnv(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let stdout = "";
    child.stderr?.on("data", (c) => {
      stderr += c;
    });
    child.stdout?.on("data", (c) => {
      stdout += c;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error((stderr + stdout).trim() || "git clone failed"));
    });
  });
}

function runCommandAsync(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    let stderr = "";
    let stdout = "";
    child.stderr?.on("data", (c) => {
      stderr += c;
    });
    child.stdout?.on("data", (c) => {
      stdout += c;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error((stderr + stdout).trim() || `${command} failed`));
    });
  });
}

async function buildJavaProjectIfPresent(cloneTarget) {
  const pomPath = path.join(cloneTarget, "pom.xml");
  if (!fs.existsSync(pomPath)) return;

  const hasMvnw = fs.existsSync(path.join(cloneTarget, "mvnw"));
  const hasMvnwCmd = fs.existsSync(path.join(cloneTarget, "mvnw.cmd"));

  if (process.platform === "win32" && hasMvnwCmd) {
    await runCommandAsync("mvnw.cmd", ["-DskipTests", "clean", "package"], cloneTarget);
    return;
  }
  if (process.platform !== "win32" && hasMvnw) {
    await runCommandAsync("sh", ["mvnw", "-DskipTests", "clean", "package"], cloneTarget);
    return;
  }

  const mavenCmd = process.env.MAVEN_CMD || "mvn";
  await runCommandAsync(mavenCmd, ["-DskipTests", "clean", "package"], cloneTarget);
}

function detectedGitBranch(cloneTarget) {
  const r = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: cloneTarget,
    encoding: "utf8",
    env: gitEnv(),
  });
  const b = r.stdout?.trim();
  if (b && b !== "HEAD") return b;
  return process.env.SONAR_BRANCH_NAME?.trim() || "main";
}

function runSonarScannerAsync(projectId, cloneTarget, sonarHost, branchName) {
  const scanner = process.env.SONAR_SCANNER_PATH || "sonar-scanner";
  const token = process.env.SONAR_TOKEN || "";
  const args = [
    `-Dsonar.projectKey=cloudsentinel_${projectId}`,
    // Run analysis from the cloned repository root to avoid path resolution issues.
    `-Dsonar.projectBaseDir=${cloneTarget}`,
    `-Dsonar.sources=.`,
    `-Dsonar.java.binaries=target/classes`,
    `-Dsonar.host.url=${sonarHost}`,
    `-Dsonar.token=${token}`,
    `-Dsonar.scm.disabled=true`,
  ];
  if (shouldUseSonarBranchAnalysis() && branchName) args.push(`-Dsonar.branch.name=${branchName}`);
  return new Promise((resolve, reject) => {
    const child = spawn(scanner, args, {
      cwd: cloneTarget,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    let stderr = "";
    let stdout = "";
    child.stderr?.on("data", (c) => {
      stderr += c;
    });
    child.stdout?.on("data", (c) => {
      stdout += c;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error((stderr + stdout).trim() || "sonar-scanner failed"));
    });
  });
}

async function fetchSonarMetrics(projectId) {
  const sonarHost = sonarBaseUrl();
  const projectKey = `cloudsentinel_${projectId}`;
  const metricKeys = [
    "bugs",
    "vulnerabilities",
    "security_hotspots",
    "code_smells",
    "coverage",
    "duplicated_lines_density",
    "ncloc",
  ].join(",");

  const res = await axios.get(
    `${sonarHost}/api/measures/component?component=${projectKey}&metricKeys=${metricKeys}`,
    {
      auth: {
        username: process.env.SONAR_TOKEN,
        password: "",
      },
    }
  );

  const measures = res.data?.component?.measures || [];
  const byMetric = Object.fromEntries(measures.map((m) => [m.metric, m.value]));
  return {
    bugs: Number(byMetric.bugs || 0),
    vulnerabilities: Number(byMetric.vulnerabilities || 0),
    hotspots: Number(byMetric.security_hotspots || 0),
    codeSmells: Number(byMetric.code_smells || 0),
    coverage: Number(byMetric.coverage || 0),
    duplications: Number(byMetric.duplicated_lines_density || 0),
    ncloc: Number(byMetric.ncloc || 0),
  };
}

const OWASP_RULE_MAP = [
  { id: "A01:2021", name: "Broken Access Control", pattern: /(access control|authorization|privilege|bypass)/i },
  { id: "A02:2021", name: "Cryptographic Failures", pattern: /(crypto|cryptographic|encryption|hash|tls|ssl)/i },
  { id: "A03:2021", name: "Injection", pattern: /(sql|xss|inject|command injection|xpath|ldap)/i },
  { id: "A04:2021", name: "Insecure Design", pattern: /(insecure design|threat model|business logic)/i },
  { id: "A05:2021", name: "Security Misconfiguration", pattern: /(misconfig|cors|header|debug|directory listing)/i },
  { id: "A06:2021", name: "Vulnerable Components", pattern: /(dependency|vulnerable component|outdated library|cve)/i },
  { id: "A07:2021", name: "Identification and Authentication Failures", pattern: /(auth|password|session|jwt|token)/i },
  { id: "A08:2021", name: "Software and Data Integrity Failures", pattern: /(integrity|signature|supply chain|deserialization)/i },
  { id: "A09:2021", name: "Security Logging and Monitoring Failures", pattern: /(logging|audit|monitor|trace)/i },
  { id: "A10:2021", name: "Server-Side Request Forgery", pattern: /(ssrf|server-side request)/i },
];

const CIS_RULE_MAP = [
  { id: "CIS-1", name: "Inventory and Control of Enterprise Assets", pattern: /(inventory|asset|exposed service)/i },
  { id: "CIS-2", name: "Inventory and Control of Software Assets", pattern: /(dependency|package|library|component)/i },
  { id: "CIS-3", name: "Data Protection", pattern: /(data leak|encryption|sensitive data|hardcoded secret|secret)/i },
  { id: "CIS-4", name: "Secure Configuration", pattern: /(misconfig|default|hardening|configuration|cors|header)/i },
  { id: "CIS-5", name: "Account Management", pattern: /(account|authentication|authorization|password|identity)/i },
  { id: "CIS-6", name: "Access Control Management", pattern: /(access control|privilege|permission|rbac)/i },
  { id: "CIS-8", name: "Audit Log Management", pattern: /(log|audit|monitor)/i },
  { id: "CIS-16", name: "Application Software Security", pattern: /(xss|sql|inject|csrf|ssrf|deserialization)/i },
  { id: "CIS-18", name: "Penetration Testing", pattern: /(critical|high|major|vulnerability)/i },
];

function mapIssueToControl(issue, controls) {
  const text = `${issue.rule || ""} ${issue.message || ""}`.toLowerCase();
  const found = controls.find((c) => c.pattern.test(text));
  return found || null;
}

function buildComplianceFromIssues(issues) {
  const owasp = new Map();
  const cis = new Map();
  const unmapped = [];

  issues.forEach((issue) => {
    const o = mapIssueToControl(issue, OWASP_RULE_MAP);
    const c = mapIssueToControl(issue, CIS_RULE_MAP);
    const severity = (issue.severity || "INFO").toUpperCase();

    if (o) {
      const key = o.id;
      if (!owasp.has(key)) owasp.set(key, { ...o, findings: 0, critical: 0, high: 0, medium: 0, low: 0 });
      const x = owasp.get(key);
      x.findings += 1;
      if (severity === "CRITICAL") x.critical += 1;
      else if (severity === "HIGH" || severity === "MAJOR") x.high += 1;
      else if (severity === "MEDIUM" || severity === "MINOR" || severity === "LOW") x.medium += 1;
      else x.low += 1;
    }

    if (c) {
      const key = c.id;
      if (!cis.has(key)) cis.set(key, { ...c, findings: 0, critical: 0, high: 0, medium: 0, low: 0 });
      const x = cis.get(key);
      x.findings += 1;
      if (severity === "CRITICAL") x.critical += 1;
      else if (severity === "HIGH" || severity === "MAJOR") x.high += 1;
      else if (severity === "MEDIUM" || severity === "MINOR" || severity === "LOW") x.medium += 1;
      else x.low += 1;
    }

    if (!o && !c) unmapped.push(issue);
  });

  return {
    owasp: Array.from(owasp.values()).sort((a, b) => b.findings - a.findings),
    cis: Array.from(cis.values()).sort((a, b) => b.findings - a.findings),
    unmappedCount: unmapped.length,
  };
}

router.post("/scan/:projectId", auth, async (req, res) => {
  const { projectId } = req.params;
  const cloneRoot = path.resolve(process.env.CLONE_DIR || "/tmp/cloudsentinel-scans");
  const cloneTarget = path.join(cloneRoot, String(projectId));
  let scanHistoryId = null;

  try {
    const projectRes = await pool.query("SELECT * FROM projects WHERE id = $1 AND user_id = $2", [projectId, req.user.id]);
    if (!projectRes.rows.length) return res.status(404).json({ error: "Project not found" });

    const project = projectRes.rows[0];
    const runRow = await pool.query(
      "INSERT INTO scan_history (project_id, scan_type, status, started_at) VALUES ($1, 'SAST', 'RUNNING', NOW()) RETURNING id",
      [projectId]
    );
    scanHistoryId = runRow.rows[0]?.id;

    if (!fs.existsSync(cloneRoot)) fs.mkdirSync(cloneRoot, { recursive: true });
    if (fs.existsSync(cloneTarget)) fs.rmSync(cloneTarget, { recursive: true, force: true });

    const cloneUrl = resolveCloneUrl(project);
    await gitCloneAsync(cloneUrl, cloneTarget);
    await buildJavaProjectIfPresent(cloneTarget);

    const sonarHost = sonarBaseUrl();
    const branchName = detectedGitBranch(cloneTarget);
    await runSonarScannerAsync(projectId, cloneTarget, sonarHost, branchName);

    await wait(8000);

    const measuresRes = await axios.get(
      `${sonarHost}/api/measures/component?component=cloudsentinel_${projectId}&metricKeys=ncloc,files`,
      {
        auth: {
          username: process.env.SONAR_TOKEN,
          password: "",
        },
      }
    );
    const measures = measuresRes.data?.component?.measures || [];
    const ncloc = Number(measures.find((m) => m.metric === "ncloc")?.value || 0);
    const files = Number(measures.find((m) => m.metric === "files")?.value || 0);
    if (!ncloc || !files) {
      throw new Error(
        "Sonar analysis completed but indexed 0 code files (ncloc/files is zero). Check clone contents and scanner source path."
      );
    }

    const sonarRes = await axios.get(`${sonarHost}/api/issues/search?projectKeys=cloudsentinel_${projectId}&ps=500`, {
      auth: {
        username: process.env.SONAR_TOKEN,
        password: "",
      },
    });

    const issues = sonarRes.data.issues || [];
    await pool.query("DELETE FROM scan_results WHERE project_id = $1", [projectId]);

    for (const issue of issues) {
      await pool.query(
        "INSERT INTO scan_results (project_id, rule, severity, message, file_path, line_number, status) VALUES ($1,$2,$3,$4,$5,$6,'OPEN')",
        [projectId, issue.rule, issue.severity, issue.message, issue.component, issue.line || null]
      );
    }

    const summary = issues.reduce(
      (acc, item) => {
        if (item.severity === "CRITICAL") acc.critical += 1;
        else if (item.severity === "MAJOR" || item.severity === "HIGH") acc.high += 1;
        else if (item.severity === "MINOR" || item.severity === "LOW") acc.medium += 1;
        else acc.low += 1;
        acc.total += 1;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0, total: 0 }
    );

    const score = Math.max(
      0,
      100 - summary.critical * 15 - summary.high * 8 - summary.medium * 3 - summary.low
    );

    await pool.query(
      `UPDATE scan_history SET
        status = 'COMPLETED',
        total_issues = $1,
        critical = $2,
        high = $3,
        medium = $4,
        low = $5,
        completed_at = NOW()
      WHERE id = $6`,
      [summary.total, summary.critical, summary.high, summary.medium, summary.low, scanHistoryId]
    );
    await pool.query("UPDATE projects SET security_score = $1 WHERE id = $2", [score, projectId]);

    if (!shouldKeepClone() && fs.existsSync(cloneTarget)) {
      fs.rmSync(cloneTarget, { recursive: true, force: true });
    }
    return res.json({ success: true, total: summary.total, summary });
  } catch (error) {
    if (scanHistoryId != null) {
      await pool.query(
        `UPDATE scan_history SET status = 'FAILED', completed_at = NOW() WHERE id = $1`,
        [scanHistoryId]
      );
    }
    if (!shouldKeepClone() && fs.existsSync(cloneTarget)) {
      fs.rmSync(cloneTarget, { recursive: true, force: true });
    }
    return res.status(500).json({ error: error.message || "SAST scan failed" });
  }
});

router.get("/compliance/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectRes = await pool.query("SELECT id, name, security_score FROM projects WHERE id = $1 AND user_id = $2", [
      projectId,
      req.user.id,
    ]);
    if (!projectRes.rows.length) return res.status(404).json({ error: "Project not found" });

    const issuesRes = await pool.query(
      "SELECT rule, severity, message, file_path, line_number, status FROM scan_results WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId]
    );
    const issues = issuesRes.rows;
    const compliance = buildComplianceFromIssues(issues);

    const total = issues.length;
    const failedControls = compliance.owasp.reduce((a, c) => a + (c.findings > 0 ? 1 : 0), 0);
    const passedControls = Math.max(0, OWASP_RULE_MAP.length - failedControls);
    const complianceScore = OWASP_RULE_MAP.length
      ? Math.round((passedControls / OWASP_RULE_MAP.length) * 100)
      : 100;

    return res.json({
      project: projectRes.rows[0],
      summary: {
        totalIssues: total,
        failedControls,
        passedControls,
        complianceScore,
        unmappedCount: compliance.unmappedCount,
      },
      owasp: compliance.owasp,
      cis: compliance.cis,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to build compliance mapping" });
  }
});

router.get("/report/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectRes = await pool.query(
      "SELECT id, name, repo_url, language, framework, security_score, created_at FROM projects WHERE id = $1 AND user_id = $2",
      [projectId, req.user.id]
    );
    if (!projectRes.rows.length) return res.status(404).json({ error: "Project not found" });

    const [issuesRes, scanRes] = await Promise.all([
      pool.query(
        "SELECT rule, severity, message, file_path, line_number, status, created_at FROM scan_results WHERE project_id = $1 ORDER BY created_at DESC",
        [projectId]
      ),
      pool.query(
        "SELECT id, scan_type, status, total_issues, critical, high, medium, low, started_at, completed_at FROM scan_history WHERE project_id = $1 ORDER BY started_at DESC LIMIT 10",
        [projectId]
      ),
    ]);
    const issues = issuesRes.rows;
    const compliance = buildComplianceFromIssues(issues);
    const metrics = await fetchSonarMetrics(projectId).catch(() => null);

    return res.json({
      generatedAt: new Date().toISOString(),
      project: projectRes.rows[0],
      metrics,
      totals: {
        issues: issues.length,
        critical: issues.filter((i) => (i.severity || "").toUpperCase() === "CRITICAL").length,
        high: issues.filter((i) => ["HIGH", "MAJOR"].includes((i.severity || "").toUpperCase())).length,
        medium: issues.filter((i) => ["MEDIUM", "MINOR", "LOW"].includes((i.severity || "").toUpperCase())).length,
      },
      compliance,
      scans: scanRes.rows,
      topFindings: issues.slice(0, 50),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate security report" });
  }
});

router.get("/analytics/overview", auth, async (req, res) => {
  try {
    const projectsRes = await pool.query(
      "SELECT id, name, language, security_score, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    const projects = projectsRes.rows;
    if (!projects.length) {
      return res.json({
        totals: { projects: 0, critical: 0, high: 0, medium: 0, low: 0, avgScore: 0 },
        trend: [],
        topProjects: [],
      });
    }

    const ids = projects.map((p) => p.id);
    const scansRes = await pool.query(
      `SELECT project_id, status, critical, high, medium, low, started_at, completed_at
       FROM scan_history
       WHERE project_id = ANY($1::int[])`,
      [ids]
    );

    const latestByProject = new Map();
    scansRes.rows.forEach((s) => {
      const curr = latestByProject.get(s.project_id);
      const t = new Date(s.started_at).getTime();
      if (!curr || t > new Date(curr.started_at).getTime()) latestByProject.set(s.project_id, s);
    });

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    latestByProject.forEach((s) => {
      critical += Number(s.critical || 0);
      high += Number(s.high || 0);
      medium += Number(s.medium || 0);
      low += Number(s.low || 0);
    });

    const avgScore = Math.round(
      projects.reduce((a, p) => a + Number(p.security_score || 0), 0) / Math.max(1, projects.length)
    );
    const topProjects = projects
      .map((p) => ({ ...p, latest: latestByProject.get(p.id) || null }))
      .sort((a, b) => Number(b.security_score || 0) - Number(a.security_score || 0))
      .slice(0, 8);

    return res.json({
      totals: { projects: projects.length, critical, high, medium, low, avgScore },
      topProjects,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load analytics overview" });
  }
});

router.get("/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectRes = await pool.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2", [projectId, req.user.id]);
    if (!projectRes.rows.length) return res.status(404).json({ error: "Project not found" });

    const rows = await pool.query(
      "SELECT * FROM scan_results WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId]
    );
    const lastScanRes = await pool.query(
      "SELECT completed_at FROM scan_history WHERE project_id = $1 ORDER BY started_at DESC LIMIT 1",
      [projectId]
    );

    const summary = rows.rows.reduce(
      (acc, item) => {
        const sev = item.severity?.toUpperCase();
        if (sev === "CRITICAL") acc.critical += 1;
        else if (sev === "MAJOR" || sev === "HIGH") acc.major += 1;
        else if (sev === "MINOR" || sev === "LOW") acc.minor += 1;
        else acc.info += 1;
        acc.total += 1;
        return acc;
      },
      { critical: 0, major: 0, minor: 0, info: 0, total: 0 }
    );

    const vulnerabilities = rows.rows.sort((a, b) => {
      const pa = severityOrder[(a.severity || "INFO").toUpperCase()] || 99;
      const pb = severityOrder[(b.severity || "INFO").toUpperCase()] || 99;
      return pa - pb;
    });

    let sonarMetrics = null;
    try {
      sonarMetrics = await fetchSonarMetrics(projectId);
    } catch {
      sonarMetrics = null;
    }

    return res.json({
      summary,
      vulnerabilities,
      lastScan: lastScanRes.rows[0]?.completed_at || null,
      sonarMetrics,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;

const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

const severityOrder = { CRITICAL: 1, MAJOR: 2, HIGH: 2, MINOR: 3, LOW: 3, INFO: 4 };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sonarBaseUrl() {
  const raw = process.env.SONAR_HOST || process.env.SONAR_URL || "http://localhost:9000";
  return raw.replace(/\/$/, "");
}

router.post("/scan/:projectId", auth, async (req, res) => {
  const { projectId } = req.params;
  const cloneRoot = path.resolve(process.env.CLONE_DIR || "/tmp/cloudsentinel-scans");
  const cloneTarget = path.join(cloneRoot, String(projectId));

  try {
    const projectRes = await pool.query("SELECT * FROM projects WHERE id = $1 AND user_id = $2", [projectId, req.user.id]);
    if (!projectRes.rows.length) return res.status(404).json({ error: "Project not found" });

    const project = projectRes.rows[0];
    await pool.query(
      "INSERT INTO scan_history (project_id, scan_type, status, started_at) VALUES ($1, 'SAST', 'RUNNING', NOW())",
      [projectId]
    );

    if (!fs.existsSync(cloneRoot)) fs.mkdirSync(cloneRoot, { recursive: true });
    if (fs.existsSync(cloneTarget)) fs.rmSync(cloneTarget, { recursive: true, force: true });

    execSync(`git clone ${project.repo_url} "${cloneTarget}"`, { stdio: "pipe", shell: true });

    const scanner = process.env.SONAR_SCANNER_PATH || "sonar-scanner";
    const sonarHost = sonarBaseUrl();
    execSync(
      `"${scanner}" -Dsonar.projectKey=cloudsentinel_${projectId} -Dsonar.sources="${cloneTarget}" -Dsonar.host.url=${sonarHost} -Dsonar.token=${process.env.SONAR_TOKEN} -Dsonar.scm.disabled=true`,
      { stdio: "pipe", shell: true }
    );

    await wait(8000);

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
      "INSERT INTO scan_history (project_id, scan_type, status, total_issues, critical, high, medium, low, started_at, completed_at) VALUES ($1,'SAST','COMPLETED',$2,$3,$4,$5,$6,NOW(),NOW())",
      [projectId, summary.total, summary.critical, summary.high, summary.medium, summary.low]
    );
    await pool.query("UPDATE projects SET security_score = $1 WHERE id = $2", [score, projectId]);

    if (fs.existsSync(cloneTarget)) fs.rmSync(cloneTarget, { recursive: true, force: true });
    return res.json({ success: true, total: summary.total, summary });
  } catch (error) {
    if (fs.existsSync(cloneTarget)) fs.rmSync(cloneTarget, { recursive: true, force: true });
    return res.status(500).json({ error: error.message || "SAST scan failed" });
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

    return res.json({
      summary,
      vulnerabilities,
      lastScan: lastScanRes.rows[0]?.completed_at || null,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;

"use strict";

const severityOrder = { CRITICAL: 1, MAJOR: 2, HIGH: 2, MINOR: 3, LOW: 3, INFO: 4 };

function sonarBaseUrl() {
  const raw = process.env.SONAR_HOST || process.env.SONAR_URL || "http://localhost:9000";
  return raw.replace(/\/$/, "");
}

function parseEnvTimeoutMs(raw, fallback) {
  const n = Number.parseInt(String(raw ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const GIT_CLONE_TIMEOUT_MS = parseEnvTimeoutMs(process.env.SAST_GIT_TIMEOUT_MS, 900_000);
const MAVEN_TIMEOUT_MS = parseEnvTimeoutMs(process.env.SAST_MAVEN_TIMEOUT_MS, 1_800_000);
const GRADLE_TIMEOUT_MS = parseEnvTimeoutMs(process.env.SAST_GRADLE_TIMEOUT_MS, MAVEN_TIMEOUT_MS);
const SONAR_SCANNER_TIMEOUT_MS = parseEnvTimeoutMs(process.env.SAST_SONAR_SCAN_TIMEOUT_MS, 2_700_000);
const SONAR_HTTP_TIMEOUT_MS = parseEnvTimeoutMs(process.env.SAST_SONAR_HTTP_TIMEOUT_MS, 90_000);
const SONAR_INDEX_MAX_WAIT_MS = parseEnvTimeoutMs(process.env.SAST_SONAR_INDEX_MAX_WAIT_MS, 300_000);
const SONAR_INDEX_POLL_MS = parseEnvTimeoutMs(process.env.SAST_SONAR_INDEX_POLL_MS, 5_000);

/** When true (default), Maven/Gradle errors are logged and Sonar still runs (source-only / partial Java rules). */
function continueOnBuildFailure() {
  return !/^false$/i.test(String(process.env.SAST_CONTINUE_ON_BUILD_FAILURE ?? "true").trim());
}

/** When true (default), Sonar reporting 0 ncloc/files after wait still completes with issues API results. */
function allowEmptySonarIndex() {
  return !/^false$/i.test(String(process.env.SAST_ALLOW_EMPTY_SONAR_INDEX ?? "true").trim());
}

function parseSastProjectId(raw) {
  const id = Number.parseInt(String(raw ?? "").trim(), 10);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

function sanitizeScanError(err) {
  if (err == null) return "SAST scan failed";
  const m = typeof err.message === "string" && err.message.trim() ? err.message.trim() : String(err);
  return m.length > 4000 ? `${m.slice(0, 3997)}...` : m;
}

function isGradleProjectLayout(cloneTarget) {
  const fs = require("fs");
  const path = require("path");
  if (fs.existsSync(path.join(cloneTarget, "pom.xml"))) return false;
  const hasGradleFile =
    fs.existsSync(path.join(cloneTarget, "build.gradle")) ||
    fs.existsSync(path.join(cloneTarget, "build.gradle.kts")) ||
    fs.existsSync(path.join(cloneTarget, "settings.gradle")) ||
    fs.existsSync(path.join(cloneTarget, "settings.gradle.kts"));
  const hasWrapper =
    fs.existsSync(path.join(cloneTarget, "gradlew")) || fs.existsSync(path.join(cloneTarget, "gradlew.bat"));
  return Boolean(hasGradleFile && hasWrapper);
}

function coerceIssueRow(issue, projectId) {
  const lineRaw = issue.line;
  let lineNum = null;
  if (lineRaw != null && Number.isFinite(Number(lineRaw))) lineNum = Math.trunc(Number(lineRaw));

  const rule = issue.rule != null ? String(issue.rule).slice(0, 512) : "unknown";
  const severity = issue.severity != null ? String(issue.severity).slice(0, 64) : "INFO";
  const message = issue.message != null ? String(issue.message).slice(0, 8000) : "";

  let filePath = issue.component;
  if (filePath != null && typeof filePath !== "string") {
    filePath =
      filePath.path != null
        ? String(filePath.path)
        : JSON.stringify(filePath).slice(0, 2000);
  } else if (filePath != null) {
    filePath = String(filePath).slice(0, 2000);
  }

  return [projectId, rule, severity, message, filePath, lineNum];
}

function sonarAuthAxiosConfig(extra = {}) {
  return {
    timeout: SONAR_HTTP_TIMEOUT_MS,
    auth: {
      username: process.env.SONAR_TOKEN || "",
      password: "",
    },
    ...extra,
  };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldKeepClone = () => /^true$/i.test((process.env.SAST_KEEP_CLONE || "").trim());
const shouldUseSonarBranchAnalysis = () =>
  /^true$/i.test((process.env.SONAR_ENABLE_BRANCH_ANALYSIS || "").trim());

module.exports = {
  severityOrder,
  sonarBaseUrl,
  parseEnvTimeoutMs,
  GIT_CLONE_TIMEOUT_MS,
  MAVEN_TIMEOUT_MS,
  GRADLE_TIMEOUT_MS,
  SONAR_SCANNER_TIMEOUT_MS,
  SONAR_HTTP_TIMEOUT_MS,
  SONAR_INDEX_MAX_WAIT_MS,
  SONAR_INDEX_POLL_MS,
  continueOnBuildFailure,
  allowEmptySonarIndex,
  parseSastProjectId,
  sanitizeScanError,
  isGradleProjectLayout,
  coerceIssueRow,
  sonarAuthAxiosConfig,
  wait,
  shouldKeepClone,
  shouldUseSonarBranchAnalysis,
};

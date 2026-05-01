"use strict";

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

function upsertControl(map, control, severity) {
  if (!map.has(control.id)) {
    map.set(control.id, { ...control, findings: 0, critical: 0, high: 0, medium: 0, low: 0 });
  }
  const target = map.get(control.id);
  target.findings += 1;
  const sev = (severity || "LOW").toUpperCase();
  if (sev === "CRITICAL") target.critical += 1;
  else if (sev === "HIGH" || sev === "MAJOR") target.high += 1;
  else if (sev === "MEDIUM" || sev === "MINOR") target.medium += 1;
  else target.low += 1;
}

function mergeDependencyIntoCompliance(baseCompliance, dependencyRows) {
  const owaspMap = new Map(baseCompliance.owasp.map((x) => [x.id, { ...x }]));
  const cisMap = new Map(baseCompliance.cis.map((x) => [x.id, { ...x }]));

  const owaspA06 =
    OWASP_RULE_MAP.find((x) => x.id === "A06:2021") ||
    { id: "A06:2021", name: "Vulnerable Components" };
  const cis2 =
    CIS_RULE_MAP.find((x) => x.id === "CIS-2") ||
    { id: "CIS-2", name: "Inventory and Control of Software Assets" };

  dependencyRows.forEach((row) => {
    upsertControl(owaspMap, owaspA06, row.severity);
    upsertControl(cisMap, cis2, row.severity);
  });

  return {
    owasp: Array.from(owaspMap.values()).sort((a, b) => b.findings - a.findings),
    cis: Array.from(cisMap.values()).sort((a, b) => b.findings - a.findings),
    unmappedCount: baseCompliance.unmappedCount,
  };
}

module.exports = {
  OWASP_RULE_MAP,
  CIS_RULE_MAP,
  mapIssueToControl,
  buildComplianceFromIssues,
  mergeDependencyIntoCompliance,
};

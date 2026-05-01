import { Link } from "react-router-dom";
import { ClipboardCheck, Code2, GitBranch, KeyRound, Server, Shield, Zap } from "lucide-react";

export default function Landing() {
  const features = [
    { icon: Code2, title: "SAST Scanning", desc: "Analyze source code for SQL injection, XSS, hardcoded secrets and 100+ vulnerability types." },
    { icon: KeyRound, title: "Secrets Detection", desc: "Catch exposed API keys, tokens and passwords before they reach production or git history." },
    { icon: Server, title: "IaC Security", desc: "Secure Terraform, Docker and Kubernetes configurations before deployment." },
    { icon: ClipboardCheck, title: "Compliance Reports", desc: "Generate OWASP, SOC2, GDPR and ISO27001 evidence from active scans." },
    { icon: GitBranch, title: "Pipeline Protection", desc: "Embed checks in CI/CD and block high-risk merges before release." },
    { icon: Zap, title: "Real-time Monitoring", desc: "Track scan trends, critical findings, and remediation velocity in one dashboard." },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 bg-[var(--bg-secondary)]/95 backdrop-blur border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Shield className="text-[var(--accent-green)]" />
            <span>CloudSentinel</span>
          </div>
          <div className="flex items-center gap-4">
            <Link className="secondary-btn" to="/login">Login</Link>
            <Link className="primary-btn" to="/register">Get Started Free</Link>
          </div>
        </div>
      </header>
      <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)] mb-4">
            Enterprise Cloud Security
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Secure Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-blue)]">
              Applications
            </span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-xl mt-5">
            CloudSentinel integrates threat modeling, CI/CD security scanning and runtime monitoring to protect your
            applications from code to cloud.
          </p>
          <div className="mt-8 flex gap-3">
            <Link className="primary-btn px-6 py-3" to="/register">Start Free Trial</Link>
            <Link className="secondary-btn px-6 py-3" to="/login">Sign In</Link>
          </div>
        </div>
        <div className="card p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--accent-blue)]/15 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[var(--accent-purple)]/15 blur-2xl" />
          <div className="relative z-10 space-y-5">
            <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              System Status: Operational
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)]">Active Projects</p>
                <p className="text-2xl font-semibold mt-1">247</p>
              </div>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)]">Critical Alerts</p>
                <p className="text-2xl font-semibold mt-1 text-[var(--accent-red)]">3</p>
              </div>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)]">Compliance</p>
                <p className="text-2xl font-semibold mt-1">89%</p>
              </div>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)]">Avg Security Score</p>
                <p className="text-2xl font-semibold mt-1">74/100</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["SOC2", "ISO27001", "GDPR", "OWASP Top 10"].map((b) => (
            <div key={b} className="card py-2 text-sm text-[var(--text-secondary)] text-center">{b}</div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="card p-6 grid md:grid-cols-4 gap-4 text-center">
          <div><p className="text-3xl font-bold text-[var(--accent-green)]">10,000+</p><p className="text-[var(--text-secondary)]">Vulnerabilities Detected</p></div>
          <div><p className="text-3xl font-bold text-[var(--accent-yellow)]">500+</p><p className="text-[var(--text-secondary)]">Projects Secured</p></div>
          <div><p className="text-3xl font-bold text-[var(--accent-purple)]">99.9%</p><p className="text-[var(--text-secondary)]">Uptime</p></div>
          <div><p className="text-3xl font-bold text-[var(--accent-red)]">50ms</p><p className="text-[var(--text-secondary)]">Scan Speed</p></div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Everything You Need to Secure Your Pipeline</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <f.icon className="w-6 h-6 text-[var(--accent-blue)]" />
              <h3 className="font-bold mt-3">{f.title}</h3>
              <p className="text-[var(--text-secondary)] mt-2 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Up and Running in 3 Steps</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-6"><GitBranch className="text-[var(--accent-green)]" /><h3 className="font-bold mt-3">1. Connect Repository</h3><p className="text-sm text-[var(--text-secondary)] mt-2">Paste your GitHub URL and detect stack automatically.</p></div>
          <div className="card p-6"><Zap className="text-[var(--accent-yellow)]" /><h3 className="font-bold mt-3">2. Run Security Scans</h3><p className="text-sm text-[var(--text-secondary)] mt-2">Scan code, dependencies and infrastructure.</p></div>
          <div className="card p-6"><Shield className="text-[var(--accent-red)]" /><h3 className="font-bold mt-3">3. Fix & Ship Securely</h3><p className="text-sm text-[var(--text-secondary)] mt-2">Track score and apply fix guidance fast.</p></div>
        </div>
      </section>
    </div>
  );
}

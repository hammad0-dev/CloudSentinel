import { Link } from "react-router-dom";
import { ClipboardCheck, Code2, GitBranch, Globe, KeyRound, Server, Shield, Zap } from "lucide-react";

export default function Landing() {
  const features = [
    { icon: Code2, title: "SAST Scanning", desc: "Analyze source code for SQL injection, XSS, hardcoded secrets and 100+ vulnerability types.", color: "text-[var(--accent-green)]" },
    { icon: Globe, title: "DAST Testing", desc: "Test your running application dynamically. Simulate real attacker behavior against live endpoints.", color: "text-[var(--accent-yellow)]" },
    { icon: KeyRound, title: "Secrets Detection", desc: "Catch exposed API keys, tokens and passwords before they reach production or git history.", color: "text-[var(--accent-red)]" },
    { icon: Server, title: "IaC Security", desc: "Secure Terraform, Docker and Kubernetes configs before deployment.", color: "text-[var(--accent-purple)]" },
    { icon: ClipboardCheck, title: "Compliance Reports", desc: "Auto-generate OWASP, SOC2, GDPR and ISO27001 compliance reports.", color: "text-[var(--accent-green)]" },
    { icon: GitBranch, title: "Pipeline Protection", desc: "Embed security checks directly into CI/CD for shift-left security.", color: "text-[var(--accent-yellow)]" },
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
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-[var(--text-secondary)] mb-4">Trusted by 500+ development teams</p>
        <h1 className="text-6xl font-bold mb-4">Secure Your Code Before It Ships</h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
          AI-powered security scanning for modern DevOps teams. Detect vulnerabilities in code, dependencies, containers and cloud in minutes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link className="primary-btn px-6 py-3" to="/register">Get Started Free</Link>
          <button className="secondary-btn px-6 py-3">Watch Demo</button>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {["SOC2", "ISO27001", "GDPR", "OWASP Top 10"].map((b) => <div key={b} className="card py-2 text-sm text-[var(--text-secondary)]">{b}</div>)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Built For Modern DevOps Workflows</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80"
              alt="Cloud deployment infrastructure"
              className="h-52 w-full object-cover border-b border-[var(--border-subtle)]"
            />
            <div className="p-4">
              <p className="font-semibold">Cloud Deployment Security</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Track risks across infrastructure, containers, and cloud runtime.</p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80"
              alt="CI/CD pipeline automation and build flow"
              className="h-52 w-full object-cover border-b border-[var(--border-subtle)]"
            />
            <div className="p-4">
              <p className="font-semibold">CI/CD Pipeline Hardening</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Run SAST checks in every pipeline stage before production release.</p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80"
              alt="Security operations center threat monitoring"
              className="h-52 w-full object-cover border-b border-[var(--border-subtle)]"
            />
            <div className="p-4">
              <p className="font-semibold">Threat Monitoring & Response</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Visualize vulnerabilities, prioritize fixes, and keep compliance aligned.</p>
            </div>
          </div>
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
              <f.icon className={`w-6 h-6 ${f.color}`} />
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

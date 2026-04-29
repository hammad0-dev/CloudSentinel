import { Link } from "react-router-dom";
import { ClipboardCheck, Code2, GitBranch, Globe, KeyRound, Server, Shield, Zap } from "lucide-react";

export default function Landing() {
  const features = [
    { icon: Code2, title: "SAST Scanning", desc: "Analyze source code for SQL injection, XSS, hardcoded secrets and 100+ vulnerability types.", color: "text-blue-400" },
    { icon: Globe, title: "DAST Testing", desc: "Test your running application dynamically. Simulate real attacker behavior against live endpoints.", color: "text-emerald-400" },
    { icon: KeyRound, title: "Secrets Detection", desc: "Catch exposed API keys, tokens and passwords before they reach production or git history.", color: "text-yellow-400" },
    { icon: Server, title: "IaC Security", desc: "Secure Terraform, Docker and Kubernetes configs before deployment.", color: "text-orange-400" },
    { icon: ClipboardCheck, title: "Compliance Reports", desc: "Auto-generate OWASP, SOC2, GDPR and ISO27001 compliance reports.", color: "text-cyan-400" },
    { icon: GitBranch, title: "Pipeline Protection", desc: "Embed security checks directly into CI/CD for shift-left security.", color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
      <header className="sticky top-0 z-30 bg-[#0a0e1a]/90 backdrop-blur border-b border-[#1e2d4a]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Shield className="text-blue-500" />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">CloudSentinel</span>
          </div>
          <div className="flex items-center gap-4">
            <Link className="px-4 py-2 rounded-lg border border-[#1e2d4a]" to="/login">Login</Link>
            <Link className="primary-btn" to="/register">Get Started Free</Link>
          </div>
        </div>
      </header>
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-[#64748b] mb-4">Trusted by 500+ development teams</p>
        <h1 className="text-6xl font-bold mb-4">Secure Your Code Before It Ships</h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          AI-powered security scanning for modern DevOps teams. Detect vulnerabilities in code, dependencies, containers and cloud in minutes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold" to="/register">Get Started Free</Link>
          <button className="px-6 py-3 rounded-lg border border-[#1e2d4a]">Watch Demo</button>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {["SOC2", "ISO27001", "GDPR", "OWASP Top 10"].map((b) => <div key={b} className="card py-2 text-sm text-[#64748b]">{b}</div>)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="card p-6 grid md:grid-cols-4 gap-4 text-center">
          <div><p className="text-3xl font-bold text-blue-400">10,000+</p><p className="text-[#64748b]">Vulnerabilities Detected</p></div>
          <div><p className="text-3xl font-bold text-emerald-400">500+</p><p className="text-[#64748b]">Projects Secured</p></div>
          <div><p className="text-3xl font-bold text-cyan-400">99.9%</p><p className="text-[#64748b]">Uptime</p></div>
          <div><p className="text-3xl font-bold text-yellow-400">50ms</p><p className="text-[#64748b]">Scan Speed</p></div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Everything You Need to Secure Your Pipeline</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card hover-lift p-5">
              <f.icon className={`w-6 h-6 ${f.color}`} />
              <h3 className="font-bold mt-3">{f.title}</h3>
              <p className="text-[#64748b] mt-2 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Up and Running in 3 Steps</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-6"><GitBranch className="text-blue-400" /><h3 className="font-bold mt-3">1. Connect Repository</h3><p className="text-sm text-[#64748b] mt-2">Paste your GitHub URL and detect stack automatically.</p></div>
          <div className="card p-6"><Zap className="text-yellow-400" /><h3 className="font-bold mt-3">2. Run Security Scans</h3><p className="text-sm text-[#64748b] mt-2">Scan code, dependencies and infrastructure.</p></div>
          <div className="card p-6"><Shield className="text-emerald-400" /><h3 className="font-bold mt-3">3. Fix & Ship Securely</h3><p className="text-sm text-[#64748b] mt-2">Track score and apply fix guidance fast.</p></div>
        </div>
      </section>
    </div>
  );
}

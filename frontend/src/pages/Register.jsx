import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { GMAIL_ONLY_MESSAGE, isGmailAddress } from "../utils/emailAllowedDomain";

const PASSWORD_RULES = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "lower", label: "One lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "num", label: "One number (0–9)", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "One special character", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", agree: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passwordRuleStatus = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, met: r.test(form.password) })),
    [form.password]
  );
  const passwordIsValid = useMemo(() => passwordRuleStatus.every((r) => r.met), [passwordRuleStatus]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.confirm) return toast.error("Please fill all fields");
    if (!isGmailAddress(form.email)) return toast.error(GMAIL_ONLY_MESSAGE);
    if (!passwordIsValid) return toast.error("Password must meet every requirement below.");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (!form.agree) return toast.error("Please accept terms");
    try {
      await api.post("/auth/register", { fullName: form.fullName, email: form.email, password: form.password });
      toast.success("Account created. Sign in with your email and password.");
      navigate("/login", { replace: true, state: { email: form.email } });
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="h-12 px-4 md:px-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Shield size={16} className="text-[var(--accent-blue)]" />
          <span className="text-[var(--accent-blue)]">CloudSentinel</span>
        </div>
        <Link to="/landing" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          &lt; Back to Landing Page
        </Link>
      </div>
      <div className="grid lg:grid-cols-[420px_1fr] min-h-[calc(100vh-48px)]">
        <div className="border-r border-[var(--border-subtle)] p-6 md:p-10 flex items-start justify-center">
          <form onSubmit={submit} className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-3">
            <h2 className="text-4xl font-bold leading-none">Create Account</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Get started with your free 14-day trial.</p>

            <label className="text-xs text-[var(--text-secondary)]">Full Name</label>
            <div className="relative"><User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" /><input className="input input-with-icon-left w-full" placeholder="John Doe" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <label className="text-xs text-[var(--text-secondary)]">Email Address</label>
            <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" /><input className="input input-with-icon-left w-full" placeholder="name@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <label className="text-xs text-[var(--text-secondary)]">Password</label>
            <div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" /><input type={showPassword ? "text" : "password"} className="input input-with-icon-both w-full" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
            <div className="grid grid-cols-5 gap-1">
              {passwordRuleStatus.map((r) => (
                <div key={r.id} className={`h-1.5 rounded ${r.met ? "bg-[var(--accent-green)]" : "bg-[var(--bg-tertiary)]"}`} />
              ))}
            </div>
            <ul className="space-y-1.5 text-[11px] pt-0.5">
              {passwordRuleStatus.map((r) => (
                <li
                  key={r.id}
                  className={`flex items-center gap-2 ${r.met ? "text-[var(--accent-green)]" : "text-[var(--text-secondary)]"}`}
                >
                  {r.met ? <CheckCircle2 size={14} className="shrink-0" /> : <Circle size={14} className="shrink-0 opacity-45" />}
                  {r.label}
                </li>
              ))}
            </ul>
            <label className="text-xs text-[var(--text-secondary)]">Confirm Password</label>
            <div className="relative"><input type={showConfirm ? "text" : "password"} className="input w-full pr-10" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
            {form.confirm && form.password !== form.confirm ? <p className="text-[var(--accent-red)] text-xs">Passwords do not match</p> : null}

            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
              <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
              I agree to the Terms of Service and Privacy Policy.
            </label>
            <button className="primary-btn w-full mt-2">Create Account</button>
            <p className="text-xs text-center text-[var(--text-secondary)]">
              Already have an account? <Link className="text-[var(--accent-blue)]" to="/login">Login</Link>
            </p>
          </form>
        </div>

        <div className="hidden lg:flex flex-col justify-center p-12 bg-[radial-gradient(circle_at_top,_#172952_0%,_#0a1226_45%,_#050915_100%)]">
          <div className="max-w-xl mx-auto">
            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
              <div className="absolute inset-6 rounded-full border border-[var(--border-subtle)]" />
              <div className="absolute inset-12 rounded-full border border-[var(--border-subtle)]" />
              <div className="absolute inset-[78px] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
                <Shield size={42} className="text-[var(--accent-blue)]" />
              </div>
            </div>
          <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)] mb-4">
            Enterprise Grade Protection
          </div>
          <h1 className="text-5xl font-bold leading-tight">
            Start Securing Your{" "}
            <span className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
              Applications
            </span>{" "}
            Today
          </h1>
          <p className="text-[var(--text-secondary)] mt-4 text-lg">
            Join CloudSentinel and integrate security into every stage of your development lifecycle.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              "Automated CI/CD Security",
              "STRIDE Threat Modeling",
              "Real-Time Vulnerability Detection",
              "OWASP & CIS Compliance",
            ].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <CheckCircle2 size={14} className="text-[var(--accent-blue)]" />
                {item}
              </p>
            ))}
          </div>
          <div className="flex gap-6 mt-10 text-[11px] text-[var(--text-secondary)]">
            <span>SOC2 TYPE II</span>
            <span>ISO 27001</span>
            <span>HIPAA COMPLIANT</span>
          </div>
        </div>
      </div>
      <div className="h-10 border-t border-[var(--border-subtle)] px-4 md:px-6 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
        <p>© 2026 CloudSentinel Security Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Overview</span>
        </div>
      </div>
    </div>
    </div>
  );
}

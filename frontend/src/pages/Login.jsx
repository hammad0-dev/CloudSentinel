import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import api from "../utils/api";
import { GMAIL_ONLY_MESSAGE, isGmailAddress } from "../utils/emailAllowedDomain";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: typeof location.state?.email === "string" ? location.state.email : "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Both fields are required");
    if (!isGmailAddress(form.email)) return toast.error(GMAIL_ONLY_MESSAGE);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      toast.success("Welcome back!");
      navigate(location.state?.from || "/dashboard");
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const googleAuth = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse?.access_token;
      if (!accessToken) return toast.error("Google token missing");
      setGoogleLoading(true);
      try {
        const { data } = await api.post("/auth/google", { accessToken });
        login(data);
        toast.success("Signed in with Google");
        navigate(location.state?.from || "/dashboard");
      } catch (error) {
        toast.error(error.response?.data?.error || "Google sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      toast.error("Google sign-in failed");
    },
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="h-12 px-4 md:px-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Shield size={16} className="text-[var(--accent-blue)]" />
          <span className="text-[var(--accent-blue)]">CloudSentinel</span>
        </div>
        <Link to="/landing" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          &lt; Back to Landing
        </Link>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] min-h-[calc(100vh-48px)]">
        <div className="border-r border-[var(--border-subtle)] p-6 md:p-10 flex items-start justify-center">
          <form onSubmit={onSubmit} className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-3">
            <h2 className="text-4xl font-bold leading-none">Welcome Back</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Enter your credentials to access your security dashboard.</p>

            <label className="text-xs text-[var(--text-secondary)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={15} />
              <input
                className="input input-with-icon-left w-full"
                placeholder="name@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-[var(--text-secondary)]">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[var(--accent-blue)]">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={15} />
              <input
                type={showPassword ? "text" : "password"}
                className="input input-with-icon-both w-full"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
              <input type="checkbox" />
              Keep me signed in for 30 days
            </label>

            <button className="primary-btn w-full mt-1" disabled={loading}>
              {loading ? "Signing In..." : "Secure Login"}
            </button>

            <div className="relative py-2">
              <div className="border-t border-[var(--border-subtle)]" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-[var(--bg-secondary)] px-3 text-[10px] text-[var(--text-secondary)] uppercase">
                Or continue with
              </span>
            </div>

            <div className={`${googleLoading ? "opacity-70 pointer-events-none" : ""}`}>
              <button
                type="button"
                onClick={() => googleAuth()}
                className="secondary-btn w-full h-10 inline-flex items-center justify-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16" height="16" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.224 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.847 1.154 7.966 3.034l5.657-5.657C34.023 6.053 29.259 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.656 16.108 18.961 13 24 13c3.059 0 5.847 1.154 7.966 3.034l5.657-5.657C34.023 6.053 29.259 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.157 0 9.86-1.977 13.409-5.2l-6.19-5.238C29.144 35.091 26.693 36 24 36c-5.203 0-9.617-3.329-11.283-7.946l-6.52 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.563.001-.001 6.19 5.237 6.19 5.237C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </button>
            </div>

            <p className="text-xs text-center text-[var(--text-secondary)]">
              New to CloudSentinel?{" "}
              <Link className="text-[var(--accent-blue)]" to="/register">
                Create Account
              </Link>
            </p>
          </form>
        </div>

        <div className="hidden lg:flex flex-col justify-center p-12 bg-[radial-gradient(circle_at_top,_#172952_0%,_#0a1226_45%,_#050915_100%)]">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                Enterprise Cloud Security
              </span>
              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                System Status: Operational
              </span>
            </div>
            <h1 className="text-6xl font-bold leading-tight mt-6">
              Secure Your
              <br />
              <span className="bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-blue)] bg-clip-text text-transparent">
                Applications
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] mt-4 text-2xl leading-relaxed">
              CloudSentinel integrates threat modeling, CI/CD security scanning, and real-time monitoring to protect
              your applications from code to cloud.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-8 text-sm">
              {[
                "Automated CI/CD Pipeline",
                "STRIDE Threat Modeling",
                "SAST, DAST & Dependency",
                "Kubernetes Enforcement",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--accent-blue)]" />
                  {item}
                </p>
              ))}
            </div>
            <div className="mt-10 border-t border-[var(--border-subtle)] pt-6 text-[var(--text-secondary)] text-sm">
              <p className="italic">
                “The shift-left security approach provided by CloudSentinel reduced our vulnerability remediation time
                by 65%.”
              </p>
              <p className="mt-2 text-xs">Hammad Ur Rehman · CISO, NexusScale Systems</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-10 border-t border-[var(--border-subtle)] px-4 md:px-6 flex items-center justify-center text-[11px] text-[var(--text-secondary)] gap-6">
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
        <span>Security Audit</span>
      </div>
    </div>
  );
}

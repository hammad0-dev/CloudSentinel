import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import api from "../utils/api";
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="hidden lg:flex flex-col justify-center p-12 gap-6">
        <Shield className="w-20 h-20 text-[var(--accent-green)]" />
        <h1 className="text-4xl font-bold">Your Security Command Center</h1>
        <div className="space-y-2 text-[var(--text-secondary)]">
          {["Detect vulnerabilities before deployment", "Real-time security monitoring", "Automated compliance reporting"].map((item) => (
            <p key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[var(--accent-green)]" /> {item}</p>
          ))}
        </div>
        <div className="card p-3 text-sm">3 critical issues detected in auth.js</div>
        <div className="card p-3 text-sm">Last scan completed 2 minutes ago</div>
        <div className="grid grid-cols-2 gap-3">
          <img
            src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80"
            alt="Secure systems"
            className="rounded-md h-24 w-full object-cover border border-[var(--border-subtle)]"
          />
          <img
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
            alt="Threat monitoring"
            className="rounded-md h-24 w-full object-cover border border-[var(--border-subtle)]"
          />
        </div>
      </div>
      <div className="bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
          <p className="text-center text-[var(--accent-green)] font-semibold">CloudSentinel</p>
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-[var(--text-secondary)]">Sign in to your security dashboard</p>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
            <input className="input input-with-icon-left w-full" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
            <input type={showPassword ? "text" : "password"} className="input input-with-icon-both w-full" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <div className="flex justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--text-secondary)]"><input type="checkbox" /> Remember me</label>
            <Link to="/forgot-password" className="text-[var(--accent-green)]">Forgot password?</Link>
          </div>
          <button className="primary-btn w-full" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</button>
          <div className="relative py-2">
            <div className="border-t border-[var(--border-subtle)]" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-[var(--bg-secondary)] px-3 text-xs text-[var(--text-secondary)]">or continue with</span>
          </div>
          <div className={`${googleLoading ? "opacity-70 pointer-events-none" : ""}`}>
            <button
              type="button"
              onClick={() => googleAuth()}
              className="secondary-btn w-full h-11 inline-flex items-center justify-center gap-3 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.224 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.847 1.154 7.966 3.034l5.657-5.657C34.023 6.053 29.259 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.656 16.108 18.961 13 24 13c3.059 0 5.847 1.154 7.966 3.034l5.657-5.657C34.023 6.053 29.259 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.157 0 9.86-1.977 13.409-5.2l-6.19-5.238C29.144 35.091 26.693 36 24 36c-5.203 0-9.617-3.329-11.283-7.946l-6.52 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.563.001-.001 6.19 5.237 6.19 5.237C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Don't have an account? <Link className="text-[var(--accent-green)]" to="/register">Create one free</Link></p>
        </form>
      </div>
    </div>
  );
}

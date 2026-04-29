import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0e1a]">
      <div className="hidden lg:flex flex-col justify-center p-12 gap-6">
        <Shield className="w-20 h-20 text-blue-500 animate-pulse drop-shadow-[0_0_24px_rgba(59,130,246,0.8)]" />
        <h1 className="text-4xl font-bold">Your Security Command Center</h1>
        <div className="space-y-2 text-[#cbd5e1]">
          {["Detect vulnerabilities before deployment", "Real-time security monitoring", "Automated compliance reporting"].map((item) => (
            <p key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> {item}</p>
          ))}
        </div>
        <div className="card p-3 text-sm">3 Critical issues detected in auth.js</div>
        <div className="card p-3 text-sm">Last scan completed 2 minutes ago</div>
        <div className="grid grid-cols-2 gap-3">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
            alt="Secure systems"
            className="rounded-xl h-24 w-full object-cover border border-[#1e2d4a]"
          />
          <img
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
            alt="Threat monitoring"
            className="rounded-xl h-24 w-full object-cover border border-[#1e2d4a]"
          />
        </div>
      </div>
      <div className="bg-[#0f1629] flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
          <p className="text-center text-blue-400 font-semibold">CloudSentinel</p>
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-[#64748b]">Sign in to your security dashboard</p>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
            <input className="input input-with-icon-left w-full" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
            <input type={showPassword ? "text" : "password"} className="input input-with-icon-both w-full" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <div className="flex justify-between text-sm">
            <label className="flex items-center gap-2 text-[#64748b]"><input type="checkbox" /> Remember me</label>
            <Link to="/forgot-password" className="text-blue-400">Forgot password?</Link>
          </div>
          <button className="primary-btn w-full" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</button>
          <p className="text-sm text-[#64748b]">Don't have an account? <Link className="text-blue-400" to="/register">Create one free</Link></p>
        </form>
      </div>
    </div>
  );
}

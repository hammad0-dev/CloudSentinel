import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", agree: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const strength = useMemo(() => {
    const p = form.password;
    if (p.length < 6) return { bars: 1, label: "Weak", color: "bg-red-500" };
    if (p.length >= 10 && /[^a-zA-Z0-9]/.test(p)) return { bars: 4, label: "Very Strong", color: "bg-emerald-500" };
    if (p.length >= 8 && /\d/.test(p)) return { bars: 3, label: "Strong", color: "bg-yellow-500" };
    return { bars: 2, label: "Fair", color: "bg-orange-500" };
  }, [form.password]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.confirm) return toast.error("Please fill all fields");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (!form.agree) return toast.error("Please accept terms");
    try {
      const { data } = await api.post("/auth/register", { fullName: form.fullName, email: form.email, password: form.password });
      login(data);
      toast.success("Account created! Welcome to CloudSentinel");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0e1a]">
      <div className="hidden lg:flex flex-col justify-center p-12 gap-6">
        <h1 className="text-4xl font-bold">Your Security Command Center</h1>
        {["Detect vulnerabilities before deployment", "Real-time security monitoring", "Automated compliance reporting"].map((item) => <p key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" />{item}</p>)}
        <div className="grid grid-cols-2 gap-3">
          <img
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80"
            alt="Cybersecurity dashboard"
            className="rounded-xl h-28 w-full object-cover border border-[#1e2d4a]"
          />
          <img
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
            alt="Security operations"
            className="rounded-xl h-28 w-full object-cover border border-[#1e2d4a]"
          />
        </div>
      </div>
      <div className="bg-[#0f1629] flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-md space-y-4">
          <h2 className="text-3xl font-bold">Create Your Account</h2>
          <p className="text-[#64748b]">Start securing your code in minutes</p>
          <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" /><input className="input input-with-icon-left w-full" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" /><input className="input input-with-icon-left w-full" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" /><input type={showPassword ? "text" : "password"} className="input input-with-icon-both w-full" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          <div className="grid grid-cols-4 gap-1">{Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-2 rounded ${i < strength.bars ? strength.color : "bg-slate-700"}`} />)}</div>
          <p className="text-xs text-[#64748b]">{strength.label}</p>
          <div className="relative"><input type={showConfirm ? "text" : "password"} className="input w-full pr-10" placeholder="Confirm Password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          {form.confirm && form.password !== form.confirm ? <p className="text-red-400 text-xs">Passwords do not match</p> : null}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} /> I agree to Terms of Service and Privacy Policy</label>
          <button className="primary-btn w-full">Create Account</button>
          <p className="text-sm text-[#64748b]">Already have an account? <Link className="text-blue-400" to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}

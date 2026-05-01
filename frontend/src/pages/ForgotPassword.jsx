import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return toast.error("Email is required");
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("If email exists, reset instructions sent");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[radial-gradient(circle_at_top,_#172952_0%,_#0a1226_45%,_#050915_100%)] px-4">
      <div className="w-full max-w-md p-8 text-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/85 backdrop-blur">
        {!sent ? (
          <>
            <p className="text-sm text-[var(--accent-blue)] mb-2 font-semibold">CloudSentinel</p>
            <Lock className="mx-auto text-[var(--accent-blue)] mb-3" />
            <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
            <p className="text-[var(--text-secondary)] mb-4">Enter your email and we will send reset instructions</p>
            <input className="input w-full mb-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <button className="primary-btn w-full" onClick={submit} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link to="/login" className="inline-block text-sm text-[var(--text-secondary)] mt-3 hover:text-[var(--text-primary)]">
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto text-[var(--accent-blue)] mb-3" />
            <h2 className="text-xl font-bold">Check your inbox!</h2>
            <p className="text-[var(--text-secondary)] my-3">We sent password reset instructions to {email}</p>
            <Link to="/login" className="text-[var(--accent-blue)]">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

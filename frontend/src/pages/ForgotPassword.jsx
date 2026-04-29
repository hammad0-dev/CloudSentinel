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
    <div className="min-h-screen grid place-items-center bg-[#0a0e1a] px-4">
      <div className="card w-full max-w-md p-8 text-center">
        {!sent ? (
          <>
            <Lock className="mx-auto text-blue-500 mb-3" />
            <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
            <p className="text-[#64748b] mb-4">Enter your email and we will send reset instructions</p>
            <input className="input w-full mb-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <button className="primary-btn w-full" onClick={submit} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto text-emerald-500 mb-3" />
            <h2 className="text-xl font-bold">Check your inbox!</h2>
            <p className="text-[#64748b] my-3">We sent password reset instructions to {email}</p>
            <Link to="/login" className="text-blue-400">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!token) return toast.error("Missing reset token");
    if (!password || !confirm) return toast.error("All fields are required");
    if (password !== confirm) return toast.error("Passwords do not match");
    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#0a0e1a] px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
        {!done ? (
          <>
            <p className="text-[#64748b] mb-4">Enter your new password.</p>
            <input className="input w-full mb-3" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className="input w-full mb-4" type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <button className="primary-btn w-full" onClick={submit} disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-emerald-400">Password reset successful.</p>
            <Link to="/login" className="text-blue-400">Go to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}

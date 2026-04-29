import { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || "", jobTitle: user?.jobTitle || "", company: user?.company || "" });
  const [tab, setTab] = useState("Profile");
  const save = async () => {
    await api.patch("/auth/profile", form);
    toast.success("Profile updated successfully");
  };
  return (
    <div className="space-y-6">
      <PageHeader title="Account Settings" />
      <div className="grid lg:grid-cols-[220px_1fr] gap-4">
        <div className="card p-3 h-fit">
          {["Profile", "Security", "Notifications", "API Keys", "Team", "Billing"].map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${tab === item ? "bg-blue-600/20 text-blue-400" : "hover:bg-[#111827]"}`}>{item}</button>
          ))}
        </div>
        <div className="card p-6">
          {tab === "Profile" ? (
            <div className="grid gap-3 max-w-2xl">
              <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full Name" />
              <input className="input bg-[#111827]" value={user?.email || ""} readOnly />
              <input className="input" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Job Title" />
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" />
              <input className="input" placeholder="Location" />
              <select className="input"><option>Timezone</option><option>Asia/Karachi</option></select>
              <button className="primary-btn w-fit" onClick={save}>Save Changes</button>
            </div>
          ) : null}
          {tab === "Security" ? (
            <div className="space-y-6">
              <div className="grid gap-3 max-w-xl">
                <h3 className="font-bold">Change Password</h3>
                <input type="password" className="input" placeholder="Current Password" />
                <input type="password" className="input" placeholder="New Password" />
                <input type="password" className="input" placeholder="Confirm New Password" />
                <button className="primary-btn w-fit">Update Password</button>
              </div>
              <div className="card p-4">
                <p className="font-semibold">Two-Factor Authentication</p>
                <label className="flex items-center gap-2 mt-2"><input type="checkbox" /> Enable 2FA</label>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[#64748b]"><th>Device</th><th>Location</th><th>Last Active</th><th /></tr></thead>
                <tbody><tr className="border-t border-[#1e2d4a]"><td>Chrome on Windows</td><td>Rawalpindi, PK</td><td>Now</td><td><button>Revoke</button></td></tr><tr className="border-t border-[#1e2d4a]"><td>Mobile Safari</td><td>Rawalpindi, PK</td><td>2h ago</td><td><button>Revoke</button></td></tr></tbody>
              </table>
            </div>
          ) : null}
          {tab === "Notifications" ? <div className="space-y-3"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Critical vulnerability alerts</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Scan completed</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Weekly security report</label><label className="flex items-center gap-2"><input type="checkbox" /> Marketing updates</label><input className="input max-w-xl" placeholder="Slack webhook URL" /></div> : null}
          {tab === "API Keys" ? <div className="space-y-3"><button className="primary-btn">+ Generate New Key</button><table className="w-full text-sm"><thead><tr className="text-left text-[#64748b]"><th>Name</th><th>Key</th><th>Created</th><th>Last Used</th><th /></tr></thead><tbody><tr className="border-t border-[#1e2d4a]"><td>Production</td><td>cs_live_****xyz</td><td>Jan 1</td><td>2h ago</td><td>Revoke</td></tr><tr className="border-t border-[#1e2d4a]"><td>Development</td><td>cs_dev_****abc</td><td>Jan 15</td><td>Never</td><td>Revoke</td></tr></tbody></table></div> : null}
          {tab === "Team" ? <div className="space-y-3"><button className="primary-btn">+ Invite Member</button><table className="w-full text-sm"><thead><tr className="text-left text-[#64748b]"><th>Name</th><th>Email</th><th>Role</th><th>Last Active</th><th /></tr></thead><tbody><tr className="border-t border-[#1e2d4a]"><td>John Doe</td><td>john@company.com</td><td>Admin</td><td>Now</td><td>-</td></tr><tr className="border-t border-[#1e2d4a]"><td>Sarah Smith</td><td>sarah@company.com</td><td>Developer</td><td>3h ago</td><td>Remove</td></tr></tbody></table></div> : null}
          {tab === "Billing" ? <div className="space-y-2"><p className="text-xl font-bold">Pro Plan</p><p className="text-[#64748b]">$99/month • Next billing: May 1</p><button className="primary-btn">Manage Subscription</button></div> : null}
        </div>
      </div>
    </div>
  );
}

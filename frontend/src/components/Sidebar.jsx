import { NavLink } from "react-router-dom";
import {
  Bell,
  ClipboardCheck,
  Cloud,
  FolderOpen,
  GitBranch,
  KeyRound,
  Layers,
  LayoutDashboard,
  Package,
  Server,
  Shield,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderOpen },
  { to: "/cicd", label: "CI/CD Pipeline", icon: GitBranch },
  { to: "/dependencies", label: "Dependencies", icon: Package },
  { to: "/iac", label: "IaC Security", icon: Server },
  { to: "/cloud", label: "Cloud Deployment", icon: Cloud },
  { to: "/kubernetes", label: "Kubernetes", icon: Layers },
  { to: "/compliance", label: "Compliance", icon: ClipboardCheck },
  { to: "/monitoring", label: "Monitoring", icon: Bell },
  { to: "/secrets", label: "Secrets", icon: KeyRound },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initials = user?.fullName?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() || "CS";

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] z-40">
      <div className="h-12 px-4 flex items-center border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <Shield size={18} className="text-[var(--accent-blue)]" />
          <span className="font-semibold text-sm tracking-wide">CloudSentinel</span>
        </div>
      </div>
      <nav className="p-2 space-y-1 h-[calc(100vh-152px)] overflow-y-auto">
        {links.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 h-10 rounded-md border-l-2 text-sm transition-all ${
                isActive
                  ? "bg-[rgba(47,129,247,0.12)] text-[var(--accent-blue)] border-l-[var(--accent-blue)]"
                  : "border-l-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              }`
            }
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)] text-white grid place-items-center text-xs font-semibold">{initials}</div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-primary)] truncate">{user?.fullName || "User"}</p>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">{user?.email}</p>
          </div>
        </div>
        <NavLink
          to="/settings"
          className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm"
        >
          <Settings size={16} />
          Settings
        </NavLink>
        <button
          onClick={logout}
          className="w-full mt-2 text-sm rounded-md border border-[var(--border)] py-2 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center justify-center gap-2"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}

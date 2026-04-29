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
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
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

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-[#0f1629] border-r border-[#1e2d4a] z-40 transition-all duration-300"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1e2d4a]">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-500" />
          {!collapsed && (
            <span className="font-bold bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">
              CloudSentinel
            </span>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
      </div>
      <nav className="p-2 space-y-1">
        {links.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg border-l-4 ${
                isActive
                  ? "bg-blue-500/10 text-[#3b82f6] border-l-[#3b82f6]"
                  : "border-l-transparent text-[#e2e8f0] hover:bg-[#111827]"
              }`
            }
          >
            <item.icon size={18} />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#1e2d4a]">
        <NavLink to="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#111827] mb-2">
          <Settings size={16} />
          {!collapsed && "Settings"}
        </NavLink>
        {!collapsed && (
          <>
            <p className="text-sm font-semibold">{user?.fullName || "User"}</p>
            <p className="text-xs text-[#64748b] truncate">{user?.email}</p>
          </>
        )}
        <button onClick={logout} className="w-full mt-2 text-sm rounded-lg border border-[#1e2d4a] py-1.5 hover:bg-red-600/20">
          Logout
        </button>
      </div>
    </aside>
  );
}

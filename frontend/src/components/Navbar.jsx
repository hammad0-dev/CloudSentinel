import { Bell, ClipboardCheck, Cloud, FolderOpen, GitBranch, KeyRound, Layers, LayoutDashboard, Package, Search, Server, Shield } from "lucide-react";
import { useLocation, Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const titles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/cicd": "CI/CD Pipeline",
  "/dependencies": "Dependencies & SBOM",
  "/iac": "IaC Security Scanner",
  "/cloud": "Cloud Security Posture",
  "/kubernetes": "Kubernetes Security",
  "/compliance": "Compliance Dashboard",
  "/monitoring": "Monitoring & Alerts",
  "/secrets": "Secrets & Credentials Detection",
  "/settings": "Account Settings",
};

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderOpen },
  { to: "/cicd", label: "CI/CD", icon: GitBranch },
  { to: "/dependencies", label: "Dependencies", icon: Package },
  { to: "/iac", label: "IaC", icon: Server },
  { to: "/cloud", label: "Cloud", icon: Cloud },
  { to: "/kubernetes", label: "Kubernetes", icon: Layers },
  { to: "/compliance", label: "Compliance", icon: ClipboardCheck },
  { to: "/monitoring", label: "Monitoring", icon: Bell },
  { to: "/secrets", label: "Secrets", icon: KeyRound },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  return (
    <header className="bg-[#0f1629] border-b border-[#1e2d4a] sticky top-0 z-40">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Shield className="text-blue-500" size={18} />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">CloudSentinel</span>
          </div>
          <h2 className="font-bold text-lg hidden md:block">{titles[pathname] || "CloudSentinel"}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-[#111827]"><Search size={18} /></button>
          <button className="relative p-2 rounded-lg hover:bg-[#111827]">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] rounded-full bg-red-500 grid place-items-center">3</span>
          </button>
          <Link to="/settings" className="text-sm text-[#64748b] hover:text-white">Settings</Link>
          <Link to="/settings" className="w-9 h-9 rounded-full bg-blue-600 grid place-items-center text-sm font-semibold">
            {user?.fullName?.split(" ").map((s) => s[0]).join("").slice(0, 2) || "CS"}
          </Link>
          <button onClick={logout} className="text-sm text-[#64748b] hover:text-white">Logout</button>
        </div>
      </div>
      <div className="px-4 pb-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
                  isActive ? "bg-blue-500/10 text-[#3b82f6] border-blue-500/40" : "border-[#1e2d4a] hover:bg-[#111827]"
                }`
              }
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

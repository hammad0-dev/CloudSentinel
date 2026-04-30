import { Bell, Search, Settings } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const titles = {
  "/dashboard": "Security Overview",
  "/projects": "Projects",
  "/cicd": "CI/CD",
  "/dependencies": "Dependencies",
  "/iac": "IaC",
  "/cloud": "Cloud",
  "/kubernetes": "Kubernetes",
  "/compliance": "Compliance",
  "/monitoring": "Monitoring",
  "/secrets": "Secrets",
  "/settings": "Settings",
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const rootPath = `/${pathname.split("/").filter(Boolean)[0] || "dashboard"}`;
  const crumb = titles[rootPath] || "CloudSentinel";
  const leaf = pathname.includes("/sast")
    ? "SAST Results"
    : pathname.includes("/dast")
      ? "DAST Results"
      : pathname.match(/^\/projects\/\w+/)
        ? "Project Details"
        : null;

  const links = [
    ["/dashboard", "Dashboard"],
    ["/projects", "Projects"],
    ["/cicd", "CI/CD"],
    ["/dependencies", "Dependencies"],
    ["/iac", "IaC"],
    ["/cloud", "Cloud"],
    ["/kubernetes", "Kubernetes"],
    ["/compliance", "Compliance"],
    ["/monitoring", "Monitoring"],
    ["/secrets", "Secrets"],
  ];

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
      <div className="h-12 px-6 flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">CloudSentinel</div>
        <div className="text-sm hidden md:block">
          <span className="text-[var(--text-secondary)]">{crumb}</span>
          {leaf ? <span className="text-[var(--text-tertiary)]"> / </span> : null}
          {leaf ? <span className="text-[var(--text-primary)]">{leaf}</span> : null}
        </div>
        <div className="flex items-center gap-1.5">
          <button className="p-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Search size={16} />
          </button>
          <button className="relative p-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Bell size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] rounded-full bg-[var(--accent-red)] text-white grid place-items-center">3</span>
          </button>
          <Link to="/settings" className="p-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Settings size={16} />
          </Link>
          <button onClick={logout} className="secondary-btn py-1.5 text-xs">
            Logout
          </button>
        </div>
      </div>
      <div className="px-6 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm border transition-all ${
                  isActive
                    ? "border-[var(--accent-green)] text-[var(--accent-green)] bg-[rgba(47,111,79,0.10)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

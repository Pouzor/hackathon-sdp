import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Shield,
  Zap,
  Globe,
  Calendar,
  Activity,
  Award,
  Trophy,
  LogOut,
  Radio,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/astronauts", label: "Astronautes", icon: Users },
  { to: "/roles", label: "Rôles", icon: Shield },
  { to: "/attributions/new", label: "Attribution", icon: Zap },
  { to: "/planets", label: "Planètes", icon: Globe },
  { to: "/seasons", label: "Saisons", icon: Calendar },
  { to: "/activities", label: "Activités", icon: Activity },
  { to: "/grades", label: "Grades", icon: Award },
  { to: "/trophies", label: "Trophées", icon: Trophy },
];

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-space-900 font-exo">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col bg-space-800 border-r border-space-500">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-space-500">
          <div className="flex items-center gap-2 mb-0.5">
            <Radio size={13} className="text-neon-cyan shrink-0" />
            <span className="font-orbitron text-[10px] font-semibold tracking-widest text-neon-cyan uppercase">
              Mission Control
            </span>
          </div>
          <p className="text-xs text-space-300 pl-[21px]">Site des Planètes</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map(({ to, label, end, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-all border-l-2 ${
                      isActive
                        ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan"
                        : "text-space-300 hover:bg-space-700 hover:text-slate-200 border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={14}
                        className={isActive ? "text-neon-cyan" : "text-space-300"}
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-t border-space-500">
          <p className="truncate text-xs font-medium text-space-300 mb-1.5">{user?.email}</p>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-space-300 hover:text-neon-red transition-colors"
          >
            <LogOut size={11} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col dot-grid">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

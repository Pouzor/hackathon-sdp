import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/astronauts", label: "Astronautes" },
  { to: "/roles", label: "Rôles" },
  { to: "/attributions/new", label: "Attribuer des points" },
  { to: "/planets", label: "Planètes" },
  { to: "/seasons", label: "Saisons" },
  { to: "/activities", label: "Activités" },
  { to: "/grades", label: "Grades" },
  { to: "/trophies", label: "Trophées" },
];

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r bg-gray-50">
        <div className="border-b px-6 py-4">
          <h1 className="text-base font-bold text-gray-900">Site des Planètes</h1>
          <p className="text-xs text-gray-400">Back-office admin</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-600 font-medium text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* User info + logout */}
        <div className="border-t px-4 py-3">
          <p className="truncate text-xs font-medium text-gray-700">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-1 text-xs text-gray-400 hover:text-red-500"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

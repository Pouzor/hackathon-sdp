import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/planets", label: "Planètes" },
  { to: "/astronauts", label: "Astronautes" },
  { to: "/seasons", label: "Saisons" },
  { to: "/activities", label: "Activités" },
  { to: "/grades", label: "Grades" },
  { to: "/attributions/new", label: "Attribuer des points" },
  { to: "/trophies", label: "Trophées" },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50">
        <div className="border-b px-6 py-4">
          <h1 className="text-lg font-bold">Admin — Planètes</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-b px-6 py-4">
          <span className="text-sm text-gray-500">Back-office Eleven Labs</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

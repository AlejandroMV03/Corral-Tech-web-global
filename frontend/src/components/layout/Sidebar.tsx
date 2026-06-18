import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Ranchos", path: "/ranchos" },
  { label: "Usuarios plataforma", path: "/usuarios-plataforma" },
  { label: "Usuarios por rancho", path: "/usuarios-rancho" },
  { label: "Roles y permisos", path: "/roles-permisos" },
  { label: "Reportes", path: "/reportes" },
  { label: "Auditoría", path: "/auditoria" },
  { label: "Configuración", path: "/configuracion" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-emerald-800">CorralTech</h1>
        <p className="text-sm text-slate-500">Web Global</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-emerald-700 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
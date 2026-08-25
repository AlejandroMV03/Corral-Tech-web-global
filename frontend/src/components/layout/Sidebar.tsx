import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  UserCheck, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import logoCorralTech from "../../assets/Logo.png";

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({}: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("ranchos");

  const toggleSubmenu = (menu: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSubmenu(menu);
      return;
    }
    setOpenSubmenu(prevMenu => (prevMenu === menu ? null : menu));
  };

  return (
    <aside 
      className={`relative h-screen sticky top-0 z-30 bg-[#264575] text-white flex flex-col justify-between shadow-xl select-none transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed ? "w-20 min-w-[80px] max-w-[80px]" : "w-72 min-w-[288px] max-w-[288px]"
      }`}
    >
      {/* BOTÓN FLOTANTE DE FLECHA PARA COLAPSAR / EXPANDIR */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-7 bg-white text-[#264575] hover:text-[#822420] hover:bg-amber-50 border border-gray-200 shadow-md rounded-full p-1.5 transition-all z-40 focus:outline-none flex items-center justify-center active:scale-95"
        title={isCollapsed ? "Expandir menú lateral" : "Ocultar menú lateral"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        ) : (
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        )}
      </button>

      <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
        {/* LOGO Y ENCABEZADO */}
        <div className="p-5 bg-[#1f3961] flex flex-col items-center justify-center border-b border-[#32578f] min-h-[90px] transition-all">
          {!isCollapsed ? (
            <>
              <img 
                src={logoCorralTech} 
                alt="CorralTech Logo" 
                className="w-32 h-auto object-contain transition-all" 
              />
              <span className="text-[11px] text-orange-200 mt-1 font-semibold tracking-wider uppercase">
                Web Global
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="font-black text-lg text-amber-400 tracking-tighter">CT</span>
              <span className="text-[9px] text-orange-200 font-bold uppercase tracking-widest">Global</span>
            </div>
          )}
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className={`py-4 space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}>
          
          {/* 1. DASHBOARD GLOBAL */}
          <NavLink
            to="/dashboard"
            title="Dashboard Global"
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "space-x-3 px-4 py-2.5"} rounded-xl font-medium tracking-wide transition-all duration-150 ${
                isActive ? "bg-[#822420] text-white shadow-md font-bold" : "text-blue-100 hover:bg-[#1f3961]"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 opacity-90" />
            {!isCollapsed && <span>Dashboard Global</span>}
          </NavLink>

          {/* 2. RANCHOS / CLIENTES */}
          <div>
            <button
              type="button"
              onClick={() => toggleSubmenu("ranchos")}
              title="Ranchos / Clientes"
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-2.5"} rounded-xl font-medium tracking-wide transition-all duration-150 text-blue-100 hover:bg-[#1f3961] ${
                location.pathname.includes("ranchos") ? "text-white font-semibold bg-[#1f3961]/50" : ""
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                <Layers className="w-5 h-5 shrink-0 opacity-90" />
                {!isCollapsed && <span>Ranchos / Clientes</span>}
              </div>
              {!isCollapsed && (
                openSubmenu === "ranchos" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            
            {openSubmenu === "ranchos" && !isCollapsed && (
              <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
                <NavLink 
                  to="/ranchos" 
                  end 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Lista de ranchos
                </NavLink>
                <NavLink 
                  to="/ranchos/crear" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Crear rancho
                </NavLink>
              </div>
            )}
          </div>

          {/* 3. USUARIOS PLATAFORMA */}
          <div>
            <button
              type="button"
              onClick={() => toggleSubmenu("usuariosPlataforma")}
              title="Usuarios Plataforma"
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-2.5"} rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
                location.pathname.includes("usuarios-plataforma") ? "text-white font-semibold bg-[#1f3961]/50" : ""
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                <Users className="w-5 h-5 shrink-0 opacity-90" />
                {!isCollapsed && <span>Usuarios Plataforma</span>}
              </div>
              {!isCollapsed && (
                openSubmenu === "usuariosPlataforma" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            {openSubmenu === "usuariosPlataforma" && !isCollapsed && (
              <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
                <NavLink 
                  to="/usuarios-plataforma/dueno-global" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Dueño Global
                </NavLink>
                <NavLink 
                  to="/usuarios-plataforma/administradores" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Administradores
                </NavLink>
                <NavLink 
                  to="/usuarios-plataforma/soporte-global" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Soporte Global
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. USUARIOS POR RANCHO */}
          <div>
            <button
              type="button"
              onClick={() => toggleSubmenu("usuariosRancho")}
              title="Usuarios por Rancho"
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-2.5"} rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
                location.pathname.includes("usuarios-rancho") ? "text-white font-semibold bg-[#1f3961]/50" : ""
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                <UserCheck className="w-5 h-5 shrink-0 opacity-90" />
                {!isCollapsed && <span>Usuarios por Rancho</span>}
              </div>
              {!isCollapsed && (
                openSubmenu === "usuariosRancho" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            {openSubmenu === "usuariosRancho" && !isCollapsed && (
              <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
                <NavLink 
                  to="/usuarios-rancho" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Administrar Cuentas
                </NavLink>
              </div>
            )}
          </div>

          {/* 5. REPORTES GLOBALES */}
          <div>
            <button
              type="button"
              onClick={() => toggleSubmenu("reportes")}
              title="Reportes Globales"
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-2.5"} rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
                location.pathname.includes("reportes") ? "text-white font-semibold bg-[#1f3961]/50" : ""
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                <BarChart3 className="w-5 h-5 shrink-0 opacity-90" />
                {!isCollapsed && <span>Reportes Globales</span>}
              </div>
              {!isCollapsed && (
                openSubmenu === "reportes" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            {openSubmenu === "reportes" && !isCollapsed && (
              <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
                <NavLink 
                  to="/reportes" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Reporte de Ranchos
                </NavLink>
              </div>
            )}
          </div>

          {/* 6. AUDITORÍA GLOBAL */}
          <div>
            <button
              type="button"
              onClick={() => toggleSubmenu("auditoria")}
              title="Auditoría Global"
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-2.5"} rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
                location.pathname.includes("auditoria") ? "text-white font-semibold bg-[#1f3961]/50" : ""
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                <ShieldCheck className="w-5 h-5 shrink-0 opacity-90" />
                {!isCollapsed && <span>Auditoría Global</span>}
              </div>
              {!isCollapsed && (
                openSubmenu === "auditoria" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            {openSubmenu === "auditoria" && !isCollapsed && (
              <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
                <NavLink 
                  to="/auditoria" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Cambios Administrativos
                </NavLink>
              </div>
            )}
          </div>

          {/* 7. CONFIGURACIÓN GLOBAL */}
          <div>
            <button
              type="button"
              onClick={() => toggleSubmenu("configuracion")}
              title="Configuración Global"
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-2.5"} rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
                location.pathname.includes("configuracion") ? "text-white font-semibold bg-[#1f3961]/50" : ""
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                <Settings className="w-5 h-5 shrink-0 opacity-90" />
                {!isCollapsed && <span>Configuración Global</span>}
              </div>
              {!isCollapsed && (
                openSubmenu === "configuracion" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </button>
            {openSubmenu === "configuracion" && !isCollapsed && (
              <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
                <NavLink 
                  to="/configuracion" 
                  className={({ isActive }) => 
                    `block px-4 py-2 text-xs rounded-lg transition-colors ${isActive ? "text-white bg-[#822420] font-bold shadow-sm" : "text-blue-200 hover:text-white hover:bg-[#1f3961]/60"}`
                  }
                >
                  Control General
                </NavLink>
              </div>
            )}
          </div>

        </nav>
      </div>
    </aside>
  );
}
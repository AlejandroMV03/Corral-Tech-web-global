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
  User, 
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import logoCorralTech from "../../assets/Logo.png";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("ranchos");

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(prevMenu => (prevMenu === menu ? null : menu));
  };

  return (
    <aside className="w-72 bg-[#264575] text-white flex flex-col min-h-screen shadow-xl select-none">
      
      <div className="p-6 bg-[#1f3961] flex flex-col items-center justify-center border-b border-[#32578f]">
        <img 
          src={logoCorralTech} 
          alt="CorralTech Logo" 
          className="w-32 h-auto object-contain" 
        />
        <span className="text-xs text-orange-200 mt-1 font-semibold tracking-wider uppercase">Web Global</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        
        {/* 1. DASHBOARD GLOBAL */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium tracking-wide transition-all duration-150 ${
              isActive ? "bg-[#822420] text-white shadow-md font-bold" : "text-blue-100 hover:bg-[#1f3961]"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 opacity-90" />
          <span>Dashboard Global</span>
        </NavLink>

        {/* 2. RANCHOS / CLIENTES */}
        <div>
          <button
            onClick={() => toggleSubmenu("ranchos")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium tracking-wide transition-all duration-150 text-blue-100 hover:bg-[#1f3961] ${
              location.pathname.includes("ranchos") ? "text-white font-semibold" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 opacity-90" />
              <span>Ranchos / Clientes</span>
            </div>
            {openSubmenu === "ranchos" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>
          
          {openSubmenu === "ranchos" && (
            <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
              <NavLink 
                to="/ranchos" 
                end 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm rounded-lg ${isActive ? "text-white bg-[#822420] font-semibold shadow-sm" : "text-blue-200 hover:text-white"}`
                }
              >
                Lista de ranchos
              </NavLink>
              <NavLink 
                to="/ranchos/crear" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm rounded-lg ${isActive ? "text-white bg-[#822420] font-semibold shadow-sm" : "text-blue-200 hover:text-white"}`
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
            onClick={() => toggleSubmenu("usuariosPlataforma")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
              location.pathname.includes("usuarios-plataforma") ? "text-white font-semibold" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 opacity-90" />
              <span>Usuarios Plataforma</span>
            </div>
            {openSubmenu === "usuariosPlataforma" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>
          {openSubmenu === "usuariosPlataforma" && (
            <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
              <NavLink 
                to="/usuarios-plataforma/dueno-global" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm rounded-lg ${isActive ? "text-white bg-[#822420] font-semibold shadow-sm" : "text-blue-200 hover:text-white"}`
                }
              >
                Dueño Global
              </NavLink>
              <NavLink 
                to="/usuarios-plataforma/administradores" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm rounded-lg ${isActive ? "text-white bg-[#822420] font-semibold shadow-sm" : "text-blue-200 hover:text-white"}`
                }
              >
                Administradores
              </NavLink>
              <NavLink 
                to="/usuarios-plataforma/soporte-global" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm rounded-lg ${isActive ? "text-white bg-[#822420] font-semibold shadow-sm" : "text-blue-200 hover:text-white"}`
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
            onClick={() => toggleSubmenu("usuariosRancho")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
              location.pathname.includes("usuarios-rancho") ? "text-white font-semibold" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5 opacity-90" />
              <span>Usuarios por Rancho</span>
            </div>
            {openSubmenu === "usuariosRancho" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>
          {openSubmenu === "usuariosRancho" && (
            <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
              <NavLink 
                to="/usuarios-rancho" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm rounded-lg ${isActive ? "text-white bg-[#822420] font-semibold shadow-sm" : "text-blue-200 hover:text-white"}`
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
            onClick={() => toggleSubmenu("reportes")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
              location.pathname.includes("reportes") ? "text-white font-semibold" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 opacity-90" />
              <span>Reportes Globales</span>
            </div>
            {openSubmenu === "reportes" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>
          {openSubmenu === "reportes" && (
            <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
              <NavLink to="/reportes" className="block px-4 py-2 text-sm text-blue-200 hover:text-white">Reporte de Ranchos </NavLink>
            </div>
          )}
        </div>

        {/* 6. AUDITORÍA GLOBAL */}
        <div>
          <button
            onClick={() => toggleSubmenu("auditoria")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
              location.pathname.includes("auditoria") ? "text-white font-semibold" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 opacity-90" />
              <span>Auditoría Global</span>
            </div>
            {openSubmenu === "auditoria" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>
          {openSubmenu === "auditoria" && (
            <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
              <NavLink to="/auditoria" className="block px-4 py-2 text-sm text-blue-200 hover:text-white">Cambios Administrativos</NavLink>
            </div>
          )}
        </div>

        {/* 7. CONFIGURACIÓN GLOBAL */}
        <div>
          <button
            onClick={() => toggleSubmenu("configuracion")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-blue-100 hover:bg-[#1f3961] ${
              location.pathname.includes("configuracion") ? "text-white font-semibold" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 opacity-90" />
              <span>Configuración Global</span>
            </div>
            {openSubmenu === "configuracion" ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>
          {openSubmenu === "configuracion" && (
            <div className="mt-1 ml-6 pl-2 border-l border-[#32578f] space-y-1 animate-fade-in">
              <NavLink to="/configuracion" className="block px-4 py-2 text-sm text-blue-200 hover:text-white">Control General </NavLink>
            </div>
          )}
        </div>

      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="p-4 border-t border-[#32578f]">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-red-200 hover:bg-[#822420] hover:text-white font-medium transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  UserCircle,
  Building,
  Users,
  FileText,
  Shield,
  Sliders,
  X,
  Loader2,
  ChevronRight,
  LogOut
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface TopbarProps {
  onLogout?: () => void;
}

// CATÁLOGO DE RUTAS RÁPIDAS DEL SISTEMA
const PAGINAS_SISTEMA = [
  { nombre: "Dashboard Global", ruta: "/dashboard", icono: Sliders },
  { nombre: "Lista de Ranchos / Clientes", ruta: "/ranchos", icono: Building },
  { nombre: "Crear Nuevo Rancho", ruta: "/ranchos/crear", icono: Building },
  { nombre: "Usuarios Plataforma", ruta: "/usuarios-plataforma", icono: Users },
  { nombre: "Usuarios por Rancho", ruta: "/usuarios-rancho", icono: Users },
  { nombre: "Reportes Globales", ruta: "/reportes", icono: FileText },
  { nombre: "Auditoría Global", ruta: "/auditoria", icono: Shield },
  { nombre: "Configuración Global (RBAC)", ruta: "/configuracion", icono: Sliders },
  { nombre: "Mi Perfil de Usuario", ruta: "/perfil", icono: UserCircle },
];

export default function Topbar({ onLogout }: TopbarProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ranchosResult, setRanchosResult] = useState<any[]>([]);

  const token = localStorage.getItem("corraltech_token");

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("corraltech_token");
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setRanchosResult([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/v1/master/ranchos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filtrados = (res.data || []).filter((r: any) =>
          r.nombre.toLowerCase().includes(query.toLowerCase()) ||
          (r.propietario && r.propietario.toLowerCase().includes(query.toLowerCase()))
        );
        setRanchosResult(filtrados.slice(0, 4));
      } catch (err) {
        console.error("Error al buscar en backend:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, token]);

  const paginasFiltradas = PAGINAS_SISTEMA.filter(p =>
    p.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectRoute = (ruta: string) => {
    navigate(ruta);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm relative z-30 sticky top-0">
      
      <div 
        onClick={() => navigate("/perfil")}
        className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-gray-100/60 transition-all"
        title="Ver mi perfil"
      >
        <UserCircle className="w-10 h-10 text-[#264575]" />
        <div className="flex flex-col">
          <p className="text-sm font-bold text-gray-800 leading-tight">
            ¡Hola, AndrésOHT!
          </p>
          <span className="text-xs text-[#885f3a] font-semibold">
            Dueño Global (DG)
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-[#F3F4F6] border border-gray-300 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#264575] text-gray-800 placeholder-gray-400 transition-all shadow-inner"
            placeholder="Buscar páginas, ranchos o módulos del sistema..."
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isOpen && query.trim().length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50 animate-fade-in">
            
            {paginasFiltradas.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <span className="block px-3 py-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Navegación Rápida
                </span>
                {paginasFiltradas.map((pag, idx) => {
                  const Icono = pag.icono;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectRoute(pag.ruta)}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-blue-50/60 rounded-xl transition-colors text-left group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-[#264575]/10 text-[#264575] rounded-lg group-hover:bg-[#264575] group-hover:text-white transition-colors">
                          <Icono className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 group-hover:text-[#264575]">
                          {pag.nombre}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#264575]" />
                    </button>
                  );
                })}
              </div>
            )}

            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400 font-bold flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#264575]" />
                <span>Buscando en la base de datos...</span>
              </div>
            ) : (
              ranchosResult.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <span className="block px-3 py-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    Ranchos Registrados
                  </span>
                  {ranchosResult.map((r) => (
                    <button
                      key={r.id_rancho}
                      type="button"
                      onClick={() => handleSelectRoute("/ranchos")}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-amber-50/60 rounded-xl transition-colors text-left group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-amber-100 text-[#885f3a] rounded-lg">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-800">{r.nombre}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{r.propietario || "Sin Propietario"}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#885f3a]" />
                    </button>
                  ))}
                </div>
              )
            )}

            {!loading && paginasFiltradas.length === 0 && ranchosResult.length === 0 && (
              <div className="p-6 text-center text-xs font-bold text-gray-400">
                No se encontraron coincidencias para "{query}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* CERRAR SESIÓN */}
      <div className="flex items-center">
        <button 
          type="button" 
          onClick={handleLogoutAction}
          className="flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-red-700 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all border border-red-200/80 shadow-sm"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>

    </header>
  );
}
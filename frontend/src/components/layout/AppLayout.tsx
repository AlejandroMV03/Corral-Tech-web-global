import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AppLayoutProps {
  onLogout: () => void;
}

export default function AppLayout({ onLogout }: AppLayoutProps) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    const validarSesionAlRecargar = async () => {
      const token = localStorage.getItem("corraltech_token");

      if (!token) {
        setVerificandoSesion(false);
        onLogout();
        navigate("/login", { replace: true });
        return;
      }

      // Configurar token en los encabezados globales de Axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // Validar token activo contra el endpoint de perfil
        await axios.get(`${API_URL}/master/perfil`);
      } catch (error) {
        // Token expirado o corrupto
        localStorage.removeItem("corraltech_token");
        localStorage.removeItem("corraltech_user");
        delete axios.defaults.headers.common["Authorization"];
        onLogout();
        navigate("/login", { replace: true });
      } finally {
        setVerificandoSesion(false);
      }
    };

    validarSesionAlRecargar();
  }, [navigate, onLogout]);

  const abrirModal = () => setShowLogoutModal(true);
  const cerrarModal = () => setShowLogoutModal(false);

  if (verificandoSesion) {
    return (
      <div className="min-h-screen bg-[#fff8ed] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#264575] animate-spin" />
        <span className="text-xs font-bold text-[#885f3a] tracking-wider">
          Verificando sesión activa...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fff8ed] font-sans antialiased text-gray-800 relative">
      <Sidebar onLogout={abrirModal} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onLogout={abrirModal} />

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={cerrarModal}
          ></div>

          {/* Ventana del Modal */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 relative z-10 transform transition-all text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#822420]/10 mb-4">
              <AlertTriangle className="h-7 w-7 text-[#822420]" />
            </div>
            <h3 className="text-xl font-black text-[#264575] tracking-tight mb-2">
              ¿Cerrar Sesión?
            </h3>
            <p className="text-sm font-medium text-gray-500 px-2 leading-relaxed">
              ¿Estás seguro de que deseas salir de CorralTech? Tendrás que introducir tus credenciales de nuevo para acceder.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
              <button
                type="button"
                onClick={cerrarModal}
                className="w-full sm:w-28 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  cerrarModal();
                  onLogout(); 
                }}
                className="w-full sm:w-32 py-2.5 text-sm font-bold text-white bg-[#822420] hover:bg-[#681c19] rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 focus:outline-none"
              >
                <LogOut className="w-4 h-4" />
                <span>Confirmar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
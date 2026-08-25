import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Shield,
  Mail,
  Edit3,
  Save,
  X,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { sanitizarTexto } from "../../lib/sanitizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface PerfilData {
  id_usuario: number;
  nombres: string;
  apellidos?: string;
  username: string;
  email: string;
  rol_nombre: string;
  rol_scope: string;
  activo: boolean;
  fecha_creacion?: string;
}

export default function PerfilPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Formulario Editable
  const [formData, setFormData] = useState({ nombres: "", apellidos: "", email: "" });

  // Modal Notificación
  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", message: "" });

  const getHeaders = () => {
    const token = localStorage.getItem("corraltech_token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchPerfil = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master/perfil`, { headers: getHeaders() });
      setPerfil(res.data);
      setFormData({
        nombres: res.data.nombres || "",
        apellidos: res.data.apellidos || "",
        email: res.data.email || ""
      });
    } catch (error: any) {
      console.error("Error al obtener perfil:", error);
      setStatusModal({ open: true, type: "error", message: "No se pudieron obtener los datos del perfil." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const handleToggleEditOrSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si está en modo lectura, activamos modo edición
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // Sanitización antes de enviar
    const payload = {
      nombres: sanitizarTexto(formData.nombres, 14),
      apellidos: sanitizarTexto(formData.apellidos, 14),
      email: formData.email.trim().toLowerCase()
    };

    setGuardando(true);
    try {
      await axios.patch(`${API_URL}/master/perfil`, payload, { headers: getHeaders() });
      setStatusModal({ open: true, type: "success", message: "Tu perfil se ha actualizado correctamente." });
      setIsEditing(false);
      fetchPerfil();
    } catch (error: any) {
      setStatusModal({ open: true, type: "error", message: error.response?.data?.detail || "Error al actualizar perfil." });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    if (isEditing) {
      setIsEditing(false);
      if (perfil) {
        setFormData({
          nombres: perfil.nombres || "",
          apellidos: perfil.apellidos || "",
          email: perfil.email || ""
        });
      }
    } else {
      navigate("/dashboard-global");
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* CONTENEDOR MODAL PRINCIPAL */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden relative transition-all">
        
        {/* ENCABEZADO DECORATIVO */}
        <div className="bg-gradient-to-r from-[#1d3356] via-[#264575] to-[#1d3356] p-6 text-white relative">
          <button
            onClick={() => navigate("/dashboard-global")}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Cerrar y volver al Dashboard"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <User className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-white">Mi Perfil de Usuario</h2>
              <p className="text-xs font-semibold text-amber-200/90">CorralTech v2.0 • Credenciales Centrales</p>
            </div>
          </div>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-6 md:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-[#264575] animate-spin" />
              <p className="text-xs font-bold text-gray-400">Cargando información del usuario...</p>
            </div>
          ) : (
            <form onSubmit={handleToggleEditOrSave} className="space-y-6">
              
              {/* RESUMEN DE ROL Y ESTADO */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                  <Shield className="w-4 h-4 text-[#264575]" />
                  <div>
                    <span className="block text-[10px] font-extrabold text-gray-400 uppercase">Rol Asignado</span>
                    <span className="text-xs font-black text-[#264575]">{perfil?.rol_nombre || "Dueño Global"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="block text-[10px] font-extrabold text-gray-400 uppercase">Estado Cuenta</span>
                    <span className="text-xs font-black text-emerald-600">
                      {perfil?.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CAMPOS DE FORMULARIO */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NOMBRE */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">
                      Nombre(s) *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={formData.nombres}
                        onChange={(e) => setFormData({ ...formData, nombres: sanitizarTexto(e.target.value, 14) })}
                        placeholder="Máx 14 caracteres"
                        className="w-full px-4 py-2.5 bg-amber-50/20 border-2 border-[#264575] rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#264575]/20 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-bold text-gray-800">
                        {perfil?.nombres || "—"}
                      </div>
                    )}
                  </div>

                  {/* APELLIDOS */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">
                      Apellido(s)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        maxLength={14}
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: sanitizarTexto(e.target.value, 14) })}
                        placeholder="Máx 14 caracteres"
                        className="w-full px-4 py-2.5 bg-amber-50/20 border-2 border-[#264575] rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#264575]/20 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-bold text-gray-800">
                        {perfil?.apellidos || "—"}
                      </div>
                    )}
                  </div>
                </div>

                {/* CORREO ELECTRÓNICO */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">
                    Correo Electrónico *
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      required
                      maxLength={100}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.replace(/\s+/g, "") })}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-4 py-2.5 bg-amber-50/20 border-2 border-[#264575] rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#264575]/20 transition-all"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between">
                      <span>{perfil?.email || "—"}</span>
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* USERNAME (SOLO LECTURA) */}
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-1">
                    Nombre de Usuario (Identificador Único)
                  </label>
                  <div className="px-4 py-2.5 bg-gray-100/70 border border-gray-200/50 rounded-xl text-xs font-mono font-bold text-gray-500">
                    @{perfil?.username}
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isEditing ? "Cancelar Edición" : "Volver al Dashboard"}</span>
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-2 transition-all ${
                    isEditing
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-[#264575] hover:bg-[#1d3356]"
                  }`}
                >
                  {guardando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEditing ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                  <span>{isEditing ? "Guardar Cambios" : "Editar Datos"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* MODAL STATUS NOTIFICACIÓN */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 text-center shadow-2xl border border-gray-50 space-y-3">
            <div className="flex justify-center">
              {statusModal.type === "success" ? (
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              ) : (
                <XCircle className="w-10 h-10 text-rose-600" />
              )}
            </div>
            <p className="text-xs font-bold text-gray-800 leading-relaxed">{statusModal.message}</p>
            <button
              type="button"
              onClick={() => setStatusModal({ ...statusModal, open: false })}
              className="w-full py-2 bg-[#264575] text-white text-xs font-bold rounded-xl shadow"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
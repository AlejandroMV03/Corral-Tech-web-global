import { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Key } from "lucide-react";

const API_URL = "http://192.168.1.71:8000";

interface DueñoGlobal {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
}

export default function UsuariosPlataformaPage() {
  const [usuarios, setUsuarios] = useState<DueñoGlobal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({ nombres: "", apellidos: "", username: "", email: "", password: "" });
  const [usuarioEditando, setUsuarioEditando] = useState<DueñoGlobal | null>(null);
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "" });
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });
  const token = localStorage.getItem("corraltech_token");
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/v1/master/dueños-globales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar el listado de dueños globales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  // REGISTRAR NUEVO DUEÑO GLOBAL
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/v1/master/dueños-globales`, formCrear, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalCrearOpen(false);
      setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "" });
      mostrarStatus("success", "Cuenta de Dueño Global creada exitosamente.");
      cargarUsuarios();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudo registrar la cuenta.");
    }
  };

  // GUARDAR EDICIÓN DE USUARIO
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;

    try {
      await axios.put(`${API_URL}/api/v1/master/dueños-globales/${usuarioEditando.id_usuario}`, formEdit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      mostrarStatus("success", "Datos de la cuenta actualizados correctamente.");
      cargarUsuarios();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al actualizar la cuenta.");
    }
  };

  // CAMBIAR ACCESO / ESTADO
  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      await axios.patch(`${API_URL}/api/v1/master/dueños-globales/${id}/estado?activo=${nuevoEstado}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(usuarios.map(u => u.id_usuario === id ? { ...u, activo: nuevoEstado } : u));
      mostrarStatus("success", `Estatus de cuenta modificado correctamente.`);
    } catch (err) {
      mostrarStatus("error", "No se pudo cambiar el estado de acceso del usuario.");
    }
  };

  const abrirEdicion = (u: DueñoGlobal) => {
    setUsuarioEditando(u);
    setFormEdit({ nombres: u.nombres, apellidos: u.apellidos || "", email: u.email || "" });
    setModalEdicionOpen(true);
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      
      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Administración de Dueños Globales</h1>
          <p className="text-sm font-semibold text-[#885f3a]">Módulo de Seguridad y Cuentas de Nivel Raíz (DG)</p>
        </div>
        <button 
          onClick={() => setModalCrearOpen(true)}
          className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Dueño Global</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3.5 rounded-xl shadow-sm max-w-md transition-all focus-within:border-[#264575] focus-within:ring-1 focus-within:ring-[#264575]">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, usuario o email..." 
          className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium"
        />
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Cargando credenciales maestras...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">
            No se encontraron usuarios administradores globales registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">UID</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email Corporativo</th>
                  <th className="px-6 py-4 text-center">Acceso Sistema</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">
                      #{String(u.id_usuario).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-base">
                      {u.nombres} {u.apellidos || ""}
                    </td>
                    <td className="px-6 py-4 text-[#885f3a] font-mono text-xs bg-amber-50/40 px-2 py-1 rounded-md inline-block my-3 ml-4">
                      @{u.username}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">{u.email || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleToggleEstado(u.id_usuario, u.activo)}
                        className="focus:outline-none transition-transform active:scale-95 inline-block align-middle"
                      >
                        {u.activo ? (
                          <ToggleRight className="w-9 h-9 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => abrirEdicion(u)}
                        className="p-2 text-[#264575] hover:bg-[#264575]/10 rounded-xl transition-all inline-block"
                        title="Editar cuenta"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalCrearOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form onSubmit={handleCrearUsuario} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#264575]">Registrar Nuevo Dueño Global</h3>
              <p className="text-xs font-bold text-[#885f3a]">Generación de credenciales con privilegios raíz</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                  <input type="text" required value={formCrear.nombres} onChange={(e) => setFormCrear({ ...formCrear, nombres: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                  <input type="text" value={formCrear.apellidos} onChange={(e) => setFormCrear({ ...formCrear, apellidos: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Username Único *</label>
                <input type="text" required value={formCrear.username} onChange={(e) => setFormCrear({ ...formCrear, username: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" placeholder="ejemplo.dg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email Corporativo</label>
                <input type="email" value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" placeholder="correo@corraltech.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña Inicial *</label>
                <div className="relative">
                  <input type="password" required minLength={6} value={formCrear.password} onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 w-full">
              <button type="button" onClick={() => setModalCrearOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl font-bold text-xs shadow-md transition-colors">
                Crear Administrador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PARA EDICIÓN DE DG */}
      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#264575]">Modificar Perfil Máster</h3>
              <p className="text-xs font-bold text-[#885f3a]">Actualización de identidad para @{usuarioEditando?.username}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                <input type="text" required value={formEdit.nombres} onChange={(e) => setFormEdit({ ...formEdit, nombres: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                <input type="text" value={formEdit.apellidos} onChange={(e) => setFormEdit({ ...formEdit, apellidos: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email Corporativo</label>
                <input type="email" value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 w-full">
              <button type="button" onClick={() => setModalEdicionOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-[#264575] hover:bg-[#1e355b] text-white rounded-xl font-bold text-xs shadow-md transition-colors">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {statusModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 text-center shadow-2xl border border-gray-50 space-y-3">
            <div className="flex justify-center">
              {statusModal.type === "success" ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
            </div>
            <p className="text-sm font-bold text-gray-700 leading-tight">{statusModal.message}</p>
            <button type="button" onClick={() => setStatusModal({ ...statusModal, open: false })} className="w-full py-2 bg-[#264575] hover:bg-[#1e355b] text-white text-xs font-bold rounded-xl shadow transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
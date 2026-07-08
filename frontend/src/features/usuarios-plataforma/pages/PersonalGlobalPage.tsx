import { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Shield, LifeBuoy } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface UsuarioGlobal {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
  nombre_rol: "Administrador Global" | "Soporte Global";
}

export default function PersonalGlobalPage() {
  const [usuarios, setUsuarios] = useState<UsuarioGlobal[]>([]);
  const [tabActiva, setTabActiva] = useState<"TODOS" | "ADMIN" | "SOPORTE">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({ 
    nombres: "", 
    apellidos: "", 
    username: "", 
    email: "", 
    password: "",
    rol_solicitado: "Administrador Global"
  });

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioGlobal | null>(null);
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "" });
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });
  const token = localStorage.getItem("corraltech_token");
  const cargarPersonalGlobal = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/usuarios-globales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar el listado de personal global.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPersonalGlobal();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/master/usuarios-globales`, formCrear, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalCrearOpen(false);
      setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "", rol_solicitado: "Administrador Global" });
      mostrarStatus("success", `Personal asignado como ${formCrear.rol_solicitado} correctamente.`);
      cargarPersonalGlobal();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al registrar la cuenta global.");
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;

    try {
      await axios.put(`${API_URL}/master/usuarios-globales/${usuarioEditando.id_usuario}`, formEdit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      mostrarStatus("success", "Datos de cuenta actualizados con éxito.");
      cargarPersonalGlobal();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudieron salvar los cambios.");
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      await axios.patch(`${API_URL}/master/usuarios-globales/${id}/estado?activo=${nuevoEstado}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(usuarios.map(u => u.id_usuario === id ? { ...u, activo: nuevoEstado } : u));
      mostrarStatus("success", "Estatus de seguridad de la cuenta modificado.");
    } catch (err) {
      mostrarStatus("error", "Error al cambiar los privilegios de acceso.");
    }
  };

  const abrirEdicion = (u: UsuarioGlobal) => {
    setUsuarioEditando(u);
    setFormEdit({ nombres: u.nombres, apellidos: u.apellidos || "", email: u.email || "" });
    setModalEdicionOpen(true);
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = 
      u.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()));

    if (tabActiva === "ADMIN") return coincideBusqueda && u.nombre_rol === "Administrador Global";
    if (tabActiva === "SOPORTE") return coincideBusqueda && u.nombre_rol === "Soporte Global";
    return coincideBusqueda;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Gestión de Personal Global</h1>
          <p className="text-sm font-semibold text-[#885f3a]">Sprint 7 - Control Corporativo de Administradores y Soporte Técnico</p>
        </div>
        <button 
          onClick={() => setModalCrearOpen(true)}
          className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Dar de Alta Miembro</span>
        </button>
      </div>

      <div className="flex border-b border-gray-200 gap-2">
        {(["TODOS", "ADMIN", "SOPORTE"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              tabActiva === tab 
                ? "border-[#264575] text-[#264575]" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "TODOS" && "Todos los Miembros"}
            {tab === "ADMIN" && "Administradores Globales"}
            {tab === "SOPORTE" && "Soporte Técnico"}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3.5 rounded-xl shadow-sm max-w-md transition-all focus-within:border-[#264575] focus-within:ring-1 focus-within:ring-[#264575]">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, usuario, correo..." 
          className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Sincronizando cuentas con el ecosistema raíz...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">
            No se encontraron usuarios en este segmento organizativo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">UID</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Nivel de Acceso (Rol)</th>
                  <th className="px-6 py-4 text-center">Estado Acceso</th>
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
                    <td className="px-6 py-4 font-semibold text-gray-500">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.nombre_rol === "Administrador Global"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-purple-50 text-purple-700 border-purple-100"
                      }`}>
                        {u.nombre_rol === "Administrador Global" ? <Shield className="w-3.5 h-3.5" /> : <LifeBuoy className="w-3.5 h-3.5" />}
                        {u.nombre_rol}
                      </span>
                    </td>
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
                        title="Modificar perfil"
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
            <div>
              <h3 className="text-lg font-black text-[#264575]">Alta de Personal de Plataforma</h3>
              <p className="text-xs font-bold text-[#885f3a]">Asignación de roles jerárquicos globales</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                  <input type="text" required value={formCrear.nombres} onChange={(e) => setFormCrear({ ...formCrear, nombres: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                  <input type="text" value={formCrear.apellidos} onChange={(e) => setFormCrear({ ...formCrear, apellidos: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Username Único *</label>
                  <input type="text" required value={formCrear.username} onChange={(e) => setFormCrear({ ...formCrear, username: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Rol de Plataforma *</label>
                  <select value={formCrear.rol_solicitado} onChange={(e) => setFormCrear({ ...formCrear, rol_solicitado: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white font-semibold text-gray-700">
                    <option value="Administrador Global">Administrador Global</option>
                    <option value="Soporte Global">Soporte Global</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email de Contacto</label>
                <input type="email" value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña de Acceso *</label>
                <input type="password" required minLength={6} value={formCrear.password} onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalCrearOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl font-bold text-xs shadow-md">Dar de Alta</button>
            </div>
          </form>
        </div>
      )}

      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Modificar Perfil Operativo</h3>
              <p className="text-xs font-bold text-[#885f3a]">Actualizando datos de @{usuarioEditando?.username}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                <input type="text" required value={formEdit.nombres} onChange={(e) => setFormEdit({ ...formEdit, nombres: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                <input type="text" value={formEdit.apellidos} onChange={(e) => setFormEdit({ ...formEdit, apellidos: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email Corporativo</label>
                <input type="email" value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalEdicionOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-[#264575] hover:bg-[#1e355b] text-white rounded-xl font-bold text-xs shadow-md">Guardar Cambios</button>
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
            <button type="button" onClick={() => setStatusModal({ ...statusModal, open: false })} className="w-full py-2 bg-[#264575] text-white text-xs font-bold rounded-xl shadow">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}
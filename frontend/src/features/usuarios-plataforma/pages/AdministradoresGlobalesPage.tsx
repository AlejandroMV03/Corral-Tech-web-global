import { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AdministradorGlobal {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
}

export default function AdministradoresGlobalesPage() {
  const [admins, setAdmins] = useState<AdministradorGlobal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ACTIVOS" | "INACTIVOS">("TODOS");
  const [loading, setLoading] = useState(true);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({ nombres: "", apellidos: "", username: "", email: "", password: "" });
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  const [adminEditando, setAdminEditando] = useState<AdministradorGlobal | null>(null);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "" });

  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });
  const token = localStorage.getItem("corraltech_token");

  const cargarAdministradores = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/usuarios-globales?rol=Administrador global`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar el listado de Administradores Globales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAdministradores();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const handleCrearAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/master/usuarios-globales?rol_solicitado=Administrador global`, formCrear, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalCrearOpen(false);
      setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "" });
      mostrarStatus("success", "Administrador Global registrado y habilitado en la plataforma.");
      cargarAdministradores();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al registrar la cuenta administrativa.");
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditando) return;
    try {
      await axios.put(`${API_URL}/master/usuarios-globales/${adminEditando.id_usuario}`, formEdit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      mostrarStatus("success", "Perfil de administración actualizado con éxito.");
      cargarAdministradores();
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
      setAdmins(admins.map(a => a.id_usuario === id ? { ...a, activo: nuevoEstado } : a));
      mostrarStatus("success", nuevoEstado ? "Cuenta activada con éxito." : "Acceso del administrador revocado.");
    } catch (err) {
      mostrarStatus("error", "Error al modificar los privilegios de acceso lógico.");
    }
  };

  const abrirEdicion = (a: AdministradorGlobal) => {
    setAdminEditando(a);
    setFormEdit({ nombres: a.nombres, apellidos: a.apellidos || "", email: a.email || "" });
    setModalEdicionOpen(true);
  };

  const adminsFiltrados = admins.filter(a => {
    const coincideBusqueda = a.nombres.toLowerCase().includes(busqueda.toLowerCase()) || a.username.toLowerCase().includes(busqueda.toLowerCase());
    if (filtroEstado === "ACTIVOS") return coincideBusqueda && a.activo;
    if (filtroEstado === "INACTIVOS") return coincideBusqueda && !a.activo;
    return coincideBusqueda;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Administradores Globales</h1>
          <p className="text-sm font-semibold text-[#885f3a]">Supervisión operativa y gestión de la plataforma a gran escala</p>
        </div>
        <button onClick={() => setModalCrearOpen(true)} className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center space-x-2 transition-all active:scale-95">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3 rounded-xl shadow-sm w-full max-w-md">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o usuario..." className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium" />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          {(["TODOS", "ACTIVOS", "INACTIVOS"] as const).map((estado) => (
            <button key={estado} onClick={() => setFiltroEstado(estado)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroEstado === estado ? "bg-white text-[#264575] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {estado}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Cargando tablero operativo...</p>
          </div>
        ) : adminsFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">No se encontraron administradores registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">UID</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4 text-center">Estado Acceso</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {adminsFiltrados.map((a) => (
                  <tr key={a.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">#{String(a.id_usuario).padStart(3, "0")}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{a.nombres} {a.apellidos || ""}</td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">@{a.username}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{a.email || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => handleToggleEstado(a.id_usuario, a.activo)} className="focus:outline-none transition-transform active:scale-95 inline-block align-middle">
                        {a.activo ? <ToggleRight className="w-9 h-9 text-green-600" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => abrirEdicion(a)} className="p-2 text-[#264575] hover:bg-[#264575]/10 rounded-xl transition-all inline-block"><Edit className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalCrearOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleCrearAdmin} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Alta de Administrador Global</h3>
              <p className="text-xs font-bold text-[#885f3a]">Ingreso obligatorio de credenciales operativas</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre *</label>
                  <input type="text" required value={formCrear.nombres} onChange={(e) => setFormCrear({ ...formCrear, nombres: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                  <input type="text" value={formCrear.apellidos} onChange={(e) => setFormCrear({ ...formCrear, apellidos: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Username Único *</label>
                <input type="text" required value={formCrear.username} onChange={(e) => setFormCrear({ ...formCrear, username: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico *</label>
                <input type="email" required value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña Inicial *</label>
                <input type="password" required minLength={6} value={formCrear.password} onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalCrearOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-[#822420] text-white rounded-xl font-bold text-xs shadow-md">Registrar Cuenta</button>
            </div>
          </form>
        </div>
      )}

      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Modificar Perfil de Administrador</h3>
              <p className="text-xs font-bold text-[#885f3a]">Actualizando privilegios operativos de @{adminEditando?.username}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nombre *</label>
                <input type="text" required value={formEdit.nombres} onChange={(e) => setFormEdit({ ...formEdit, nombres: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                <input type="text" value={formEdit.apellidos} onChange={(e) => setFormEdit({ ...formEdit, apellidos: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Corporativo</label>
                <input type="email" value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalEdicionOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-[#264575] text-white rounded-xl font-bold text-xs shadow-md">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      {statusModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 text-center shadow-2xl border border-gray-50 space-y-3">
            <div className="flex justify-center">{statusModal.type === "success" ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}</div>
            <p className="text-sm font-bold text-gray-700 leading-tight">{statusModal.message}</p>
            <button type="button" onClick={() => setStatusModal({ ...statusModal, open: false })} className="w-full py-2 bg-[#264575] text-white text-xs font-bold rounded-xl shadow">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}
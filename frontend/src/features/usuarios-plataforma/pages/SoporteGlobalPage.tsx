import { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Key } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface SoporteGlobal {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
}

export default function SoporteGlobalPage() {
  const [personalSoporte, setPersonalSoporte] = useState<SoporteGlobal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({ nombres: "", apellidos: "", username: "", email: "", password: "" });
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  const [soporteEditando, setSoporteEditando] = useState<SoporteGlobal | null>(null);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "" });
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [nuevaPasswordManual, setNuevaPasswordManual] = useState("");
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });
  const token = localStorage.getItem("corraltech_token");
  const cargarSoporte = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/usuarios-globales?rol=Soporte global`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPersonalSoporte(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar la nómina técnica de soporte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSoporte();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const handleCreateSoporte = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/master/usuarios-globales?rol_solicitado=Soporte global`, formCrear, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalCrearOpen(false);
      setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "" });
      mostrarStatus("success", "Técnico de Soporte Global asignado correctamente.");
      cargarSoporte();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al registrar la cuenta de soporte.");
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soporteEditando) return;
    try {
      await axios.put(`${API_URL}/master/usuarios-globales/${soporteEditando.id_usuario}`, formEdit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      mostrarStatus("success", "Datos de la cuenta técnica salvados.");
      cargarSoporte();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudo actualizar el perfil.");
    }
  };

  const handleProcesarPasswordManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soporteEditando) return;
    try {
      await axios.patch(`${API_URL}/master/usuarios-globales/${soporteEditando.id_usuario}/reset-password`, {
        nueva_password: nuevaPasswordManual
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalPasswordOpen(false);
      setNuevaPasswordManual("");
      mostrarStatus("success", `Contraseña de @${soporteEditando.username} reestablecida con éxito de forma manual.`);
    } catch (err) {
      mostrarStatus("error", "No se pudo procesar la solicitud de contraseña.");
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      await axios.patch(`${API_URL}/master/usuarios-globales/${id}/estado?activo=${nuevoEstado}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPersonalSoporte(personalSoporte.map(s => s.id_usuario === id ? { ...s, activo: nuevoEstado } : s));
      mostrarStatus("success", "Estado lógico del técnico modificado.");
    } catch (err) {
      mostrarStatus("error", "Error al revocar permisos del sistema.");
    }
  };

  const soporteFiltrado = personalSoporte.filter(s => s.nombres.toLowerCase().includes(busqueda.toLowerCase()) || s.username.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Soporte Global</h1>
          <p className="text-sm font-semibold text-[#885f3a]">Atención de incidencias, mantenimiento y blanqueo manual de credenciales</p>
        </div>
        <button onClick={() => setModalCrearOpen(true)} className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center space-x-2 transition-all active:scale-95">
          <UserPlus className="w-4 h-4" />
          <span>Registrar Técnico</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3.5 rounded-xl shadow-sm max-w-md">
        <Search className="w-5 h-5 text-gray-400" />
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar soporte técnico..." className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Cargando cuentas de soporte...</p>
          </div>
        ) : soporteFiltrado.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">No hay personal técnico asignado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">ID</th>
                  <th className="px-6 py-4">Técnico Asignado</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4 text-center">Estatus</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {soporteFiltrado.map((s) => (
                  <tr key={s.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">#{String(s.id_usuario).padStart(3, "0")}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{s.nombres} {s.apellidos || ""}</td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">@{s.username}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{s.email}</td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => handleToggleEstado(s.id_usuario, s.activo)} className="focus:outline-none transition-transform active:scale-95 inline-block align-middle">
                        {s.activo ? <ToggleRight className="w-9 h-9 text-green-600" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button type="button" onClick={() => { setSoporteEditando(s); setFormEdit({ nombres: s.nombres, apellidos: s.apellidos || "", email: s.email }); setModalEdicionOpen(true); }} className="p-2 text-[#264575] hover:bg-[#264575]/10 rounded-xl transition-all inline-block" title="Editar"><Edit className="w-4 h-4" /></button>
                      <button type="button" onClick={() => { setSoporteEditando(s); setModalPasswordOpen(true); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all inline-block" title="Atención manual de contraseña"><Key className="w-4 h-4" /></button>
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
          <form onSubmit={handleCreateSoporte} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Alta de Soporte Global</h3>
              <p className="text-xs font-bold text-[#885f3a]">Registro completo de cuentas técnicas de mantenimiento</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre *</label>
                  <input type="text" required value={formCrear.nombres} onChange={(e) => setFormCrear({ ...formCrear, nombres: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                  <input type="text" value={formCrear.apellidos} onChange={(e) => setFormCrear({ ...formCrear, apellidos: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Username Único *</label>
                <input type="text" required value={formCrear.username} onChange={(e) => setFormCrear({ ...formCrear, username: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico *</label>
                <input type="email" required value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña Inicial *</label>
                <input type="password" required minLength={6} value={formCrear.password} onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalCrearOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-[#822420] text-white rounded-xl font-bold text-xs shadow-md">Dar de Alta</button>
            </div>
          </form>
        </div>
      )}

      {modalPasswordOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleProcesarPasswordManual} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-amber-600 flex items-center gap-2"><Key className="w-5 h-5"/> Procesar Contraseña</h3>
              <p className="text-xs font-bold text-gray-500">Atención manual de incidencias para @{soporteEditando?.username}</p>
            </div>
            <div className="text-sm">
              <label className="block text-xs font-bold text-gray-600 mb-1">Nueva Contraseña Forzada *</label>
              <input type="text" required minLength={6} value={nuevaPasswordManual} onChange={(e) => setNuevaPasswordManual(e.target.value)} placeholder="Ej: CorralTech2026!" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-mono" />
              <p className="text-[11px] text-amber-600 mt-2 font-medium">⚠️ Nota de negocio: Debe proporcionar este código manualmente al usuario solicitante ya que no hay autoservicio automatizado.</p>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalPasswordOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md">Reestablecer e Informar</button>
            </div>
          </form>
        </div>
      )}

      {/* STATUS FEEDBACK */}
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
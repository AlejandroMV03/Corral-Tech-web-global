import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle } from "lucide-react";

const API_URL = "http://192.168.1.71:8000";

interface Rancho {
  id_rancho: number;
  nombre: string;
  ubicacion: string;
  propietario: string;
  telefono: string;
  email_contacto: string;
  id_plan: number;
  activo: boolean;
}

export default function ListaRanchosPage() {
  const [ranchos, setRanchos] = useState<Rancho[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [ranchoEditando, setRanchoEditando] = useState<Rancho | null>(null);
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  
  const [formEdit, setFormEdit] = useState({ nombre: "", ubicacion: "", propietario: "", telefono: "", email_contacto: "", id_plan: 1 });
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });

  const token = localStorage.getItem("corraltech_token");

  const cargarRanchos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/v1/master/ranchos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRanchos(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar la lista de ranchos globales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRanchos();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      await axios.patch(`${API_URL}/api/v1/master/ranchos/${id}/estado?activo=${nuevoEstado}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRanchos(ranchos.map(r => r.id_rancho === id ? { ...r, activo: nuevoEstado } : r));
      mostrarStatus("success", `Rancho ${nuevoEstado ? "activado" : "desactivado"} correctamente.`);
    } catch (err) {
      mostrarStatus("error", "No se pudo cambiar el estado del acceso del rancho.");
    }
  };

  const abrirEdicion = (rancho: Rancho) => {
    setRanchoEditando(rancho);
    setFormEdit({
      nombre: rancho.nombre,
      ubicacion: rancho.ubicacion || "",
      propietario: rancho.propietario || "",
      telefono: rancho.telefono || "",
      email_contacto: rancho.email_contacto || "",
      id_plan: rancho.id_plan || 1 
    });
    setModalEdicionOpen(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ranchoEditando) return;

    try {
      await axios.put(`${API_URL}/api/v1/master/ranchos/${ranchoEditando.id_rancho}`, formEdit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      mostrarStatus("success", "Datos y plan del rancho actualizados con éxito.");
      cargarRanchos(); 
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al actualizar el rancho.");
    }
  };

  const ranchosFiltrados = ranchos.filter(r => 
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (r.propietario && r.propietario.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-[#264575] tracking-tight">Lista Corporativa de Ranchos</h1>
        <p className="text-sm font-semibold text-[#885f3a]">Módulo de Monitoreo General de Tenants</p>
      </div>

      <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3.5 rounded-xl shadow-sm max-w-md transition-all focus-within:border-[#264575] focus-within:ring-1 focus-within:ring-[#264575]">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por rancho o propietario..." 
          className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Cargando clústeres corporativos...</p>
          </div>
        ) : ranchosFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">
            No se encontraron entidades registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">ID / Tenant</th>
                  <th className="px-6 py-4">Nombre de la Entidad</th>
                  <th className="px-6 py-4">Propietario Legal</th>
                  <th className="px-6 py-4">Ubicación (GPS)</th>
                  <th className="px-6 py-4 text-center">Acceso Plataforma</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {ranchosFiltrados.map((rancho) => (
                  <tr key={rancho.id_rancho} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">
                      #{String(rancho.id_rancho).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-base">{rancho.nombre}</td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">{rancho.propietario || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#885f3a] bg-amber-50/30 px-2 py-1 rounded-lg inline-block my-3 ml-4">{rancho.ubicacion || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleToggleEstado(rancho.id_rancho, rancho.activo)}
                        className="focus:outline-none transition-transform active:scale-95 inline-block align-middle"
                      >
                        {rancho.activo ? (
                          <ToggleRight className="w-9 h-9 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => abrirEdicion(rancho)}
                        className="p-2 text-[#264575] hover:bg-[#264575]/10 rounded-xl transition-all inline-block"
                        title="Editar parámetros"
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

      {/* MODAL PARA DETALLE / EDICIÓN CON SELECTOR DE PLAN INCLUIDO */}
      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#264575]">Detalle y Edición de Rancho</h3>
              <p className="text-xs font-bold text-[#885f3a]">Modificación de parámetros y niveles de suscripción</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre Entidad *</label>
                  <input type="text" required value={formEdit.nombre} onChange={(e) => setFormEdit({ ...formEdit, nombre: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Plan de Suscripción *</label>
                  <select value={formEdit.id_plan} onChange={(e) => setFormEdit({ ...formEdit, id_plan: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium text-gray-700 bg-transparent cursor-pointer">
                    <option value={1}>Plan limitado 50</option>
                    <option value={2}>Plan limitado 100</option>
                    <option value={3}>Plan limitado 200</option>
                    <option value={4}>Plan limitado 500</option>
                    <option value={5}>Plan personalizado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Coordenadas GPS</label>
                <input type="text" value={formEdit.ubicacion} onChange={(e) => setFormEdit({ ...formEdit, ubicacion: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Propietario Jurídico</label>
                <input type="text" value={formEdit.propietario} onChange={(e) => setFormEdit({ ...formEdit, propietario: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                  <input type="text" maxLength={10} value={formEdit.telefono} onChange={(e) => setFormEdit({ ...formEdit, telefono: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico</label>
                  <input type="email" maxLength={100} value={formEdit.email_contacto} onChange={(e) => setFormEdit({ ...formEdit, email_contacto: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-medium" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 w-full">
              <button type="button" onClick={() => setModalEdicionOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl font-bold text-xs shadow-md transition-colors">
                Guardar Parámetros
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
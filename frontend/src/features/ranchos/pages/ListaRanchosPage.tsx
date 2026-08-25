import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle } from "lucide-react";
import { 
  sanitizarTexto, 
  sanitizarTelefono, 
  sanitizarCoordenadas 
} from "../../../lib/sanitizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Rancho {
  id_rancho: number;
  nombre: string;
  ubicacion: string;
  propietario: string;
  telefono: string;
  email_contacto: string;
  id_plan?: number;
  activo: boolean;
}

const NOMBRES_PLANES: { [key: number]: { label: string; badgeColor: string } } = {
  1: { label: "Plan 50", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
  2: { label: "Plan 100", badgeColor: "bg-teal-50 text-teal-700 border-teal-200" },
  3: { label: "Plan 200", badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
  4: { label: "Plan 500", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
  5: { label: "Personalizado", badgeColor: "bg-rose-50 text-rose-700 border-rose-200" }
};

export default function ListaRanchosPage() {
  const [ranchos, setRanchos] = useState<Rancho[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [ranchoEditando, setRanchoEditando] = useState<Rancho | null>(null);
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);

  const [formEdit, setFormEdit] = useState({
    nombre: "",
    ubicacion: "",
    propietario: "",
    telefono: "",
    email_contacto: "",
    id_plan: 1
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", message: "" });
  const [guardando, setGuardando] = useState(false);

  const token = localStorage.getItem("corraltech_token");

  const cargarRanchos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/ranchos`, {
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

  const limpiarError = (campo: string) => {
    if (errors[campo]) {
      setErrors((prev) => {
        const nuevo = { ...prev };
        delete nuevo[campo];
        return nuevo;
      });
    }
  };

  const validarCoordenadas = (valor: string): string | null => {
    if (!valor.trim()) return null;
    const partes = valor.split(",");
    if (partes.length !== 2) {
      return "Formato inválido. Usa latitud y longitud separadas por coma (ej. 19.8437, -90.5255).";
    }

    const latRaw = partes[0].trim();
    const lonRaw = partes[1].trim();

    const lat = parseFloat(latRaw);
    const lon = parseFloat(lonRaw);

    if (isNaN(lat) || isNaN(lon)) {
      return "Las coordenadas deben expresarse en formato numérico válido.";
    }

    if (lat < -90 || lat > 90) return "La latitud debe estar entre -90 y 90 grados.";
    if (lon < -180 || lon > 180) return "La longitud debe estar entre -180 y 180 grados.";

    return null;
  };

  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formEdit.nombre.trim()) {
      nuevosErrores.nombre = "El nombre del rancho es obligatorio.";
    } else if (formEdit.nombre.length > 14) {
      nuevosErrores.nombre = "El nombre no debe exceder los 14 caracteres.";
    }

    if (formEdit.propietario.trim() && formEdit.propietario.length > 14) {
      nuevosErrores.propietario = "El propietario no debe exceder los 14 caracteres.";
    }

    if (formEdit.telefono.trim()) {
      if (formEdit.telefono.trim().length < 10 || formEdit.telefono.trim().length > 14) {
        nuevosErrores.telefono = "El teléfono debe tener entre 10 y 14 dígitos.";
      }
    }

    if (formEdit.email_contacto.trim()) {
      if (!emailRegex.test(formEdit.email_contacto.trim())) {
        nuevosErrores.email_contacto = "El formato del correo de contacto no es válido.";
      } else if (formEdit.email_contacto.trim().length > 100) {
        nuevosErrores.email_contacto = "El correo no puede exceder los 100 caracteres.";
      }
    }

    if (formEdit.ubicacion.trim()) {
      const errorGps = validarCoordenadas(formEdit.ubicacion.trim());
      if (errorGps) {
        nuevosErrores.ubicacion = errorGps;
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      await axios.patch(`${API_URL}/master/ranchos/${id}/estado?activo=${nuevoEstado}`, {}, {
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
    setErrors({});
    const planActual = rancho.id_plan ? Number(rancho.id_plan) : 1;

    setFormEdit({
      nombre: rancho.nombre,
      ubicacion: rancho.ubicacion || "",
      propietario: rancho.propietario || "",
      telefono: rancho.telefono || "",
      email_contacto: rancho.email_contacto || "",
      id_plan: planActual
    });
    setModalEdicionOpen(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ranchoEditando) return;

    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await axios.put(`${API_URL}/master/ranchos/${ranchoEditando.id_rancho}`, {
        nombre: formEdit.nombre.trim(),
        ubicacion: formEdit.ubicacion.trim(),
        propietario: formEdit.propietario.trim() || null,
        telefono: formEdit.telefono.trim() || null,
        email_contacto: formEdit.email_contacto.trim() || null,
        id_plan: Number(formEdit.id_plan)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModalEdicionOpen(false);
      mostrarStatus("success", "Datos y plan del rancho actualizados con éxito.");
      await cargarRanchos();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al actualizar el rancho.");
    } finally {
      setGuardando(false);
    }
  };

  // Punto 13: Detectar si hubo alguna modificación real
  const hayCambios = ranchoEditando ? (
    formEdit.nombre.trim() !== (ranchoEditando.nombre || "").trim() ||
    formEdit.ubicacion.trim() !== (ranchoEditando.ubicacion || "").trim() ||
    formEdit.propietario.trim() !== (ranchoEditando.propietario || "").trim() ||
    formEdit.telefono.trim() !== (ranchoEditando.telefono || "").trim() ||
    formEdit.email_contacto.trim() !== (ranchoEditando.email_contacto || "").trim() ||
    Number(formEdit.id_plan) !== Number(ranchoEditando.id_plan || 1)
  ) : false;

  const ranchosFiltrados = ranchos.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (r.propietario && r.propietario.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-[#264575] tracking-tight">Lista Corporativa de Ranchos</h1>
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
                  <th className="px-6 py-4">Plan Actual</th>
                  <th className="px-6 py-4">Ubicación (GPS)</th>
                  <th className="px-6 py-4 text-center">Acceso Plataforma</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {ranchosFiltrados.map((rancho) => {
                  const planInfo = NOMBRES_PLANES[rancho.id_plan || 1] || NOMBRES_PLANES[1];
                  return (
                    <tr key={rancho.id_rancho} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">
                        #{String(rancho.id_rancho).padStart(3, "0")}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-base">{rancho.nombre}</td>
                      <td className="px-6 py-4 text-gray-500 font-semibold">{rancho.propietario || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${planInfo.badgeColor}`}>
                          {planInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#885f3a]">
                        <span className="bg-amber-50/70 px-2.5 py-1 rounded-lg border border-amber-100 inline-block">
                          {rancho.ubicacion || "—"}
                        </span>
                      </td>
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
                          title="Editar parámetros y plan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PARA DETALLE / EDICIÓN (Punto 10 & 13) */}
      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form noValidate onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#264575]">Detalle y Edición de Rancho</h3>
              <p className="text-xs font-bold text-[#885f3a]">Modificación de parámetros y niveles de suscripción</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre Entidad *</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formEdit.nombre}
                    onChange={(e) => {
                      setFormEdit({ ...formEdit, nombre: sanitizarTexto(e.target.value, 14) });
                      limpiarError("nombre");
                    }}
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium transition-colors ${
                      errors.nombre
                        ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`}
                    placeholder="Máx 14 caracteres"
                  />
                  {errors.nombre && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.nombre}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Plan de Suscripción *</label>
                  <select
                    value={formEdit.id_plan}
                    onChange={(e) => {
                      setFormEdit({ ...formEdit, id_plan: parseInt(e.target.value, 10) });
                      limpiarError("id_plan");
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#264575] outline-none font-semibold text-gray-700 bg-white cursor-pointer"
                  >
                    <option value={1}>Plan limitado 50 (50 an. • 5MB)</option>
                    <option value={2}>Plan limitado 100 (100 an. • 5MB)</option>
                    <option value={3}>Plan limitado 200 (200 an. • 10MB)</option>
                    <option value={4}>Plan limitado 500 (500 an. • 10MB)</option>
                    <option value={5}>Plan personalizado (Configurable)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Coordenadas GPS</label>
                <input
                  type="text"
                  maxLength={40}
                  value={formEdit.ubicacion}
                  onChange={(e) => {
                    setFormEdit({ ...formEdit, ubicacion: sanitizarCoordenadas(e.target.value, 40) });
                    limpiarError("ubicacion");
                  }}
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium transition-colors ${
                    errors.ubicacion
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                      : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`}
                  placeholder="Ej. 19.8437, -90.5255"
                />
                {errors.ubicacion && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.ubicacion}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Propietario Jurídico</label>
                <input
                  type="text"
                  maxLength={14}
                  value={formEdit.propietario}
                  onChange={(e) => {
                    setFormEdit({ ...formEdit, propietario: sanitizarTexto(e.target.value, 14) });
                    limpiarError("propietario");
                  }}
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium transition-colors ${
                    errors.propietario
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                      : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`}
                  placeholder="Máx 14 caracteres"
                />
                {errors.propietario && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.propietario}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formEdit.telefono}
                    onChange={(e) => {
                      setFormEdit({ ...formEdit, telefono: sanitizarTelefono(e.target.value, 14) });
                      limpiarError("telefono");
                    }}
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium transition-colors ${
                      errors.telefono
                        ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`}
                    placeholder="10 a 14 dígitos"
                  />
                  {errors.telefono && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.telefono}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    maxLength={100}
                    value={formEdit.email_contacto}
                    onChange={(e) => {
                      setFormEdit({ ...formEdit, email_contacto: e.target.value.replace(/\s+/g, "") });
                      limpiarError("email_contacto");
                    }}
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium transition-colors ${
                      errors.email_contacto
                        ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email_contacto && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.email_contacto}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 w-full">
              <button
                type="button"
                onClick={() => setModalEdicionOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!hayCambios || guardando}
                className="px-5 py-2 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL STATUS */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 text-center shadow-2xl border border-gray-50 space-y-3">
            <div className="flex justify-center">
              {statusModal.type === "success" ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <p className="text-sm font-bold text-gray-700 leading-tight">{statusModal.message}</p>
            <button
              type="button"
              onClick={() => setStatusModal({ ...statusModal, open: false })}
              className="w-full py-2 bg-[#264575] hover:bg-[#1e355b] text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
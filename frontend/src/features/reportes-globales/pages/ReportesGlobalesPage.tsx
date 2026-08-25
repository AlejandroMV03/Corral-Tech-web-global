import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  FileSpreadsheet,
  Building2,
  Filter,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileType,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  Layers,
  Calendar,
  Loader2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- INTERFACES ---
interface AuditoriaItem {
  id_auditoria: number;
  id_usuario?: number;
  usuario_nombre?: string;
  id_rancho?: number;
  rancho_nombre?: string;
  modulo?: string;
  accion: string;
  descripcion?: string;
  ip_usuario?: string;
  dispositivo?: string;
  fecha_hora: string;
}

interface RanchoOption {
  id_rancho: number;
  nombre: string;
}

interface ResumenRancho {
  total_animales: number;
  animales_activos: number;
  animales_enfermos: number;
  lotes_activos: number;
  movimientos_pendientes: number;
  partos_proximos: number;
  alertas_sanitarias: number;
  ultima_actualizacion?: string;
}

interface RanchoDetalle {
  id_rancho: number;
  nombre: string;
  ubicacion?: string;
  propietario?: string;
  telefono?: string;
  email_contacto?: string;
  activo: boolean;
  resumen?: ResumenRancho;
  historial_auditoria: AuditoriaItem[];
}

export default function ReportesGlobalesPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"actividad" | "rancho">("actividad");

  // --- LISTA GENERAL DE RANCHOS PARA SELECTORES ---
  const [ranchosList, setRanchosList] = useState<RanchoOption[]>([]);

  // --- ESTADOS TAB 1: REPORTE DE ACTIVIDAD ---
  const [filterRancho, setFilterRancho] = useState<string>("");
  const [filterModulo, setFilterModulo] = useState<string>("");
  const [filterFechaInicio, setFilterFechaInicio] = useState<string>("");
  const [filterFechaFin, setFilterFechaFin] = useState<string>("");
  
  const [actividadLogs, setActividadLogs] = useState<AuditoriaItem[]>([]);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const limit = 15;
  const [loadingActividad, setLoadingActividad] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  // --- ESTADOS TAB 2: REPORTE POR RANCHO ---
  const [selectedRanchoId, setSelectedRanchoId] = useState<string>("");
  const [ranchoDetalle, setRanchoDetalle] = useState<RanchoDetalle | null>(null);
  const [loadingRanchoDetalle, setLoadingRanchoDetalle] = useState<boolean>(false);

  // --- ESTADOS DE MODAL NOTIFICACIÓN ---
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("corraltech_token");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchRanchos = async () => {
      try {
        const res = await axios.get(`${API_URL}/master/ranchos`, {
          headers: getAuthHeader()
        });
        setRanchosList(res.data || []);

        // Si viene un rancho preseleccionado desde la navegación (Dashboard)
        const stateRanchoId = (location.state as any)?.selectedRanchoId;
        if (stateRanchoId) {
          setActiveTab("rancho");
          setSelectedRanchoId(String(stateRanchoId));
          fetchReporteRancho(String(stateRanchoId));
        }
      } catch (error) {
        console.error("Error al cargar lista de ranchos:", error);
      }
    };
    fetchRanchos();
  }, [location.state]);

  const fetchReporteActividad = async () => {
    setLoadingActividad(true);
    try {
      const params: any = { page, limit };
      if (filterRancho) params.id_rancho = filterRancho;
      if (filterModulo) params.modulo = filterModulo;
      if (filterFechaInicio) params.fecha_inicio = filterFechaInicio;
      if (filterFechaFin) params.fecha_fin = filterFechaFin;

      const res = await axios.get(`${API_URL}/master/reportes/actividad`, {
        headers: getAuthHeader(),
        params
      });

      setActividadLogs(res.data.registros || []);
      setTotalRegistros(res.data.total_registros || 0);
    } catch (error: any) {
      console.error("Error al obtener la actividad:", error);
    } finally {
      setLoadingActividad(false);
    }
  };

  useEffect(() => {
    if (activeTab === "actividad") {
      fetchReporteActividad();
    }
  }, [page, activeTab]);

  const fetchReporteRancho = async (idRanchoStr: string) => {
    if (!idRanchoStr) {
      setRanchoDetalle(null);
      return;
    }
    setLoadingRanchoDetalle(true);
    try {
      const res = await axios.get(`${API_URL}/master/reportes/ranchos/${idRanchoStr}`, {
        headers: getAuthHeader()
      });
      setRanchoDetalle(res.data);
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(error.response?.data?.detail || "No se pudo extraer el reporte del rancho.");
      setShowStatusModal(true);
    } finally {
      setLoadingRanchoDetalle(false);
    }
  };

  const handleExportarExcel = async () => {
    setExportingExcel(true);
    try {
      const params: any = {};
      if (filterRancho) params.id_rancho = filterRancho;
      if (filterModulo) params.modulo = filterModulo;
      if (filterFechaInicio) params.fecha_inicio = filterFechaInicio;
      if (filterFechaFin) params.fecha_fin = filterFechaFin;

      const response = await axios.get(`${API_URL}/master/reportes/exportar/excel`, {
        headers: getAuthHeader(),
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Actividad_CorralTech_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatusType("success");
      setStatusMessage("El archivo Excel se generó y descargó correctamente.");
      setShowStatusModal(true);
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Error al generar el documento Excel.");
      setShowStatusModal(true);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportarPDF = async () => {
    setExportingPdf(true);
    try {
      const params: any = {};
      if (filterRancho) params.id_rancho = filterRancho;
      if (filterModulo) params.modulo = filterModulo;
      if (filterFechaInicio) params.fecha_inicio = filterFechaInicio;
      if (filterFechaFin) params.fecha_fin = filterFechaFin;

      const response = await axios.get(`${API_URL}/master/reportes/exportar/pdf`, {
        headers: getAuthHeader(),
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Actividad_CorralTech_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatusType("success");
      setStatusMessage("El informe PDF institucional se generó con éxito.");
      setShowStatusModal(true);
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Error al generar el documento PDF.");
      setShowStatusModal(true);
    } finally {
      setExportingPdf(false);
    }
  };

  const totalPages = Math.ceil(totalRegistros / limit) || 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Reportes y Auditoría Global</h1>
          <p className="text-sm font-medium text-[#885f3a]">Módulo de Reportes Centrales • Ecosistema CorralTech</p>
        </div>

        <div className="flex bg-white/70 p-1.5 rounded-xl border border-gray-200 shadow-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab("actividad")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "actividad"
                ? "bg-[#264575] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Bitácora de Actividad</span>
          </button>
          <button
            onClick={() => setActiveTab("rancho")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "rancho"
                ? "bg-[#264575] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Reporte por Rancho</span>
          </button>
        </div>
      </div>

      {activeTab === "actividad" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-[#822420]" />
                <h2 className="text-sm font-bold text-gray-800">Filtros de Búsqueda de Auditoría</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportarExcel}
                  disabled={exportingExcel}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{exportingExcel ? "Generando..." : "Excel"}</span>
                </button>
                <button
                  onClick={handleExportarPDF}
                  disabled={exportingPdf}
                  className="px-3.5 py-2 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-xs font-bold shadow flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <FileType className="w-4 h-4" />
                  <span>{exportingPdf ? "Generando..." : "PDF"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rancho</label>
                <select
                  value={filterRancho}
                  onChange={(e) => setFilterRancho(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-medium text-gray-700 cursor-pointer outline-none focus:ring-1 focus:ring-[#264575]"
                >
                  <option value="">-- Todos los Ranchos --</option>
                  {ranchosList.map((r) => (
                    <option key={r.id_rancho} value={r.id_rancho}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Módulo</label>
                <select
                  value={filterModulo}
                  onChange={(e) => setFilterModulo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-medium text-gray-700 cursor-pointer outline-none focus:ring-1 focus:ring-[#264575]"
                >
                  <option value="">-- Todos los Módulos --</option>
                  <option value="Auth">Autenticación</option>
                  <option value="Ranchos">Ranchos</option>
                  <option value="Usuarios Globales">Usuarios Globales</option>
                  <option value="Usuarios Por Rancho">Usuarios Por Rancho</option>
                  <option value="Auditoría">Auditoría</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={filterFechaInicio}
                  onChange={(e) => setFilterFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-medium text-gray-700 outline-none focus:ring-1 focus:ring-[#264575]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filterFechaFin}
                  onChange={(e) => setFilterFechaFin(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-medium text-gray-700 outline-none focus:ring-1 focus:ring-[#264575]"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setPage(1);
                  fetchReporteActividad();
                }}
                className="px-6 py-2 bg-[#264575] hover:bg-[#1d3356] text-white font-bold rounded-xl text-xs shadow flex items-center space-x-2 transition-all active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Aplicar Filtros</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#264575]" />
                <h3 className="text-sm font-bold text-gray-800">
                  Eventos Registrados ({totalRegistros})
                </h3>
              </div>
              <button
                onClick={fetchReporteActividad}
                className="p-1.5 hover:bg-gray-200/60 rounded-lg transition-colors text-gray-600"
                title="Actualizar tabla"
              >
                <RefreshCw className={`w-4 h-4 ${loadingActividad ? "animate-spin text-[#822420]" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#264575]/5 border-b border-gray-100 text-[11px] font-black text-[#264575] uppercase tracking-wider">
                    <th className="p-3.5">Fecha / Hora</th>
                    <th className="p-3.5">Usuario</th>
                    <th className="p-3.5">Rancho</th>
                    <th className="p-3.5">Módulo</th>
                    <th className="p-3.5">Acción</th>
                    <th className="p-3.5">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {loadingActividad ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#264575]" />
                          <span>Cargando bitácora de actividad...</span>
                        </div>
                      </td>
                    </tr>
                  ) : actividadLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">
                        No se encontraron registros de auditoría con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    actividadLogs.map((log) => (
                      <tr key={log.id_auditoria} className="hover:bg-amber-50/20 transition-colors">
                        <td className="p-3.5 font-medium whitespace-nowrap text-gray-600">
                          {log.fecha_hora}
                        </td>
                        <td className="p-3.5 font-bold text-gray-900">
                          {log.usuario_nombre}
                        </td>
                        <td className="p-3.5 font-medium text-gray-700">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[11px] font-semibold">
                            {log.rancho_nombre}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#885f3a]">
                          {log.modulo || "General"}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-800">
                          {log.accion}
                        </td>
                        <td className="p-3.5 text-gray-400 font-mono text-[11px]">
                          {log.ip_usuario || "127.0.0.1"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Página <b>{page}</b> de <b>{totalPages}</b>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || loadingActividad}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 font-bold transition-all flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages || loadingActividad}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 font-bold transition-all flex items-center space-x-1"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "rancho" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Selecciona un Rancho para Generar su Ficha Consolidada
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedRanchoId}
                onChange={(e) => {
                  setSelectedRanchoId(e.target.value);
                  fetchReporteRancho(e.target.value);
                }}
                className="flex-1 px-4 py-2.5 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-sm font-bold text-gray-700 cursor-pointer outline-none focus:ring-1 focus:ring-[#264575]"
              >
                <option value="">-- Seleccionar Rancho --</option>
                {ranchosList.map((r) => (
                  <option key={r.id_rancho} value={r.id_rancho}>
                    {r.nombre} (ID: #{r.id_rancho})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingRanchoDetalle ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 font-medium shadow-md flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#264575] animate-spin" />
              <span>Extrayendo métricas operativas del esquema del rancho...</span>
            </div>
          ) : ranchoDetalle ? (
            <div className="space-y-6">
              {/* ENCABEZADO DE LA ENTIDAD */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-7 h-7 text-[#822420]" />
                    <h2 className="text-2xl font-black text-gray-900">{ranchoDetalle.nombre}</h2>
                    <span
                      className={`px-3 py-0.5 text-xs font-bold rounded-full ${
                        ranchoDetalle.activo
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {ranchoDetalle.activo ? "Rancho Activo" : "Rancho Inactivo"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Propietario Legal: <b>{ranchoDetalle.propietario || "No especificado"}</b> • Teléfono:{" "}
                    <b>{ranchoDetalle.telefono || "N/A"}</b>
                  </p>
                </div>

                <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Contacto Oficial</span>
                  <p className="text-xs font-bold text-[#264575]">{ranchoDetalle.email_contacto || "Sin email registrado"}</p>
                  <p className="text-[11px] text-gray-500 font-mono">GPS: {ranchoDetalle.ubicacion || "No disponible"}</p>
                </div>
              </div>

              {/* TARJETAS OPERATIVAS FUNCIONALES (PUNTO 11) */}
              {ranchoDetalle.resumen ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  
                  {/* TOTAL GANADO */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1 text-[#264575]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Total Ganado</span>
                    <span className="text-2xl font-black text-[#264575]">
                      {(ranchoDetalle.resumen.total_animales ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {/* ANIMALES ACTIVOS */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mb-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Activos</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {(ranchoDetalle.resumen.animales_activos ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {/* ENFERMOS */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mb-1 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Enfermos</span>
                    <span className="text-2xl font-black text-amber-600">
                      {(ranchoDetalle.resumen.animales_enfermos ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {/* LOTES ACTIVOS */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-[#fff8ed] flex items-center justify-center mb-1 text-[#885f3a]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Lotes Activos</span>
                    <span className="text-2xl font-black text-[#885f3a]">
                      {(ranchoDetalle.resumen.lotes_activos ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {/* PARTOS PRÓXIMOS */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mb-1 text-indigo-600">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Partos Próx.</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {(ranchoDetalle.resumen.partos_proximos ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {/* ALERTAS SANITARIAS */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-1 text-red-600">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Alertas San.</span>
                    <span className="text-2xl font-black text-red-600">
                      {(ranchoDetalle.resumen.alertas_sanitarias ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-medium text-amber-800 text-center">
                  Este rancho aún no cuenta con un resumen acumulado de inventario de ganado.
                </div>
              )}

              {/* HISTORIAL ESPECÍFICO DEL RANCHO */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-[#822420]" />
                  <h3 className="text-sm font-bold text-gray-800">
                    Últimas Acciones de Auditoría en {ranchoDetalle.nombre}
                  </h3>
                </div>

                <div className="space-y-3">
                  {ranchoDetalle.historial_auditoria.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No hay historial de auditoría reciente para este rancho.</p>
                  ) : (
                    ranchoDetalle.historial_auditoria.map((aud) => (
                      <div
                        key={aud.id_auditoria}
                        className="p-3 bg-gray-50/60 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-bold text-gray-800">{aud.accion}</p>
                          <p className="text-gray-500 text-[11px]">
                            Ejecutado por: <b>{aud.usuario_nombre}</b> • Módulo: <b>{aud.modulo || "General"}</b>
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">
                          {aud.fecha_hora}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 font-medium shadow-md border border-dashed border-gray-200">
              Selecciona un rancho del menú desplegable para consultar su ficha técnica y auditoría.
            </div>
          )}
        </div>
      )}

      {/* MODAL STATUS */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-center">
            <div className="flex justify-center">
              {statusType === "success" ? (
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl font-black ${statusType === "success" ? "text-green-700" : "text-red-700"}`}>
                {statusType === "success" ? "Operación Exitosa" : "Atención"}
              </h3>
              <p className="text-sm font-medium text-gray-600 px-3 leading-relaxed">{statusMessage}</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className={`w-full py-2.5 rounded-xl font-bold text-sm text-white shadow transition-colors ${
                  statusType === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
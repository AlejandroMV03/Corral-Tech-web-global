import { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Building,
  UserCheck,
  KeyRound,
  AlertOctagon,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AuditLogItem {
  id_auditoria: number;
  id_usuario?: number;
  usuario_nombre?: string;
  id_rancho?: number;
  rancho_nombre?: string;
  modulo?: string;
  accion: string;
  descripcion?: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  fecha_hora: string;
}

export default function AuditoriaGlobalPage() {
  const [activeTab, setActiveTab] = useState<"creacion_ranchos" | "cambios_admin" | "accesos" | "errores">("creacion_ranchos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLogModal, setSelectedLogModal] = useState<AuditLogItem | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem("corraltech_token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAuditoria = async () => {
    setLoading(true);
    try {
      let endpoint = "/master/auditoria/creacion-ranchos";
      if (activeTab === "cambios_admin") endpoint = "/master/auditoria/cambios-administrativos";
      if (activeTab === "accesos") endpoint = "/master/auditoria/accesos";
      if (activeTab === "errores") endpoint = "/master/auditoria/errores-sistema";

      const params: any = { page, limit };
      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;

      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: getAuthHeader(),
        params
      });

      setLogs(res.data.registros || []);
      setTotalRegistros(res.data.total_registros || 0);
    } catch (error) {
      console.error("Error al cargar auditoría:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAuditoria();
  }, [activeTab]);

  useEffect(() => {
    fetchAuditoria();
  }, [page]);

  const totalPages = Math.ceil(totalRegistros / limit) || 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in relative">
      {/* CABECERA GENERAL */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-[#264575] tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-[#822420]" />
          <span>Auditoría Global</span>
        </h1>
        <p className="text-sm font-semibold text-[#885f3a]">
          Módulo de Trazabilidad Central
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/80 p-2 rounded-2xl border border-gray-200/80 shadow-sm">
        <button
          onClick={() => setActiveTab("creacion_ranchos")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "creacion_ranchos"
              ? "bg-[#264575] text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <Building className="w-4 h-4 shrink-0" />
          <span className="truncate">Creación de Ranchos</span>
        </button>

        <button
          onClick={() => setActiveTab("cambios_admin")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "cambios_admin"
              ? "bg-[#264575] text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Cambios de administrador</span>
        </button>

        <button
          onClick={() => setActiveTab("accesos")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "accesos"
              ? "bg-[#264575] text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <KeyRound className="w-4 h-4 shrink-0" />
          <span className="truncate">Accesos</span>
        </button>

        <button
          onClick={() => setActiveTab("errores")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "errores"
              ? "bg-[#822420] text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span className="truncate">Errores de Sistema</span>
        </button>
      </div>

      {/* PANEL DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Término de Búsqueda</label>
            <div className="relative">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por usuario, descripción o acción..."
                className="w-full pl-9 pr-4 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-medium text-gray-800"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-medium text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-medium text-gray-800"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-3">
          <button
            onClick={() => {
              setPage(1);
              fetchAuditoria();
            }}
            className="px-5 py-2 bg-[#264575] hover:bg-[#1d3356] text-white rounded-xl text-xs font-bold shadow flex items-center space-x-2 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar Bitácora</span>
          </button>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs font-bold text-gray-700">
            Mostrando <b>{logs.length}</b> de <b>{totalRegistros}</b> eventos inmutables
          </span>
          <button
            onClick={fetchAuditoria}
            className="p-1.5 hover:bg-gray-200/60 rounded-lg transition-colors text-gray-600"
            title="Recargar bitácora"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#822420]" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#264575]/5 border-b border-gray-100 text-[11px] font-black text-[#264575] uppercase tracking-wider">
                <th className="p-3.5">Fecha y Hora</th>
                <th className="p-3.5">Usuario Ejecutor</th>
                <th className="p-3.5">Rancho Target</th>
                <th className="p-3.5">Acción</th>
                <th className="p-3.5">Detalle / Descripción</th>
                <th className="p-3.5 text-center">Payload JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 font-bold">
                    Consultando registros de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">
                    Sin registros de auditoría en este submódulo con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id_auditoria} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {log.fecha_hora}
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">
                      {log.usuario_nombre}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-bold">
                        {log.rancho_nombre}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        log.accion.includes("CREAR") || log.accion.includes("ALTA")
                          ? "bg-green-100 text-green-800"
                          : log.accion.includes("ERROR")
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-600 max-w-xs truncate" title={log.descripcion}>
                      {log.descripcion || "-"}
                    </td>
                    <td className="p-3.5 text-center">
                      {(log.datos_anteriores || log.datos_nuevos) ? (
                        <button
                          onClick={() => setSelectedLogModal(log)}
                          className="p-1.5 bg-gray-100 hover:bg-[#264575] hover:text-white rounded-lg text-gray-600 transition-colors mx-auto flex items-center space-x-1"
                          title="Inspeccionar Payload JSON"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">Ver JSON</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Página <b>{page}</b> de <b>{totalPages}</b></span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 font-bold transition-all flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 font-bold transition-all flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE INSPECCIÓN JSON (DATOS ANTERIORES VS NUEVOS) */}
      {selectedLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#264575]">Payload de Auditoría #{selectedLogModal.id_auditoria}</h3>
                <p className="text-xs font-semibold text-[#885f3a]">Acción: {selectedLogModal.accion} • Módulo: {selectedLogModal.modulo}</p>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="block font-bold text-gray-600 mb-1 font-sans">Estado Anterior (datos_anteriores)</span>
                <pre className="p-3 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto max-h-60 text-gray-700">
                  {selectedLogModal.datos_anteriores ? JSON.stringify(selectedLogModal.datos_anteriores, null, 2) : "null"}
                </pre>
              </div>

              <div>
                <span className="block font-bold text-gray-600 mb-1 font-sans">Estado Nuevo (datos_nuevos)</span>
                <pre className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl overflow-x-auto max-h-60 text-blue-900">
                  {selectedLogModal.datos_nuevos ? JSON.stringify(selectedLogModal.datos_nuevos, null, 2) : "null"}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogModal(null)}
                className="px-5 py-2 bg-[#264575] text-white rounded-xl text-xs font-bold shadow"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
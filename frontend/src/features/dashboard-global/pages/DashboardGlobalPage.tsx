import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  TrendingUp, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Pencil, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import logo2 from "../../../assets/logo2.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const COLOR_PIE = ["#1E3A8A", "#7A2E22", "#3F6212", "#D97706", "#475569", "#7C3AED"];

export default function DashboardGlobalPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mostrarDashboard, setMostrarDashboard] = useState<boolean>(true);

  const [metrics, setMetrics] = useState({
    ranchos: { total: 0, activos: 0, inactivos: 0 },
    animales: { total: 0, activos: 0, bajas: 0 },
    usuarios: { total: 0, activos: 0, bajas: 0 },
    actividadGlobalNuevos: 0,
  });

  const [crecimientoData, setCrecimientoData] = useState<any[]>([]);
  const [actividadRanchosData, setActividadRanchosData] = useState<any[]>([]);
  const [usuariosPieData, setUsuariosPieData] = useState<any[]>([]);
  const [ranchosClavesList, setRanchosClavesList] = useState<any[]>([]);
  const [actividadesList, setActividadesList] = useState<any[]>([]);

  const getHeaders = () => {
    const token = localStorage.getItem("corraltech_token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await axios.get(`${API_URL}/master/dashboard/metricas`, {
        headers: getHeaders(),
      });

      const res = response.data;

      if (res) {
        setMetrics({
          ranchos: {
            total: res.ranchos?.total ?? 0,
            activos: res.ranchos?.activos ?? 0,
            inactivos: res.ranchos?.inactivos ?? 0,
          },
          animales: {
            total: res.animales?.total ?? 0,
            activos: res.animales?.activos ?? 0,
            bajas: res.animales?.bajas ?? 0,
          },
          usuarios: {
            total: res.usuarios?.total ?? 0,
            activos: res.usuarios?.activos ?? 0,
            bajas: res.usuarios?.bajas ?? 0,
          },
          actividadGlobalNuevos: res.actividad_global_nuevos ?? 0,
        });

        setCrecimientoData(res.crecimiento_animales || []);

        const actRanchos = (res.actividad_por_rancho || []).map((item: any) => ({
          rancho: item.rancho,
          acciones: item.actividad,
        }));
        setActividadRanchosData(actRanchos);

        const rolesData = (res.desglose_roles || []).map((item: any) => ({
          name: item.rol,
          value: item.cantidad,
        }));
        setUsuariosPieData(rolesData);

        setRanchosClavesList(res.ranchos_claves || []);
        setActividadesList(res.actividades_recientes || []);
      }
    } catch (error: any) {
      const msg = error.response?.data?.detail || "No se pudieron sincronizar las métricas con los esquemas de ranchos.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cardWithBgStyle = {
    backgroundImage: `url(${logo2})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  const Tag = ({ value, label }: { value: React.ReactNode; label: string }) => (
    <div className="bg-[#F3E6C6]/90 backdrop-blur-xs border border-[#7A2E22]/30 rounded-xl px-2.5 py-1 text-center shadow-xs min-w-[68px]">
      <span className="text-xs font-extrabold text-[#0D1F3C] block leading-none">
        {value !== undefined && value !== null ? value : 0}
      </span>
      <span className="text-[9px] font-bold text-[#7A2E22] block leading-tight mt-0.5">{label}</span>
    </div>
  );

  const isNuevo = (desc: string) => /se registr|crear|alta/i.test(desc || "");

  // Punto 15: Redirección directa hacia el Reporte por Rancho preseleccionado
  const handleEntrarRancho = (e: React.MouseEvent, idRancho: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/reportes", { state: { selectedRanchoId: idRancho, tab: "rancho" } });
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF8F5] min-h-screen">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TÍTULOS PRINCIPALES Y BOTÓN OCULTAR/MOSTRAR TABLERO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/70 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B365D]">Panel de Control Global</h1>
          <p className="text-sm font-bold text-[#7A2E22] mt-1">
            Resumen Ejecutivo y Métricas Multi-tenant en Tiempo Real
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarDashboard(!mostrarDashboard)}
          className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-gray-100 border border-[#7A2E22]/30 text-[#1B365D] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2"
        >
          <span>{mostrarDashboard ? "Ocultar Tablero" : "Mostrar Tablero"}</span>
          {mostrarDashboard ? <ChevronUp className="w-4 h-4 text-[#7A2E22]" /> : <ChevronDown className="w-4 h-4 text-[#7A2E22]" />}
        </button>
      </div>

      {mostrarDashboard && (
        <div className="space-y-6 animate-fade-in">
          {/* SECCIÓN 1: TARJETAS KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* CARD 1: RANCHOS TOTALES */}
            <div
              className="relative overflow-hidden rounded-3xl border-2 border-[#7A2E22] shadow-md p-4 sm:p-5 flex items-center justify-between min-h-[130px]"
              style={cardWithBgStyle}
            >
              <div className="absolute inset-0 bg-white/60 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0D1F3C] block leading-none">
                  {loading ? <Loader2 className="animate-spin text-gray-500 w-8 h-8" /> : metrics.ranchos.total}
                </span>
                <span className="text-xs font-bold text-[#0D1F3C] mt-2 block leading-tight">
                  Ranchos<br />Totales
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-1.5">
                <Tag value={metrics.ranchos.activos} label="Activos" />
                <Tag value={metrics.ranchos.inactivos} label="Inactivos" />
              </div>
            </div>

            {/* CARD 2: GANADO TOTAL CONSOLIDADO */}
            <div
              className="relative overflow-hidden rounded-3xl border-2 border-[#7A2E22] shadow-md p-4 sm:p-5 flex items-center justify-between min-h-[130px]"
              style={cardWithBgStyle}
            >
              <div className="absolute inset-0 bg-white/60 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0D1F3C] block leading-none">
                  {loading ? (
                    <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                  ) : (
                    metrics.animales.total.toLocaleString()
                  )}
                </span>
                <span className="text-xs font-bold text-[#0D1F3C] mt-2 block leading-tight">
                  Ganado Total<br />Consolidado
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-1.5">
                <Tag value={metrics.animales.activos} label="Activos" />
                <Tag value={metrics.animales.bajas} label="Bajas" />
              </div>
            </div>

            {/* CARD 3: USUARIOS PLATAFORMA */}
            <div
              className="relative overflow-hidden rounded-3xl border-2 border-[#7A2E22] shadow-md p-4 sm:p-5 flex items-center justify-between min-h-[130px]"
              style={cardWithBgStyle}
            >
              <div className="absolute inset-0 bg-white/60 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0D1F3C] block leading-none">
                  {loading ? <Loader2 className="animate-spin text-gray-500 w-8 h-8" /> : metrics.usuarios.total}
                </span>
                <span className="text-xs font-bold text-[#0D1F3C] mt-2 block leading-tight">
                  Usuarios<br />Plataforma
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-1.5">
                <Tag value={metrics.usuarios.activos} label="Activos" />
                <Tag value={metrics.usuarios.bajas} label="Inactivos" />
              </div>
            </div>

            {/* CARD 4: ACTIVIDAD SEMANAL */}
            <div
              className="relative overflow-hidden rounded-3xl border-2 border-[#7A2E22] shadow-md p-4 sm:p-5 flex items-center justify-between min-h-[130px]"
              style={cardWithBgStyle}
            >
              <div className="absolute inset-0 bg-white/60 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-center">
                <div className="w-9 h-9 rounded-xl bg-[#0D1F3C] flex items-center justify-center mb-1.5">
                  <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-[#0D1F3C] block leading-tight">
                  Actividad<br />Semanal
                </span>
              </div>

              <div className="relative z-10 flex flex-col justify-center">
                <Tag value={`+${metrics.actividadGlobalNuevos}`} label="Eventos" />
              </div>
            </div>

          </div>

          {/* SECCIÓN 2: GRÁFICAS Y RANCHOS CLAVES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Crecimiento de Animales */}
            <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col justify-between h-64">
              <h3 className="text-sm font-bold text-center text-[#0D1F3C]">Crecimiento de Animales</h3>
              <div className="w-full h-44 mt-2">
                {crecimientoData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={crecimientoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="mes" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1E3A8A", borderRadius: "8px", color: "#fff", border: "none" }}
                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cantidad"
                        name="Altas"
                        stroke="#1E3A8A"
                        fill="#1E3A8A"
                        fillOpacity={0.25}
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Sin datos de crecimiento
                  </div>
                )}
              </div>
            </div>

            {/* Actividad por Rancho */}
            <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col justify-between h-64">
              <h3 className="text-sm font-bold text-center text-[#0D1F3C]">Actividad por Rancho</h3>
              <div className="w-full h-44 mt-2">
                {actividadRanchosData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={actividadRanchosData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="rancho" stroke="#64748B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#7A2E22", borderRadius: "8px", color: "#fff", border: "none" }}
                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                      />
                      <Bar dataKey="acciones" name="Acciones" fill="#7A2E22" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Sin registros de actividad
                  </div>
                )}
              </div>
            </div>

            {/* Desglose de Roles */}
            <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col justify-between h-64">
              <h3 className="text-sm font-bold text-center text-[#0D1F3C]">Desglose de Roles</h3>
              <div className="w-full h-44 mt-2">
                {usuariosPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usuariosPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={52}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {usuariosPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLOR_PIE[index % COLOR_PIE.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0D1F3C", borderRadius: "8px", color: "#fff", border: "none" }}
                        itemStyle={{ color: "#fff", fontSize: "11px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Sin usuarios desglosados
                  </div>
                )}
              </div>
            </div>

            {/* Ranchos Claves con botón "Ver ->" funcional */}
            <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col h-64 overflow-hidden">
              <h3 className="text-base font-extrabold text-center text-[#7A2E22] mb-2">Ranchos Claves</h3>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase px-1 mb-1">
                <span>Rancho</span>
                <span>Animales</span>
              </div>
              <div className="overflow-y-auto flex-1 space-y-1.5 pr-0.5">
                {ranchosClavesList.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-8">Sin ranchos registrados</p>
                ) : (
                  ranchosClavesList.map((rancho, idx) => (
                    <div
                      key={rancho.id_rancho || idx}
                      className="flex items-center justify-between bg-[#FAF8F5] rounded-xl px-2.5 py-1.5 border border-gray-100/80 hover:bg-amber-50/30 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-bold text-[#0D1F3C] truncate">
                          {rancho.nombre}
                        </span>
                        <span className="block text-[11px] font-extrabold text-[#7A2E22]">
                          {rancho.animales_totales} cabezas
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleEntrarRancho(e, rancho.id_rancho)}
                        className="bg-[#0D1F3C] hover:bg-[#1E3A8A] text-white text-[10px] font-bold rounded-full px-3 py-1 flex items-center space-x-1 shrink-0 transition-all shadow-xs active:scale-95"
                      >
                        <span>Ver</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* SECCIÓN 3: ACTIVIDADES RECIENTES */}
          <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-center text-[#1B365D] mb-4">
              Bitácora de Actividades Recientes
            </h3>
            {actividadesList.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">
                No hay actividades recientes registradas en la base de datos central.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {actividadesList.map((act, idx) => {
                  const nuevo = isNuevo(act.descripcion || act.tipo);
                  return (
                    <div key={act.id_auditoria || idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/60 border border-gray-100">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          nuevo ? "bg-[#3F6212]/15 text-[#3F6212]" : "bg-[#1E3A8A]/15 text-[#1E3A8A]"
                        }`}
                      >
                        {nuevo ? <Plus className="w-3.5 h-3.5" strokeWidth={3} /> : <Pencil className="w-3 h-3 text-white" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-[#0D1F3C] block truncate">
                          {act.descripcion || act.tipo}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {act.fecha_hora}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
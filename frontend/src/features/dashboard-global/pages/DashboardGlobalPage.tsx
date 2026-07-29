import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TrendingUp, Loader2, AlertCircle, Plus, Pencil } from "lucide-react";
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
const COLOR_PIE = ["#1E3A8A", "#7A2E22", "#3F6212", "#D97706"];

export default function DashboardGlobalPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados formateados exactamente como lo responde tu backend
  const [metrics, setMetrics] = useState({
    ranchos: { total: 0, activos: 0, inactivos_o_bajas: 0 },
    animales: { total: 0, activos: 0, inactivos_o_bajas: 0 },
    usuarios: { total: 0, activos: 0, inactivos_o_bajas: 0 },
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // URL exacta que definiste en tu global_router.py:
        const response = await axios.get(`${API_URL}/master/dashboard/metricas`, {
          headers: getHeaders(),
        });

        console.log("DATOS REALES RECIBIDOS:", response.data);

        const res = response.data;

        // Mapeo directo con tu DashboardGlobalDataResponse
        if (res) {
          setMetrics({
            ranchos: res.ranchos || { total: 0, activos: 0, inactivos_o_bajas: 0 },
            animales: res.animales || { total: 0, activos: 0, inactivos_o_bajas: 0 },
            usuarios: res.usuarios || { total: 0, activos: 0, inactivos_o_bajas: 0 },
            actividadGlobalNuevos: res.actividad_global_nuevos || 0,
          });

          setCrecimientoData(res.crecimiento_animales || []);

          // Mapeo de actividad por rancho para Recharts
          const actRanchos = (res.actividad_por_rancho || []).map((item: any) => ({
            rancho: item.rancho,
            acciones: item.actividad,
          }));
          setActividadRanchosData(actRanchos);

          // Mapeo del desglose de roles
          const rolesData = (res.desglose_roles || []).map((item: any) => ({
            name: item.rol,
            value: item.cantidad,
          }));
          setUsuariosPieData(rolesData);

          setRanchosClavesList(res.ranchos_claves || []);
          setActividadesList(res.actividades_recientes || []);
        }
      } catch (error: any) {
        console.error("Error al conectar con el backend:", error);
        const msg = error.response
          ? `Error ${error.response.status}: ${error.response.data?.detail || "No autorizado o endpoint inválido"}`
          : "Servidor inalcanzable. Revisa si FastAPI está en ejecución.";
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardWithBgStyle = {
    backgroundImage: `url(${logo2})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  // Pequeña etiqueta "colgante" que se monta sobre el borde superior de la tarjeta
  const Tag = ({ value, label }: { value: React.ReactNode; label: string }) => (
    <div className="bg-[#F3E6C6] border border-[#7A2E22]/40 rounded-xl px-3 py-1 text-center shadow-md min-w-[64px]">
      <span className="text-sm font-extrabold text-[#0D1F3C] block leading-tight">{value}</span>
      <span className="text-[9px] font-bold text-[#7A2E22] block leading-tight">{label}</span>
    </div>
  );

  const isNuevo = (desc: string) => /se registr/i.test(desc || "");

  return (
    <div className="p-6 space-y-6 bg-[#FAF8F5] min-h-screen">
      {/* ALERTA EN CASO DE ERROR DE CONEXIÓN O AUTH */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TÍTULOS PRINCIPALES */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1B365D]">Panel de Control Global</h1>
        <p className="text-sm font-bold text-[#7A2E22] mt-1">
          Resumen Ejecutivo del Ecosistema CorralTech
        </p>
      </div>

      {/* 4 TARJETAS SUPERIORES CON ETIQUETAS COLGANTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
        {/* CARD 1: RANCHOS TOTALES */}
        <div
          className="relative overflow-visible rounded-3xl border-2 border-[#7A2E22] shadow-md min-h-[130px]"
          style={cardWithBgStyle}
        >
          <div className="absolute inset-0 rounded-3xl bg-white/55" />
          <div className="absolute -top-4 right-4 flex gap-2">
            <Tag value={metrics.ranchos.activos} label="Ranchos" />
            <Tag value={metrics.ranchos.inactivos_o_bajas} label="Inactivos" />
          </div>
          <div className="relative z-10 p-5 pt-9">
            <span className="text-4xl font-extrabold text-[#0D1F3C] block">
              {loading ? <Loader2 className="animate-spin text-gray-500" /> : metrics.ranchos.total}
            </span>
            <span className="text-xs font-bold text-[#0D1F3C] mt-1 block leading-tight">
              Ranchos
              <br />
              Totales
            </span>
          </div>
        </div>

        {/* CARD 2: ANIMALES REGISTRADOS */}
        <div
          className="relative overflow-visible rounded-3xl border-2 border-[#7A2E22] shadow-md min-h-[130px]"
          style={cardWithBgStyle}
        >
          <div className="absolute inset-0 rounded-3xl bg-white/55" />
          <div className="absolute -top-4 right-4 flex gap-2">
            <Tag value={metrics.animales.activos} label="Activos" />
            <Tag value={metrics.animales.inactivos_o_bajas} label="Bajas" />
          </div>
          <div className="relative z-10 p-5 pt-9">
            <span className="text-3xl font-extrabold text-[#0D1F3C] block">
              {loading ? (
                <Loader2 className="animate-spin text-gray-500" />
              ) : (
                metrics.animales.total.toLocaleString()
              )}
            </span>
            <span className="text-xs font-bold text-[#0D1F3C] mt-1 block leading-tight">
              Animales
              <br />
              Registrados
            </span>
          </div>
        </div>

        {/* CARD 3: USUARIOS PLATAFORMA */}
        <div
          className="relative overflow-visible rounded-3xl border-2 border-[#7A2E22] shadow-md min-h-[130px]"
          style={cardWithBgStyle}
        >
          <div className="absolute inset-0 rounded-3xl bg-white/55" />
          <div className="absolute -top-4 right-4 flex gap-2">
            <Tag value={metrics.usuarios.activos} label="Activos" />
            <Tag value={metrics.usuarios.inactivos_o_bajas} label="Bajas" />
          </div>
          <div className="relative z-10 p-5 pt-9">
            <span className="text-3xl font-extrabold text-[#0D1F3C] block">
              {loading ? <Loader2 className="animate-spin text-gray-500" /> : metrics.usuarios.total}
            </span>
            <span className="text-xs font-bold text-[#0D1F3C] mt-1 block leading-tight">
              Usuarios
              <br />
              Plataforma
            </span>
          </div>
        </div>

        {/* CARD 4: ACTIVIDAD GLOBAL */}
        <div
          className="relative overflow-visible rounded-3xl border-2 border-[#7A2E22] shadow-md min-h-[130px]"
          style={cardWithBgStyle}
        >
          <div className="absolute inset-0 rounded-3xl bg-white/55" />
          <div className="absolute -top-4 right-4">
            <Tag value={`+${metrics.actividadGlobalNuevos}`} label="Nuevos" />
          </div>
          <div className="relative z-10 p-5 pt-9 flex flex-col justify-center h-full">
            <div className="w-11 h-11 rounded-xl bg-[#0D1F3C] flex items-center justify-center mb-1">
              <TrendingUp className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-[#0D1F3C] mt-2 block leading-tight">
              Actividad
              <br />
              Global
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN SEGUNDA: GRÁFICAS Y RANCHOS CLAVES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Crecimiento de animales */}
        <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col justify-between h-64">
          <h3 className="text-sm font-bold text-center text-[#0D1F3C]">Crecimiento de animales</h3>
          <div className="w-full h-44 mt-2">
            {crecimientoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={crecimientoData}>
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                  <YAxis hide />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cantidad"
                    stroke="#1E3A8A"
                    fill="#1E3A8A"
                    fillOpacity={0.2}
                    strokeWidth={2}
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

        {/* Actividad por rancho */}
        <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col justify-between h-64">
          <h3 className="text-sm font-bold text-center text-[#0D1F3C]">Actividad por rancho</h3>
          <div className="w-full h-44 mt-2">
            {actividadRanchosData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actividadRanchosData}>
                  <XAxis dataKey="rancho" stroke="#94a3b8" fontSize={11} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="acciones" fill="#7A2E22" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Sin registros de actividad
              </div>
            )}
          </div>
        </div>

        {/* Desglose de usuarios por rol */}
        <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col justify-between h-64">
          <h3 className="text-sm font-bold text-center text-[#0D1F3C]">Desglose de usuarios por rol</h3>
          <div className="w-full h-44 mt-2">
            {usuariosPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usuariosPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {usuariosPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_PIE[index % COLOR_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Sin usuarios desglosados
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta: Ranchos claves */}
        <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-4 shadow-sm flex flex-col h-64 overflow-hidden">
          <h3 className="text-base font-extrabold text-center text-[#7A2E22] mb-2">Ranchos claves</h3>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase px-1 mb-1">
            <span>Nombre</span>
            <span>Animales totales</span>
          </div>
          <div className="overflow-y-auto flex-1 space-y-1.5">
            {ranchosClavesList.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">Sin ranchos registrados</p>
            ) : (
              ranchosClavesList.map((rancho, idx) => (
                <div
                  key={rancho.id_rancho || idx}
                  className="flex items-center justify-between bg-[#FAF8F5] rounded-xl px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-[#0D1F3C] truncate">
                      {rancho.nombre}
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      {rancho.animales_totales}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/ranchos/${rancho.id_rancho}`)}
                    className="bg-[#0D1F3C] text-white text-[10px] font-bold rounded-full px-3 py-1 flex-shrink-0 hover:bg-[#1B365D] transition-colors"
                  >
                    Entrar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN TERCERA: ACTIVIDADES RECIENTES */}
      <div className="rounded-3xl border-2 border-[#7A2E22] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-center text-[#1B365D] mb-4">
          Actividades recientes
        </h3>
        {actividadesList.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-2">
            No hay actividades recientes registradas en la base de datos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {actividadesList.map((act, idx) => {
              const nuevo = isNuevo(act.descripcion);
              return (
                <div key={act.id_auditoria || idx} className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      nuevo ? "bg-[#3F6212]/15 text-[#3F6212]" : "bg-[#1E3A8A]/15 text-[#1E3A8A]"
                    }`}
                  >
                    {nuevo ? <Plus className="w-3.5 h-3.5" strokeWidth={3} /> : <Pencil className="w-3 h-3" />}
                  </span>
                  <span className="text-xs font-semibold text-[#0D1F3C]">{act.descripcion}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
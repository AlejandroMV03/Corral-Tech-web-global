import { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Building,
  Lock,
  Sliders,
  Plus,
  Save,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Edit2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- INTERFACES ---
interface RolItem {
  id_rol: number;
  nombre: string;
  scope: string;
  descripcion?: string;
  puede_acceder_todos_ranchos?: boolean;
  activo: boolean;
}

interface PermisoRolItem {
  id_modulo: number;
  nombre_modulo?: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  puede_exportar: boolean;
  puede_desactivar: boolean;
}

interface ParametroGeneral {
  id_parametro: number;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo_dato: string;
  ultima_modificacion?: string;
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<"roles_globales" | "roles_rancho" | "permisos" | "parametros">("roles_globales");

  const [loading, setLoading] = useState<boolean>(false);
  const token = localStorage.getItem("corraltech_token");

  // --- ESTADOS TAB 1 & 2: ROLES ---
  const [rolesList, setRolesList] = useState<RolItem[]>([]);
  const [modalRolOpen, setModalRolOpen] = useState<boolean>(false);
  const [formRol, setFormRol] = useState({ nombre: "", descripcion: "", scope: "GLOBAL", puede_acceder_todos_ranchos: false });

  // --- ESTADOS TAB 3: MATRIZ DE PERMISOS ---
  const [allRoles, setAllRoles] = useState<RolItem[]>([]);
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null);
  const [matrizPermisos, setMatrizPermisos] = useState<PermisoRolItem[]>([]);
  const [guardandoPermisos, setGuardandoPermisos] = useState<boolean>(false);

  // --- ESTADOS TAB 4: PARÁMETROS GENERALES ---
  const [parametrosList, setParametrosList] = useState<ParametroGeneral[]>([]);
  const [paramEdit, setParamEdit] = useState<{ id: number; valor: string } | null>(null);

  // --- MODAL NOTIFICACIÓN ---
  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", message: "" });

  const getHeaders = () => ({ Authorization: `Bearer ${token}` });

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  // 1. CARGA DE ROLES
  const cargarRoles = async (scope: "GLOBAL" | "RANCHO") => {
    setLoading(true);
    try {
      const endpoint = scope === "GLOBAL" ? "/master/config/roles-globales" : "/master/config/roles-rancho";
      const res = await axios.get(`${API_URL}${endpoint}`, { headers: getHeaders() });
      setRolesList(res.data || []);
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudieron cargar los roles.");
    } finally {
      setLoading(false);
    }
  };

  // 2. CARGA DE TODOS LOS ROLES (PARA PESTAÑA PERMISOS)
  const cargarTodosLosRolesParaPermisos = async () => {
    try {
      const [resG, resR] = await Promise.all([
        axios.get(`${API_URL}/master/config/roles-globales`, { headers: getHeaders() }),
        axios.get(`${API_URL}/master/config/roles-rancho`, { headers: getHeaders() })
      ]);
      const consolidados = [...(resG.data || []), ...(resR.data || [])];
      setAllRoles(consolidados);
      if (consolidados.length > 0 && !selectedRolId) {
        setSelectedRolId(consolidados[0].id_rol);
      }
    } catch (err) {
      console.error("Error al cargar roles para la matriz:", err);
    }
  };

  // 3. CARGA DE MATRIZ DE PERMISOS POR ROL
  const cargarMatrizPermisos = async (idRol: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master/config/permisos/${idRol}`, { headers: getHeaders() });
      setMatrizPermisos(res.data || []);
    } catch (err: any) {
      mostrarStatus("error", "Error al consultar la matriz de permisos.");
    } finally {
      setLoading(false);
    }
  };

  // 4. CARGA DE PARÁMETROS GENERALES
  const cargarParametros = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master/config/parametros`, { headers: getHeaders() });
      setParametrosList(res.data || []);
    } catch (err: any) {
      mostrarStatus("error", "No se pudieron obtener los parámetros generales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "roles_globales") cargarRoles("GLOBAL");
    if (activeTab === "roles_rancho") cargarRoles("RANCHO");
    if (activeTab === "permisos") {
      cargarTodosLosRolesParaPermisos();
    }
    if (activeTab === "parametros") cargarParametros();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "permisos" && selectedRolId) {
      cargarMatrizPermisos(selectedRolId);
    }
  }, [selectedRolId, activeTab]);

  // CREAR NUEVO ROL
  const handleCrearRol = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/master/config/roles`, formRol, { headers: getHeaders() });
      setModalRolOpen(false);
      mostrarStatus("success", `Rol '${formRol.nombre}' creado exitosamente.`);
      cargarRoles(formRol.scope as "GLOBAL" | "RANCHO");
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudo registrar el nuevo rol.");
    }
  };

  // HANDLER CHECKBOX EN MATRIZ DE PERMISOS
  const handleTogglePermiso = (idModulo: number, campo: keyof PermisoRolItem) => {
    setMatrizPermisos((prev) =>
      prev.map((item) => {
        if (item.id_modulo === idModulo) {
          return { ...item, [campo]: !item[campo] };
        }
        return item;
      })
    );
  };

  // GUARDAR MATRIZ DE PERMISOS
  const handleGuardarMatriz = async () => {
    if (!selectedRolId) return;
    setGuardandoPermisos(true);
    try {
      await axios.post(
        `${API_URL}/master/config/permisos`,
        { id_rol: selectedRolId, permisos: matrizPermisos },
        { headers: getHeaders() }
      );
      mostrarStatus("success", "Matriz RBAC de permisos actualizada con éxito.");
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al actualizar la matriz de permisos.");
    } finally {
      setGuardandoPermisos(false);
    }
  };

  // GUARDAR PARÁMETRO GENERAL
  const handleGuardarParametro = async (idParametro: number) => {
    if (!paramEdit) return;
    try {
      await axios.patch(
        `${API_URL}/master/config/parametros/${idParametro}`,
        { valor: paramEdit.valor },
        { headers: getHeaders() }
      );
      setParamEdit(null);
      mostrarStatus("success", "Parámetro de configuración actualizado.");
      cargarParametros();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudo actualizar el parámetro.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-[#264575] tracking-tight">Configuración Global</h1>
        <p className="text-sm font-semibold text-[#885f3a]">
          Administración de Roles, Matriz RBAC de Permisos y Parámetros del Ecosistema
        </p>
      </div>

      {/* BARRA DE NAVEGACIÓN ENTRE SUBMÓDULOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/80 p-2 rounded-2xl border border-gray-200/80 shadow-sm">
        <button
          onClick={() => setActiveTab("roles_globales")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "roles_globales" ? "bg-[#264575] text-white shadow-md" : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span className="truncate">Roles Globales</span>
        </button>

        <button
          onClick={() => setActiveTab("roles_rancho")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "roles_rancho" ? "bg-[#264575] text-white shadow-md" : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <Building className="w-4 h-4 shrink-0" />
          <span className="truncate">Roles de Rancho</span>
        </button>

        <button
          onClick={() => setActiveTab("permisos")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "permisos" ? "bg-[#264575] text-white shadow-md" : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span className="truncate">Módulos y Permisos</span>
        </button>

        <button
          onClick={() => setActiveTab("parametros")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "parametros" ? "bg-[#264575] text-white shadow-md" : "text-gray-600 hover:bg-gray-100/60"
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span className="truncate">Parámetros Generales</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑA 1 Y 2: ROLES GLOBALES Y DE RANCHO */}
      {/* ============================================================== */}
      {(activeTab === "roles_globales" || activeTab === "roles_rancho") && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800">
              Catálogo de {activeTab === "roles_globales" ? "Roles de Nivel Global" : "Roles Operativos para Ranchos"}
            </h2>
            <button
              onClick={() => {
                setFormRol({
                  nombre: "",
                  descripcion: "",
                  scope: activeTab === "roles_globales" ? "GLOBAL" : "RANCHO",
                  puede_acceder_todos_ranchos: false
                });
                setModalRolOpen(true);
              }}
              className="px-4 py-2 bg-[#264575] text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 hover:bg-[#1e365d] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Rol</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#264575]/5 text-[11px] font-black text-[#264575] uppercase tracking-wider">
                    <th className="p-4">ID</th>
                    <th className="p-4">Nombre del Rol</th>
                    <th className="p-4">Ámbito (Scope)</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4 text-center">Acceso Multitenant</th>
                    <th className="p-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400 font-bold">Cargando catálogo de roles...</td>
                    </tr>
                  ) : rolesList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400 font-medium">No hay roles registrados en este ámbito.</td>
                    </tr>
                  ) : (
                    rolesList.map((r) => (
                      <tr key={r.id_rol} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-gray-400">#{r.id_rol}</td>
                        <td className="p-4 font-bold text-gray-900">{r.nombre}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.scope === 'GLOBAL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {r.scope}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{r.descripcion || "Sin descripción"}</td>
                        <td className="p-4 text-center">
                          {r.puede_acceder_todos_ranchos ? (
                            <span className="text-xs font-bold text-green-600">Sí (Acceso Global)</span>
                          ) : (
                            <span className="text-xs font-medium text-gray-400">Limitado por Rancho</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${r.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {r.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 3: MATRIZ DE PERMISOS (RBAC) */}
      {/* ============================================================== */}
      {activeTab === "permisos" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Seleccionar Rol para Configurar Matriz</label>
              <select
                value={selectedRolId || ""}
                onChange={(e) => setSelectedRolId(Number(e.target.value))}
                className="w-full md:w-80 px-3.5 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-xs font-bold text-gray-800 outline-none cursor-pointer"
              >
                {allRoles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre} ({r.scope})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGuardarMatriz}
              disabled={guardandoPermisos || !selectedRolId}
              className="px-6 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white text-xs font-bold rounded-xl shadow flex items-center space-x-2 transition-all disabled:opacity-50 self-end md:self-auto"
            >
              {guardandoPermisos ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Matriz de Permisos</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-700">
                Configurando acciones por módulo para el rol ID: <b>#{selectedRolId}</b>
              </span>
              <button onClick={() => selectedRolId && cargarMatrizPermisos(selectedRolId)} className="p-1 hover:bg-gray-200 rounded-lg text-gray-500">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#264575]/5 text-[11px] font-black text-[#264575] uppercase tracking-wider">
                    <th className="p-4">Módulo</th>
                    <th className="p-4 text-center">Ver</th>
                    <th className="p-4 text-center">Crear</th>
                    <th className="p-4 text-center">Editar</th>
                    <th className="p-4 text-center">Eliminar</th>
                    <th className="p-4 text-center">Exportar</th>
                    <th className="p-4 text-center">Desactivar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 font-bold">Cargando matriz RBAC...</td>
                    </tr>
                  ) : matrizPermisos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 font-medium">
                        No hay módulos parametrizados para el ámbito de este rol.
                      </td>
                    </tr>
                  ) : (
                    matrizPermisos.map((p) => (
                      <tr key={p.id_modulo} className="hover:bg-amber-50/20 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{p.nombre_modulo}</td>
                        
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.puede_ver}
                            onChange={() => handleTogglePermiso(p.id_modulo, "puede_ver")}
                            className="w-4 h-4 accent-[#264575] cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.puede_crear}
                            onChange={() => handleTogglePermiso(p.id_modulo, "puede_crear")}
                            className="w-4 h-4 accent-[#264575] cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.puede_editar}
                            onChange={() => handleTogglePermiso(p.id_modulo, "puede_editar")}
                            className="w-4 h-4 accent-[#264575] cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.puede_eliminar}
                            onChange={() => handleTogglePermiso(p.id_modulo, "puede_eliminar")}
                            className="w-4 h-4 accent-[#264575] cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.puede_exportar}
                            onChange={() => handleTogglePermiso(p.id_modulo, "puede_exportar")}
                            className="w-4 h-4 accent-[#264575] cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.puede_desactivar}
                            onChange={() => handleTogglePermiso(p.id_modulo, "puede_desactivar")}
                            className="w-4 h-4 accent-[#264575] cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 4: PARÁMETROS GENERALES */}
      {/* ============================================================== */}
      {activeTab === "parametros" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-800">Parámetros Centrales de la Plataforma CorralTech</h2>
            <button onClick={cargarParametros} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-8 text-gray-400 font-bold text-xs">Cargando parámetros globales...</p>
            ) : (
              parametrosList.map((param) => (
                <div
                  key={param.id_parametro}
                  className="p-4 border border-gray-100 rounded-xl bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-[#264575]">{param.clave}</span>
                    <p className="text-gray-500">{param.descripcion || "Parámetro global de sistema"}</p>
                    <span className="text-[10px] text-gray-400">Tipo: {param.tipo_dato}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {paramEdit?.id === param.id_parametro ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={paramEdit.valor}
                          onChange={(e) => setParamEdit({ ...paramEdit, valor: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white outline-none font-medium"
                        />
                        <button
                          onClick={() => handleGuardarParametro(param.id_parametro)}
                          className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setParamEdit(null)} className="p-1.5 bg-gray-300 text-gray-700 rounded-lg">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-800 font-mono">
                          {param.valor}
                        </span>
                        <button
                          onClick={() => setParamEdit({ id: param.id_parametro, valor: param.valor })}
                          className="p-1.5 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                          title="Editar Parámetro"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL CREAR ROL */}
      {modalRolOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleCrearRol} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Registrar Nuevo Rol</h3>
              <p className="text-xs font-bold text-[#885f3a]">Ámbito de aplicación: {formRol.scope}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  value={formRol.nombre}
                  onChange={(e) => setFormRol({ ...formRol, nombre: e.target.value })}
                  placeholder="Ej. Auditor de Campo, Supervisor Global"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={formRol.descripcion}
                  onChange={(e) => setFormRol({ ...formRol, descripcion: e.target.value })}
                  placeholder="Breve descripción de responsabilidades..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none font-medium h-20"
                />
              </div>

              {formRol.scope === "GLOBAL" && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="chkAcceso"
                    checked={formRol.puede_acceder_todos_ranchos}
                    onChange={(e) => setFormRol({ ...formRol, puede_acceder_todos_ranchos: e.target.checked })}
                    className="w-4 h-4 accent-[#264575]"
                  />
                  <label htmlFor="chkAcceso" className="font-bold text-gray-700 cursor-pointer">
                    Permitir acceso multitenant a todos los ranchos
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalRolOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-[#264575] text-white rounded-xl font-bold text-xs shadow-md">
                Guardar Rol
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL STATUS NOTIFICACIÓN */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 text-center shadow-2xl border border-gray-50 space-y-3">
            <div className="flex justify-center">
              {statusModal.type === "success" ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
            </div>
            <p className="text-sm font-bold text-gray-700 leading-tight">{statusModal.message}</p>
            <button
              type="button"
              onClick={() => setStatusModal({ ...statusModal, open: false })}
              className="w-full py-2 bg-[#264575] text-white text-xs font-bold rounded-xl shadow"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
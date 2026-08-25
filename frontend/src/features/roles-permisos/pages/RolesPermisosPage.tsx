import { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Plus, Loader2, CheckCircle, XCircle, Lock, Save, RefreshCw } from "lucide-react";
import { sanitizarTexto } from "../../../lib/sanitizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Rol {
  id_rol: number;
  nombre: string;
  scope: "GLOBAL" | "RANCHO";
  descripcion?: string;
  puede_acceder_todos_ranchos?: boolean;
  activo: boolean;
}

interface PermisoItem {
  id_modulo: number;
  nombre_modulo: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  puede_exportar: boolean;
  puede_desactivar: boolean;
}

export default function RolesPermisosPage() {
  const [scopeActivo, setScopeActivo] = useState<"GLOBAL" | "RANCHO">("GLOBAL");
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [permisos, setPermisos] = useState<PermisoItem[]>([]);
  const [permisosOriginales, setPermisosOriginales] = useState<string>("");

  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [loadingPermisos, setLoadingPermisos] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Modal Crear Rol
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({
    nombre: "",
    descripcion: "",
    puede_acceder_todos_ranchos: false
  });

  // Modal Status
  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", message: "" });
  const token = localStorage.getItem("corraltech_token");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // 1. Cargar lista de roles según el Scope (GLOBAL / RANCHO)
  const cargarRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await axios.get(`${API_URL}/master/roles?scope=${scopeActivo}`, getHeaders());
      setRoles(res.data);
      if (res.data.length > 0) {
        setRolSeleccionado(res.data[0]);
      } else {
        setRolSeleccionado(null);
        setPermisos([]);
      }
    } catch (err: any) {
      mostrarStatus("error", "No se pudo recuperar la lista de roles parametrizados.");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, [scopeActivo]);

  // 2. Cargar Matriz de Permisos cuando se selecciona un rol
  useEffect(() => {
    if (rolSeleccionado) {
      cargarMatrizPermisos(rolSeleccionado.id_rol);
    }
  }, [rolSeleccionado]);

  const cargarMatrizPermisos = async (idRol: number) => {
    try {
      setLoadingPermisos(true);
      const res = await axios.get(`${API_URL}/master/roles/${idRol}/permisos`, getHeaders());
      setPermisos(res.data);
      setPermisosOriginales(JSON.stringify(res.data));
    } catch (err: any) {
      mostrarStatus("error", "No se pudo recuperar la matriz de permisos para este rol.");
    } finally {
      setLoadingPermisos(false);
    }
  };

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  // Alternar Checkbox individual
  const handleTogglePermiso = (idModulo: number, campo: keyof PermisoItem) => {
    setPermisos((prev) =>
      prev.map((item) => {
        if (item.id_modulo === idModulo) {
          return { ...item, [campo]: !item[campo] };
        }
        return item;
      })
    );
  };

  // Marcar / Desmarcar todos los permisos de un módulo
  const handleToggleFilaCompleta = (idModulo: number) => {
    setPermisos((prev) =>
      prev.map((item) => {
        if (item.id_modulo === idModulo) {
          const todosActivos =
            item.puede_ver &&
            item.puede_crear &&
            item.puede_editar &&
            item.puede_eliminar &&
            item.puede_exportar &&
            item.puede_desactivar;
          return {
            ...item,
            puede_ver: !todosActivos,
            puede_crear: !todosActivos,
            puede_editar: !todosActivos,
            puede_eliminar: !todosActivos,
            puede_exportar: !todosActivos,
            puede_desactivar: !todosActivos
          };
        }
        return item;
      })
    );
  };

  // Guardar Cambios en la Matriz
  const handleGuardarPermisos = async () => {
    if (!rolSeleccionado) return;
    try {
      setGuardando(true);
      await axios.post(
        `${API_URL}/master/roles/${rolSeleccionado.id_rol}/permisos`,
        {
          id_rol: rolSeleccionado.id_rol,
          permisos: permisos
        },
        getHeaders()
      );
      setPermisosOriginales(JSON.stringify(permisos));
      mostrarStatus("success", `Matriz de permisos de "${rolSeleccionado.nombre}" guardada con éxito.`);
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al actualizar los permisos del rol.");
    } finally {
      setGuardando(false);
    }
  };

  // Crear Nuevo Rol
  const handleCrearRol = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: sanitizarTexto(formCrear.nombre, 14),
        scope: scopeActivo,
        descripcion: formCrear.descripcion.trim(),
        puede_acceder_todos_ranchos: formCrear.puede_acceder_todos_ranchos
      };

      await axios.post(`${API_URL}/master/roles`, payload, getHeaders());
      setModalCrearOpen(false);
      setFormCrear({ nombre: "", descripcion: "", puede_acceder_todos_ranchos: false });
      mostrarStatus("success", "Nuevo rol registrado en la plataforma.");
      cargarRoles();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudo registrar el rol.");
    }
  };

  const hayCambiosSinGuardar = JSON.stringify(permisos) !== permisosOriginales;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Roles y Permisos (RBAC)</h1>
          <p className="text-sm font-semibold text-[#885f3a]">
            Matriz de Control de Accesos por Módulos y Ámbitos de Seguridad
          </p>
        </div>

        <button
          onClick={() => setModalCrearOpen(true)}
          className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Rol ({scopeActivo})</span>
        </button>
      </div>

      {/* SELECTOR DE SCOPE (GLOBAL / RANCHO) */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setScopeActivo("GLOBAL")}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            scopeActivo === "GLOBAL"
              ? "border-[#264575] text-[#264575]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Ámbito Global (Ecosistema Central)
        </button>
        <button
          onClick={() => setScopeActivo("RANCHO")}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            scopeActivo === "RANCHO"
              ? "border-[#264575] text-[#264575]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Ámbito Local (Operaciones de Rancho)
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL: SELECTOR DE ROLES + MATRIZ DE PERMISOS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUMNA IZQUIERDA: LISTA DE ROLES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-black text-[#264575] uppercase tracking-wide">Roles Disponibles</span>
            <Shield className="w-4 h-4 text-gray-400" />
          </div>

          {loadingRoles ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-[#264575] animate-spin" />
              <span className="text-xs font-bold text-gray-400">Cargando roles...</span>
            </div>
          ) : roles.length === 0 ? (
            <p className="text-xs text-center py-6 text-gray-400">No hay roles definidos en este ámbito.</p>
          ) : (
            <div className="space-y-1.5">
              {roles.map((r) => {
                const isSelected = rolSeleccionado?.id_rol === r.id_rol;
                return (
                  <button
                    key={r.id_rol}
                    onClick={() => setRolSeleccionado(r)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#264575] text-white shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="truncate">{r.nombre}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                        isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      ID #{r.id_rol}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: MATRIZ DE PERMISOS */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#264575]">
                Matriz de Permisos: <span className="text-[#822420]">{rolSeleccionado?.nombre || "—"}</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {rolSeleccionado?.descripcion || "Asigna los privilegios de visualización y modificación por módulo."}
              </p>
            </div>

            <button
              onClick={handleGuardarPermisos}
              disabled={!hayCambiosSinGuardar || guardando || !rolSeleccionado}
              className="px-5 py-2 bg-[#264575] hover:bg-[#1e355b] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 self-end sm:self-auto"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Matriz</span>
            </button>
          </div>

          {loadingPermisos ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#264575] animate-spin" />
              <span className="text-xs font-bold text-gray-400">Consultando privilegios de módulos...</span>
            </div>
          ) : permisos.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-bold">
              Selecciona un rol de la lista izquierda para cargar su matriz de seguridad.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-extrabold uppercase text-gray-500 tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3 rounded-l-xl">Módulo del Sistema</th>
                    <th className="px-3 py-3 text-center">Ver</th>
                    <th className="px-3 py-3 text-center">Crear</th>
                    <th className="px-3 py-3 text-center">Editar</th>
                    <th className="px-3 py-3 text-center">Eliminar</th>
                    <th className="px-3 py-3 text-center">Exportar</th>
                    <th className="px-3 py-3 text-center">Desactivar</th>
                    <th className="px-3 py-3 text-center rounded-r-xl">Todo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {permisos.map((p) => (
                    <tr key={p.id_modulo} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#0D1F3C] flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#264575]" />
                        <span>{p.nombre_modulo}</span>
                      </td>

                      {(
                        [
                          "puede_ver",
                          "puede_crear",
                          "puede_editar",
                          "puede_eliminar",
                          "puede_exportar",
                          "puede_desactivar"
                        ] as const
                      ).map((accion) => (
                        <td key={accion} className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={p[accion]}
                            onChange={() => handleTogglePermiso(p.id_modulo, accion)}
                            className="w-4 h-4 rounded text-[#264575] focus:ring-[#264575] border-gray-300 cursor-pointer"
                          />
                        </td>
                      ))}

                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFilaCompleta(p.id_modulo)}
                          className="p-1 text-gray-400 hover:text-[#264575] transition-colors"
                          title="Alternar todos los permisos de este módulo"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR ROL */}
      {modalCrearOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCrearRol}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100"
          >
            <div>
              <h3 className="text-lg font-black text-[#264575]">Definir Nuevo Rol</h3>
              <p className="text-xs font-bold text-[#885f3a]">Ámbito asignado: {scopeActivo}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={formCrear.nombre}
                  onChange={(e) => setFormCrear({ ...formCrear, nombre: sanitizarTexto(e.target.value, 14) })}
                  placeholder="Ej. Auditor (máx 14)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium focus:ring-1 focus:ring-[#264575]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Descripción / Función</label>
                <textarea
                  rows={2}
                  maxLength={150}
                  value={formCrear.descripcion}
                  onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })}
                  placeholder="Finalidad del rol en la organización..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-1 focus:ring-[#264575]"
                />
              </div>

              {scopeActivo === "GLOBAL" && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="acceso_todos"
                    checked={formCrear.puede_acceder_todos_ranchos}
                    onChange={(e) =>
                      setFormCrear({ ...formCrear, puede_acceder_todos_ranchos: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#264575] focus:ring-[#264575] border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="acceso_todos" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                    Acceso irrestricto a todos los ranchos
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalCrearOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                Crear Rol
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATUS MODAL */}
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
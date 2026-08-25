import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Key } from "lucide-react";
import { sanitizarTexto } from "../../../lib/sanitizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface UsuarioRanchoConsolidado {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
  id_rancho: number;
  nombre_rancho: string;
  id_rol: number;
  rol: string;
}

export default function UsuariosRanchoPage() {
  const [usuarios, setUsuarios] = useState<UsuarioRanchoConsolidado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal Edición de Datos y Rol
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioRanchoConsolidado | null>(null);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "", id_rol: 4, activo: true });
  const [errorsEdit, setErrorsEdit] = useState<Record<string, string>>({});
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  // Modal Cambio Forzado de Contraseña
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [usuarioPasswordEditando, setUsuarioPasswordEditando] = useState<UsuarioRanchoConsolidado | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  // Modal Status
  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", message: "" });
  const token = localStorage.getItem("corraltech_token");

  const rolesCatalogo = [
    { id: 4, nombre: "Superadministrador rancho" },
    { id: 5, nombre: "Administrador rancho" },
    { id: 6, nombre: "Empleado rancho" },
    { id: 7, nombre: "Trabajador rancho" },
    { id: 8, nombre: "Veterinario rancho" },
    { id: 9, nombre: "Consulta rancho" },
  ];

  const cargarUsuariosConsolidados = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/ranchos/usuarios-consolidados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudo recuperar el personal de los ranchos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuariosConsolidados();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const limpiarErrorEdit = (campo: string) => {
    if (errorsEdit[campo]) {
      setErrorsEdit((prev) => {
        const nuevo = { ...prev };
        delete nuevo[campo];
        return nuevo;
      });
    }
  };

  const validarFormEdit = () => {
    const nuevosErrores: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formEdit.nombres.trim()) {
      nuevosErrores.nombres = "El nombre es obligatorio.";
    } else if (formEdit.nombres.length > 14) {
      nuevosErrores.nombres = "El nombre no debe exceder los 14 caracteres.";
    }

    if (formEdit.apellidos.trim() && formEdit.apellidos.length > 14) {
      nuevosErrores.apellidos = "Los apellidos no deben exceder los 14 caracteres.";
    }

    if (formEdit.email.trim()) {
      if (!emailRegex.test(formEdit.email.trim())) {
        nuevosErrores.email = "Formato de correo electrónico inválido.";
      } else if (formEdit.email.trim().length > 100) {
        nuevosErrores.email = "El correo no debe exceder los 100 caracteres.";
      }
    }

    setErrorsEdit(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const abrirModalEdicion = (u: UsuarioRanchoConsolidado) => {
    setUsuarioEditando(u);
    setErrorsEdit({});
    setFormEdit({
      nombres: u.nombres,
      apellidos: u.apellidos || "",
      email: u.email || "",
      id_rol: u.id_rol,
      activo: u.activo
    });
    setModalEditOpen(true);
  };

  const abrirModalPassword = (u: UsuarioRanchoConsolidado) => {
    setUsuarioPasswordEditando(u);
    setNuevaPassword("");
    setErrorPassword("");
    setModalPasswordOpen(true);
  };

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    if (!validarFormEdit()) return;

    setGuardandoEdit(true);
    try {
      await axios.patch(
        `${API_URL}/master/ranchos/${usuarioEditando.id_rancho}/usuarios/${usuarioEditando.id_usuario}?id_rol=${formEdit.id_rol}&activo=${formEdit.activo}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalEditOpen(false);
      mostrarStatus("success", "Cuenta local actualizada y auditada correctamente.");
      cargarUsuariosConsolidados();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al actualizar el usuario.");
    } finally {
      setGuardandoEdit(false);
    }
  };

  const handleProcesarPasswordRancho = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioPasswordEditando) return;

    if (!nuevaPassword.trim()) {
      setErrorPassword("La contraseña es obligatoria.");
      return;
    } else if (nuevaPassword.length < 6) {
      setErrorPassword("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setGuardandoPassword(true);
    try {
      await axios.patch(
        `${API_URL}/master/ranchos/${usuarioPasswordEditando.id_rancho}/usuarios/${usuarioPasswordEditando.id_usuario}/reset-password`,
        { nueva_password: nuevaPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalPasswordOpen(false);
      setNuevaPassword("");
      setErrorPassword("");
      mostrarStatus("success", `Contraseña de @${usuarioPasswordEditando.username} reestablecida con éxito.`);
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al procesar el cambio de contraseña.");
    } finally {
      setGuardandoPassword(false);
    }
  };

  const handleToggleEstadoRapido = async (u: UsuarioRanchoConsolidado) => {
    try {
      const nuevoEstado = !u.activo;
      await axios.patch(
        `${API_URL}/master/ranchos/${u.id_rancho}/usuarios/${u.id_usuario}?id_rol=${u.id_rol}&activo=${nuevoEstado}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuarios(usuarios.map(usr => usr.id_usuario === u.id_usuario ? { ...usr, activo: nuevoEstado } : usr));
      mostrarStatus("success", nuevoEstado ? "Acceso al rancho restablecido." : "Baja lógica ejecutada.");
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudo alterar el estado de acceso.");
    }
  };

  // Punto 13: Deshabilitar botón si no hay cambios
  const hayCambios = usuarioEditando ? (
    formEdit.nombres.trim() !== (usuarioEditando.nombres || "").trim() ||
    formEdit.apellidos.trim() !== (usuarioEditando.apellidos || "").trim() ||
    formEdit.email.trim() !== (usuarioEditando.email || "").trim() ||
    Number(formEdit.id_rol) !== Number(usuarioEditando.id_rol) ||
    formEdit.activo !== usuarioEditando.activo
  ) : false;

  const usuariosFiltrados = usuarios.filter(u => {
    const termino = busqueda.toLowerCase();
    return (
      u.nombres.toLowerCase().includes(termino) ||
      (u.apellidos && u.apellidos.toLowerCase().includes(termino)) ||
      u.username.toLowerCase().includes(termino) ||
      u.nombre_rancho.toLowerCase().includes(termino) ||
      u.rol.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-[#264575] tracking-tight">Usuarios por Rancho</h1>
        <p className="text-sm font-semibold text-[#885f3a]">Supervisión operativa, asignación de roles y control de credenciales</p>
      </div>

      <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3.5 rounded-xl shadow-sm max-w-xl transition-all focus-within:border-[#264575] focus-within:ring-1 focus-within:ring-[#264575]">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          placeholder="Buscar por encargado, usuario, rancho o nivel de acceso..." 
          className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium" 
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Sincronizando cuentas locales...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">No se encontraron registros de personal.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">Personal del Rancho</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Rancho / Tenant</th>
                  <th className="px-6 py-4">Nivel de Acceso</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {u.nombres} {u.apellidos || ""}
                      <span className="block text-xs text-gray-400 font-normal mt-0.5">{u.email || "Sin correo"}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">@{u.username}</td>
                    <td className="px-6 py-4 text-[#264575] font-bold">{u.nombre_rancho}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase ${
                        u.id_rol === 4 
                          ? "bg-amber-50 text-amber-700 border border-amber-200" 
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => handleToggleEstadoRapido(u)} className="focus:outline-none transition-transform active:scale-95">
                        {u.activo ? <ToggleRight className="w-9 h-9 text-green-600" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button 
                          type="button" 
                          onClick={() => abrirModalEdicion(u)} 
                          className="p-2 text-[#264575] hover:bg-[#264575]/10 rounded-xl transition-all inline-block"
                          title="Editar rol y datos"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => abrirModalPassword(u)} 
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all inline-block"
                          title="Restablecer contraseña manualmente"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN DE ROL (Puntos 10 & 13) */}
      {modalEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form noValidate onSubmit={handleGuardarCambios} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Modificar Usuario de Rancho</h3>
              <p className="text-xs font-bold text-[#885f3a]">Asignado al tenant: {usuarioEditando?.nombre_rancho}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    value={formEdit.nombres} 
                    onChange={(e) => {
                      setFormEdit({ ...formEdit, nombres: sanitizarTexto(e.target.value, 14) });
                      limpiarErrorEdit("nombres");
                    }} 
                    placeholder="Máx 14 car."
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                      errorsEdit.nombres ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errorsEdit.nombres && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsEdit.nombres}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    value={formEdit.apellidos} 
                    onChange={(e) => {
                      setFormEdit({ ...formEdit, apellidos: sanitizarTexto(e.target.value, 14) });
                      limpiarErrorEdit("apellidos");
                    }} 
                    placeholder="Máx 14 car."
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                      errorsEdit.apellidos ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errorsEdit.apellidos && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsEdit.apellidos}</span>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  maxLength={100}
                  value={formEdit.email} 
                  onChange={(e) => {
                    setFormEdit({ ...formEdit, email: e.target.value.replace(/\s+/g, "") });
                    limpiarErrorEdit("email");
                  }} 
                  placeholder="correo@ejemplo.com"
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                    errorsEdit.email ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                />
                {errorsEdit.email && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsEdit.email}</span>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nivel de Acceso (Rol Local)</label>
                <select 
                  value={formEdit.id_rol} 
                  onChange={(e) => setFormEdit({ ...formEdit, id_rol: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-1 focus:ring-[#264575] cursor-pointer"
                >
                  {rolesCatalogo.map((rol) => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Estado de la cuenta</label>
                <select 
                  value={String(formEdit.activo)} 
                  onChange={(e) => setFormEdit({ ...formEdit, activo: e.target.value === "true" })}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-1 focus:ring-[#264575] cursor-pointer"
                >
                  <option value="true">Habilitado (Acceso total a la App Móvil)</option>
                  <option value="false">Inhabilitado (Baja Lógica / Suspendido)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalEditOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button 
                type="submit" 
                disabled={!hayCambios || guardandoEdit}
                className="px-5 py-2 bg-[#264575] hover:bg-[#1e355b] text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                {guardandoEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Guardar y Auditar</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL RESTABLECER CONTRASEÑA (Puntos 5 & 10) */}
      {modalPasswordOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form noValidate onSubmit={handleProcesarPasswordRancho} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-amber-600 flex items-center gap-2"><Key className="w-5 h-5"/> Blanqueo de Contraseña</h3>
              <p className="text-xs font-bold text-gray-500">Usuario: @{usuarioPasswordEditando?.username} • Rancho: {usuarioPasswordEditando?.nombre_rancho}</p>
            </div>
            <div className="text-sm">
              <label className="block text-xs font-bold text-gray-600 mb-1">Nueva Contraseña Forzada *</label>
              <input 
                type="text" 
                value={nuevaPassword} 
                onChange={(e) => {
                  setNuevaPassword(e.target.value);
                  if (errorPassword) setErrorPassword("");
                }} 
                placeholder="Mínimo 6 caracteres" 
                className={`w-full px-4 py-2 border rounded-xl outline-none font-mono text-xs transition-colors ${
                  errorPassword ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-amber-500"
                }`} 
              />
              {errorPassword && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorPassword}</span>}
              <p className="text-[11px] text-amber-600 mt-2 font-medium">⚠️ Se guardará y auditará el cambio manual en la base de datos central.</p>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalPasswordOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button 
                type="submit" 
                disabled={guardandoPassword}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {guardandoPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Actualizar Contraseña</span>
              </button>
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
            <button type="button" onClick={() => setStatusModal({ ...statusModal, open: false })} className="w-full py-2 bg-[#264575] text-white text-xs font-bold rounded-xl shadow transition-colors">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}
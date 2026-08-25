import { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Shield, LifeBuoy } from "lucide-react";
import { sanitizarTexto, sanitizarUsername } from "../../../lib/sanitizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface UsuarioGlobal {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
  nombre_rol: "Administrador Global" | "Soporte Global";
}

export default function PersonalGlobalPage() {
  const [usuarios, setUsuarios] = useState<UsuarioGlobal[]>([]);
  const [tabActiva, setTabActiva] = useState<"TODOS" | "ADMIN" | "SOPORTE">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal y formulario de creación
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({ 
    nombres: "", 
    apellidos: "", 
    username: "", 
    email: "", 
    password: "",
    rol_solicitado: "Administrador Global"
  });
  const [errorsCrear, setErrorsCrear] = useState<Record<string, string>>({});
  const [guardandoCrear, setGuardandoCrear] = useState(false);

  // Modal y formulario de edición
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioGlobal | null>(null);
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "" });
  const [errorsEdit, setErrorsEdit] = useState<Record<string, string>>({});
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", message: "" });
  const token = localStorage.getItem("corraltech_token");

  const cargarPersonalGlobal = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/usuarios-globales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar el listado de personal global.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPersonalGlobal();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const limpiarErrorCrear = (campo: string) => {
    if (errorsCrear[campo]) {
      setErrorsCrear((prev) => {
        const nuevo = { ...prev };
        delete nuevo[campo];
        return nuevo;
      });
    }
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

  const validarCrear = () => {
    const nuevosErrores: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formCrear.nombres.trim()) {
      nuevosErrores.nombres = "El nombre es obligatorio.";
    } else if (formCrear.nombres.length > 14) {
      nuevosErrores.nombres = "El nombre no debe exceder los 14 caracteres.";
    }

    if (formCrear.apellidos.trim() && formCrear.apellidos.length > 14) {
      nuevosErrores.apellidos = "Los apellidos no deben exceder los 14 caracteres.";
    }

    if (!formCrear.username.trim()) {
      nuevosErrores.username = "El nombre de usuario es obligatorio.";
    } else if (formCrear.username.length > 14) {
      nuevosErrores.username = "El usuario no debe exceder los 14 caracteres.";
    }

    if (formCrear.email.trim()) {
      if (!emailRegex.test(formCrear.email.trim())) {
        nuevosErrores.email = "Formato de correo electrónico inválido.";
      } else if (formCrear.email.trim().length > 100) {
        nuevosErrores.email = "El correo no debe exceder los 100 caracteres.";
      }
    }

    if (!formCrear.password.trim()) {
      nuevosErrores.password = "La contraseña de acceso es obligatoria.";
    } else if (formCrear.password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener mínimo 6 caracteres.";
    }

    setErrorsCrear(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarEdit = () => {
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

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarCrear()) return;

    setGuardandoCrear(true);
    try {
      const payload = {
        nombres: formCrear.nombres.trim(),
        apellidos: formCrear.apellidos.trim() || null,
        username: formCrear.username.trim(),
        email: formCrear.email.trim().toLowerCase() || null,
        password: formCrear.password,
        rol_solicitado: formCrear.rol_solicitado
      };

      await axios.post(`${API_URL}/master/usuarios-globales`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalCrearOpen(false);
      setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "", rol_solicitado: "Administrador Global" });
      setErrorsCrear({});
      mostrarStatus("success", `Personal asignado como ${formCrear.rol_solicitado} correctamente.`);
      cargarPersonalGlobal();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al registrar la cuenta global.");
    } finally {
      setGuardandoCrear(false);
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    if (!validarEdit()) return;

    setGuardandoEdit(true);
    try {
      const payload = {
        nombres: formEdit.nombres.trim(),
        apellidos: formEdit.apellidos.trim() || null,
        email: formEdit.email.trim().toLowerCase() || null
      };

      await axios.put(`${API_URL}/master/usuarios-globales/${usuarioEditando.id_usuario}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      setErrorsEdit({});
      mostrarStatus("success", "Datos de cuenta actualizados con éxito.");
      cargarPersonalGlobal();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "No se pudieron salvar los cambios.");
    } finally {
      setGuardandoEdit(false);
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      await axios.patch(`${API_URL}/master/usuarios-globales/${id}/estado?activo=${nuevoEstado}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(usuarios.map(u => u.id_usuario === id ? { ...u, activo: nuevoEstado } : u));
      mostrarStatus("success", "Estatus de seguridad de la cuenta modificado.");
    } catch (err) {
      mostrarStatus("error", "Error al cambiar los privilegios de acceso.");
    }
  };

  const abrirEdicion = (u: UsuarioGlobal) => {
    setUsuarioEditando(u);
    setErrorsEdit({});
    setFormEdit({ nombres: u.nombres || "", apellidos: u.apellidos || "", email: u.email || "" });
    setModalEdicionOpen(true);
  };

  // Punto 13: Deshabilitar botón si no hay cambios
  const hayCambios = usuarioEditando ? (
    formEdit.nombres.trim() !== (usuarioEditando.nombres || "").trim() ||
    formEdit.apellidos.trim() !== (usuarioEditando.apellidos || "").trim() ||
    formEdit.email.trim() !== (usuarioEditando.email || "").trim()
  ) : false;

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = 
      u.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()));

    if (tabActiva === "ADMIN") return coincideBusqueda && u.nombre_rol === "Administrador Global";
    if (tabActiva === "SOPORTE") return coincideBusqueda && u.nombre_rol === "Soporte Global";
    return coincideBusqueda;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Gestión de Personal Global</h1>
          <p className="text-sm font-semibold text-[#885f3a]">Sprint 7 - Control Corporativo de Administradores y Soporte Técnico</p>
        </div>
        <button 
          onClick={() => {
            setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "", rol_solicitado: "Administrador Global" });
            setErrorsCrear({});
            setModalCrearOpen(true);
          }}
          className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Dar de Alta Miembro</span>
        </button>
      </div>

      <div className="flex border-b border-gray-200 gap-2">
        {(["TODOS", "ADMIN", "SOPORTE"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              tabActiva === tab 
                ? "border-[#264575] text-[#264575]" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "TODOS" && "Todos los Miembros"}
            {tab === "ADMIN" && "Administradores Globales"}
            {tab === "SOPORTE" && "Soporte Técnico"}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3.5 rounded-xl shadow-sm max-w-md transition-all focus-within:border-[#264575] focus-within:ring-1 focus-within:ring-[#264575]">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, usuario, correo..." 
          className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Sincronizando cuentas con el ecosistema raíz...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">
            No se encontraron usuarios en este segmento organizativo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">UID</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Nivel de Acceso (Rol)</th>
                  <th className="px-6 py-4 text-center">Estado Acceso</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">
                      #{String(u.id_usuario).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-base">
                      {u.nombres} {u.apellidos || ""}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-500">@{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.nombre_rol === "Administrador Global"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-purple-50 text-purple-700 border-purple-100"
                      }`}>
                        {u.nombre_rol === "Administrador Global" ? <Shield className="w-3.5 h-3.5" /> : <LifeBuoy className="w-3.5 h-3.5" />}
                        {u.nombre_rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleToggleEstado(u.id_usuario, u.activo)}
                        className="focus:outline-none transition-transform active:scale-95 inline-block align-middle"
                      >
                        {u.activo ? (
                          <ToggleRight className="w-9 h-9 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => abrirEdicion(u)}
                        className="p-2 text-[#264575] hover:bg-[#264575]/10 rounded-xl transition-all inline-block"
                        title="Modificar perfil"
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

      {/* MODAL DE CREACIÓN (Punto 10) */}
      {modalCrearOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form noValidate onSubmit={handleCrearUsuario} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Alta de Personal de Plataforma</h3>
              <p className="text-xs font-bold text-[#885f3a]">Asignación de roles jerárquicos globales</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    value={formCrear.nombres} 
                    onChange={(e) => {
                      setFormCrear({ ...formCrear, nombres: sanitizarTexto(e.target.value, 14) });
                      limpiarErrorCrear("nombres");
                    }} 
                    placeholder="Máx 14 car."
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                      errorsCrear.nombres ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errorsCrear.nombres && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsCrear.nombres}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    value={formCrear.apellidos} 
                    onChange={(e) => {
                      setFormCrear({ ...formCrear, apellidos: sanitizarTexto(e.target.value, 14) });
                      limpiarErrorCrear("apellidos");
                    }} 
                    placeholder="Máx 14 car."
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                      errorsCrear.apellidos ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errorsCrear.apellidos && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsCrear.apellidos}</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Username Único *</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    value={formCrear.username} 
                    onChange={(e) => {
                      setFormCrear({ ...formCrear, username: sanitizarUsername(e.target.value, 14) });
                      limpiarErrorCrear("username");
                    }} 
                    placeholder="ejemplo.user (máx 14)"
                    className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                      errorsCrear.username ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errorsCrear.username && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsCrear.username}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Rol de Plataforma *</label>
                  <select value={formCrear.rol_solicitado} onChange={(e) => setFormCrear({ ...formCrear, rol_solicitado: e.target.value as any })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white font-semibold text-gray-700 text-xs focus:ring-1 focus:ring-[#264575] cursor-pointer">
                    <option value="Administrador Global">Administrador Global</option>
                    <option value="Soporte Global">Soporte Global</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email de Contacto</label>
                <input 
                  type="email" 
                  maxLength={100}
                  value={formCrear.email} 
                  onChange={(e) => {
                    setFormCrear({ ...formCrear, email: e.target.value.replace(/\s+/g, "") });
                    limpiarErrorCrear("email");
                  }} 
                  placeholder="correo@corraltech.com"
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                    errorsCrear.email ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                />
                {errorsCrear.email && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsCrear.email}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña de Acceso *</label>
                <input 
                  type="password" 
                  value={formCrear.password} 
                  onChange={(e) => {
                    setFormCrear({ ...formCrear, password: e.target.value });
                    limpiarErrorCrear("password");
                  }} 
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                    errorsCrear.password ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                />
                {errorsCrear.password && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsCrear.password}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalCrearOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={guardandoCrear} className="px-5 py-2 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50">
                {guardandoCrear && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Dar de Alta</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE EDICIÓN (Punto 10 & 13) */}
      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form noValidate onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Modificar Perfil Operativo</h3>
              <p className="text-xs font-bold text-[#885f3a]">Actualizando datos de @{usuarioEditando?.username}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                <input 
                  type="text" 
                  maxLength={14}
                  value={formEdit.nombres} 
                  onChange={(e) => {
                    setFormEdit({ ...formEdit, nombres: sanitizarTexto(e.target.value, 14) });
                    limpiarErrorEdit("nombres");
                  }} 
                  placeholder="Máx 14 caracteres"
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
                  placeholder="Máx 14 caracteres"
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                    errorsEdit.apellidos ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                />
                {errorsEdit.apellidos && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsEdit.apellidos}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email Corporativo</label>
                <input 
                  type="email" 
                  maxLength={100}
                  value={formEdit.email} 
                  onChange={(e) => {
                    setFormEdit({ ...formEdit, email: e.target.value.replace(/\s+/g, "") });
                    limpiarErrorEdit("email");
                  }} 
                  placeholder="correo@corraltech.com"
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                    errorsEdit.email ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                />
                {errorsEdit.email && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsEdit.email}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setModalEdicionOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button 
                type="submit" 
                disabled={!hayCambios || guardandoEdit} 
                className="px-5 py-2 bg-[#264575] hover:bg-[#1e355b] text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                {guardandoEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      )}

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
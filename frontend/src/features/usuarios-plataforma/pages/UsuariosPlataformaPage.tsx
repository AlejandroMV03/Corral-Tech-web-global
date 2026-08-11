import { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Key, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface DueñoGlobal {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
}

const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const REGEX_USERNAME = /^[a-z0-9._-]+$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMINIOS_PUBLICOS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "live.com", "icloud.com", "aol.com", "protonmail.com"];
const DOMINIO_CORPORATIVO = "corraltech.com";
const REGEX_ESPECIAL_PASSWORD = /[!@#$%^&*()_+\-=]/;

function validarNombres(value: string): string {
  const v = value.trim();
  if (!v) return "El nombre es obligatorio.";
  if (v.length < 2) return "El nombre debe tener al menos 2 caracteres.";
  if (v.length > 50) return "El nombre no puede exceder 50 caracteres.";
  if (!REGEX_NOMBRE.test(v)) return "Solo se permiten letras y espacios.";
  return "";
}

function validarApellidos(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.length > 50) return "Los apellidos no pueden exceder 50 caracteres.";
  if (!REGEX_NOMBRE.test(v)) return "Solo se permiten letras y espacios.";
  return "";
}

function validarUsernameFormato(value: string): string {
  const v = value.trim();
  if (!v) return "El username es obligatorio.";
  if (v.length < 3) return "El username debe tener al menos 3 caracteres.";
  if (v.length > 30) return "El username no puede exceder 30 caracteres.";
  if (!REGEX_USERNAME.test(v)) return "Solo minúsculas, números, puntos, guiones y guiones bajos.";
  return "";
}

function validarEmail(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (!REGEX_EMAIL.test(v)) return "El formato de correo no es válido.";
  const dominio = v.split("@")[1]?.toLowerCase();
  if (dominio && DOMINIOS_PUBLICOS.includes(dominio)) {
    return "No se permiten correos de dominios públicos (gmail, outlook, etc.).";
  }
  return "";
}

function validarPassword(value: string): string {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < 10) return "La contraseña debe tener al menos 10 caracteres.";
  if (value.length > 64) return "La contraseña no puede exceder 64 caracteres.";
  if (!/[A-Z]/.test(value)) return "Debe incluir al menos una letra mayúscula.";
  if (!/[a-z]/.test(value)) return "Debe incluir al menos una letra minúscula.";
  if (!/[0-9]/.test(value)) return "Debe incluir al menos un número.";
  if (!REGEX_ESPECIAL_PASSWORD.test(value)) return "Debe incluir al menos un carácter especial (!@#$%^&*()_+-=).";
  return "";
}

function calcularFuerzaPassword(value: string): number {
  let fuerza = 0;
  if (value.length >= 10) fuerza++;
  if (/[A-Z]/.test(value)) fuerza++;
  if (/[a-z]/.test(value)) fuerza++;
  if (/[0-9]/.test(value)) fuerza++;
  if (REGEX_ESPECIAL_PASSWORD.test(value)) fuerza++;
  return fuerza;
}

const ETIQUETAS_FUERZA = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"];
const COLORES_FUERZA = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-green-600"];

export default function UsuariosPlataformaPage() {
  const [usuarios, setUsuarios] = useState<DueñoGlobal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // ---------- Modal de creación ----------
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({ nombres: "", apellidos: "", username: "", email: "", password: "" });
  const [erroresCrear, setErroresCrear] = useState<{ [key: string]: string }>({});
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [usernameDisponible, setUsernameDisponible] = useState<boolean | null>(null);
  const [verificandoUsername, setVerificandoUsername] = useState(false);
  const [enviandoCrear, setEnviandoCrear] = useState(false);

  const [usuarioEditando, setUsuarioEditando] = useState<DueñoGlobal | null>(null);
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "" });
  const [erroresEdit, setErroresEdit] = useState<{ [key: string]: string }>({});
  const [enviandoEdit, setEnviandoEdit] = useState(false);

  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });
  const token = localStorage.getItem("corraltech_token");

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/dueños-globales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar el listado de dueños globales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const mostrarStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  // ==================== FORMULARIO DE CREACIÓN ====================
  const formCrearTocado = Object.values(formCrear).some((v) => v.trim().length > 0);

  const validarCampoCrear = (campo: string, valor: string) => {
    let error = "";
    switch (campo) {
      case "nombres":
        error = validarNombres(valor);
        break;
      case "apellidos":
        error = validarApellidos(valor);
        break;
      case "username": {
        error = validarUsernameFormato(valor);
        if (!error) {
          const existe = usuarios.some((u) => u.username.toLowerCase() === valor.trim().toLowerCase());
          if (existe) error = "El username ya está en uso.";
        }
        break;
      }
      case "email": {
        error = validarEmail(valor);
        if (!error && valor.trim()) {
          const existe = usuarios.some((u) => u.email && u.email.toLowerCase() === valor.trim().toLowerCase());
          if (existe) error = "Este correo ya está registrado.";
        }
        break;
      }
      case "password":
        error = validarPassword(valor);
        break;
      default:
        break;
    }
    setErroresCrear((prev) => ({ ...prev, [campo]: error }));
    return error;
  };

  const handleChangeCrear = (campo: string, valor: string) => {
    const valorNormalizado = campo === "username" ? valor.toLowerCase().replace(/\s/g, "") : valor;
    setFormCrear((prev) => ({ ...prev, [campo]: valorNormalizado }));
    if (campo === "username") setUsernameDisponible(null);
    validarCampoCrear(campo, valorNormalizado);
  };

  const handleBlurCrear = (campo: string, valor: string) => {
    const valorTrim = valor.trim();
    setFormCrear((prev) => ({ ...prev, [campo]: valorTrim }));
    const error = validarCampoCrear(campo, valorTrim);

    // Verificación de disponibilidad de username al perder el foco
    if (campo === "username" && !error && valorTrim) {
      setVerificandoUsername(true);
      setTimeout(() => {
        const existe = usuarios.some((u) => u.username.toLowerCase() === valorTrim.toLowerCase());
        setUsernameDisponible(!existe);
        if (existe) {
          setErroresCrear((prev) => ({ ...prev, username: "El username ya está en uso." }));
        }
        setVerificandoUsername(false);
      }, 300);
    }
  };

  const fuerzaPassword = calcularFuerzaPassword(formCrear.password);

  const formCrearValido =
    !validarNombres(formCrear.nombres) &&
    !validarApellidos(formCrear.apellidos) &&
    !validarUsernameFormato(formCrear.username) &&
    !validarEmail(formCrear.email) &&
    !validarPassword(formCrear.password) &&
    usernameDisponible !== false &&
    !usuarios.some((u) => u.email && formCrear.email.trim() && u.email.toLowerCase() === formCrear.email.trim().toLowerCase());

  const resetFormCrear = () => {
    setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "" });
    setErroresCrear({});
    setUsernameDisponible(null);
    setMostrarPassword(false);
  };

  const handleCerrarModalCrear = () => {
    if (formCrearTocado) {
      const confirmar = window.confirm("¿Deseas cancelar? Se perderán los datos ingresados.");
      if (!confirmar) return;
    }
    setModalCrearOpen(false);
    resetFormCrear();
  };

  // REGISTRAR NUEVO DUEÑO GLOBAL
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    const datosLimpios = {
      nombres: formCrear.nombres.trim(),
      apellidos: formCrear.apellidos.trim(),
      username: formCrear.username.trim().toLowerCase(),
      email: formCrear.email.trim().toLowerCase(),
      password: formCrear.password
    };

    // Validación final antes de enviar
    const errores = {
      nombres: validarNombres(datosLimpios.nombres),
      apellidos: validarApellidos(datosLimpios.apellidos),
      username: validarUsernameFormato(datosLimpios.username),
      email: validarEmail(datosLimpios.email),
      password: validarPassword(datosLimpios.password)
    };
    setErroresCrear(errores);

    const hayErrores = Object.values(errores).some((err) => err);
    if (hayErrores || enviandoCrear) return;

    try {
      setEnviandoCrear(true);
      await axios.post(`${API_URL}/master/dueños-globales`, datosLimpios, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalCrearOpen(false);
      resetFormCrear();
      mostrarStatus("success", "Cuenta de Dueño Global creada exitosamente.");
      cargarUsuarios();
    } catch (err: any) {
      const mensaje = err.response?.data?.detail || "No se pudo registrar la cuenta.";
      mostrarStatus("error", mensaje);
      if (typeof mensaje === "string" && mensaje.toLowerCase().includes("username")) {
        setErroresCrear((prev) => ({ ...prev, username: mensaje }));
      } else if (typeof mensaje === "string" && mensaje.toLowerCase().includes("email")) {
        setErroresCrear((prev) => ({ ...prev, email: mensaje }));
      }
    } finally {
      setEnviandoCrear(false);
    }
  };

  const formEditTocado =
    usuarioEditando !== null &&
    (formEdit.nombres !== usuarioEditando.nombres ||
      formEdit.apellidos !== (usuarioEditando.apellidos || "") ||
      formEdit.email !== (usuarioEditando.email || ""));

  const validarCampoEdit = (campo: string, valor: string) => {
    let error = "";
    switch (campo) {
      case "nombres":
        error = validarNombres(valor);
        break;
      case "apellidos":
        error = validarApellidos(valor);
        break;
      case "email": {
        error = validarEmail(valor);
        if (!error && valor.trim()) {
          const existe = usuarios.some(
            (u) =>
              u.email &&
              u.email.toLowerCase() === valor.trim().toLowerCase() &&
              u.id_usuario !== usuarioEditando?.id_usuario
          );
          if (existe) error = "Este correo ya está registrado por otro usuario.";
        }
        break;
      }
      default:
        break;
    }
    setErroresEdit((prev) => ({ ...prev, [campo]: error }));
    return error;
  };

  const handleChangeEdit = (campo: string, valor: string) => {
    setFormEdit((prev) => ({ ...prev, [campo]: valor }));
    validarCampoEdit(campo, valor);
  };

  const handleBlurEdit = (campo: string, valor: string) => {
    const valorTrim = valor.trim();
    setFormEdit((prev) => ({ ...prev, [campo]: valorTrim }));
    validarCampoEdit(campo, valorTrim);
  };

  const formEditValido = !validarNombres(formEdit.nombres) && !validarApellidos(formEdit.apellidos) && !validarEmail(formEdit.email);

  const handleCerrarModalEdit = () => {
    if (formEditTocado) {
      const confirmar = window.confirm("¿Deseas cancelar? Se perderán los cambios realizados.");
      if (!confirmar) return;
    }
    setModalEdicionOpen(false);
    setErroresEdit({});
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;

    const datosLimpios = {
      nombres: formEdit.nombres.trim(),
      apellidos: formEdit.apellidos.trim(),
      email: formEdit.email.trim().toLowerCase()
    };

    const errores = {
      nombres: validarNombres(datosLimpios.nombres),
      apellidos: validarApellidos(datosLimpios.apellidos),
      email: validarEmail(datosLimpios.email)
    };
    setErroresEdit(errores);

    const hayErrores = Object.values(errores).some((err) => err);
    if (hayErrores || enviandoEdit) return;

    try {
      setEnviandoEdit(true);
      await axios.put(`${API_URL}/master/dueños-globales/${usuarioEditando.id_usuario}`, datosLimpios, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      setErroresEdit({});
      mostrarStatus("success", "Datos de la cuenta actualizados correctamente.");
      cargarUsuarios();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al actualizar la cuenta.");
    } finally {
      setEnviandoEdit(false);
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      await axios.patch(`${API_URL}/master/dueños-globales/${id}/estado?activo=${nuevoEstado}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(usuarios.map(u => u.id_usuario === id ? { ...u, activo: nuevoEstado } : u));
      mostrarStatus("success", `Estatus de cuenta modificado correctamente.`);
    } catch (err) {
      mostrarStatus("error", "No se pudo cambiar el estado de acceso del usuario.");
    }
  };

  const abrirEdicion = (u: DueñoGlobal) => {
    setUsuarioEditando(u);
    setFormEdit({ nombres: u.nombres, apellidos: u.apellidos || "", email: u.email || "" });
    setErroresEdit({});
    setModalEdicionOpen(true);
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      
      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Administración de Dueños Globales</h1>
          <p className="text-sm font-semibold text-[#885f3a]">Módulo de Seguridad y Cuentas de Nivel Raíz (DG)</p>
        </div>
        <button 
          onClick={() => setModalCrearOpen(true)}
          className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Dueño Global</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3.5 rounded-xl shadow-sm max-w-md transition-all focus-within:border-[#264575] focus-within:ring-1 focus-within:ring-[#264575]">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, usuario o email..." 
          className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium"
        />
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Cargando credenciales maestras...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">
            No se encontraron usuarios administradores globales registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">UID</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email Corporativo</th>
                  <th className="px-6 py-4 text-center">Acceso Sistema</th>
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
                    <td className="px-6 py-4 text-[#885f3a] font-mono text-xs bg-amber-50/40 px-2 py-1 rounded-md inline-block my-3 ml-4">
                      @{u.username}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">{u.email || "—"}</td>
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
                        title="Editar cuenta"
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

      {modalCrearOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form onSubmit={handleCrearUsuario} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#264575]">Registrar Nuevo Dueño Global</h3>
              <p className="text-xs font-bold text-[#885f3a]">Generación de credenciales con privilegios raíz</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formCrear.nombres}
                    onChange={(e) => handleChangeCrear("nombres", e.target.value)}
                    onBlur={(e) => handleBlurCrear("nombres", e.target.value)}
                    maxLength={50}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-1 outline-none font-medium ${erroresCrear.nombres ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                  />
                  {erroresCrear.nombres && <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresCrear.nombres}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={formCrear.apellidos}
                    onChange={(e) => handleChangeCrear("apellidos", e.target.value)}
                    onBlur={(e) => handleBlurCrear("apellidos", e.target.value)}
                    maxLength={50}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-1 outline-none font-medium ${erroresCrear.apellidos ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                  />
                  {erroresCrear.apellidos && <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresCrear.apellidos}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Username Único *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formCrear.username}
                    onChange={(e) => handleChangeCrear("username", e.target.value)}
                    onBlur={(e) => handleBlurCrear("username", e.target.value)}
                    maxLength={30}
                    placeholder="ejemplo.dg"
                    className={`w-full px-4 py-2 pr-9 border rounded-xl focus:ring-1 outline-none font-medium ${erroresCrear.username ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                  />
                  {verificandoUsername && (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                  {!verificandoUsername && usernameDisponible === true && !erroresCrear.username && (
                    <CheckCircle className="w-4 h-4 text-green-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {erroresCrear.username ? (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresCrear.username}</p>
                ) : usernameDisponible === true ? (
                  <p className="text-green-600 text-[11px] font-semibold mt-1">Username disponible.</p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email Corporativo</label>
                <input
                  type="email"
                  value={formCrear.email}
                  onChange={(e) => handleChangeCrear("email", e.target.value)}
                  onBlur={(e) => handleBlurCrear("email", e.target.value)}
                  placeholder="correo@corraltech.com"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-1 outline-none font-medium ${erroresCrear.email ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                />
                {erroresCrear.email ? (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresCrear.email}</p>
                ) : (
                  formCrear.email.trim() &&
                  !formCrear.email.trim().toLowerCase().endsWith(`@${DOMINIO_CORPORATIVO}`) && (
                    <p className="text-amber-600 text-[11px] font-semibold mt-1">
                      Recomendado: usar un correo del dominio @{DOMINIO_CORPORATIVO}.
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña Inicial *</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    required
                    minLength={10}
                    value={formCrear.password}
                    onChange={(e) => handleChangeCrear("password", e.target.value)}
                    onBlur={(e) => validarCampoCrear("password", e.target.value)}
                    className={`w-full pl-9 pr-9 py-2 border rounded-xl focus:ring-1 outline-none font-medium ${erroresCrear.password ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formCrear.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${i < fuerzaPassword ? COLORES_FUERZA[fuerzaPassword - 1] : "bg-gray-150 bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-bold text-gray-500">
                      Fortaleza: {ETIQUETAS_FUERZA[Math.max(fuerzaPassword - 1, 0)]}
                    </p>
                  </div>
                )}
                {erroresCrear.password && <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresCrear.password}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 w-full">
              <button type="button" onClick={handleCerrarModalCrear} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formCrearValido || enviandoCrear}
                className="px-5 py-2 bg-[#822420] hover:bg-[#681c19] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#822420] text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2"
              >
                {enviandoCrear && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Crear Administrador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PARA EDICIÓN DE DG */}
      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <form onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#264575]">Modificar Perfil Máster</h3>
              <p className="text-xs font-bold text-[#885f3a]">Actualización de identidad para @{usuarioEditando?.username}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  value={formEdit.nombres}
                  onChange={(e) => handleChangeEdit("nombres", e.target.value)}
                  onBlur={(e) => handleBlurEdit("nombres", e.target.value)}
                  maxLength={50}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-1 outline-none font-medium ${erroresEdit.nombres ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                />
                {erroresEdit.nombres && <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresEdit.nombres}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos</label>
                <input
                  type="text"
                  value={formEdit.apellidos}
                  onChange={(e) => handleChangeEdit("apellidos", e.target.value)}
                  onBlur={(e) => handleBlurEdit("apellidos", e.target.value)}
                  maxLength={50}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-1 outline-none font-medium ${erroresEdit.apellidos ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                />
                {erroresEdit.apellidos && <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresEdit.apellidos}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email Corporativo</label>
                <input
                  type="email"
                  value={formEdit.email}
                  onChange={(e) => handleChangeEdit("email", e.target.value)}
                  onBlur={(e) => handleBlurEdit("email", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-1 outline-none font-medium ${erroresEdit.email ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#264575]"}`}
                />
                {erroresEdit.email && <p className="text-red-600 text-[11px] font-semibold mt-1">{erroresEdit.email}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 w-full">
              <button type="button" onClick={handleCerrarModalEdit} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formEditValido || enviandoEdit}
                className="px-5 py-2 bg-[#264575] hover:bg-[#1e355b] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#264575] text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2"
              >
                {enviandoEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Guardar Cambios
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
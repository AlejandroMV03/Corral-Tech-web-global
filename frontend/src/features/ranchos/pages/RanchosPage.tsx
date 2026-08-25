import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, ShieldAlert, Key, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { 
  sanitizarTexto, 
  sanitizarTelefono, 
  sanitizarUsername, 
  sanitizarCoordenadas 
} from "../../../lib/sanitizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLANES_CONFIG: { [key: string]: { maxAnimales: number; maxFotoMb: number; esPersonalizado: boolean } } = {
  "1": { maxAnimales: 50, maxFotoMb: 5, esPersonalizado: false },
  "2": { maxAnimales: 100, maxFotoMb: 5, esPersonalizado: false },
  "3": { maxAnimales: 200, maxFotoMb: 10, esPersonalizado: false },
  "4": { maxAnimales: 500, maxFotoMb: 10, esPersonalizado: false },
  "5": { maxAnimales: 500, maxFotoMb: 10, esPersonalizado: true }
};

export default function RanchosPage() {
  const [step, setStep] = useState(1);

  // --- ESTADOS DEL RANCHO ---
  const [nombre, setNombre] = useState("");
  const [propietario, setPropietario] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [idPlan, setIdPlan] = useState("1");
  const [catalogosPersonalizados, setCatalogosPersonalizados] = useState(false);
  const [maxAnimalesOverride, setMaxAnimalesOverride] = useState("50");
  const [maxFotoMbOverride, setMaxFotoMbOverride] = useState("5");

  // --- ESTADOS DEL SUPERADMIN ---
  const [adminNombres, setAdminNombres] = useState("");
  const [adminApellidos, setAdminApellidos] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // --- ESTADOS DE CONTROL Y ERRORES ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // --- ESTADOS PARA LOS MODALES ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");

  const limpiarError = (campo: string) => {
    if (errors[campo]) {
      setErrors((prev) => {
        const nuevo = { ...prev };
        delete nuevo[campo];
        return nuevo;
      });
    }
  };

  const tieneDatosIntroducidos = () => {
    return !!(nombre || propietario || ubicacion || telefono || emailContacto || adminNombres || adminUsername);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (tieneDatosIntroducidos() && !loading) {
        e.preventDefault();
        e.returnValue = "Tiene un proceso de alta en ejecución. Si sale o recarga, la tarea se cancelará.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [nombre, propietario, ubicacion, telefono, emailContacto, adminNombres, adminUsername, loading]);

  useEffect(() => {
    const configPlan = PLANES_CONFIG[idPlan];
    if (configPlan) {
      if (!configPlan.esPersonalizado) {
        setMaxAnimalesOverride(configPlan.maxAnimales.toString());
        setMaxFotoMbOverride(configPlan.maxFotoMb.toString());
      } else {
        setMaxAnimalesOverride("500");
        setMaxFotoMbOverride("10");
      }
    }
  }, [idPlan]);

  const handleKeyDownSoloNumeros = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    if (e.key === " " || !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleKeyDownSoloLetras = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", " "].includes(e.key)) return;
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleUbicacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUbicacion(sanitizarCoordenadas(e.target.value, 40));
    limpiarError("ubicacion");
  };

  const validarCoordenadas = (valor: string): string | null => {
    const partes = valor.split(",");
    if (partes.length !== 2) {
      return "Ingresa latitud y longitud separadas por una coma (ej: 19.8437, -90.5255).";
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

    const contarDecimales = (numStr: string) => {
      const splitDec = numStr.split(".");
      return splitDec.length > 1 ? splitDec[1].length : 0;
    };

    if (contarDecimales(latRaw) > 6 || contarDecimales(lonRaw) > 6) {
      return "Las coordenadas no deben rebasar 6 decimales de precisión.";
    }

    return null;
  };

  const validarPaso = () => {
    const nuevosErrores: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 1) {
      if (!nombre.trim()) {
        nuevosErrores.nombre = "El nombre del rancho es obligatorio.";
      } else if (nombre.length > 14) {
        nuevosErrores.nombre = "El nombre del rancho no debe exceder los 14 caracteres."; 
      }

      if (propietario.trim() && propietario.length > 14) {
        nuevosErrores.propietario = "El nombre del propietario no debe exceder los 14 caracteres.";
      }

      if (!telefono.trim()) {
        nuevosErrores.telefono = "El teléfono de contacto es obligatorio.";
      } else if (telefono.trim().length < 10 || telefono.trim().length > 14) {
        nuevosErrores.telefono = "El teléfono debe tener entre 10 y 14 dígitos.";
      }

      if (emailContacto.trim()) {
        if (!emailRegex.test(emailContacto.trim())) {
          nuevosErrores.emailContacto = "El formato del correo de contacto no es válido.";
        } else if (emailContacto.trim().length > 100) {
          nuevosErrores.emailContacto = "El correo no puede exceder los 100 caracteres.";
        }
      }

      if (!ubicacion.trim()) {
        nuevosErrores.ubicacion = "Las coordenadas geográficas del rancho son obligatorias.";
      } else {
        const errorCoordenadas = validarCoordenadas(ubicacion.trim());
        if (errorCoordenadas) {
          nuevosErrores.ubicacion = errorCoordenadas;
        }
      }
    }

    if (step === 2) {
      if (!adminNombres.trim()) {
        nuevosErrores.adminNombres = "Los nombres del administrador son obligatorios.";
      } else if (adminNombres.length > 14) {
        nuevosErrores.adminNombres = "El nombre no debe exceder los 14 caracteres.";
      }

      if (adminApellidos.trim() && adminApellidos.length > 14) {
        nuevosErrores.adminApellidos = "Los apellidos no deben exceder los 14 caracteres.";
      }

      if (!adminUsername.trim()) {
        nuevosErrores.adminUsername = "El username de acceso es obligatorio.";
      } else if (adminUsername.length > 14) {
        nuevosErrores.adminUsername = "El username no debe exceder los 14 caracteres.";
      }
      
      if (adminEmail.trim()) {
        if (!emailRegex.test(adminEmail.trim())) {
          nuevosErrores.adminEmail = "El formato del correo no es válido.";
        } else if (adminEmail.trim().length > 100) {
          nuevosErrores.adminEmail = "El correo no puede exceder los 100 caracteres.";
        }
      }
      
      if (!adminPassword.trim() || adminPassword.length < 6) {
        nuevosErrores.adminPassword = "La contraseña debe tener mínimo 6 caracteres.";
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSiguiente = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validarPaso()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleAtras = () => {
    setStep(1);
    setErrors({});
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarPaso()) return;
    setShowConfirmModal(true);
  };

  const ejecutarRegistroReal = async () => {
    setShowConfirmModal(false);
    setLoading(true); 
    const configPlan = PLANES_CONFIG[idPlan];

    const payload = {
      rancho: {
        nombre: nombre.trim(),
        ubicacion: ubicacion.trim(),
        propietario: propietario.trim() || null,
        telefono: telefono.trim() || null,
        email_contacto: emailContacto.trim() || null,
        id_plan: parseInt(idPlan, 10),
        catalogos_personalizados: catalogosPersonalizados,
        max_animales_override: configPlan.esPersonalizado ? parseInt(maxAnimalesOverride, 10) : null,
        max_foto_mb_override: null
      },
      superadmin: {
        nombres: adminNombres.trim(),
        apellidos: adminApellidos.trim() || null,
        username: adminUsername.trim(),
        email: adminEmail.trim() || null,
        password: adminPassword,
      }
    };

    try {
      const token = localStorage.getItem("corraltech_token"); 

      await axios.post(`${API_URL}/master/ranchos`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });

      setStatusType("success");
      setStatusMessage(`¡Felicidades! El rancho "${nombre}" y su Súper Administrador se configuraron exitosamente.`);
      setShowStatusModal(true);
      
      setStep(1);
      setNombre(""); setPropietario(""); setUbicacion(""); setTelefono(""); setEmailContacto("");
      setAdminNombres(""); setAdminApellidos(""); setAdminUsername(""); setAdminEmail(""); setAdminPassword("");
      setIdPlan("1"); setCatalogosPersonalizados(false); setMaxAnimalesOverride("50"); setMaxFotoMbOverride("5");
      setErrors({});
    } catch (error: any) {
      setStatusType("error");
      if (error.code === "ECONNABORTED") {
        setStatusMessage("El servidor central tardó demasiado en responder.");
      } else {
        setStatusMessage(error.response?.data?.detail || "No se pudo procesar la solicitud debido a un conflicto de datos.");
      }
      setShowStatusModal(true);
    } finally {
      setLoading(false);
    }
  };

  const esPersonalizado = PLANES_CONFIG[idPlan]?.esPersonalizado || false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-[#264575] tracking-tight">Alta de Rancho y Súper Administrador</h1>
        <p className="text-sm font-medium text-[#885f3a]">Módulo de Administración Global • Ecosistema CorralTech</p>
      </div>

      {/* TRACKER DE PASOS */}
      <div className="flex items-center space-x-4 bg-white/60 p-3 rounded-xl border border-gray-100 max-w-md">
        <div className="flex items-center space-x-2">
          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${step === 1 ? "bg-[#822420] text-white" : "bg-green-600 text-white"}`}>
            {step === 2 ? "✓" : "1"}
          </span>
          <span className={`text-xs font-bold ${step === 1 ? "text-gray-800" : "text-gray-400"}`}>Datos del Rancho</span>
        </div>
        <div className="flex-1 h-[2px] bg-gray-200" />
        <div className="flex items-center space-x-2">
          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${step === 2 ? "bg-[#264575] text-white" : "bg-gray-200 text-gray-500"}`}>
            2
          </span>
          <span className={`text-xs font-bold ${step === 2 ? "text-gray-800" : "text-gray-400"}`}>Súper Administrador</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 transition-all duration-300">
        {step === 1 ? (
          <form noValidate onSubmit={handleSiguiente} className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <PlusCircle className="w-6 h-6 text-[#822420]" />
              <h2 className="text-lg font-bold text-gray-800">1. Datos del Rancho (Cliente)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Rancho *</label>
                <input 
                  type="text" 
                  maxLength={14} 
                  onKeyDown={handleKeyDownSoloLetras} 
                  value={nombre} 
                  onChange={(e) => {
                    setNombre(sanitizarTexto(e.target.value, 14));
                    limpiarError("nombre");
                  }} 
                  className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                    errors.nombre ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                  placeholder="Ej. El Rancho Viejo" 
                />
                {errors.nombre && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.nombre}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Propietario Jurídico</label>
                <input 
                  type="text" 
                  maxLength={14} 
                  onKeyDown={handleKeyDownSoloLetras} 
                  value={propietario} 
                  onChange={(e) => {
                    setPropietario(sanitizarTexto(e.target.value, 14));
                    limpiarError("propietario");
                  }} 
                  className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                    errors.propietario ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                  }`}
                  placeholder="Ej. Manuel Suarez" 
                />
                {errors.propietario && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.propietario}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono *</label>
                <input 
                  type="text" 
                  maxLength={14} 
                  onKeyDown={handleKeyDownSoloNumeros} 
                  value={telefono} 
                  onChange={(e) => {
                    setTelefono(sanitizarTelefono(e.target.value, 14));
                    limpiarError("telefono");
                  }} 
                  className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                    errors.telefono ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                  placeholder="10 a 14 dígitos" 
                />
                {errors.telefono && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.telefono}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Ubicación Geográfica (Coordenadas GPS) *</label>
                <input 
                  type="text" 
                  maxLength={40}
                  value={ubicacion} 
                  onChange={handleUbicacionChange} 
                  className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                    errors.ubicacion ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                  placeholder="Ej. 19.8437, -90.5255" 
                />
                {errors.ubicacion && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.ubicacion}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo de Contacto</label>
                <input 
                  type="text" 
                  maxLength={100} 
                  value={emailContacto} 
                  onChange={(e) => {
                    setEmailContacto(e.target.value.replace(/\s+/g, ""));
                    limpiarError("emailContacto");
                  }} 
                  className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                    errors.emailContacto ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                  placeholder="rancho@correo.com" 
                />
                {errors.emailContacto && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.emailContacto}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Plan de Rancho</label>
                <select value={idPlan} onChange={(e) => setIdPlan(e.target.value)} className="w-full px-4 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-sm text-gray-700 font-medium cursor-pointer outline-none focus:ring-1 focus:ring-[#264575]">
                  <option value="1">Plan limitado 50 (50 an. • 5MB)</option>
                  <option value="2">Plan limitado 100 (100 an. • 5MB)</option>
                  <option value="3">Plan limitado 200 (200 an. • 10MB)</option>
                  <option value="4">Plan limitado 500 (500 an. • 10MB)</option>
                  <option value="5">Plan personalizado (Configurable)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad Máxima de Animales</label>
                <input type="number" value={maxAnimalesOverride} disabled={!esPersonalizado} onChange={(e) => setMaxAnimalesOverride(e.target.value)} className={`w-full px-4 py-2 border rounded-xl text-sm font-medium transition-all ${!esPersonalizado ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-[#fff8ed]/20 border-[#885f3a]/40 text-gray-800 focus:ring-1 focus:ring-[#264575]"}`} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="catalogos" checked={catalogosPersonalizados} onChange={(e) => setCatalogosPersonalizados(e.target.checked)} className="w-4 h-4 rounded text-[#822420] focus:ring-[#822420] border-gray-300 cursor-pointer" />
                <label htmlFor="catalogos" className="text-sm font-bold text-gray-700 select-none cursor-pointer">Habilitar Catálogos Personalizados</label>
              </div>

              <button type="submit" className="px-6 py-2.5 text-white bg-[#822420] hover:bg-[#681c19] font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all md:w-auto w-full active:scale-95">
                <span>Siguiente Paso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* PASO 2: CUENTA DEL SUPERADMINISTRADOR */
          <form noValidate onSubmit={handlePreSubmit} className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <ShieldAlert className="w-6 h-6 text-[#264575]" />
              <h2 className="text-lg font-bold text-gray-800">2. Cuenta del Súper Administrador (Dueño del Rancho)</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombres *</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    onKeyDown={handleKeyDownSoloLetras} 
                    value={adminNombres} 
                    onChange={(e) => {
                      setAdminNombres(sanitizarTexto(e.target.value, 14));
                      limpiarError("adminNombres");
                    }} 
                    className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                      errors.adminNombres ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errors.adminNombres && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.adminNombres}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellidos</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    onKeyDown={handleKeyDownSoloLetras} 
                    value={adminApellidos} 
                    onChange={(e) => {
                      setAdminApellidos(sanitizarTexto(e.target.value, 14));
                      limpiarError("adminApellidos");
                    }} 
                    className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                      errors.adminApellidos ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errors.adminApellidos && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.adminApellidos}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Username de Acceso *</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    value={adminUsername} 
                    onChange={(e) => {
                      setAdminUsername(sanitizarUsername(e.target.value, 14));
                      limpiarError("adminUsername");
                    }} 
                    className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                      errors.adminUsername ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                  />
                  {errors.adminUsername && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.adminUsername}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input 
                    type="text" 
                    maxLength={100} 
                    value={adminEmail} 
                    onChange={(e) => {
                      setAdminEmail(e.target.value.replace(/\s+/g, ""));
                      limpiarError("adminEmail");
                    }} 
                    className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                      errors.adminEmail ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                    }`} 
                    placeholder="admin@correo.com" 
                  />
                  {errors.adminEmail && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.adminEmail}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña Inicial *</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={adminPassword} 
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        limpiarError("adminPassword");
                      }} 
                      className={`w-full pl-9 pr-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all outline-none ${
                        errors.adminPassword ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-[#885f3a]/40 focus:ring-1 focus:ring-[#264575]"
                      }`} 
                    />
                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {errors.adminPassword && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errors.adminPassword}</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-100">
              <button type="button" onClick={handleAtras} disabled={loading} className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 font-bold rounded-xl text-sm text-gray-700 flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-40">
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
              <button type="submit" disabled={loading} className="px-8 py-2.5 text-white bg-[#264575] hover:bg-[#1e355b] font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50">
                {loading ? "Procesando Alta..." : "Registrar Rancho y Dueño"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* MODAL CONFIRMACIÓN */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">¿Confirmar Alta de Rancho?</h3>
              <p className="text-sm text-gray-500 px-2">Se guardará el rancho "{nombre}" en la base central global.</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 w-full">
              <button type="button" onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-sm text-gray-700 transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={ejecutarRegistroReal} className="flex-1 py-2.5 bg-[#822420] hover:bg-[#681c19] rounded-xl font-bold text-sm text-white shadow-md transition-colors">
                Confirmar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO / ERROR */}
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
                {statusType === "success" ? "¡Alta Exitosa!" : "Registro Denegado"}
              </h3>
              <p className="text-sm font-medium text-gray-600 px-3 leading-relaxed">{statusMessage}</p>
            </div>
            <div className="pt-2">
              <button type="button" onClick={() => setShowStatusModal(false)} className={`w-full py-2.5 rounded-xl font-bold text-sm text-white shadow transition-colors ${statusType === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
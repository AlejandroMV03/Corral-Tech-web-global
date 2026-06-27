import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, ShieldAlert, Key, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";

// Mapeo exacto de los planes según la base de datos central de Supabase
const PLANES_CONFIG: { [key: string]: { maxAnimales: number; maxFotoMb: number; esPersonalizado: boolean } } = {
  "1": { maxAnimales: 50, maxFotoMb: 5, esPersonalizado: false },
  "2": { maxAnimales: 100, maxFotoMb: 5, esPersonalizado: false },
  "3": { maxAnimales: 200, maxFotoMb: 10, esPersonalizado: false },
  "4": { maxAnimales: 500, maxFotoMb: 10, esPersonalizado: false },
  "5": { maxAnimales: 500, maxFotoMb: 10, esPersonalizado: true }
};

export default function RanchosPage() {
  // --- CONTROL DE PASOS (STEPPER) ---
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

  // Efecto dinámico para actualizar los inputs automáticos al cambiar de plan
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

  // Validación segmentada por pasos
  const validarPaso = () => {
    const nuevosErrores: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ👤\s]+$/;

    if (step === 1) {
      if (!nombre.trim()) nuevosErrores.nombre = "El nombre del rancho es obligatorio.";
      if (telefono.trim() && (!/^[0-9]{10}$/.test(telefono.trim()) || /^(.)\1+$/.test(telefono.trim()))) {
        nuevosErrores.telefono = "Ingrese un número de teléfono válido de 10 dígitos.";
      }
      if (emailContacto.trim() && !emailRegex.test(emailContacto.trim())) {
        nuevosErrores.emailContacto = "El formato del correo de contacto no es válido.";
      }
    }

    if (step === 2) {
      if (!adminNombres.trim()) {
        nuevosErrores.adminNombres = "Los nombres del administrador son obligatorios.";
      } else if (!soloLetrasRegex.test(adminNombres.trim())) {
        nuevosErrores.adminNombres = "Los nombres solo deben contener letras.";
      }
      if (adminApellidos.trim() && !soloLetrasRegex.test(adminApellidos.trim())) {
        nuevosErrores.adminApellidos = "Los apellidos solo deben contener letras.";
      }
      if (!adminUsername.trim()) nuevosErrores.adminUsername = "El username es obligatorio.";
      if (adminEmail.trim() && !emailRegex.test(adminEmail.trim())) {
        nuevosErrores.adminEmail = "El formato del correo del administrador no es válido.";
      }
      if (!adminPassword.trim() || adminPassword.length < 6) {
        nuevosErrores.adminPassword = "La contraseña es obligatoria (mínimo 6 caracteres).";
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSiguiente = () => {
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
        ubicacion: ubicacion.trim() || null,
        propietario: propietario.trim() || null,
        telefono: telefono.trim() || null,
        email_contacto: emailContacto.trim() || null,
        id_plan: parseInt(idPlan),
        catalogos_personalizados: catalogosPersonalizados,
        max_animales_override: configPlan.esPersonalizado ? parseInt(maxAnimalesOverride) : null,
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
      await axios.post("http://192.168.1.71:8000/api/v1/master/ranchos", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatusType("success");
      setStatusMessage(`El rancho "${nombre}" ha sido guardado correctamente junto a los límites automáticos de su plan.`);
      setShowStatusModal(true);
      
      // Resetear todo al paso 1 al finalizar con éxito
      setStep(1);
      setNombre(""); setPropietario(""); setUbicacion(""); setTelefono(""); setEmailContacto("");
      setAdminNombres(""); setAdminApellidos(""); setAdminUsername(""); setAdminEmail(""); setAdminPassword("");
      setIdPlan("1"); setCatalogosPersonalizados(false); setMaxAnimalesOverride("50"); setMaxFotoMbOverride("5");
      setErrors({});
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(error.response?.data?.detail || "No se pudo completar el registro debido a un error de comunicación.");
      setShowStatusModal(true);
    } finally {
      setLoading(false);
    }
  };

  const esPersonalizado = PLANES_CONFIG[idPlan]?.esPersonalizado || false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      {/* HEADER COHESIVO */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-[#264575] tracking-tight">Alta de Rancho y Súper Administrador</h1>
        <p className="text-sm font-medium text-[#885f3a]">Módulo de Administración Global • Integridad con Supabase</p>
      </div>

      {/* INDICADOR VISUAL DE PASOS (STEPPER TRACKER) */}
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

      {/* FORMULARIO DINÁMICO COMPACTO */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 transition-all duration-300">
        {step === 1 ? (
          /* PASO 1: DATOS DEL RANCHO (COMPACTO DE 3 COLUMNAS) */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <PlusCircle className="w-6 h-6 text-[#822420]" />
              <h2 className="text-lg font-bold text-gray-800">1. Datos del Rancho (Cliente)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {/* FILA 1 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Rancho *</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.nombre ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} placeholder="Ej. El Rancho Viejo" />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Propietario Jurídico</label>
                <input type="text" value={propietario} onChange={(e) => setPropietario(e.target.value)} className="w-full px-4 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-sm" placeholder="Ej. Andrés Heredia" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.telefono ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} placeholder="10 dígitos" />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>

              {/* FILA 2 - Ubicación y Correo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Ubicación Geográfica</label>
                <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="w-full px-4 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-sm" placeholder="Dirección o Municipio..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo de Contacto</label>
                <input type="text" value={emailContacto} onChange={(e) => setEmailContacto(e.target.value)} className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.emailContacto ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} placeholder="rancho@correo.com" />
                {errors.emailContacto && <p className="text-red-500 text-xs mt-1">{errors.emailContacto}</p>}
              </div>

              {/* FILA 3 - Configuración de límites y planes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Plan de Rancho</label>
                <select value={idPlan} onChange={(e) => setIdPlan(e.target.value)} className="w-full px-4 py-2 bg-[#fff8ed]/20 border border-[#885f3a]/40 rounded-xl text-sm text-gray-700 font-medium cursor-pointer">
                  <option value="1">Plan limitado 50 (50 an. • 5MB)</option>
                  <option value="2">Plan limitado 100 (100 an. • 5MB)</option>
                  <option value="3">Plan limitado 200 (200 an. • 10MB)</option>
                  <option value="4">Plan limitado 500 (500 an. • 10MB)</option>
                  <option value="5">Plan personalizado (Configurable)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad Máxima de Animales</label>
                <input type="number" value={maxAnimalesOverride} disabled={!esPersonalizado} onChange={(e) => setMaxAnimalesOverride(e.target.value)} className={`w-full px-4 py-2 border rounded-xl text-sm font-medium transition-all ${!esPersonalizado ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-[#fff8ed]/20 border-[#885f3a]/40 text-gray-800"}`} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Megabytes por Foto (Fijo)</label>
                <input type="number" value={maxFotoMbOverride} disabled={true} className="w-full px-4 py-2 bg-gray-100 text-gray-400 border-gray-200 rounded-xl text-sm font-medium cursor-not-allowed" />
              </div>
            </div>

            {/* CONTROL DE CHECKBOX Y BOTÓN INFERIOR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="catalogos" checked={catalogosPersonalizados} onChange={(e) => setCatalogosPersonalizados(e.target.checked)} className="w-4 h-4 rounded text-[#822420] focus:ring-[#822420] border-gray-300 cursor-pointer" />
                <label htmlFor="catalogos" className="text-sm font-bold text-gray-700 select-none cursor-pointer">Habilitar Catálogos Personalizados</label>
              </div>

              <button type="button" onClick={handleSiguiente} className="px-6 py-2.5 text-white bg-[#822420] hover:bg-[#681c19] font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 md:w-auto w-full">
                <span>Siguiente Paso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* PASO 2: CUENTA DEL SUPERADMINISTRADOR */
          <form onSubmit={handlePreSubmit} className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <ShieldAlert className="w-6 h-6 text-[#264575]" />
              <h2 className="text-lg font-bold text-gray-800">2. Cuenta del Súper Administrador (Dueño del Rancho)</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombres *</label>
                  <input type="text" value={adminNombres} onChange={(e) => setAdminNombres(e.target.value)} className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.adminNombres ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} />
                  {errors.adminNombres && <p className="text-red-500 text-xs mt-1">{errors.adminNombres}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellidos</label>
                  <input type="text" value={adminApellidos} onChange={(e) => setAdminApellidos(e.target.value)} className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.adminApellidos ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} />
                  {errors.adminApellidos && <p className="text-red-500 text-xs mt-1">{errors.adminApellidos}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Username de Acceso *</label>
                  <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.adminUsername ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} />
                  {errors.adminUsername && <p className="text-red-500 text-xs mt-1">{errors.adminUsername}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="text" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={`w-full px-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.adminEmail ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} placeholder="admin@correo.com" />
                  {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña Inicial *</label>
                  <div className="relative">
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className={`w-full pl-9 pr-4 py-2 bg-[#fff8ed]/20 border rounded-xl text-sm transition-all ${errors.adminPassword ? "border-red-500 ring-1 ring-red-500" : "border-[#885f3a]/40"}`} />
                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-100">
              <button type="button" onClick={handleAtras} className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 font-bold rounded-xl text-sm text-gray-700 flex items-center space-x-2 transition-all active:scale-95">
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

      {/* ================= MODAL 1: CONFIRMACIÓN ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">¿Confirmar Alta de Rancho?</h3>
              <p className="text-sm text-gray-500 px-2">
                Se inicializará el nuevo rancho "{nombre}" bajo el paquete {PLANES_CONFIG[idPlan]?.esPersonalizado ? "Personalizado" : `Limitado ${PLANES_CONFIG[idPlan]?.maxAnimales}`} de forma permanente.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="button" onClick={ejecutarRegistroReal} className="flex-1 py-2.5 bg-[#822420] hover:bg-[#681c19] rounded-xl font-bold text-sm text-white shadow-md">
                Confirmar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ÉXITO / ERROR ================= */}
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
              <p className="text-sm font-medium text-gray-600 px-3 leading-relaxed">
                {statusMessage}
              </p>
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
import { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, Edit, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle } from "lucide-react";
import { sanitizarTexto, sanitizarUsername } from "../../../lib/sanitizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AdministradorGlobal {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
}

export default function AdministradoresGlobalesPage() {
  const [admins, setAdmins] = useState<AdministradorGlobal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ACTIVOS" | "INACTIVOS">("TODOS");
  const [loading, setLoading] = useState(true);

  // Modal y formulario de creación
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formCrear, setFormCrear] = useState({ nombres: "", apellidos: "", username: "", email: "", password: "" });
  const [errorsCrear, setErrorsCrear] = useState<Record<string, string>>({});
  const [guardandoCrear, setGuardandoCrear] = useState(false);

  // Modal y formulario de edición
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
  const [adminEditando, setAdminEditando] = useState<AdministradorGlobal | null>(null);
  const [formEdit, setFormEdit] = useState({ nombres: "", apellidos: "", email: "" });
  const [errorsEdit, setErrorsEdit] = useState<Record<string, string>>({});
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", message: "" });
  const token = localStorage.getItem("corraltech_token");

  const cargarAdministradores = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/master/usuarios-globales?rol=Administrador global`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      mostrarStatus("error", "No se pudo recuperar el listado de Administradores Globales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAdministradores();
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

    if (!formCrear.email.trim()) {
      nuevosErrores.email = "El correo electrónico es obligatorio.";
    } else if (!emailRegex.test(formCrear.email.trim())) {
      nuevosErrores.email = "Formato de correo electrónico inválido.";
    } else if (formCrear.email.trim().length > 100) {
      nuevosErrores.email = "El correo no debe exceder los 100 caracteres.";
    }

    if (!formCrear.password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria.";
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

  const handleCrearAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarCrear()) return;

    setGuardandoCrear(true);
    try {
      const payload = {
        nombres: formCrear.nombres.trim(),
        apellidos: formCrear.apellidos.trim() || null,
        username: formCrear.username.trim(),
        email: formCrear.email.trim().toLowerCase(),
        password: formCrear.password
      };

      await axios.post(`${API_URL}/master/usuarios-globales?rol_solicitado=Administrador global`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalCrearOpen(false);
      setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "" });
      setErrorsCrear({});
      mostrarStatus("success", "Administrador Global registrado y habilitado en la plataforma.");
      cargarAdministradores();
    } catch (err: any) {
      mostrarStatus("error", err.response?.data?.detail || "Error al registrar la cuenta administrativa.");
    } finally {
      setGuardandoCrear(false);
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditando) return;
    if (!validarEdit()) return;

    setGuardandoEdit(true);
    try {
      const payload = {
        nombres: formEdit.nombres.trim(),
        apellidos: formEdit.apellidos.trim() || null,
        email: formEdit.email.trim().toLowerCase() || null
      };

      await axios.put(`${API_URL}/master/usuarios-globales/${adminEditando.id_usuario}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdicionOpen(false);
      setErrorsEdit({});
      mostrarStatus("success", "Perfil de administración actualizado con éxito.");
      cargarAdministradores();
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
      setAdmins(admins.map(a => a.id_usuario === id ? { ...a, activo: nuevoEstado } : a));
      mostrarStatus("success", nuevoEstado ? "Cuenta activada con éxito." : "Acceso del administrador revocado.");
    } catch (err) {
      mostrarStatus("error", "Error al modificar los privilegios de acceso lógico.");
    }
  };

  const abrirEdicion = (a: AdministradorGlobal) => {
    setAdminEditando(a);
    setErrorsEdit({});
    setFormEdit({ nombres: a.nombres || "", apellidos: a.apellidos || "", email: a.email || "" });
    setModalEdicionOpen(true);
  };

  // Punto 13: Deshabilitar botón si no hay cambios
  const hayCambios = adminEditando ? (
    formEdit.nombres.trim() !== (adminEditando.nombres || "").trim() ||
    formEdit.apellidos.trim() !== (adminEditando.apellidos || "").trim() ||
    formEdit.email.trim() !== (adminEditando.email || "").trim()
  ) : false;

  const adminsFiltrados = admins.filter(a => {
    const coincideBusqueda = a.nombres.toLowerCase().includes(busqueda.toLowerCase()) || a.username.toLowerCase().includes(busqueda.toLowerCase());
    if (filtroEstado === "ACTIVOS") return coincideBusqueda && a.activo;
    if (filtroEstado === "INACTIVOS") return coincideBusqueda && !a.activo;
    return coincideBusqueda;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black text-[#264575] tracking-tight">Administradores Globales</h1>
          <p className="text-sm font-semibold text-[#885f3a]">Supervisión operativa y gestión de la plataforma a gran escala</p>
        </div>
        <button 
          onClick={() => {
            setFormCrear({ nombres: "", apellidos: "", username: "", email: "", password: "" });
            setErrorsCrear({});
            setModalCrearOpen(true);
          }} 
          className="px-5 py-2.5 bg-[#822420] hover:bg-[#681c19] text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center space-x-3 bg-white border border-gray-200/80 p-3 rounded-xl shadow-sm w-full max-w-md">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            placeholder="Buscar por nombre o usuario..." 
            className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 font-medium" 
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          {(["TODOS", "ACTIVOS", "INACTIVOS"] as const).map((estado) => (
            <button key={estado} onClick={() => setFiltroEstado(estado)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroEstado === estado ? "bg-white text-[#264575] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {estado}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="w-9 h-9 text-[#264575] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Cargando tablero operativo...</p>
          </div>
        ) : adminsFiltrados.length === 0 ? (
          <div className="text-center p-16 text-gray-400 font-semibold text-sm">No se encontraron administradores registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#264575] text-[11px] font-bold uppercase text-white tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">UID</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4 text-center">Estado Acceso</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {adminsFiltrados.map((a) => (
                  <tr key={a.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">#{String(a.id_usuario).padStart(3, "0")}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{a.nombres} {a.apellidos || ""}</td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">@{a.username}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{a.email || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => handleToggleEstado(a.id_usuario, a.activo)} className="focus:outline-none transition-transform active:scale-95 inline-block align-middle">
                        {a.activo ? <ToggleRight className="w-9 h-9 text-green-600" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => abrirEdicion(a)} className="p-2 text-[#264575] hover:bg-[#264575]/10 rounded-xl transition-all inline-block" title="Editar perfil"><Edit className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form noValidate onSubmit={handleCrearAdmin} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Alta de Administrador Global</h3>
              <p className="text-xs font-bold text-[#885f3a]">Ingreso de credenciales operativas</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre *</label>
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
                  placeholder="ejemplo.admin (máx 14)"
                  className={`w-full px-4 py-2 border rounded-xl outline-none font-medium text-xs transition-colors ${
                    errorsCrear.username ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-[#264575]"
                  }`} 
                />
                {errorsCrear.username && <span className="text-red-600 text-[11px] font-bold mt-1 block">{errorsCrear.username}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico *</label>
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
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña Inicial *</label>
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
                <span>Registrar Cuenta</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE EDICIÓN (Punto 10 & 13) */}
      {modalEdicionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <form noValidate onSubmit={handleGuardarEdicion} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#264575]">Modificar Perfil de Administrador</h3>
              <p className="text-xs font-bold text-[#885f3a]">Actualizando privilegios operativos de @{adminEditando?.username}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
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
                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Corporativo</label>
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
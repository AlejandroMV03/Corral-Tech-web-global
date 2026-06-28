import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import logoCorralTech from "../../../assets/Logo.png";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      username: username.trim(),
      password: password
    };

    try {
     const response = await axios.post("http://localhost:8000/api/v1/master/auth/login", payload, {        headers: { "Content-Type": "application/json" }
      });

      const { access_token, usuario } = response.data;

      if (usuario && usuario.rol !== "master_admin" && usuario.rol !== "global_admin") {
        setError("Acceso Denegado: Tus credenciales pertenecen a una cuenta de Rancho. No tienes autorización para ingresar al Panel Global Corporativo.");
        setLoading(false);
        return; 
      }

      localStorage.setItem("token", access_token);
      localStorage.setItem("username", username.trim());
      if (usuario?.rol) {
        localStorage.setItem("user_role", usuario.rol);
      }
      
      onLoginSuccess();
      navigate("/dashboard"); 
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-[#FDF8F2]">

      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        
        {!showAlert ? (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-64 h-auto mb-4 flex items-center justify-center">
                <img 
                  src={logoCorralTech} 
                  alt="CorralTech Logo" 
                  className="w-full h-auto object-contain" 
                />
              </div>

              <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">
                ¡Bienvenido de Nuevo!
              </h1>
              <p className="text-lg font-medium text-[#7A2E22] mt-1">
                Menú Global
              </p>
            </div>

            <div className="w-full max-w-md mx-auto space-y-6">
              <p className="text-center text-[#7A2E22] font-medium text-sm tracking-wide">
                Ingrese sus credenciales para continuar.
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                
                {/* Mensaje de error dinámico en caso de credenciales inválidas o restricción de rol */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-[#7A2E22] p-3 rounded-r-xl flex items-start space-x-2 transition-all">
                    <AlertCircle className="w-5 h-5 text-[#7A2E22] shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-semibold leading-normal">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
                    Usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    disabled={loading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#C4A484] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7A2E22] focus:border-[#7A2E22] bg-white text-gray-900 transition-all disabled:opacity-50"
                    placeholder="AndresOHT"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#C4A484] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7A2E22] focus:border-[#7A2E22] bg-white text-gray-900 pr-12 transition-all disabled:opacity-50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#1E3A8A] opacity-80 hover:opacity-100 focus:outline-none"
                    >
                      {showPassword ? (
                        <Eye className="text-lg" />
                      ) : (
                        <EyeOff className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 text-white bg-[#7A2E22] hover:bg-[#63241B] font-bold rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all tracking-wide text-center disabled:opacity-50"
                  >
                    {loading ? "Verificando..." : "Iniciar Sesión"}
                  </button>
                </div>

                {/* Enlace Olvidaste Contraseña */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAlert(true)}
                    className="text-xs font-semibold text-[#1E3A8A] hover:underline bg-transparent border-0 cursor-pointer focus:outline-none tracking-tight"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (

          <div className="w-full max-w-md p-6 space-y-6 text-center bg-white rounded-2xl border border-red-200 shadow-2xl transition-all">
            <h2 className="text-2xl font-black tracking-widest text-[#7A2E22]">
              ¡ALERTA!
            </h2>
            
            <p className="text-sm text-gray-700 leading-relaxed px-2">
              Como usuario de <span className="font-semibold text-[#1E3A8A]">CorralTech</span> podrás cambiar tu contraseña mediante nuestro soporte por email:
            </p>
            
            <p className="text-base font-bold text-[#1E3A8A] underline break-all">
              soporte@corraltech.com
            </p>

            <div className="flex justify-center py-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#1E3A8A] text-[#1E3A8A] text-xl font-bold">
                !
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAlert(false)}
              className="w-full py-2.5 px-4 text-white bg-[#7A2E22] hover:bg-[#63241B] font-bold rounded-xl shadow transition-colors"
            >
              Regresar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
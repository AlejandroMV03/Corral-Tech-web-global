import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardGlobalPage from "../../features/dashboard-global/pages/DashboardGlobalPage";
import RanchosPage from "../../features/ranchos/pages/RanchosPage";
import UsuariosPlataformaPage from "../../features/usuarios-plataforma/pages/UsuariosPlataformaPage";
import UsuariosRanchoPage from "../../features/usuarios-rancho/pages/UsuariosRanchoPage";
import RolesPermisosPage from "../../features/roles-permisos/pages/RolesPermisosPage";
import ReportesGlobalesPage from "../../features/reportes-globales/pages/ReportesGlobalesPage";
import AuditoriaGlobalPage from "../../features/auditoria-global/pages/AuditoriaGlobalPage";
import ConfiguracionPage from "../../features/configuracion/pages/ConfiguracionPage";

export default function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />

      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <AppLayout onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardGlobalPage />} />
        <Route path="ranchos" element={<div className="p-6"><h1 className="text-2xl font-bold text-[#264575]">Lista de Ranchos </h1></div>} />
        <Route path="ranchos/crear" element={<RanchosPage />} />
        <Route path="usuarios-plataforma" element={<UsuariosPlataformaPage />} />
        <Route path="usuarios-rancho" element={<UsuariosRanchoPage />} />
        <Route path="roles-permisos" element={<RolesPermisosPage />} />
        <Route path="reportes" element={<ReportesGlobalesPage />} />
        <Route path="auditoria" element={<AuditoriaGlobalPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
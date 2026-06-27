import { Search, Bell, UserCircle } from "lucide-react";

interface TopbarProps {
  onLogout: () => void;
}

export default function Topbar({ onLogout }: TopbarProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm">
      
      <div className="flex items-center space-x-3">
        <UserCircle className="w-10 h-10 text-gray-400" />
        <div className="flex flex-col">
          <p className="text-sm font-bold text-gray-800 leading-tight">
            ¡Hola, AndresOHT!
          </p>
          <span className="text-xs text-gray-500 font-medium">
            Dueño Global (DG)
          </span>
        </div>
      </div>

      {/* Sección Central: Buscador Estilizado */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-4 pr-10 py-2 bg-[#F3F4F6] border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-gray-800 placeholder-gray-400 transition-all"
            placeholder="Buscar..."
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Icono de Alerta / Campana */}
        <button className="relative p-2 text-gray-500 hover:text-[#1E3A8A] hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        </button>

      </div>

    </header>
  );
}
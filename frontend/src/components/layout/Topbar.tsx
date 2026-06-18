export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">Panel administrativo</p>
        <h2 className="font-semibold text-slate-900">Plataforma Web Global</h2>
      </div>

      <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
        Cerrar sesión
      </button>
    </header>
  );
}
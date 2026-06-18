export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-900">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-emerald-800">
          CorralTech
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Acceso plataforma global
        </p>

        <form className="mt-8 space-y-5">
          <input
            type="text"
            placeholder="Usuario"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
          />

          <button
            type="button"
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
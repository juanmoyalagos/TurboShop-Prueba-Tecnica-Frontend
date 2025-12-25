import { ArrowLeft, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

export default function RepuestosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-purple-500/10 p-8 shadow-xl backdrop-blur">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Wrench className="h-6 w-6 text-emerald-200" />
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-200/80">
                Inventario
              </p>
              <h2 className="text-2xl font-semibold leading-tight">
                Repuestos disponibles
              </h2>
              <p className="text-sm text-white/70">
                Consulta, filtra y gestiona los repuestos del portal.
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 active:scale-[0.99]"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-200" />
            Volver al inicio
          </Link>
        </header>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">
              Renderizar listado general (cards o tabla) con los
              repuestos
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

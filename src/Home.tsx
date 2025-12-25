import { Car, Wrench, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
        <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-purple-500/10 p-8 shadow-xl backdrop-blur">
        <div className="flex justify-center">
            <div className="flex flex-col items-center text-center w-full">
                <h1 className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
                    <Car className="h-6 w-6 text-emerald-200" />
                    Portal de Repuestos
                </h1>
                <p className="mt-2 text-sm text-white/70">
                    Revisa repuestos disponibles y datos asociados a vehículos.
                </p>
            </div>
        </div>

        <div className="mt-8">
          <Link
            to="/repuestos"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-emerald-950 shadow-lg shadow-emerald-400/20 transition hover:brightness-110 active:scale-[0.99]"
          >
            <Wrench className="h-5 w-5 text-emerald-200" />
            Ver repuestos disponibles
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Wrench } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "./types/product";
import { useSSE } from "./SSEProvider";

const PAGE_SIZE = 20;
const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function RepuestosPage() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoadDone, setInitialLoadDone] = useState(false);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [sortSku, setSortSku] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      q: search.trim(),
      brand: brand.trim(),
      make: make.trim(),
      model: model.trim(),
      year: year.trim(),
    });
    return params.toString();
  }, [page, search, brand, make, model, year]);

  const refetch = useCallback(async () => {
    const url = `${API_URL}/offers?${queryParams}`;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        const fallbackText = await response.text();
        throw new Error(
          `Error ${
            response.status
          }: no se pudieron cargar los repuestos. Detalle: ${fallbackText.slice(
            0,
            120
          )}`
        );
      }
      const data = contentType.includes("application/json")
        ? await response.json()
        : JSON.parse(await response.text());

      setProducts(Array.isArray(data?.data) ? data.data : []);
      setTotalPages(Number(data?.totalPages) || 1);
      setInitialLoadDone(true);
    } catch (err) {
      setError(
        (err as Error).message ||
          "No se pudieron cargar los repuestos. Revisa la URL del API."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams, page, search, brand, make, model, year]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!isMounted) return;
      await refetch();
    })();
    return () => {
      isMounted = false;
    };
  }, [refetch]);

  const handleSSE = useCallback(
    (data: any) => {
      if (
        !data ||
        data.type !== "catalog:update_batch" ||
        !Array.isArray(data.items)
      ) {
        return;
      }
      // Si el batch trae nuevas ofertas, refrescamos completo para verlas.
      if (data.items.some((it: any) => it.change === "offer_created")) {
        refetch();
        return;
      }
      setProducts((prev) => {
        let needsRefetch = false;
        const next = prev.map((p) => {
          const item = data.items.find((it: any) => it.sku === p.sku);
          if (!item) return p;

          if (item.change === "offer_created") {
            needsRefetch = true;
            return p;
          }

          const updatedOffers = (p.offers || []).map((o) =>
            o.provider_id === item.provider_id
              ? {
                  ...o,
                  price_value: item.price_value ?? o.price_value,
                  currency: item.currency ?? o.currency,
                  stock_qty: item.stock_qty ?? o.stock_qty,
                  stock_status: item.stock_status ?? o.stock_status,
                }
              : o
          );

          const found = (p.offers || []).some(
            (o) => o.provider_id === item.provider_id
          );
          if (!found) {
            needsRefetch = true;
          }

          return { ...p, offers: updatedOffers };
        });

        if (needsRefetch) {
          refetch();
        }
        return next;
      });
    },
    [refetch]
  );

  useSSE(handleSSE);

  const showSpinnerFull = loading && !isInitialLoadDone;
  const showSpinnerOverlay = loading && isInitialLoadDone;

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("es-CL").format(value);

  const displayProducts = useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) =>
      sortSku === "asc"
        ? a.sku.localeCompare(b.sku)
        : b.sku.localeCompare(a.sku)
    );
    return arr;
  }, [products, sortSku]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
      <section className="w-full max-w-6xl rounded-2xl border border-white/10 bg-purple-500/10 p-8 shadow-md">
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
                Navega para descubrir el catálogo de repuestos disponibles.
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

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-inner">
          <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
            Búsqueda rápida
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, SKU, etc."
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30"
            />
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Ordenar SKU
              </span>
              <select
                value={sortSku}
                onChange={(e) =>
                  setSortSku(e.target.value === "desc" ? "desc" : "asc")
                }
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30"
              >
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-inner">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Marca de repuesto
            </label>
            <input
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(1);
              }}
              placeholder="Ej: Brembo"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-inner">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Marca vehículo
            </label>
            <input
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setPage(1);
              }}
              placeholder="Ej: Toyota"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-inner">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Modelo vehículo
            </label>
            <input
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setPage(1);
              }}
              placeholder="Ej: Corolla"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-inner">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Año
            </label>
            <input
              value={year}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, "");
                setYear(value);
                setPage(1);
              }}
              inputMode="numeric"
              maxLength={4}
              placeholder="Ej: 2015"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-white/80">
          <p className="text-sm">
            Página {page} de {totalPages}
          </p>
          <div className="inline-flex overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </button>
            <div className="h-full w-px bg-white/10" />
            <button
              onClick={() => setPage((p) => (page < totalPages ? p + 1 : p))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8">
          {error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : showSpinnerFull ? (
            <div className="flex items-center gap-3 text-white/80">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-200" />
              Cargando repuestos...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              No hay repuestos para mostrar.
            </div>
          ) : (
            <div className="relative">
              {showSpinnerOverlay && (
                <div className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-200" />
                  Actualizando página...
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayProducts.map((product) => (
                  <article
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/repuestos/${product.sku}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/repuestos/${product.sku}`);
                      }
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-emerald-300/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-emerald-200/80">
                          {product.category || "Sin categoría"}
                        </p>
                        <h3 className="text-lg font-semibold leading-snug">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-white/60">
                          SKU: {product.sku}
                        </p>
                      </div>
                      {product.part_brand && (
                        <span className="rounded-full border border-emerald-200/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                          {product.part_brand}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                        Stock por proveedor
                      </p>
                      {product.offers && product.offers.length > 0 ? (
                        <div className="space-y-2">
                          {product.offers.map((offer) => (
                            <div
                              key={`${product.id}-${offer.id}`}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-white">
                                  {offer.provider?.name ?? "Proveedor"}
                                </span>
                                <span className="text-xs text-white/60">
                                  {offer.currency} $
                                  {formatNumber(offer.price_value)}
                                </span>
                              </div>
                              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                                Stock: {offer.stock_qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-white/60">
                          Sin ofertas disponibles.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

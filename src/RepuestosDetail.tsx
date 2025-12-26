import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Wrench,
  Info,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { ProductDetail } from "./types/productDetail";
import { useSSE } from "./SSEProvider";


const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function RepuestosDetail() {
  const { sku } = useParams<{ sku: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!sku) return;
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/offers/${sku}`);
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok) {
          const fallbackText = await response.text();
          throw new Error(
            `Error ${response.status}: no se pudo cargar el repuesto. Detalle: ${fallbackText.slice(
              0,
              120
            )}`
          );
        }
        const data = contentType.includes("application/json")
          ? await response.json()
          : JSON.parse(await response.text());
        if (!isMounted) return;
        setProduct(data);
      } catch (err) {
        if (!isMounted) return;
        setError(
          (err as Error).message ||
            "No se pudo cargar el detalle. Revisa la URL del API."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [sku]);

  const handleSSE = useCallback(
    (data: any) => {
      if (!sku || !data || data.type !== "catalog:update_batch" || !Array.isArray(data.items)) {
        return;
      }

      const item = data.items.find((it: any) => it.sku === sku);
      if (!item) return;

      if (item.change === "offer_created") return;

      setProduct((prev) => {
        if (!prev) return prev;
        const found = (prev.offers || []).some(
          (o) => o.provider_id === item.provider_id
        );

        if (!found) return prev;

        const updatedOffers = (prev.offers || []).map((o) =>
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

        return { ...prev, offers: updatedOffers };
      });
    },
    [sku]
  );

  useSSE(handleSSE);

  const formatNumber = (value?: number) =>
    value !== undefined
      ? new Intl.NumberFormat("es-CL").format(value)
      : undefined;

  const primaryImage = product?.images?.[0]?.url ?? "";
  const showImage = primaryImage && !imageError;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
      <section className="w-full max-w-5xl rounded-2xl border border-white/10 bg-purple-500/10 p-8 shadow-md">
        <header className="flex flex-wrap items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-emerald-200" />
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-200/80">
                Detalle de repuesto
              </p>
              <h1 className="text-2xl font-semibold leading-tight">
                {product?.name || "Cargando repuesto..."}
              </h1>
              {product?.part_brand && (
                <p className="text-sm text-emerald-100">
                  Marca: {product.part_brand}
                </p>
              )}
            </div>
          </div>

          <Link
            to="/repuestos"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 active:scale-[0.99]"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-200" />
            Volver al listado
          </Link>
        </header>

        <div className="mt-6">
          {error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : loading || !product ? (
            <div className="flex items-center gap-3 text-white/80">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-200" />
              Cargando detalle del repuesto...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-emerald-200/80">
                        {product.category || "Sin categoría"}
                      </p>
                      <h2 className="text-xl font-semibold leading-snug">
                        {product.name}
                      </h2>
                      <p className="text-xs text-white/60 mt-1">
                        SKU: {product.sku}
                        {product.oem_code ? ` · OEM: ${product.oem_code}` : ""}
                      </p>
                    </div>
                    {product.part_brand && (
                      <span className="rounded-full border border-emerald-200/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                        {product.part_brand}
                      </span>
                    )}
                  </div>

                  {showImage ? (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="h-64 w-full object-cover"
                        onError={() => setImageError(true)}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 text-white/50">
                      <Info className="h-5 w-5 mr-2" />
                      Sin imagen disponible
                    </div>
                  )}

                  {product.description && (
                    <p className="text-sm text-white/80 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    {product.weight_value !== undefined && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Peso: {product.weight_value} {product.weight_unit || ""}
                      </span>
                    )}
                    {product.specs &&
                      Object.entries(product.specs).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-200" />
                    <p className="text-sm font-semibold">Ofertas</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {product.offers && product.offers.length > 0 ? (
                      product.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {offer.provider?.name ?? "Proveedor"}
                            </span>
                            <span className="text-xs text-white/60">
                              {offer.currency} ${formatNumber(offer.price_value)}
                            </span>
                          </div>
                          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                            Stock: {offer.stock_qty}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">
                        Sin ofertas disponibles.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white shadow-sm">
                  <p className="text-sm font-semibold">Compatibilidad</p>
                  <div className="mt-3 space-y-2 text-sm text-white/80">
                    {product.vehicleFits && product.vehicleFits.length > 0 ? (
                      product.vehicleFits.map((fit, idx) => (
                        <div
                          key={`${fit.vehicle_make}-${fit.vehicle_model}-${idx}`}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <div>
                            <p className="font-semibold text-white">
                              {fit.vehicle_make} {fit.vehicle_model}
                            </p>
                            <p className="text-xs text-white/60">
                              Años: {fit.year_from} - {fit.year_to}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">
                        No hay compatibilidades registradas.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


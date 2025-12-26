import type { OfferProvider } from "./offerProvider";

export type OfferDetail = {
  id: number;
  provider_id: number;
  price_value: number;
  currency: string;
  stock_qty: number;
  stock_status: string;
  dispatch_eta?: string | null;
  provider?: OfferProvider;
};
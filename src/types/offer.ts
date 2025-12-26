import type { OfferProvider } from "./offerProvider";

export type Offer = {
  id: number;
  provider_id: number;
  price_value: number;
  currency: string;
  stock_qty: number;
  stock_status: string;
  provider: OfferProvider;
};
import type { OfferDetail } from "./offerDetail";
import type { VehicleFit } from "./vehicleFit";
import type { Image } from "./image";

export type ProductDetail = {
  id: number;
  sku: string;
  oem_code?: string;
  name: string;
  description?: string;
  part_brand?: string;
  category?: string;
  weight_value?: number;
  weight_unit?: string;
  specs?: Record<string, unknown>;
  offers: OfferDetail[];
  vehicleFits?: VehicleFit[];
  images?: Image[];
};
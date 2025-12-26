import type { Offer } from "./offer";
import type { VehicleFit } from "./vehicleFit";

export type Product = {
  id: number;
  sku: string;
  name: string;
  part_brand?: string;
  category?: string;
  offers: Offer[];
  vehicleFits?: VehicleFit[];
};
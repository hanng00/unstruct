import { z } from "zod";

export const PimEssentialSchema = z.object({
  productName: z
    .string()
    .nullable()
    .describe("Short product label or identifier."), // code
  vendorSku: z.string().nullable().describe("SKU used by the vendor."), // Nefab code

  fefco: z
    .string()
    .nullable()
    .describe("FEFCO code for standard corrugated packaging."),
  primaryMaterial: z
    .string()
    .nullable()
    .describe("Primary material used (e.g. corrugated board, paper, plastic)."),
  recycledContentPercentage: z
    .number()
    .nullable()
    .describe("Recycled content percentage (0.5 = 50%)."),
  renewable: z
    .boolean()
    .nullable()
    .describe("Indicates if the product is made from renewable sources."),
  sustainableGlue: z
    .string()
    .nullable()
    .describe("Type of sustainable glue used."),
  priceValue: z
    .number()
    .nullable()
    .describe("Price corresponding to the quantity threshold."),
  minimumOrderQuantity: z
    .string()
    .nullable()
    .describe("Minimum order quantity (MOQ)."),
  weightPerProductBundleG: z
    .number()
    .nullable()
    .describe("Weight per product bundle (grams)."), // for total weight
  productionCountry: z.string().nullable().describe("Country of production."),
  shippedFromCountry: z
    .string()
    .nullable()
    .describe("Country where product is shipped from."),
  fossilEnergyLevel: z
    .number()
    .nullable()
    .describe("Percentage of fossil energy used."),
});

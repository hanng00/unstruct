import { z } from "zod";

export const FoxwayPackagingRecordSchema = z.object({
  // Identification
  productName: z
    .string()
    .nullable()
    .describe("Short product label or identifier."),

  // Media
  imagePackshot: z
    .array(z.string())
    .nullable()
    .describe("URLs to packshot images."),

  // Basic info
  description: z
    .string()
    .nullable()
    .describe("A short product description in English."),
  vendorName: z.string().nullable().describe("Name of the vendor."),
  vendorCountry: z
    .string()
    .nullable()
    .describe("Country of registration of the vendor."),
  vendorVatNumber: z.string().nullable().describe("VAT number of the vendor."),
  vendorWebsite: z.string().nullable().describe("Website of the vendor."),
  vendorEmail: z.string().nullable().describe("Email of the vendor."),
  productType: z
    .string()
    .nullable()
    .describe(
      "Product type identifier, e.g. shipping box, mailer bag, sticker, tape."
    ),
  vendorSku: z.string().nullable().describe("SKU used by the vendor."),

  // Ordering
  minimumOrderQuantity: z
    .string()
    .nullable()
    .describe(
      "Minimum order quantity (MOQ). Typically large in packaging (thousands to tens of thousands)."
    ),
  priceQuantity: z
    .number()
    .nullable()
    .describe(
      "Quantity threshold for a price increment. Prices often quoted per thousand."
    ),
  priceValue: z
    .number()
    .nullable()
    .describe(
      "Price corresponding to the quantity threshold. Unit cost usually decreases with volume."
    ),
  priceCurrency: z
    .string()
    .nullable()
    .describe(
      "Currency of the price (e.g. EUR, USD). Normalize symbols and abbreviations."
    ),
  deliveryTimeDays: z
    .number()
    .nullable()
    .describe("Estimated delivery time in days."),

  // Materials & Specs
  primaryMaterial: z
    .string()
    .nullable()
    .describe("Primary material used (e.g. corrugated board, paper, plastic)."),
  materialSpecification: z
    .string()
    .nullable()
    .describe("Detailed material specification."),
  grammage: z
    .number()
    .nullable()
    .describe("Grammage of material, in gsm (grams per square meter)."),
  mainColour: z.string().nullable().describe("Main colour of the product."),
  fluting: z
    .string()
    .nullable()
    .describe("Fluting type for corrugated packaging."),
  ect: z
    .number()
    .nullable()
    .describe("Edge Crush Test strength (kg/m2), a key strength indicator."),
  bct: z
    .number()
    .nullable()
    .describe(
      "Box Compression Test strength (kg/m2), used for load resistance."
    ),

  // Dimensions & Weight
  weightPerProductBundleG: z
    .number()
    .nullable()
    .describe("Weight per product bundle (grams)."),
  weightG: z.number().nullable().describe("Single product weight (grams)."),
  outerLengthMm: z.number().nullable().describe("Outer length (mm)."),
  outerWidthMm: z.number().nullable().describe("Outer width (mm)."),
  outerHeightMm: z.number().nullable().describe("Outer height (mm)."),
  outerVolumeMl: z.number().nullable().describe("Outer volume (ml)."),
  outerDiameterMm: z.number().nullable().describe("Outer diameter (mm)."),
  innerLengthMm: z.number().nullable().describe("Inner length (mm)."),
  innerWidthMm: z.number().nullable().describe("Inner width (mm)."),
  innerHeightMm: z.number().nullable().describe("Inner height (mm)."),
  innerVolumeMl: z.number().nullable().describe("Inner volume (ml)."),
  innerDiameterMm: z.number().nullable().describe("Inner diameter (mm)."),

  // Logistics
  shippedFromCity: z.string().nullable().describe("City shipped from."),
  shippedFromRegion: z.string().nullable().describe("Region shipped from."),
  shippedFromCountry: z.string().nullable().describe("Country shipped from."),
  productionCity: z.string().nullable().describe("City of production."),
  productionRegion: z.string().nullable().describe("Region of production."),
  productionCountry: z.string().nullable().describe("Country of production."),

  // Bundling
  comparisonUnit: z
    .string()
    .nullable()
    .describe("Unit of comparison (e.g., stickers, meters, m2, boxes)."),
  productBundleUnit: z
    .string()
    .nullable()
    .describe("Unit used for product bundles."),
  productBundleQuantity: z
    .number()
    .nullable()
    .describe(
      "Number of comparison units per product bundle (e.g. 100 stickers per box)."
    ),
  salesBundleUnit: z
    .string()
    .nullable()
    .describe("Unit used for sales bundles (e.g. boxes, pallets)."),
  salesBundleQuantity: z
    .number()
    .nullable()
    .describe(
      "Number of product bundles per sales bundle (e.g. 10 boxes per pallet)."
    ),
  palletBundleQuantity: z
    .number()
    .nullable()
    .describe("Number of sales bundles per pallet."),

  // Sustainability
  renewableMaterialLevel: z
    .number()
    .nullable()
    .describe("Percentage of renewable material."),
  wasteLevel: z
    .number()
    .nullable()
    .describe("Percentage of waste generated during production."),
  fossilEnergyLevel: z
    .number()
    .nullable()
    .describe("Percentage of fossil energy used."),
  recycledContentPercentage: z
    .number()
    .nullable()
    .describe("Recycled content percentage (0.5 = 50%)."),
  renewable: z
    .boolean()
    .nullable()
    .describe("Indicates if the product is made from renewable sources."),
  recyclable: z
    .boolean()
    .nullable()
    .describe("Indicates if the product is recyclable."),
  sustainableInk: z
    .string()
    .nullable()
    .describe("Type of sustainable ink used."),
  sustainableGlue: z
    .string()
    .nullable()
    .describe("Type of sustainable glue used."),
  monomaterial: z
    .boolean()
    .nullable()
    .describe("Indicates if the product is made from a single material."),
  sustainabilityInformation: z
    .string()
    .nullable()
    .describe("Additional sustainability information, often found in notes."),

  // Certifications & Ethics
  certifications: z
    .array(z.string())
    .nullable()
    .describe("Certifications relevant to the product (e.g. FSC, PEFC)."),
  productionMethod: z
    .string()
    .nullable()
    .describe("Production methods used (e.g. offset, flexo, handmade)."),

  // Capacities
  loadCapacityWeightG: z
    .number()
    .nullable()
    .describe("Load capacity by weight (grams)."),
  loadCapacityVolumeMl: z
    .number()
    .nullable()
    .describe("Load capacity by volume (ml)."),

  // Specifications
  closure: z
    .string()
    .nullable()
    .describe("Closure type (e.g. glued flap, tuck-in)."),
  requiredAccessories: z
    .array(z.string())
    .nullable()
    .describe("List of required accessories."),
  fefco: z
    .string()
    .nullable()
    .describe("FEFCO code for standard corrugated packaging."),
  foodSuitableFor: z
    .string()
    .nullable()
    .describe("Food type suitability, if applicable."),
  foodCertifications: z
    .array(z.string())
    .nullable()
    .describe("Food safety certifications."),

  // Customisation
  pattern: z.string().nullable().describe("Custom pattern available."),
  availableForCustomPrint: z
    .boolean()
    .nullable()
    .describe("Whether custom printing is possible."),
  toolingAndCosts: z
    .string()
    .nullable()
    .describe("Setup/tooling costs, often significant fixed costs."),
  printTechnique: z
    .string()
    .nullable()
    .describe("Printing technique (e.g. flexo, offset)."),
  printColourScale: z
    .string()
    .nullable()
    .describe("Colour scale used (e.g. CMYK, Pantone)."),
  printCoverage: z.string().nullable().describe("Coverage description."),
  printSides: z.number().nullable().describe("Number of sides printed."),
  printColoursInside: z
    .number()
    .nullable()
    .describe("Number of colours inside."),
  printColoursOutside: z
    .number()
    .nullable()
    .describe("Number of colours outside."),
  printInkType: z.string().nullable().describe("Type of ink used."),
  printToolingCostEur: z.number().nullable().describe("Tooling cost in EUR."),
  printInstructions: z.string().nullable().describe("Printing instructions."),
  printLocationCountry: z
    .string()
    .nullable()
    .describe("Country where printing is done (ISO alpha-2)."),

  // Finishes
  finishes: z
    .string()
    .array()
    .nullable()
    .describe("Finishing options (e.g. varnish, lamination, embossing, foil)."),

  // Compliance & Audits
  complianceDirectives: z
    .string()
    .array()
    .nullable()
    .describe("Regulatory or legal directives mentioned, e.g. EU 94/62/EC."),
  auditReports: z
    .string()
    .array()
    .nullable()
    .describe("Social or environmental audit references."),

  // Other
  barrierProperties: z
    .string()
    .nullable()
    .describe(
      "Barrier or resistance properties (e.g. greaseproof, moisture barrier)."
    ),
  stackingStrengthKg: z
    .number()
    .nullable()
    .describe("Stacking strength (kg), as given by vendor."),
  cartonQuantity: z
    .number()
    .nullable()
    .describe("Number of items per carton, if quoted separately."),
  tolerance: z
    .string()
    .nullable()
    .describe("Tolerances for dimensions or weight, e.g. ±2mm."),
  notes: z
    .string()
    .nullable()
    .describe(
      "Free-form catch-all for vendor info or ambiguous/conflicting data."
    ),
});

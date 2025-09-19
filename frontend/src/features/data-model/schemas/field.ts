import { z } from "zod";

// Base schema for all fields
const BaseFieldSchema = z.object({
  id: z.string(), // Internally stable key, eg. total_excluding_vat
  name: z.string().min(1), // Display name, eg. 'Total Excluding VAT'
  description: z.string().optional(),
  nullable: z.boolean().default(false),
  required: z.boolean().default(true),
});

// Enum-specific extension
const EnumFieldSchema = BaseFieldSchema.extend({
  type: z.literal("enum"),
  enumValues: z.array(z.string().min(1)).nonempty(),
});

// String, number, date fields
const StringFieldSchema = BaseFieldSchema.extend({
  type: z.literal("string"),
});

const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal("number"),
});

const DateFieldSchema = BaseFieldSchema.extend({
  type: z.literal("date"),
});

// Union of all supported field types
export const FieldSchema = z.union([
  StringFieldSchema,
  NumberFieldSchema,
  DateFieldSchema,
  EnumFieldSchema,
]);

// TS type
export type Field = z.infer<typeof FieldSchema>;

// Example of a schema containing many fields
export const SchemaDefinition = z.object({
  fields: z.array(FieldSchema),
});
export type SchemaDefinition = z.infer<typeof SchemaDefinition>;

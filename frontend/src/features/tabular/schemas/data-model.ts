import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

// Define the schema structure for extracted data
export const ExtractedDataSchema = z.object({
  documentTitle: z.string().describe("Title or name of the document"),
  fileSize: z.number().describe("File size in bytes"),
  createdAt: z.string().describe("Creation date in ISO format"),
  documentType: z.string().describe("Type of document (e.g., invoice, contract, report)"),
  pageCount: z.number().describe("Number of pages in the document"),
  lastModified: z.string().describe("Last modification date in ISO format"),
});

// Default data model schema with common fields
const DefaultDataModelSchema = z.object({
  title: z.string().describe("Title of the document"),
  description: z.string().describe("Description of the document"),
  createdAt: z.string().describe("Creation date in ISO format"),
  tags: z.string().array().describe("Tags of the document"),
});

export const DefaultDataModelJsonSchema = zodToJsonSchema(DefaultDataModelSchema);

// Schema for the data model itself
export const DataModelSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  version: z.number(),
  schemaJson: z.unknown(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Type for the extracted data
export type ExtractedData = z.infer<typeof ExtractedDataSchema>;

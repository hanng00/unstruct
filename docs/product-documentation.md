## Unstruct – Turn messy files into structured product data

Unstruct is a powerful data extraction and synthesis service built for businesses that deal with unstructured information. Simply drop in your files—Excel spreadsheets, PDFs, Word documents, or even emails—and Unstruct will do the heavy lifting.

The service automatically reads and interprets each file, extracting relevant data points even when they appear in partial or inconsistent formats. Once extracted, Unstruct intelligently merges the data across multiple files using a chosen primary key.

In the packaging industry, for example, suppliers often deliver product details scattered across different file types and formats. One file may contain information for multiple products, while another provides overlapping details. With Unstruct, all of these sources are harmonized into a complete, vendor-specific product catalog.

The result: a clean, consistent dataset per supplier—ready to download as a CSV or seamlessly ingest into your product system.

Unstruct turns chaos into clarity, making it faster and easier to build structured product catalogs from unstructured inputs.

## Data Model & UX Flow

### Core Entities

**USER** → **FILE** → **EXTRACTION** → **PRODUCT**

1. **USER** uploads **FILE**(s)
2. Each **FILE** gets processed in parallel, creating **EXTRACTION**(s)
3. Each **EXTRACTION** has:
   - Array of records (rows in the sheet)
   - A data model attached
   - Status (pending/processing/success/failed)
4. **EXTRACTION**(s) can be approved individually
5. Multiple approved **EXTRACTION**(s) can be synthesized into **PRODUCT**(s)
6. **PRODUCT** represents the unified view after LLM synthesis
7. One **PRODUCT** can reference multiple **EXTRACTION**(s)

### User Experience Flow

1. **Upload**: User drops files → files get extracted in parallel
2. **Review**: User sees extractions in the sheet, can approve/reject individual extractions
3. **Synthesize**: User selects multiple approved extractions → LLM synthesizes into unified products
4. **Final View**: Clean product catalog with references back to source extractions
import { readFile } from "fs/promises";
import { pdfToPages } from "pdf-ts";
import { IContentLoader, LoadResult } from "./types";

const PDF_MIME_TYPES = ["application/pdf"];

export class PdfLoader implements IContentLoader {
  supports(mimeType: string): boolean {
    return PDF_MIME_TYPES.includes(mimeType);
  }

  async load(localPath: string): Promise<LoadResult> {
    const buffer = await readFile(localPath);
    const pages = await pdfToPages(buffer);
    const content = pages.map((page) => page.text).join("\n\n");
    const numPages = Math.max(...pages.map((page) => page.page));
    return { content, metadata: { pages: numPages } };
  } 
}

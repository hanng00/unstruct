import { readFile } from "fs/promises";
import mammoth from "mammoth";
import { htmlToMarkdown } from "./html-to-md";
import { IContentLoader, LoadResult } from "./types";

const DOCX_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export class DocxLoader implements IContentLoader {
  supports(mimeType: string): boolean {
    return DOCX_MIME_TYPES.includes(mimeType);
  }

  async load(localPath: string): Promise<LoadResult> {
    const buffer = await readFile(localPath);
    const { value: html } = await mammoth.convertToHtml({ buffer });
    const content = htmlToMarkdown(html);
    return { content };
  }
}



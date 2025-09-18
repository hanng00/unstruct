import { readFile } from "fs/promises";
import { htmlToMarkdown } from "./html-to-md";
import { IContentLoader, LoadResult } from "./types";

const HTML_MIME_TYPES = ["text/html", "application/xhtml+xml"];

export class HtmlLoader implements IContentLoader {
  supports(mimeType: string): boolean {
    return HTML_MIME_TYPES.includes(mimeType);
  }

  async load(localPath: string): Promise<LoadResult> {
    const html = await readFile(localPath, "utf8");
    const content = htmlToMarkdown(html);
    return { content };
  }
}



import { readFile } from "fs/promises";
import { IContentLoader, LoadResult } from "./types";

const TEXT_MIME_PREFIXES = [
  "text/plain",
  "text/csv",
  "text/",
  "application/json",
  "application/xml",
  "application/xhtml+xml",
];

export class TextLikeLoader implements IContentLoader {
  supports(mimeType: string): boolean {
    return TEXT_MIME_PREFIXES.some((p) =>
      p.endsWith("/") ? mimeType.startsWith(p) : mimeType === p
    );
  }

  async load(localPath: string): Promise<LoadResult> {
    const content = await readFile(localPath, "utf8");
    return { content };
  }
}

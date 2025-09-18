import { IContentLoader, LoadResult } from "./types";

export class FallbackLoader implements IContentLoader {
  supports(_mimeType: string): boolean {
    return true; // catch-all fallback
  }

  async load(_localPath: string): Promise<LoadResult> {
    return { content: "" };
  }
}



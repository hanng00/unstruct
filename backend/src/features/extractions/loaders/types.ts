export type LoadResult = {
  content: string;
  metadata?: Record<string, unknown>;
};

export interface IContentLoader {
  supports(mimeType: string): boolean;
  load(localPath: string): Promise<LoadResult>;
}



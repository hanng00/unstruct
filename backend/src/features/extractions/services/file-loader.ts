import { IStorageService } from "@/clients/s3";
import { IFileRepository } from "@/features/files/repositories/file-repository";
import { readFile } from "fs/promises";
import path from "path";
import { IContentLoader } from "../loaders/types";

export class FileLoader {
  constructor(
    private readonly storageService: IStorageService,
    private readonly fileRepository: IFileRepository,
    private readonly loaders: IContentLoader[] = []
  ) {}

  async load(
    userId: string,
    fileId: string
  ): Promise<{ content: string; filename: string }> {
    const fileResponse = await this.fileRepository.getFile(userId, fileId);
    const file = fileResponse.file;
    if (!fileResponse.success || !file)
      throw new Error("File not found");

    const tmpPath = "/tmp";
    const localPath = path.join(tmpPath, file.filename);
    await this.storageService.downloadFile(file.s3Key, localPath);

    const loader = this.loaders.find((l) =>
      l.supports(file.mimeType)
    );
    if (loader) {
      const { content } = await loader.load(localPath);
      return { content, filename: file.filename };
    }

    const content = await readFile(localPath, "utf8");
    return { content, filename: file.filename };
  }
}

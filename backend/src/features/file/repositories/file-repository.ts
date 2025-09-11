import { UnstructRepository } from "@/repositories/unstruct-repository";
import { File, CreateFile } from "@/features/file/models/file";

export class FileRepository extends UnstructRepository {
  async createFile(input: CreateFile & { id: string; userId: string; workspaceId: string }): Promise<File> {
    const file: File = {
      id: input.id,
      userId: input.userId,
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      s3Key: input.s3Key,
      status: "uploading",
      metadata: input.metadata,
      createdAt: new Date().toISOString(),
    };

    return await this.create("FILE", file, {
      GSI2PK: `FILE#uploading`,
      GSI2SK: `FILE#${file.createdAt}`,
      GSI3PK: `WS#${input.workspaceId}`,
      GSI3SK: `FILE#${file.id}`,
    });
  }

  async getFile(id: string): Promise<File | null> {
    return await this.get<File>("FILE", id);
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return await this.queryByUser<File>(userId, "FILE");
  }

  async getFilesByWorkspace(workspaceId: string): Promise<File[]> {
    return await this.queryByWorkspace<File>(workspaceId, "FILE");
  }

  async updateFileStatus(id: string, status: File["status"]): Promise<File | null> {
    const file = await this.getFile(id);
    if (!file) return null;

    return await this.update<File>("FILE", id, { status });
  }

  async deleteFile(id: string): Promise<void> {
    return await this.delete("FILE", id);
  }
}

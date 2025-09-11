export type FileUploadStatus = "idle" | "uploading" | "completed" | "failed";

// A single file in the upload queue. `fileId` is assigned after
// generating a presigned URL. `clientId` uniquely identifies the item on
// the client prior to receiving a server-side id.
export interface FileUpload {
  clientId: string;
  file: File;
  fileId?: string;
  status: FileUploadStatus;
  progress: number; // 0-100
  error?: string;
}

export interface FileUploadProgress {
  fileId: string;
  progress: number;
  status: FileUploadStatus;
}

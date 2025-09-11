import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates an S3 key in the format: files/{userId}/{yyyy}/{mm}/{dd}/{uuid}_{filename}
 */
export const generateS3Key = (userId: string, filename: string, fileId?: string): string => {
  const now = new Date();
  const year = format(now, "yyyy");
  const month = format(now, "MM");
  const day = format(now, "dd");
  const id = fileId || uuidv4();
  
  return `files/${userId}/${year}/${month}/${day}/${id}_${filename}`;
};

/**
 * Generates an S3 key with a custom file ID
 */
export const generateS3KeyWithId = (userId: string, filename: string, fileId: string): string => {
  const now = new Date();
  const year = format(now, "yyyy");
  const month = format(now, "MM");
  const day = format(now, "dd");
  
  return `files/${userId}/${year}/${month}/${day}/${fileId}_${filename}`;
};

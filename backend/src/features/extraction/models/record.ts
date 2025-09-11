import { z } from "zod";

export const RecordSchema = z.object({
  id: z.string(),
  extractionId: z.string(),
  rowIndex: z.number().int().nonnegative(),
  data: z.record(z.unknown()),
  status: z.enum(["pending", "approved", "rejected"]),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});

export type Record = z.infer<typeof RecordSchema>;

export const CreateRecordSchema = z.object({
  extractionId: z.string(),
  rowIndex: z.number().int().nonnegative(),
  data: z.record(z.unknown()),
});

export type CreateRecord = z.infer<typeof CreateRecordSchema>;

export const UpdateRecordSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateRecord = z.infer<typeof UpdateRecordSchema>;

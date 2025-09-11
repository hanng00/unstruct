import { z } from "zod";

export const resetRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ResetRequestFormData = z.infer<typeof resetRequestSchema>;

export const resetConfirmSchema = z
  .object({
    confirmationCode: z
      .string()
      .min(1, "Confirmation code is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ResetConfirmFormData = z.infer<typeof resetConfirmSchema>;



"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { confirmNewPassword } from "../api/amplify";
import { Infinity } from "lucide-react";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

export function ForceChangePasswordForm({ onDone }: { onDone: () => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ newPassword }: { newPassword: string }) => confirmNewPassword({ newPassword }),
    onSuccess: () => onDone(),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await mutateAsync({ newPassword: data.newPassword });
          } catch {
            // handled by error state
          }
        })}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2">
          <Infinity className="size-10 text-primary" />
          <h1 className="text-xl text-foreground">Update your password</h1>
          <div className="text-center text-sm text-muted-foreground">
            For security, your account requires a new password before continuing. This often happens on first sign‑in or when an admin creates your account. Enter and confirm a new password to proceed.
          </div>
        </div>

        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="new-password">New password</FormLabel>
                <FormControl>
                  <Input id="new-password" type="password" placeholder="Enter a new password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="confirm-password">Confirm password</FormLabel>
                <FormControl>
                  <Input id="confirm-password" type="password" placeholder="Re-enter the new password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Updating..." : "Update password"}
        </Button>

        {error && (
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        )}
      </form>
    </Form>
  );
}



"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Infinity, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animation";
import {
    resetRequestSchema,
    type ResetRequestFormData,
    resetConfirmSchema,
    type ResetConfirmFormData,
} from "../schemas/reset";
import { resetPassword, confirmResetPassword } from "../api/amplify";

export interface ResetPasswordFormProps {
  initialEmail?: string;
  onBack: () => void;
  onCompleted?: (email: string) => void;
}

const msgToResetRequestError = (msg: string, name?: string) => {
  const code = name ?? "";
  if (msg.includes("UserNotConfirmedException") || code === "UserNotConfirmedException") {
    return "Please confirm your email address before resetting your password.";
  }
  if (msg.includes("NotAuthorizedException") || code === "NotAuthorizedException") {
    return "Password reset isn’t available for this account. If you signed up with SSO or haven’t confirmed your email, contact support.";
  }
  if (msg.includes("LimitExceededException") || code === "LimitExceededException") {
    return "Too many attempts. Please wait a bit and try again.";
  }
  // Intentionally generic to avoid email enumeration
  if (msg.includes("UserNotFoundException") || code === "UserNotFoundException") {
    return "If an account exists for this email, we’ve sent a verification code.";
  }
  return "We couldn’t start the reset. Please try again.";
};

const msgToResetConfirmError = (msg: string, name?: string) => {
  const code = name ?? "";
  if (msg.includes("CodeMismatchException") || code === "CodeMismatchException") {
    return "Invalid confirmation code. Please double-check and try again.";
  }
  if (msg.includes("ExpiredCodeException") || code === "ExpiredCodeException") {
    return "Confirmation code expired. Request a new code and try again.";
  }
  if (msg.includes("InvalidPasswordException") || code === "InvalidPasswordException") {
    return "Password does not meet security requirements.";
  }
  if (msg.includes("LimitExceededException") || code === "LimitExceededException") {
    return "Too many attempts. Please wait a bit and try again.";
  }
  return "We couldn’t reset your password. Please try again.";
};

export function ResetPasswordForm({ initialEmail, onBack, onCompleted }: ResetPasswordFormProps) {
  const [mode, setMode] = useState<"resetRequest" | "resetConfirm">(
    "resetRequest"
  );
  const [resetEmail, setResetEmail] = useState<string>(initialEmail ?? "");

  const resetRequestForm = useForm<ResetRequestFormData>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: initialEmail ?? "" },
  });

  const resetConfirmForm = useForm<ResetConfirmFormData>({
    resolver: zodResolver(resetConfirmSchema),
    defaultValues: {
      confirmationCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    mutateAsync: requestResetAsync,
    isPending: isRequestingReset,
    error: requestError,
    isSuccess: requestSuccess,
  } = useMutation({
    mutationFn: ({ email }: ResetRequestFormData) => resetPassword({ email }),
    onSuccess: (nextStep, variables) => {
      const email = variables.email;
      setResetEmail(email);
      if (nextStep?.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        resetConfirmForm.clearErrors();
        setMode("resetConfirm");
      }
      // If DONE, stay on request with a generic message
    },
    onError: (error) => {
      if (error instanceof Error) {
        const name = (error as unknown as { name?: string })?.name;
        if (name === "UserNotFoundException") {
          setResetEmail(resetRequestForm.getValues("email"));
          setMode("resetConfirm");
          return;
        }
        resetRequestForm.setError("root", {
          message: msgToResetRequestError(error.message, name),
        });
      }
    },
  });

  const {
    mutateAsync: confirmResetAsync,
    isPending: isConfirmingReset,
    error: confirmError,
  } = useMutation({
    mutationFn: async (data: ResetConfirmFormData) => {
      await confirmResetPassword({
        email: resetEmail,
        confirmationCode: data.confirmationCode,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      onCompleted?.(resetEmail);
    },
    onError: (error) => {
      if (error instanceof Error) {
        const name = (error as unknown as { name?: string })?.name;
        resetConfirmForm.setError("root", {
          message: msgToResetConfirmError(error.message, name),
        });
      }
    },
  });

  const onSubmitResetRequest = async (data: ResetRequestFormData) => {
    try {
      await requestResetAsync({ email: data.email });
    } catch {
      // handled by onError
    }
  };

  const onSubmitResetConfirm = async (data: ResetConfirmFormData) => {
    try {
      await confirmResetAsync(data);
    } catch {
      // handled by onError
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {mode === "resetRequest" && (
        <Form {...resetRequestForm}>
          <form onSubmit={resetRequestForm.handleSubmit(onSubmitResetRequest)}>
            <div className="flex flex-col gap-6">
              <motion.div
                className="flex flex-col items-center gap-2"
                variants={fadeIn(0.05)}
                initial="initial"
                animate="animate"
              >
                <Infinity className="size-10 text-primary" />
                <h1 className="text-xl text-foreground">Reset your password</h1>
                <div className="text-center text-sm text-muted-foreground">
                  Enter your account email. We&apos;ll send a verification code.
                </div>
              </motion.div>

              {(resetRequestForm.formState.errors.root || requestError) && (
                <motion.div
                  variants={fadeIn(0.1)}
                  initial="initial"
                  animate="animate"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                      {resetRequestForm.formState.errors.root?.message ??
                        (requestError as Error)?.message}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {requestSuccess && (
                <motion.div
                  variants={fadeIn(0.1)}
                  initial="initial"
                  animate="animate"
                >
                  <Alert>
                    <AlertDescription>
                      Verification code sent. Check your email.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                className="flex flex-col gap-6"
                variants={fadeIn(0.12)}
                initial="initial"
                animate="animate"
              >
                <div className="grid gap-3">
                  <FormField
                    control={resetRequestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="reset-email">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="m@example.com"
                              className="pl-10"
                              disabled={isRequestingReset}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <motion.div
                  variants={fadeIn(0.2)}
                  initial="initial"
                  animate="animate"
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isRequestingReset}
                  >
                    {isRequestingReset ? "Sending code..." : "Send code"}
                  </Button>
                </motion.div>

                <div className="text-center text-sm text-muted-foreground">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0"
                    onClick={onBack}
                  >
                    Back to sign in
                  </Button>
                </div>
              </motion.div>
            </div>
          </form>
        </Form>
      )}

      {mode === "resetConfirm" && (
        <Form {...resetConfirmForm}>
          <form onSubmit={resetConfirmForm.handleSubmit(onSubmitResetConfirm)}>
            <div className="flex flex-col gap-6">
              <motion.div
                className="flex flex-col items-center gap-2"
                variants={fadeIn(0.05)}
                initial="initial"
                animate="animate"
              >
                <Infinity className="size-10 text-primary" />
                <h1 className="text-xl text-foreground">Enter the code</h1>
                <div className="text-center text-sm text-muted-foreground">
                  We sent a code to <span className="font-medium">{resetEmail}</span>
                </div>
              </motion.div>

              {(resetConfirmForm.formState.errors.root || confirmError) && (
                <motion.div
                  variants={fadeIn(0.1)}
                  initial="initial"
                  animate="animate"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                      {resetConfirmForm.formState.errors.root?.message ??
                        (confirmError as Error)?.message}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                className="flex flex-col gap-6"
                variants={fadeIn(0.12)}
                initial="initial"
                animate="animate"
              >
                <div className="grid gap-3">
                  <FormField
                    control={resetConfirmForm.control}
                    name="confirmationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="code">Confirmation code</FormLabel>
                        <FormControl>
                          <Input
                            id="code"
                            type="text"
                            placeholder="Enter the code"
                            disabled={isConfirmingReset}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={resetConfirmForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="new-password">New password</FormLabel>
                        <FormControl>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter your new password"
                            disabled={isConfirmingReset}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={resetConfirmForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="confirm-password">Confirm password</FormLabel>
                        <FormControl>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Re-enter your new password"
                            disabled={isConfirmingReset}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <motion.div
                  variants={fadeIn(0.2)}
                  initial="initial"
                  animate="animate"
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isConfirmingReset}
                  >
                    {isConfirmingReset ? "Resetting..." : "Reset password"}
                  </Button>
                </motion.div>

                <div className="text-center text-sm text-muted-foreground">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0"
                    onClick={onBack}
                  >
                    Back to sign in
                  </Button>
                </div>
              </motion.div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}



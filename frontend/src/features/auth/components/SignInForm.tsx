"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fadeIn } from "@/lib/animation";
import { REDIRECT_AFTER_SIGN_IN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Infinity, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn, type SignInNextStep } from "../api/amplify";
import { useAuthFlow } from "../hooks/use-auth-flow";
import { signInSchema, type SignInFormData } from "../schemas/signin";

const msgToError = (msg: string, name?: string) => {
  const code = name ?? "";
  if (
    msg.includes("UserNotConfirmedException") ||
    code === "UserNotConfirmedException"
  ) {
    return "Please confirm your email address before signing in.";
  }
  if (
    msg.includes("CodeMismatchException") ||
    code === "CodeMismatchException"
  ) {
    return "Invalid confirmation code. Please double-check and try again.";
  }
  if (msg.includes("ExpiredCodeException") || code === "ExpiredCodeException") {
    return "Confirmation code expired. Request a new code and try again.";
  }
  if (
    msg.includes("InvalidPasswordException") ||
    code === "InvalidPasswordException"
  ) {
    return "Password does not meet security requirements.";
  }
  if (
    msg.includes("LimitExceededException") ||
    code === "LimitExceededException"
  ) {
    return "Too many attempts. Please wait a bit and try again.";
  }
  return "An error occurred during sign in. Please try again.";
};

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: signIn,
    onSuccess: (nextStep: SignInNextStep) => {
      if (nextStep?.signInStep === "DONE") {
        router.push(REDIRECT_AFTER_SIGN_IN);
        return;
      }
      if (
        nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        // User needs to change their password - go to force change step
        goToForcePasswordChange();
        return;
      }
      // Other challenges like SMS/TOTP are not implemented here
    },
    onError: (error) => {
      if (error instanceof Error) {
        const name = (error as unknown as { name?: string })?.name;
        form.setError("root", {
          message: msgToError(error.message, name),
        });
      }
      // Avoid console.error to prevent Next.js dev overlay
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  // View routing handled by AuthFlow via URL params
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await mutateAsync({
        email: data.email,
        password: data.password,
      });
    } catch {
      // Handled in onError; prevent unhandled rejection in Next.js dev overlay
    }
  };

  const handleSignUp = () => {
    window.open("mailto:hannes@circulate.com", "_blank");
  };

  const { goToForcePasswordChange, goToPasswordReset } = useAuthFlow();
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Other steps are rendered by AuthFlow */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <motion.div
              className="flex flex-col items-center gap-2"
              variants={fadeIn(0.05)}
              initial="initial"
              animate="animate"
            >
              <Infinity className="size-10 text-primary" />
              <h1 className="text-xl text-foreground">
                Welcome to Circulate&apos;s{" "}
                <span className="italic">Unstruct</span>
              </h1>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account? Contact:
                <Button
                  variant="link"
                  onClick={handleSignUp}
                  className="p-1"
                  type="button"
                >
                  hannes@circulate.com
                </Button>
              </div>
            </motion.div>

            {(form.formState.errors.root || error) && (
              <motion.div
                variants={fadeIn(0.1)}
                initial="initial"
                animate="animate"
              >
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    {form.formState.errors.root?.message ??
                      (error as Error).message}
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
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            className="pl-10"
                            disabled={isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            disabled={isPending}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 "
                            disabled={isPending}
                          >
                            {showPassword && <EyeOff className="size-4" />}
                            {!showPassword && <Eye className="size-4" />}
                          </Button>
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
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Signing in..." : "Sign In"}
                </Button>
              </motion.div>

              <div className="text-center text-sm text-muted-foreground">
                <Button
                  type="button"
                  variant="link"
                  className="p-0"
                  onClick={() => {
                    const email = form.getValues("email") ?? "";
                    goToPasswordReset(email);
                  }}
                >
                  Forgot your password?
                </Button>
              </div>
            </motion.div>
          </div>
        </form>
      </Form>
    </div>
  );
}

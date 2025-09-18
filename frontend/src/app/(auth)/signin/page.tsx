"use client";

import { Loader } from "@/components/loader";
import { AuthFlow } from "@/features/auth/components/AuthFlow";
import { fadeIn } from "@/lib/animation";
import { motion } from "framer-motion";
import { Suspense } from "react";

export default function SignInPage() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-md"
        variants={fadeIn(0.05)}
        initial="initial"
        animate="animate"
      >
        <Suspense fallback={<Loader />}>
          <motion.div variants={fadeIn(0.1)}>
            <AuthFlow />
          </motion.div>

          {/* Footer */}
          <motion.div className="text-center mt-8" variants={fadeIn(0.2)}>
            <p className="text-xs text-muted-foreground">
              © {currentYear} Circulate. All rights reserved.
            </p>
          </motion.div>
        </Suspense>
      </motion.div>
    </div>
  );
}

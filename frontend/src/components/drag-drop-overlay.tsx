"use client";

import { fadeIn, slideUp } from "@/lib/animation";
import { AnimatePresence, motion } from "framer-motion";
import { UploadIcon } from "lucide-react";

interface DragDropOverlayProps {
  isVisible: boolean;
}

export function DragDropOverlay({ isVisible }: DragDropOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={fadeIn(0.1)}
          className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
        >
          <motion.div
            variants={slideUp(0.2)}
            className="bg-background rounded-md absolute bottom-10 border-[0.5px] border-primary"
          >
            <div className="flex flex-row items-center justify-center gap-4 p-4">
              <UploadIcon className="size-8" />
              <p className="text-foreground">
                Release your files anywhere to get started
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

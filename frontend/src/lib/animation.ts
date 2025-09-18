import type { MotionProps, Variants } from "framer-motion";

// Minimal helpers for consistent fade animations
export function fadeIn(delay = 0): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.8, delay, ease: "easeInOut" },
    },
  };
}

export function fadeInUp(delay = 0): Variants {
  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: "easeInOut" },
    },
  };
}

export const slideUp = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: "easeInOut" },
  },
});

export function fadeInWhileInView(delay = 0, amount = 0.3): MotionProps {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" },
    viewport: { once: true, amount },
  };
}

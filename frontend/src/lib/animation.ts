import type { Variants } from "framer-motion";

export const fadeIn = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: "easeInOut" },
  },
});


export const slideUp = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: "easeInOut" },
  },
});
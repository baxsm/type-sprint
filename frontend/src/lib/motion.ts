// shared animation constants for motion/react
// all animations: under 280ms, ease-out-quart, viewport once

const EASE_OUT: [number, number, number, number] = [0.25, 1, 0.5, 1];
const DURATION = 0.28;

// scroll-triggered fade + translateY
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: DURATION, ease: EASE_OUT },
};

// scroll-triggered with custom delay (for staggered lists)
export const fadeUpDelay = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: DURATION, ease: EASE_OUT, delay },
});

// immediate entrance (hero, above the fold)
export const heroEntrance = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION, ease: EASE_OUT },
};

export const heroEntranceDelay = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION, ease: EASE_OUT, delay },
});

// slide from left/right (for before/after comparisons)
export const slideFromLeft = {
  initial: { opacity: 0, x: -20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: DURATION, ease: EASE_OUT },
};

export const slideFromRight = {
  initial: { opacity: 0, x: 20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: DURATION, ease: EASE_OUT, delay: 0.1 },
};

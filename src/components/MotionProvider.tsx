"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";

/*
 * One place for Motion settings:
 *  - LazyMotion + `m` components keep the animation runtime small (strict: `motion.*` is not allowed).
 *  - domMax includes layout animations (the gliding nav underline, product grid reflow).
 *  - reducedMotion="user" turns movement off for people who ask their OS for less motion.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

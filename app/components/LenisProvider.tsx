"use client";

/**
 * Lenis smooth-scroll provider — v1.3.x (lenis/react)
 *
 * Uses the official <ReactLenis root> pattern from the Lenis docs:
 * https://github.com/darkroomengineering/lenis/blob/main/README.md
 *
 * `root` sets up a global window-level Lenis instance.
 * `autoRaf` (default true in v1.3) handles the rAF loop automatically.
 */

import { ReactLenis } from "lenis/react";
import type { LenisOptions } from "lenis";

const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.1,            // lower = smoother/longer glide (0–1)
  smoothWheel: true,    // smooth mouse-wheel scroll
  syncTouch: false,     // let native touch scroll handle mobile
};

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}

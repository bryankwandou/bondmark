"use client";

import { motion, useReducedMotion } from "motion/react";

import type { Band } from "@/lib/score";

const BAND_COLOR: Record<Band, string> = {
  unbonded: "var(--ink-faint)",
  thin: "var(--notice)",
  building: "var(--seal)",
  solid: "var(--bond)",
  strong: "var(--bond)",
};

/**
 * The score, drawn as a ring that fills.
 *
 * The arc is the honest part: it is 100 units long and fills to the score, so a
 * weak seller looks visibly unfinished rather than merely differently coloured.
 * A seller mid-withdrawal gets a dashed ring, because the number alone would let
 * that slip past someone skimming.
 */
export function ScoreDial({
  score,
  band,
  exiting = false,
  size = 148,
}: {
  score: number;
  band: Band;
  exiting?: boolean;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const stroke = size * 0.075;
  const radius = (size - stroke) / 2;
  const color = exiting ? "var(--notice)" : BAND_COLOR[band];

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--rule)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={exiting ? "3 4" : "100 100"}
          initial={reduce ? false : { strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: exiting ? 0 : 100 - score }}
          transition={{ type: "spring", stiffness: 60, damping: 18, mass: 0.9 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="figure font-semibold leading-none"
          style={{ fontSize: size * 0.3, color }}
        >
          {score}
        </span>
        <span
          className="mt-1 text-ink-faint uppercase tracking-wider"
          style={{ fontSize: size * 0.075 }}
        >
          out of 100
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Locale, INTRO_COPY } from "@/lib/i18n/ui";

export type IntroPhase = "idle" | "launching" | "revealed";

type IntroLandingProps = {
  locale: Locale;
  phase: IntroPhase;
  reducedMotion: boolean;
  target: { x: number; y: number; size: number } | null;
  onStart: () => void;
};

type LaunchMetrics = {
  left: number;
  top: number;
  size: number;
  targetX: number;
  targetY: number;
  targetSize: number;
};

const LAUNCH_TARGET_X_OFFSET = 0;

export function IntroLanding({ locale, phase, reducedMotion, target, onStart }: IntroLandingProps) {
  const dotRef = useRef<HTMLSpanElement | null>(null);
  const [launchMetrics, setLaunchMetrics] = useState<LaunchMetrics | null>(null);
  const isLaunching = phase === "launching";
  const copy = INTRO_COPY[locale];

  const animatedDotStyle = useMemo(() => {
    if (!launchMetrics) {
      return null;
    }

    return {
      left: launchMetrics.left,
      top: launchMetrics.top,
      size: launchMetrics.size,
      targetSize: launchMetrics.targetSize,
      targetTranslateX: launchMetrics.targetX - launchMetrics.left,
      targetTranslateY: launchMetrics.targetY - launchMetrics.top
    };
  }, [launchMetrics]);

  const handleStart = () => {
    if (!reducedMotion && dotRef.current) {
      const rect = dotRef.current.getBoundingClientRect();
      const targetSize = Math.max(Math.min(window.innerWidth * 0.38, 560), 360);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const resolvedTarget = target ?? {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        size: targetSize
      };

      setLaunchMetrics({
        left: centerX,
        top: centerY,
        size: rect.width,
        targetX: resolvedTarget.x + LAUNCH_TARGET_X_OFFSET,
        targetY: resolvedTarget.y,
        targetSize: resolvedTarget.size
      });
    }

    onStart();
  };

  useEffect(() => {
    if (!isLaunching || !target) {
      return;
    }

    setLaunchMetrics((current) => {
      if (!current) {
        return current;
      }

      if (
        Math.abs(current.targetX - target.x) <= 1 &&
        Math.abs(current.targetY - target.y) <= 1 &&
        Math.abs(current.targetSize - target.size) <= 1
      ) {
        return current;
      }

      return {
        ...current,
        targetX: target.x + LAUNCH_TARGET_X_OFFSET,
        targetY: target.y,
        targetSize: target.size
      };
    });
  }, [isLaunching, target]);

  return (
    <AnimatePresence>
      {phase !== "revealed" ? (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.28 : 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="absolute inset-0 z-40 overflow-hidden"
        >
          <motion.div
            animate={isLaunching ? { opacity: 0.18 } : { opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0.3 : 1.08,
              delay: reducedMotion ? 0.08 : 1.46,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(70,255,182,0.2),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(90,255,218,0.08),transparent_22%),linear-gradient(180deg,rgba(1,4,7,0.78),rgba(2,5,10,0.96))]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
            <div className="absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-emerald-200/18 to-transparent" />
            <div className="absolute inset-x-0 bottom-[22%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>

          <motion.div
            animate={
              isLaunching
                ? { opacity: 0, scale: 0.992, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={{
              duration: reducedMotion ? 0.28 : 0.82,
              delay: reducedMotion ? 0 : 2.22,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative flex h-full flex-col items-center justify-center px-6 text-center [will-change:transform,opacity]"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 rounded-full border border-emerald-300/12 bg-black/24 px-4 py-2 text-[10px] tracking-[0.42em] text-emerald-100/72 backdrop-blur-xl"
            >
              {copy.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.84, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="font-hero inline-flex items-end justify-center whitespace-nowrap text-[clamp(3.6rem,12vw,9.6rem)] font-[700] leading-[0.88] [contain:layout_paint] [will-change:transform,opacity]"
            >
              <span className="flex w-[2.96em] items-end justify-end pr-[0.085em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.06)]">
                <span className="tracking-[-0.01em]">F</span>
                <span className="ml-[0.005em] tracking-[-0.018em]">u</span>
                <span className="ml-[-0.002em] tracking-[-0.016em]">t</span>
              </span>
              <span
                ref={dotRef}
                className={`mx-[0.05em] mb-[0.105em] block h-[0.148em] w-[0.148em] rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.22)] transition-opacity duration-500 ${isLaunching ? "opacity-0 delay-150" : "opacity-100 delay-0"}`}
              />
              <span className="flex w-[3.12em] items-end justify-start pl-[0.12em] text-[rgb(88,255,178)] drop-shadow-[0_0_18px_rgba(88,255,178,0.12)]">
                <span className="tracking-[-0.032em]">M</span>
                <span className="ml-[-0.026em] tracking-[-0.03em]">a</span>
                <span className="ml-[-0.016em] tracking-[-0.02em]">p</span>
              </span>
            </motion.h1>

            <motion.button
              type="button"
              onClick={handleStart}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.78, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reducedMotion ? undefined : { scale: 1.025, borderColor: "rgba(88,255,178,0.46)", boxShadow: "0 0 32px rgba(88,255,178,0.12)" }}
              whileTap={{ scale: 0.985 }}
              className="mt-10 rounded-full border border-emerald-300/18 bg-black/36 px-7 py-3 text-[11px] tracking-[0.34em] text-white backdrop-blur-xl transition-colors duration-300 hover:bg-emerald-300/10"
            >
              {copy.cta}
            </motion.button>
          </motion.div>

          {animatedDotStyle ? (
            <motion.div
              initial={{
                x: -animatedDotStyle.size / 2,
                y: -animatedDotStyle.size / 2,
                width: animatedDotStyle.size,
                height: animatedDotStyle.size,
                rotate: 0,
                opacity: 1
              }}
              animate={
                reducedMotion
                  ? {
                      x: animatedDotStyle.targetTranslateX,
                      y: animatedDotStyle.targetTranslateY,
                      width: animatedDotStyle.targetSize,
                      height: animatedDotStyle.targetSize,
                      opacity: 0
                    }
                  : {
                      x: animatedDotStyle.targetTranslateX - animatedDotStyle.targetSize / 2,
                      y: animatedDotStyle.targetTranslateY - animatedDotStyle.targetSize / 2,
                      width: animatedDotStyle.targetSize,
                      height: animatedDotStyle.targetSize,
                      opacity: [1, 1, 0.94, 0.38, 0]
                    }
              }
              transition={
                reducedMotion
                  ? {
                      duration: 0.48,
                      ease: [0.17, 0.92, 0.24, 1]
                    }
                  : {
                      x: { duration: 3.08, ease: [0.3, 0.01, 0.13, 1] },
                      y: { duration: 3.08, ease: [0.3, 0.01, 0.13, 1] },
                      width: { duration: 3.08, ease: [0.3, 0.01, 0.13, 1] },
                      height: { duration: 3.08, ease: [0.3, 0.01, 0.13, 1] },
                      opacity: { duration: 1.14, delay: 1.96, ease: [0.22, 1, 0.36, 1] }
                    }
              }
              className="pointer-events-none absolute"
              style={{ left: animatedDotStyle.left, top: animatedDotStyle.top }}
            >
              <div className="absolute inset-0 rounded-full bg-white shadow-[0_0_42px_rgba(255,255,255,0.26),0_0_110px_rgba(255,255,255,0.14)]" />
            </motion.div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

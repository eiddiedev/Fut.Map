import Link from "next/link";
import type { Metadata } from "next";
import { SnakeGame } from "@/components/SnakeGame";

export const metadata: Metadata = {
  title: "Snake | LiveGoal Map",
  description: "A minimal classic Snake implementation built into the LiveGoal Map playground."
};

export default function SnakePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cyber-bg text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-radial" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-black/25 p-6 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center rounded-full border border-cyber-line/20 bg-cyber-line/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-cyber-glow">
              arcade system
            </span>
            <div>
              <h1 className="font-display text-4xl uppercase tracking-[0.2em] text-white sm:text-5xl">
                Snake
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                Classic grid movement only: eat food, grow longer, survive the walls, and restart
                when the run ends.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white transition hover:border-cyber-line/30 hover:text-cyber-glow"
          >
            back to map
          </Link>
        </header>

        <SnakeGame />
      </div>
    </main>
  );
}

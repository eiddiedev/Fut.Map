"use client";

import { useEffect, useState } from "react";
import {
  createInitialGameState,
  DEFAULT_BOARD_SIZE,
  type Direction,
  type SnakeGameState,
  queueDirection,
  setGameStatus,
  stepGame,
  toCellKey
} from "@/lib/snake/game";

const TICK_MS = 180;

const KEY_TO_DIRECTION: Record<string, Direction> = {
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right"
};

const CONTROL_BUTTONS: Array<{ direction: Direction; label: string }> = [
  { direction: "up", label: "up" },
  { direction: "left", label: "left" },
  { direction: "down", label: "down" },
  { direction: "right", label: "right" }
];

export function SnakeGame() {
  const [game, setGame] = useState(() => setGameStatus(createGame(() => 0), "paused"));

  useEffect(() => {
    if (game.status !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setGame((currentGame) => stepGame(currentGame));
    }, TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [game.status]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[event.key.toLowerCase()];

      if (direction) {
        event.preventDefault();
        setGame((currentGame) => handleDirectionInput(currentGame, direction));
        return;
      }

      if (event.key === " " || event.key.toLowerCase() === "p") {
        event.preventDefault();
        setGame((currentGame) => togglePause(currentGame));
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        setGame(createGame());
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const headKey = toCellKey(game.snake[0]);
  const foodKey = game.food ? toCellKey(game.food) : null;
  const snakeCells = new Set(game.snake.map(toCellKey));
  const totalCells = game.boardSize * game.boardSize;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="space-y-4">
        <div
          className="grid aspect-square w-full overflow-hidden rounded-[28px] border border-cyber-line/20 bg-[#02060d] p-2 shadow-glow"
          style={{ gridTemplateColumns: `repeat(${game.boardSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalCells }, (_, index) => {
            const x = index % game.boardSize;
            const y = Math.floor(index / game.boardSize);
            const cellKey = `${x}:${y}`;
            const isHead = headKey === cellKey;
            const isSnake = snakeCells.has(cellKey);
            const isFood = foodKey === cellKey;

            return (
              <div
                key={cellKey}
                className={[
                  "rounded-[6px] border border-white/[0.03] bg-white/[0.02]",
                  isSnake ? "bg-cyber-line/55" : "",
                  isHead ? "border-cyber-glow/40 bg-cyber-glow shadow-[0_0_20px_rgba(132,255,215,0.22)]" : "",
                  isFood ? "border-red-300/35 bg-red-400/85" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setGame((currentGame) => togglePause(currentGame))}
            disabled={game.status === "game-over"}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white transition hover:border-cyber-line/30 hover:text-cyber-glow disabled:cursor-not-allowed disabled:opacity-40"
          >
            {game.status === "paused" ? "resume" : "pause"}
          </button>
          <button
            type="button"
            onClick={() => setGame(createGame())}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white transition hover:border-cyber-line/30 hover:text-cyber-glow"
          >
            restart
          </button>
        </div>
      </section>

      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <InfoCard label="score" value={String(game.score)} />
          <InfoCard label="status" value={formatStatus(game.status)} />
          <InfoCard label="speed" value={`${TICK_MS} ms`} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 font-display text-sm uppercase tracking-[0.28em] text-cyber-glow">
            controls
          </div>
          <p className="text-sm leading-6 text-white/65">
            Arrow keys or WASD to steer. Press <span className="text-white">P</span> or the
            button to pause, and <span className="text-white">R</span> to restart instantly.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 font-display text-sm uppercase tracking-[0.28em] text-cyber-glow">
            touch pad
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div />
            <ControlButton
              direction="up"
              label="up"
              onPress={(direction) =>
                setGame((currentGame) => handleDirectionInput(currentGame, direction))
              }
            />
            <div />
            {CONTROL_BUTTONS.slice(1).map(({ direction, label }) => (
              <ControlButton
                key={direction}
                direction={direction}
                label={label}
                onPress={(nextDirection) =>
                  setGame((currentGame) => handleDirectionInput(currentGame, nextDirection))
                }
              />
            ))}
          </div>
        </div>

        {game.status === "game-over" ? (
          <div className="rounded-3xl border border-red-300/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100/80">
            The run ended. Restart to reset the board and go again.
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-white/42">{label}</div>
      <div className="font-display text-lg uppercase tracking-[0.12em] text-white">{value}</div>
    </div>
  );
}

function ControlButton({
  direction,
  label,
  onPress
}: {
  direction: Direction;
  label: string;
  onPress: (direction: Direction) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(direction)}
      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-xs uppercase tracking-[0.24em] text-white transition hover:border-cyber-line/30 hover:text-cyber-glow"
    >
      {label}
    </button>
  );
}

function createGame(random = Math.random) {
  return createInitialGameState(DEFAULT_BOARD_SIZE, random);
}

function handleDirectionInput(game: SnakeGameState, direction: Direction) {
  const nextGame = queueDirection(game, direction);

  if (nextGame.status === "paused") {
    return setGameStatus(nextGame, "running");
  }

  return nextGame;
}

function togglePause(game: SnakeGameState) {
  if (game.status === "game-over") {
    return game;
  }

  return setGameStatus(game, game.status === "paused" ? "running" : "paused");
}

function formatStatus(status: SnakeGameState["status"]) {
  if (status === "game-over") {
    return "game over";
  }

  return status;
}

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createInitialGameState,
  queueDirection,
  spawnFood,
  stepGame,
  type SnakeGameState
} from "./game.ts";

test("stepGame moves the snake forward without changing length", () => {
  const state: SnakeGameState = {
    boardSize: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    direction: "right",
    queuedDirection: null,
    food: { x: 5, y: 5 },
    score: 0,
    status: "running"
  };

  const nextState = stepGame(state, () => 0);

  assert.deepEqual(nextState.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 }
  ]);
  assert.equal(nextState.score, 0);
  assert.equal(nextState.status, "running");
});

test("stepGame grows the snake and increments score when food is eaten", () => {
  const state: SnakeGameState = {
    boardSize: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    direction: "right",
    queuedDirection: null,
    food: { x: 3, y: 2 },
    score: 0,
    status: "running"
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.snake.length, 4);
  assert.equal(nextState.score, 1);
  assert.deepEqual(nextState.snake[0], { x: 3, y: 2 });
  assert.notEqual(nextState.food, null);
  assert.ok(nextState.food);
  assert.ok(!nextState.snake.some((segment) => segment.x === nextState.food.x && segment.y === nextState.food.y));
});

test("stepGame ends the game when the snake hits a wall", () => {
  const state: SnakeGameState = {
    boardSize: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ],
    direction: "right",
    queuedDirection: null,
    food: { x: 0, y: 0 },
    score: 2,
    status: "running"
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.status, "game-over");
  assert.equal(nextState.score, 2);
});

test("queueDirection ignores immediate reverse turns", () => {
  const state = createInitialGameState(8, () => 0);

  const nextState = queueDirection(state, "left");

  assert.equal(nextState.queuedDirection, null);
});

test("spawnFood picks an open cell in deterministic order", () => {
  const food = spawnFood(
    3,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ],
    () => 0
  );

  assert.deepEqual(food, { x: 0, y: 1 });
});

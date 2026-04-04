export type Direction = "up" | "down" | "left" | "right";

export type Position = {
  x: number;
  y: number;
};

export type GameStatus = "running" | "paused" | "game-over";

export type SnakeGameState = {
  boardSize: number;
  snake: Position[];
  direction: Direction;
  queuedDirection: Direction | null;
  food: Position | null;
  score: number;
  status: GameStatus;
};

export const DEFAULT_BOARD_SIZE = 14;

const DIRECTION_VECTORS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createInitialGameState(
  boardSize = DEFAULT_BOARD_SIZE,
  random = Math.random
): SnakeGameState {
  const center = Math.floor(boardSize / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center }
  ];

  return {
    boardSize,
    snake,
    direction: "right",
    queuedDirection: null,
    food: spawnFood(boardSize, snake, random),
    score: 0,
    status: "running"
  };
}

export function queueDirection(
  state: SnakeGameState,
  nextDirection: Direction
): SnakeGameState {
  if (
    state.status === "game-over" ||
    nextDirection === state.direction ||
    nextDirection === OPPOSITE_DIRECTIONS[state.direction] ||
    state.queuedDirection
  ) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection
  };
}

export function stepGame(
  state: SnakeGameState,
  random = Math.random
): SnakeGameState {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.queuedDirection ?? state.direction;
  const nextHead = move(state.snake[0], direction);
  const ateFood = state.food ? positionsEqual(nextHead, state.food) : false;
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);

  if (isOutOfBounds(nextHead, state.boardSize) || includesPosition(collisionBody, nextHead)) {
    return {
      ...state,
      direction,
      queuedDirection: null,
      status: "game-over"
    };
  }

  const snake = ateFood
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, state.snake.length - 1)];
  const food = ateFood ? spawnFood(state.boardSize, snake, random) : state.food;

  return {
    ...state,
    snake,
    direction,
    queuedDirection: null,
    food,
    score: state.score + (ateFood ? 1 : 0)
  };
}

export function spawnFood(
  boardSize: number,
  snake: Position[],
  random = Math.random
): Position | null {
  const occupied = new Set(snake.map(toCellKey));
  const freeCells: Position[] = [];

  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      const cell = { x, y };

      if (!occupied.has(toCellKey(cell))) {
        freeCells.push(cell);
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.min(
    freeCells.length - 1,
    Math.max(0, Math.floor(random() * freeCells.length))
  );

  return freeCells[index];
}

export function setGameStatus(
  state: SnakeGameState,
  status: Exclude<GameStatus, "game-over"> | "game-over"
): SnakeGameState {
  return {
    ...state,
    status
  };
}

export function toCellKey(position: Position): string {
  return `${position.x}:${position.y}`;
}

function move(position: Position, direction: Direction): Position {
  const vector = DIRECTION_VECTORS[direction];

  return {
    x: position.x + vector.x,
    y: position.y + vector.y
  };
}

function includesPosition(positions: Position[], target: Position): boolean {
  return positions.some((position) => positionsEqual(position, target));
}

function positionsEqual(left: Position, right: Position): boolean {
  return left.x === right.x && left.y === right.y;
}

function isOutOfBounds(position: Position, boardSize: number): boolean {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= boardSize ||
    position.y >= boardSize
  );
}

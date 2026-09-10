import type { Player } from "./types";

export const COLUMN_COUNT = 7;
export const ROWS_COUNT = 6;

export const DIRECTIONS = [
  [0, 1], // right
  [1, 0], // down
  [1, 1], // down-right
  [-1, 1], // up-right
];

export const PLAYER_TOKENS: Record<Player, string> = {
  player1: "#d9313d",
  player2: "#fdc601",
};

export const EMPTY_CELL_COLOR = "#fff";

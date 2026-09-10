import { COLUMN_COUNT, DIRECTIONS, ROWS_COUNT } from "./constants";
import type { BoardType, Player } from "./types";

// Assumes board[row][column] already equals currentPlayer (the seed cell is
// never itself checked) — callers must place the piece before calling this,
// otherwise the run length silently comes out wrong.
export function countInDirection(
  row: number,
  column: number,
  direction: number[],
  board: BoardType,
  currentPlayer: Player,
) {
  let currentRow = row;
  let currentColumn = column;
  let count = 1;

  currentRow += direction[0];
  currentColumn += direction[1];

  while (
    currentRow >= 0 &&
    currentRow < ROWS_COUNT &&
    currentColumn >= 0 &&
    currentColumn < COLUMN_COUNT &&
    board[currentRow][currentColumn] === currentPlayer
  ) {
    count += 1;

    currentRow += direction[0];
    currentColumn += direction[1];
  }

  return count;
}

export function checkWinner(
  row: number,
  column: number,
  board: BoardType,
  currentPlayer: Player,
): boolean {
  for (const direction of DIRECTIONS) {
    const directionCount = countInDirection(
      row,
      column,
      direction,
      board,
      currentPlayer,
    );

    const oppositeDirectionCount = countInDirection(
      row,
      column,
      [-direction[0], -direction[1]],
      board,
      currentPlayer,
    );

    if (directionCount + oppositeDirectionCount - 1 >= 4) {
      return true;
    }
  }

  return false;
}

export function getInitialGrid(): BoardType {
  return Array(ROWS_COUNT)
    .fill(null)
    .map(() => Array(COLUMN_COUNT).fill(null));
}

export function checkDraw(board: BoardType, winner: Player | null) {
  const movesSoFar = board.reduce(
    (count, row) => count + row.filter(Boolean).length,
    0,
  );

  return movesSoFar === ROWS_COUNT * COLUMN_COUNT && winner == null;
}

export function getAvailableColumns(board: BoardType): Set<number> {
  const availableColumns = new Set<number>();
  board[0].forEach((topCellValue, index) => {
    if (topCellValue === null) {
      availableColumns.add(index);
    }
  });

  return availableColumns;
}

import { useState } from "react";
import "./App.css";

const COLUMN_COUNT = 7;
const ROWS_COUNT = 6;

const DIRECTIONS = [
  [0, 1], // right
  [1, 0], // down
  [1, 1], // down-right
  [-1, 1], // up-right
];

const PLAYER_TOKENS = {
  player1: "#d9313d",
  player2: "#fdc601",
};

const EMPTY_CELL_COLOR = "#fff";

// Assumes board[row][column] already equals currentPlayer (the seed cell is
// never itself checked) — callers must place the piece before calling this,
// otherwise the run length silently comes out wrong.
function countInDirection(row, column, direction, board, currentPlayer) {
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

function checkWinner(row, column, board, currentPlayer) {
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

function getInitialGrid() {
  return Array(ROWS_COUNT)
    .fill(null)
    .map(() => Array(COLUMN_COUNT).fill(null));
}

function checkDraw(board, winner) {
  const movesSoFar = board.reduce(
    (count, row) => count + row.filter(Boolean).length,
    0,
  );

  return movesSoFar === ROWS_COUNT * COLUMN_COUNT && winner == null;
}

function getAvailableColumns(board) {
  const availableColumns = new Set();
  board[0].forEach((topCellValue, index) => {
    if (topCellValue === null) {
      availableColumns.add(index);
    }
  });

  return availableColumns;
}

function GameBoard({ board }) {
  return (
    <div className="board">
      {board.flat().map((cellValue, index) => (
        <div
          key={index}
          className="cell"
          style={{
            backgroundColor:
              cellValue != null ? PLAYER_TOKENS[cellValue] : EMPTY_CELL_COLOR,
          }}
        ></div>
      ))}
    </div>
  );
}

function PlayerMoveSection({
  availableColumns,
  currentPlayer,
  gameHasEnded,
  onPlayerMove,
}) {
  return (
    <div className="moveSection">
      {!gameHasEnded &&
        Array.from({ length: COLUMN_COUNT }).map((_, columnIndex) => {
          return (
            <button
              key={columnIndex}
              aria-label={`Drop piece in column ${columnIndex + 1}`}
              disabled={!availableColumns.has(columnIndex) || gameHasEnded}
              className="moveSectionCell"
              style={{
                "--player-color": PLAYER_TOKENS[currentPlayer],
              }}
              onClick={() => onPlayerMove(columnIndex)}
            ></button>
          );
        })}
    </div>
  );
}

function WinnerSection({ winner }) {
  return (
    <div
      className="winnerToken"
      style={{ backgroundColor: PLAYER_TOKENS[winner] }}
    >
      WON
    </div>
  );
}

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState("player1");
  const [winner, setWinner] = useState(null);
  const [board, setBoard] = useState(() => getInitialGrid());

  const isDraw = checkDraw(board, winner);

  const onPlayerMove = (columnIndex) => {
    if (winner || isDraw) return;
    if (board[0][columnIndex] !== null) return;

    const newBoard = board.map((row) => [...row]);
    let placedRow = -1;

    for (let row = ROWS_COUNT - 1; row >= 0; row--) {
      if (newBoard[row][columnIndex] === null) {
        newBoard[row][columnIndex] = currentPlayer;
        placedRow = row;
        break;
      }
    }

    setBoard(newBoard);

    if (checkWinner(placedRow, columnIndex, newBoard, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer((prev) => (prev === "player1" ? "player2" : "player1"));
    }
  };

  const handleReset = () => {
    setBoard(getInitialGrid());
    setCurrentPlayer("player1");
    setWinner(null);
  };

  return (
    <div className="app">
      {winner === null && !isDraw && (
        <p
          className="turn-indicator"
          style={{ color: PLAYER_TOKENS[currentPlayer] }}
        >
          {currentPlayer === "player1" ? "Player 1's" : "Player 2's"} turn
        </p>
      )}
      <PlayerMoveSection
        availableColumns={getAvailableColumns(board)}
        currentPlayer={currentPlayer}
        gameHasEnded={Boolean(isDraw || winner)}
        onPlayerMove={onPlayerMove}
      />
      <GameBoard board={board} />
      <button className="reset-button" onClick={handleReset}>
        Reset
      </button>
      {winner !== null && <WinnerSection winner={winner} />}
      {isDraw && <h2>DRAW</h2>}
    </div>
  );
}

import { useState } from "react";

import "./App.css";
import {
  checkDraw,
  checkWinner,
  getAvailableColumns,
  getInitialGrid,
} from "./utils/util";
import type { Player } from "./utils/types";
import { PLAYER_TOKENS, ROWS_COUNT } from "./utils/constants";
import WinnerSection from "./components/WinnerSection/WinnerSection";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { PlayerMoveSection } from "./components/PlayerMoveSection/PlayerMoveSection";

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("player1");
  const [winner, setWinner] = useState<Player | null>(null);

  const [board, setBoard] = useState(() => getInitialGrid());

  const isDraw = checkDraw(board, winner);

  const onPlayerMove = (columnIndex: number): void => {
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

export default App;

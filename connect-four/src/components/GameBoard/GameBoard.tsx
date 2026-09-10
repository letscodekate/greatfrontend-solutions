import { EMPTY_CELL_COLOR, PLAYER_TOKENS } from "../../utils/constants";
import type { BoardType } from "../../utils/types";
import styles from "./GameBoard.module.css";

export function GameBoard({ board }: { board: BoardType }) {
  return (
    <div className={styles.board}>
      {board.flat().map((cellValue, index) => (
        <div
          key={index}
          className={styles.cell}
          style={{
            backgroundColor:
              cellValue != null ? PLAYER_TOKENS[cellValue] : EMPTY_CELL_COLOR,
          }}
        ></div>
      ))}
    </div>
  );
}

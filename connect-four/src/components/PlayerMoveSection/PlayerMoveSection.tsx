import { COLUMN_COUNT, PLAYER_TOKENS } from "../../utils/constants";
import type { Player } from "../../utils/types";
import styles from "./PlayerMoveSection.module.css";

interface PlayerMoveSectionProps {
  availableColumns: Set<number>;
  currentPlayer: Player;
  gameHasEnded: boolean;
  onPlayerMove: (columnIndex: number) => void;
}

export function PlayerMoveSection({
  availableColumns,
  currentPlayer,
  gameHasEnded,
  onPlayerMove,
}: PlayerMoveSectionProps) {
  return (
    <div className={styles.moveSection}>
      {!gameHasEnded &&
        Array.from({ length: COLUMN_COUNT }).map((_, columnIndex) => {
          return (
            <button
              key={columnIndex}
              aria-label={`Drop piece in column ${columnIndex + 1}`}
              disabled={!availableColumns.has(columnIndex) || gameHasEnded}
              className={styles.moveSectionCell}
              style={
                {
                  "--player-color": PLAYER_TOKENS[currentPlayer],
                } as React.CSSProperties
              }
              onClick={() => onPlayerMove(columnIndex)}
            ></button>
          );
        })}
    </div>
  );
}

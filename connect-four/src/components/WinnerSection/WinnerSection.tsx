import { PLAYER_TOKENS } from "../../utils/constants";
import type { Player } from "../../utils/types";
import styles from "./WinnerSection.module.css";

interface WinnerSectionProps {
  winner: Player;
}

const WinnerSection = ({ winner }: WinnerSectionProps) => {
  return (
    <div
      className={styles.winnerToken}
      style={{ backgroundColor: PLAYER_TOKENS[winner] }}
    >
      WON
    </div>
  );
};

export default WinnerSection;

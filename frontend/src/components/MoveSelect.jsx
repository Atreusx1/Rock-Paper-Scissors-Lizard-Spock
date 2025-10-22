import { MOVES, MOVE_NAMES, MOVE_DESCRIPTIONS } from "../config/config";
import styles from "./MoveSelect.module.css";

// Import your SVGs
import rockSvg from "../assets/rock.svg";
import paperSvg from "../assets/paper.svg";
import scissorsSvg from "../assets/scissors.svg";
import spockSvg from "../assets/spock.svg";
import lizardSvg from "../assets/lizard.svg";

const MOVE_ICONS = {
  [MOVES.ROCK]: rockSvg,
  [MOVES.PAPER]: paperSvg,
  [MOVES.SCISSORS]: scissorsSvg,
  [MOVES.SPOCK]: spockSvg,
  [MOVES.LIZARD]: lizardSvg,
};

function MoveSelect({ selected, onSelect }) {
  const moves = [
    MOVES.ROCK,
    MOVES.PAPER,
    MOVES.SCISSORS,
    MOVES.SPOCK,
    MOVES.LIZARD,
  ];

  return (
    <div className={styles.container}>
      {moves.map((move) => (
        <button
          key={move}
          className={`${styles.moveBtn} ${
            selected === move ? styles.selected : ""
          }`}
          onClick={() => onSelect(move)}
        >
          <img src={MOVE_ICONS[move]} alt={MOVE_NAMES[move]} />
          <span>{MOVE_NAMES[move]}</span>
          <small>{MOVE_DESCRIPTIONS[move]}</small>
        </button>
      ))}
    </div>
  );
}

export default MoveSelect;

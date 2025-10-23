import { useState, useEffect } from "react";
import { getGameHistory } from "../utils/api";
import styles from "./Game.module.css";

function GameHistory({ account, onBack }) {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    loadHistory();
  }, [account]);

  async function loadHistory() {
    try {
      const { games } = await getGameHistory(account);
      setGames(games);
      setStatus(games.length ? "" : "No games yet");
    } catch (err) {
      setStatus("Failed to load history");
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
      <h2>Game History</h2>

      {games.map((game) => {
        const isTie = !game.winner;
        const totalWon = game.winner
          ? parseFloat(game.stake) * 2
          : parseFloat(game.stake);

        return (
          <div key={game.contractAddress} className={styles.historyItem}>
            {/* Winner */}
            <div className={styles.historyRow}>
              <strong>Winner:</strong>{" "}
              {isTie ? (
                "Tie (No Winner)"
              ) : (
                <span className={styles.addressText} title={game.winner}>
                  {game.winner}
                </span>
              )}
            </div>

            {/* Player 1 */}
            <div className={styles.historyRow}>
              <strong>Player 1:</strong>{" "}
              <span className={styles.addressText} title={game.player1}>
                {game.player1}
              </span>
            </div>

            {/* Player 2 */}
            <div className={styles.historyRow}>
              <strong>Player 2:</strong>{" "}
              <span className={styles.addressText} title={game.player2}>
                {game.player2}
              </span>
            </div>

            {/* Stake */}
            <div className={styles.historyRow}>
              <strong>Stake:</strong> {game.stake} ETH (each player)
            </div>

            {/* Total Won */}
            <div className={styles.historyRow}>
              <strong>Total Won:</strong>{" "}
              {isTie ? `${game.stake} ETH (returned)` : `${totalWon} ETH`}
            </div>

            {/* Date */}
            <div className={styles.historyRow}>
              <strong>Date:</strong> {new Date(game.createdAt).toLocaleString()}
            </div>

            {/* Contract */}
            <div className={styles.historyRow}>
              <strong>Contract:</strong>{" "}
              <span className={styles.addressText} title={game.contractAddress}>
                {game.contractAddress}
              </span>
            </div>
          </div>
        );
      })}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}

export default GameHistory;

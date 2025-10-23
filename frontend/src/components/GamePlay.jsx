import { useState } from "react";
import { ethers } from "ethers";
import MoveSelect from "./MoveSelect";
import { getRPSContract } from "../utils/contracts";
import styles from "./Game.module.css";
import { updateGameStatus } from "../utils/api";

function GamePlay({ signer, account, onBack }) {
  const [contractAddr, setContractAddr] = useState("");
  const [move, setMove] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);
  const [status, setStatus] = useState("");

  async function loadGame() {
    if (!ethers.isAddress(contractAddr)) {
      setStatus("Invalid address");
      return;
    }
    try {
      setStatus("Loading game...");
      const rps = getRPSContract(contractAddr, signer);
      const [j1, j2, c2, stake] = await Promise.all([
        rps.j1(),
        rps.j2(),
        rps.c2(),
        rps.stake(),
      ]);

      if (account.toLowerCase() !== j2.toLowerCase()) {
        setStatus("You are not Player 2");
        return;
      }
      if (Number(c2) !== 0) {
        setStatus("Already played");
        return;
      }

      setGameInfo({
        player1: j1,
        player2: j2,
        stake: ethers.formatEther(stake),
      });
      setStatus("Select your move");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handlePlay() {
    if (!move) {
      setStatus("Select a move");
      return;
    }
    try {
      setStatus("Sending transaction...");
      const rps = getRPSContract(contractAddr, signer);
      const stake = await rps.stake();
      const tx = await rps.play(move, { value: stake });
      await tx.wait();
      await updateGameStatus(contractAddr, "playing", null);

      setStatus("Move played! Player 1 can reveal.");
      // setTimeout(() => onBack(), 2000);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
      <h2>Join Game</h2>

      <label className={styles.label}>
        Contract Address
        <input
          type="text"
          value={contractAddr}
          onChange={(e) => setContractAddr(e.target.value)}
          placeholder="0x..."
          className={styles.input}
        />
      </label>

      <button onClick={loadGame} className={styles.secondaryButton}>
        Load Game
      </button>

      {gameInfo && (
        <>
          <div className={styles.infoBox}>
            <p>Stake: {gameInfo.stake} ETH</p>
            <p>Player 1: {gameInfo.player1}</p>
          </div>
          <MoveSelect selected={move} onSelect={setMove} />
          <button
            onClick={handlePlay}
            disabled={!move}
            className={styles.primaryButton}
          >
            Play Move for {gameInfo.stake} ETH
          </button>
        </>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}

export default GamePlay;

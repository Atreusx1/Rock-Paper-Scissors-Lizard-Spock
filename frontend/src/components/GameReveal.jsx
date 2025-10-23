import { useState } from "react";
import { ethers } from "ethers";
import { getRPSContract } from "../utils/contracts";
import { decryptWithSignature, uploadGameData } from "../utils/crypto";
import { loadGameFromServer, updateGameStatus } from "../utils/api";
import { MOVE_NAMES } from "../config/config";
import styles from "./Game.module.css";

function GameReveal({ signer, account, onBack }) {
  const [contractAddr, setContractAddr] = useState("");
  const [gameState, setGameState] = useState(null);
  const [status, setStatus] = useState("");

  async function loadGame() {
    if (!ethers.isAddress(contractAddr)) {
      setStatus("Invalid address");
      return;
    }

    try {
      setStatus("Loading from server...");
      const { encryptedData } = await loadGameFromServer(contractAddr, account);

      setStatus("Decrypting...");
      const encrypted = JSON.parse(encryptedData);
      const data = await decryptWithSignature(signer, encrypted);

      const rps = getRPSContract(contractAddr, signer);
      const [c2, stake] = await Promise.all([rps.c2(), rps.stake()]);

      setGameState({
        myMove: data.move,
        salt: data.salt,
        opponentMove: Number(c2),
        stake: ethers.formatEther(stake),
        hasPlayed: Number(c2) !== 0,
      });

      setStatus("Decrypted!");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setStatus("Reading backup...");
      const data = await uploadGameData(file);

      setContractAddr(data.contractAddress);

      const rps = getRPSContract(data.contractAddress, signer);
      const [c2, stake] = await Promise.all([rps.c2(), rps.stake()]);

      setGameState({
        myMove: data.move,
        salt: data.salt,
        opponentMove: Number(c2),
        stake: ethers.formatEther(stake),
        hasPlayed: Number(c2) !== 0,
      });

      setStatus("Backup loaded!");
    } catch (err) {
      setStatus(`Upload error: ${err.message}`);
    }
  }

  async function handleReveal() {
    try {
      setStatus("Revealing...");
      const rps = getRPSContract(contractAddr, signer);

      const tx = await rps.solve(
        gameState.myMove,
        ethers.toBigInt(gameState.salt)
      );
      await tx.wait();

      const [j1Win, j2Win] = await Promise.all([
        rps.win(gameState.myMove, gameState.opponentMove),
        rps.win(gameState.opponentMove, gameState.myMove),
      ]);

      let winner = null;
      if (j1Win) winner = account.toLowerCase();
      else if (j2Win) {
        const j2 = await rps.j2();
        winner = j2.toLowerCase();
      }

      await updateGameStatus(contractAddr, "revealed", winner);

      setStatus(
        `Revealed! ${j1Win ? "You win!" : j2Win ? "You lose!" : "Tie!"}`
      );
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
      <h2>Reveal Game</h2>

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

      <button onClick={loadGame} className={styles.primaryButton}>
        Load Game
      </button>

      <label className={styles.label}>
        Or upload backup file
        <input type="file" accept=".json" onChange={handleUpload} />
      </label>

      {gameState && (
        <div className={styles.gameInfo}>
          <p>
            <strong>Your Move:</strong> {MOVE_NAMES[gameState.myMove]}
          </p>
          <p>
            <strong>Opponent:</strong>{" "}
            {gameState.hasPlayed
              ? MOVE_NAMES[gameState.opponentMove]
              : "Waiting..."}
          </p>

          {gameState.hasPlayed && (
            <button onClick={handleReveal} className={styles.primaryButton}>
              Reveal Move
            </button>
          )}
        </div>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}

export default GameReveal;

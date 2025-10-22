import { useState } from "react";
import { ethers } from "ethers";
import { getRPSContract, checkTimeout } from "../utils/contracts";
import { loadGameData, clearGameData, uploadGameData } from "../utils/crypto";
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
      setStatus("Loading game...");
      const rps = getRPSContract(contractAddr, signer);
      const [j1, c2, stake, isTimeout] = await Promise.all([
        rps.j1(),
        rps.c2(),
        rps.stake(),
        checkTimeout(rps),
      ]);

      if (account.toLowerCase() !== j1.toLowerCase()) {
        setStatus("You are not Player 1");
        return;
      }

      const savedData = loadGameData(contractAddr);
      if (!savedData) {
        setStatus("No saved data. Upload backup file.");
        return;
      }

      setGameState({
        myMove: savedData.move,
        opponentMove: Number(c2),
        salt: savedData.salt,
        stake: ethers.formatEther(stake),
        canTimeout: isTimeout && Number(c2) === 0,
        hasPlayed: Number(c2) !== 0,
      });
      setStatus("Ready to reveal");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleReveal() {
    try {
      setStatus("Revealing move...");
      const rps = getRPSContract(contractAddr, signer);

      const [j1Addr, j2Addr, c2Move] = await Promise.all([
        rps.j1(),
        rps.j2(),
        rps.c2(),
      ]);

      console.log("=== PLAYER INFO ===");
      console.log("j1 (creator):", j1Addr);
      console.log("j2 (opponent):", j2Addr);
      console.log("Your address:", account);
      console.log("j1 match:", j1Addr.toLowerCase() === account.toLowerCase());

      console.log("\n=== MOVES ===");
      console.log(
        "Your move (j1):",
        gameState.myMove,
        MOVE_NAMES[gameState.myMove]
      );
      console.log(
        "Opponent move (j2):",
        Number(c2Move),
        MOVE_NAMES[Number(c2Move)]
      );

      // Test who should win
      const shouldJ1Win = await rps.win(gameState.myMove, c2Move);
      const shouldJ2Win = await rps.win(c2Move, gameState.myMove);

      console.log("\n=== WIN LOGIC ===");
      console.log("j1 wins?", shouldJ1Win);
      console.log("j2 wins?", shouldJ2Win);
      console.log("Tie?", !shouldJ1Win && !shouldJ2Win);

      const saltUint = ethers.toBigInt(gameState.salt);
      const tx = await rps.solve(gameState.myMove, saltUint);
      await tx.wait();

      // After solve, try to get transaction logs
      console.log("\n=== TRANSACTION ===");
      console.log("Transaction hash:", tx.hash);

      clearGameData(contractAddr);
      setStatus("Reveal successful!");
    } catch (err) {
      console.error("Full error:", err);
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleTimeout() {
    try {
      setStatus("Claiming timeout...");
      const rps = getRPSContract(contractAddr, signer);
      const tx = await rps.j2Timeout();
      await tx.wait();
      clearGameData(contractAddr);
      setStatus("Timeout claimed!");
      setTimeout(() => onBack(), 2000);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadGameData(file);
      setStatus("Backup restored. Load game now.");
    } catch (err) {
      setStatus(`Upload failed: ${err.message}`);
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
      <h2>Reveal & Solve</h2>

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

      <label className={styles.label}>
        Upload Backup (optional)
        <input type="file" accept=".json" onChange={handleUpload} />
      </label>

      <button onClick={loadGame} className={styles.secondaryButton}>
        Load Game
      </button>

      {gameState && (
        <div className={styles.infoBox}>
          <p>
            <b>Your Move:</b> {MOVE_NAMES[gameState.myMove]}
          </p>
          <p>
            <b>Opponent:</b>{" "}
            {gameState.hasPlayed
              ? MOVE_NAMES[gameState.opponentMove]
              : "Not played"}
          </p>
          <p>
            <b>Stake:</b> {gameState.stake} ETH
          </p>

          {gameState.hasPlayed ? (
            <button onClick={handleReveal} className={styles.primaryButton}>
              Reveal & Solve
            </button>
          ) : (
            <>
              <p>Waiting for Player 2...</p>
              {gameState.canTimeout && (
                <button
                  onClick={handleTimeout}
                  className={styles.primaryButton}
                >
                  Claim Timeout
                </button>
              )}
            </>
          )}
        </div>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}

export default GameReveal;

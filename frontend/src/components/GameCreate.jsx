import { useState } from "react";
import { ethers } from "ethers";
import MoveSelect from "./MoveSelect";
import { getHasherContract, deployRPSContract } from "../utils/contracts";
import {
  generateSecureSalt,
  saveGameData,
  downloadGameData,
} from "../utils/crypto";
import styles from "./Game.module.css";

function GameCreate({ signer, account, onBack }) {
  const [opponent, setOpponent] = useState("");
  const [stake, setStake] = useState("0.01");
  const [move, setMove] = useState(null);
  const [status, setStatus] = useState("");
  const [gameData, setGameData] = useState(null);

  async function handleCreate() {
    if (!ethers.isAddress(opponent)) {
      setStatus("Invalid opponent address");
      return;
    }
    if (!move) {
      setStatus("Select a move");
      return;
    }
    try {
      setStatus("Generating salt...");
      const salt = generateSecureSalt();

      setStatus("Getting Hasher contract...");
      const hasher = await getHasherContract(signer);

      setStatus("Computing commitment...");
      const commitment = await hasher.hash(move, salt);

      const data = {
        commitment,
        opponent,
        stake,
        move,
        salt,
        creator: account,
      };

      saveGameData("pending", move, salt);
      downloadGameData(data);
      setGameData(data);
      setStatus("Ready to deploy");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleDeploy() {
    if (!gameData) {
      setStatus("Generate commitment first");
      return;
    }
    try {
      setStatus("Deploying RPS contract...");
      // Pass only commitment and opponent address, stake goes in value
      const contractAddr = await deployRPSContract(
        signer,
        gameData.commitment,
        gameData.opponent,
        gameData.stake
      );

      saveGameData(contractAddr, gameData.move, gameData.salt);
      setStatus(`Deployed: ${contractAddr}`);
      alert(`Game created!\nContract: ${contractAddr}\nShare with opponent`);
      setTimeout(() => onBack(), 2000);
    } catch (err) {
      console.error(err);
      setStatus(`Deploy failed: ${err.message}`);
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
      <h2>Create Game</h2>

      <label className={styles.label}>
        Opponent Address
        <input
          type="text"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="0x..."
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        Stake (ETH)
        <input
          type="text"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className={styles.input}
        />
      </label>

      <MoveSelect selected={move} onSelect={setMove} />

      <button
        onClick={handleCreate}
        disabled={!move || !opponent || !stake}
        className={styles.primaryButton}
      >
        Generate Commitment
      </button>

      {gameData && (
        <button onClick={handleDeploy} className={styles.primaryButton}>
          Deploy Contract
        </button>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}

export default GameCreate;

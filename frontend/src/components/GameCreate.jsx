import { useState } from "react";
import { ethers } from "ethers";
import MoveSelect from "./MoveSelect";
import { getHasherContract, deployRPSContract } from "../utils/contracts";
import {
  generateSecureSalt,
  encryptWithSignature,
  downloadGameData,
} from "../utils/crypto";
import { saveGameToServer } from "../utils/api";
import styles from "./Game.module.css";

function GameCreate({ signer, account, onBack }) {
  const [opponent, setOpponent] = useState("");
  const [stake, setStake] = useState("0.01");
  const [move, setMove] = useState(null);
  const [status, setStatus] = useState("");
  const [gameData, setGameData] = useState(null);
  const [deployedContract, setDeployedContract] = useState(null);

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

      setStatus("Getting Hasher...");
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

      setGameData(data);
      setStatus("Ready to deploy");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleDeploy() {
    if (!gameData) return;

    try {
      setStatus("Deploying contract...");
      const contractAddr = await deployRPSContract(
        signer,
        gameData.commitment,
        gameData.opponent,
        gameData.stake
      );

      setStatus("Encrypting data...");
      const encrypted = await encryptWithSignature(signer, {
        move: gameData.move,
        salt: gameData.salt,
      });

      setStatus("Saving to server...");
      await saveGameToServer(
        contractAddr,
        account.toLowerCase(),
        gameData.opponent.toLowerCase(),
        JSON.stringify(encrypted),
        gameData.stake
      );

      setDeployedContract(contractAddr);
      setStatus("Deployed, Data encrypted & saved.");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  function handleDownloadBackup() {
    if (!deployedContract || !gameData) return;

    const backupData = {
      ...gameData,
      contractAddress: deployedContract,
      timestamp: Date.now(),
    };

    downloadGameData(backupData);
    setStatus("Backup downloaded!");
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

      {gameData && !deployedContract && (
        <button onClick={handleDeploy} className={styles.primaryButton}>
          Deploy Contract
        </button>
      )}

      {deployedContract && (
        <div className={styles.contractInfo}>
          <h3>Contract Deployed</h3>
          <input
            type="text"
            value={deployedContract}
            readOnly
            className={styles.input}
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={() => navigator.clipboard.writeText(deployedContract)}
            className={styles.secondaryButton}
          >
            Copy Address
          </button>

          <button
            onClick={handleDownloadBackup}
            className={styles.secondaryButton}
          >
            Download Backup (Optional)
          </button>

          <p className={styles.hint}>
            <small>
              Your data is saved on the server, but you can download a backup
              file as a safety net in case of server issues.
            </small>
          </p>
        </div>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}

export default GameCreate;

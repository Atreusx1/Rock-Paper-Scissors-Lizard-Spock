import { useState } from "react";
import { ethers } from "ethers";
import { claimTimeout } from "../utils/contracts";
import { updateGameStatus } from "../utils/api";
import styles from "./Game.module.css";

function GameTimeout({ signer, account, onBack }) {
  const [contractAddr, setContractAddr] = useState("");
  const [status, setStatus] = useState("");

  async function handleClaimTimeout() {
    if (!ethers.isAddress(contractAddr)) {
      setStatus("Invalid address");
      return;
    }

    try {
      setStatus("Checking game...");
      const result = await claimTimeout(contractAddr, signer, account);

      await updateGameStatus(contractAddr, "timeout", result.winner);
      setStatus(`Timeout claimed! ${result.message}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
      <h2>Claim Timeout</h2>

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

      <button onClick={handleClaimTimeout} className={styles.primaryButton}>
        Claim Timeout
      </button>

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}

export default GameTimeout;

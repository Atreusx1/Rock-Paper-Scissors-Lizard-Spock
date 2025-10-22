import { useState } from "react";
import { connectWallet } from "../utils/contracts";
import styles from "./Connect.module.css";

function Connect({ onConnected }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleConnect() {
    setIsLoading(true);
    setError("");

    try {
      // Use the utility function that already has network checking built-in
      const { signer, account } = await connectWallet();
      // Pass the successful result up to the parent
      onConnected({ signer, account });
    } catch (err) {
      console.error(err);
      // Keep the error local to this component
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1>Rock Paper Scissors Lizard Spock</h1>
      <p>Connect your wallet to start playing</p>

      <button
        onClick={handleConnect}
        className={styles.connectButton}
        disabled={isLoading}
      >
        {isLoading ? "Connecting..." : "Connect MetaMask"}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.info}>
        <p>Ensure your wallet is connected to the correct Ethereum testnet.</p>
      </div>
    </div>
  );
}

export default Connect;

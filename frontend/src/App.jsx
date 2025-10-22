import { useState, useEffect } from "react";
import { connectWallet } from "./utils/contracts";
import Connect from "./Wallet/Connect";
import GameCreate from "./components/GameCreate";
import GamePlay from "./components/GamePlay";
import GameReveal from "./components/GameReveal";
import styles from "./App.module.css";

function App() {
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [view, setView] = useState("menu");

  useEffect(() => {
    checkStillConnected();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  async function checkStillConnected() {
    if (window.ethereum && window.ethereum.selectedAddress) {
      try {
        // Quietly try to reconnect without prompting the user if possible
        const { signer, account } = await connectWallet();
        setSigner(signer);
        setAccount(account);
      } catch (err) {
        // Ignore silent Reconnection errors, let the user click connect manually
        console.warn("Silent reconnect failed:", err.message);
      }
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
      setView("menu");
    } else if (account !== accounts[0]) {
      // If account changed, force a reconnect to get new signer
      checkStillConnected();
    }
  }

  // Callback for when Connect.jsx succeeds
  function handleConnectionSuccess({ signer, account }) {
    setSigner(signer);
    setAccount(account);
    setView("menu");
  }

  if (!account) {
    return <Connect onConnected={handleConnectionSuccess} />;
  }

  return (
    <div className={styles.container}>
      {view === "menu" && (
        <div className={styles.menu}>
          <h1>RPSLS</h1>
          <p className={styles.account} title={account}>
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>

          <button onClick={() => setView("create")}>Create Game</button>
          <button onClick={() => setView("play")}>Join Game</button>
          <button onClick={() => setView("reveal")}>Reveal Move</button>
        </div>
      )}

      {view === "create" && (
        <GameCreate
          signer={signer}
          account={account}
          onBack={() => setView("menu")}
        />
      )}

      {view === "play" && (
        <GamePlay
          signer={signer}
          account={account}
          onBack={() => setView("menu")}
        />
      )}

      {view === "reveal" && (
        <GameReveal
          signer={signer}
          account={account}
          onBack={() => setView("menu")}
        />
      )}
    </div>
  );
}

export default App;

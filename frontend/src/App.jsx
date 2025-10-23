import { useState, useEffect } from "react";
import { connectWallet } from "./utils/contracts";
import Connect from "./Wallet/Connect";
import GameCreate from "./components/GameCreate";
import GamePlay from "./components/GamePlay";
import GameReveal from "./components/GameReveal";
import GameTimeout from "./components/GameTimeout";
import GameHistory from "./components/GameHistory";
import Instructions from "./components/Instructions";
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
        const { signer, account } = await connectWallet();
        setSigner(signer);
        setAccount(account);
      } catch (err) {
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
      checkStillConnected();
    }
  }

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
          <h1>Rock Paper Scissors Lizard Spock</h1>
          <h4>Web3 Game with Staking</h4>
          <p className={styles.account} title={account}>
            Connected as {account.slice(0, 6)}...{account.slice(-4)}
          </p>

          <button onClick={() => setView("create")}>Create Game</button>
          <button onClick={() => setView("play")}>Join Game</button>
          <button onClick={() => setView("reveal")}>Reveal Move</button>
          <button onClick={() => setView("timeout")}>Claim Timeout</button>
          <button onClick={() => setView("history")}>Game History</button>
          <button onClick={() => setView("instructions")}>Instructions</button>
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

      {view === "timeout" && (
        <GameTimeout
          signer={signer}
          account={account}
          onBack={() => setView("menu")}
        />
      )}

      {view === "history" && (
        <GameHistory account={account} onBack={() => setView("menu")} />
      )}

      {view === "instructions" && (
        <Instructions onBack={() => setView("menu")} />
      )}
    </div>
  );
}

export default App;

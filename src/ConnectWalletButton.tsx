// src/ConnectWalletButton.tsx
import React, { useContext } from "react";
import { WalletContext } from "./context/WalletContext";

const ConnectWalletButton: React.FC = () => {
  const walletContext = useContext(WalletContext);

  if (!walletContext) {
    return null;
  }

  const { publicKey, connectWallet, disconnectWallet } = walletContext;

  const toggleWallet = () => {
    if (publicKey) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <button onClick={toggleWallet}>
      {publicKey
        ? ` ${publicKey.toBase58().slice(0, 4)}...${publicKey
            .toBase58()
            .slice(-4)}`
        : "Connect Phantom Wallet"}
    </button>
  );
};

export default ConnectWalletButton;

/*
import React, { useContext } from "react";
import { WalletContext } from "./context/WalletContext";

const ConnectWalletButton: React.FC = () => {
  const walletContext = useContext(WalletContext);

  if (!walletContext) {
    return null;
  }

  const { publicKey, connectWallet, disconnectWallet } = walletContext;

  return (
    <div>
      {publicKey ? (
        <div>
          <p>Connected: {publicKey.toBase58()}</p>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Phantom Wallet</button>
      )}
    </div>
  );
};

export default ConnectWalletButton;

*/

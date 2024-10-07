// src/context/WalletContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";

interface WalletContextType {
  publicKey: PublicKey | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  const connectWallet = async () => {
    try {
      // @ts-ignore
      const { solana } = window;

      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        setPublicKey(new PublicKey(response.publicKey.toString()));
      } else {
        alert("Phantom Wallet is not installed. Please install it to connect.");
        window.open("https://phantom.app/", "_blank");
      }
    } catch (error) {
      console.error("Failed to connect to Phantom Wallet", error);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
  };

  useEffect(() => {
    // Auto-connect if Phantom is already connected
    // @ts-ignore
    const { solana } = window;
    if (solana && solana.isPhantom) {
      solana
        .connect({ onlyIfTrusted: true })
        .then(({ publicKey }: { publicKey: PublicKey }) => {
          setPublicKey(new PublicKey(publicKey.toString()));
        })
        .catch(() => {});
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ publicKey, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};

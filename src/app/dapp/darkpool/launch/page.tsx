"use client";
import { useState, useEffect } from "react";
import Nav from "@/components/theme/Nav";
import DAppNav from "@/components/swap_face/DAppNav";
import DarkPoolInterface from "@/components/darkpool/DarkPoolInterface";
import { WalletInfo, walletManager } from "@/lib/walletManager";
// import styles from "../../hero.module.css";
import "@/components/swap_face/SwapInterface.css";

export default function DarkPoolPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(
    null,
  );
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  const handleWalletConnected = (wallet: WalletInfo) => {
    console.log("Wallet connected:", wallet);
    setWalletConnected(true);
    setConnectedWallet(wallet);
    localStorage.setItem("siphon-connected-wallet", JSON.stringify(wallet));
  };

  const handleDisconnect = () => {
    if (connectedWallet) {
      walletManager.disconnectWallet(connectedWallet.id);
    }
    setWalletConnected(false);
    setConnectedWallet(null);
    localStorage.removeItem("siphon-connected-wallet");
  };

  useEffect(() => {
    // Check for actual wallet connection, not just localStorage
    const checkWalletConnection = async () => {
      try {
        // Check if wallet is actually connected in the browser
        if (typeof window !== "undefined") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const solana = (window as any).solana;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const solflare = (window as any).solflare;

          // Check Phantom or Solflare
          const provider = solflare?.isSolflare ? solflare : solana;

          if (provider && provider.isConnected && provider.publicKey) {
            // Wallet is actually connected
            const persistedWallet = localStorage.getItem(
              "siphon-connected-wallet",
            );
            if (persistedWallet) {
              try {
                const wallet = JSON.parse(persistedWallet);
                // Verify the address matches
                if (wallet.address === provider.publicKey.toString()) {
                  console.log("Restored wallet connection:", wallet);
                  setConnectedWallet(wallet);
                  setWalletConnected(true);
                } else {
                  // Address mismatch, clear storage
                  console.log("Wallet address mismatch, clearing storage");
                  localStorage.removeItem("siphon-connected-wallet");
                }
              } catch (error) {
                console.error("Failed to parse persisted wallet:", error);
                localStorage.removeItem("siphon-connected-wallet");
              }
            }
          } else {
            // No active wallet connection, clear any stale data
            console.log("No active wallet connection detected");
            localStorage.removeItem("siphon-connected-wallet");
            setConnectedWallet(null);
            setWalletConnected(false);
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        localStorage.removeItem("siphon-connected-wallet");
      } finally {
        setIsCheckingWallet(false);
      }
    };

    checkWalletConnection();
  }, []);
  // Show loading while checking wallet connection
  const walletAddress =
    walletConnected && connectedWallet ? connectedWallet.address : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        position: "relative",
      }}
    >
      {/* <Nav /> */}
      <DAppNav onWalletConnected={handleWalletConnected} />

      {/* Blurred content */}
      <div
        style={{
          filter: "none",
          pointerEvents: "auto",
          width: "100%",
          height: "100%",
          opacity: 1,
          transition: "opacity 0.4s ease-in, filter 0.4s ease-in",

          animation: undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCheckingWallet ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-source-code), monospace",
              }}
            >
              <div
                style={{
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  borderTop: "2px solid rgba(255, 255, 255, 0.6)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p
                style={{
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Checking wallet connection...
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              paddingTop: "40px",
            }}
          >
            <DarkPoolInterface
              walletAddress={walletAddress}
              walletName={connectedWallet?.name}
              onDisconnect={handleDisconnect}
              onWalletConnected={handleWalletConnected}
            />
          </div>
        )}
      </div>
    </div>
  );
}

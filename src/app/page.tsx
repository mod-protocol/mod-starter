"use client";

import { Button } from "@mod-protocol/react-ui-shadcn/dist/components/ui/button";
import { useState } from "react";
import EditorExample from "../components/editor-example";
import { CastFeed } from "../components/feed";
import {
  ConnectButton,
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import { arbitrum, base, optimism, polygon, zora } from "viem/chains";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import "@rainbow-me/rainbowkit/styles.css";
import { useFarcasterIdentity } from "../hooks/use-farcaster-connect";
import QRCode from "qrcode.react";

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, zora],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Mod Example App",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,

  connectors: connectors,
  publicClient,
});

export default function Home() {
  const [feedFid, setFeedFid] = useState<string | null>("3");

  const [feedInput, setFeedInput] = useState("");

  const { farcasterUser, loading, handleSignIn, logout } =
    useFarcasterIdentity();

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          borderRadius: "small",
          accentColor: "#f8fafc",
          accentColorForeground: "#0f172a",
        })}
      >
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="py-3 mb-4 border-b-2 min-w-[600px] px-3">
            <div className="flex flex-row">
              <div className="flex flex-row gap-8 my-auto">
                <h1 className="text-2xl text-accent-foreground">Mod starter</h1>
              </div>

              <div className="ml-auto flex flex-row gap-4">
                <div>
                  {!farcasterUser?.status && (
                    <button
                      className="rounded bg-purple-200 p-2 px-4 text-purple-500"
                      style={{
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                      onClick={handleSignIn}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Sign in with farcaster"}
                    </button>
                  )}
                  {farcasterUser?.status === "approved" && (
                    <button
                      className="rounded p-2 px-4 text-red-400"
                      onClick={() => logout()}
                    >
                      Clear Farcaster signer
                    </button>
                  )}
                  {farcasterUser?.status === "pending_approval" &&
                    farcasterUser?.signer_approval_url && (
                      <div className="signer-approval-container mr-4">
                        Scan with your camera app
                        <QRCode
                          value={farcasterUser.signer_approval_url}
                          size={64}
                        />
                        <div className="or-divider">OR</div>
                        <a
                          href={farcasterUser.signer_approval_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          open url
                        </a>
                      </div>
                    )}
                </div>
                <ConnectButton />
              </div>
            </div>
          </div>
          <div className="max-w-lg space-y-6 min-w-[600px]">
            <EditorExample />
            <form
              action="#"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFeedFid(feedInput);
              }}
              className="flex h-full w-full space-x-2 justify-start"
            >
              <input
                className="border rounded-sm pl-2"
                placeholder="Enter a user FID"
                type="text"
                onChange={(e) => setFeedInput(e.target.value)}
              />
              <Button variant="outline" type="submit" className="h-full">
                Load feed
              </Button>
            </form>
            {feedFid && <CastFeed fid={feedFid} />}
          </div>
        </main>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

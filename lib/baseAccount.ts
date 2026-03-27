// Baxela Identity System
// - Anonymous: every visitor gets a session ID automatically (no action needed)
// - Signed in: user authenticates via Coinbase Smart Wallet (passkey/biometrics — no seed phrase)
//   Their real wallet address is then used for persistent identity across devices.

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export const PLATFORM_ACCOUNT = {
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e' as `0x${string}`,
  chainId: 8453,
};

export const BASE_ACCOUNT_CONFIG = {
  name: 'Base Account',
  network: 'Base',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
};

// Generate or retrieve a unique anonymous session ID per browser.
function getOrCreateSessionId(): `0x${string}` {
  if (typeof window === 'undefined') return PLATFORM_ACCOUNT.address;
  const stored = localStorage.getItem('baxela_citizen_id');
  if (stored) return stored as `0x${string}`;
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const id = `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
  localStorage.setItem('baxela_citizen_id', id);
  return id;
}

// Main identity hook.
// If the user has signed in via Coinbase Smart Wallet → use their real address.
// Otherwise → use their anonymous session ID. Either way isConnected = true.
export const useBaseAccount = () => {
  const { address: walletAddress, isConnected: walletConnected } = useAccount();
  const [sessionAddress, setSessionAddress] = useState<`0x${string}`>(PLATFORM_ACCOUNT.address);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSessionAddress(getOrCreateSessionId());
    setMounted(true);
  }, []);

  const address = walletConnected && walletAddress ? walletAddress : sessionAddress;

  return {
    address,
    isConnected: true,          // Always true — every visitor is a citizen
    isSignedIn: walletConnected, // true only when they've used Smart Wallet
    chainId: PLATFORM_ACCOUNT.chainId,
    chain: { id: 8453, name: 'Base' },
    connector: { name: walletConnected ? 'Coinbase Smart Wallet' : 'Baxela Citizen' },
    mounted,
  };
};

// Short display version e.g. "0x1a2b...3c4d"
export const formatCitizenId = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

// Payment utilities
export const formatPaymentAmount = (amount: string | number): string =>
  typeof amount === 'string' ? amount : amount.toString();

export const validatePaymentAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const generateTransactionId = (): string =>
  `baxela_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const simulateTransaction = async (amount: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const txHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  return txHash;
};

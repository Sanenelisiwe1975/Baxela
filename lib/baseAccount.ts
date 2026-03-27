// Baxela Identity System
// Users get a unique anonymous session identity automatically — no wallet needed.
// The blockchain layer runs in the background using the platform's server-side account.

import { useState, useEffect } from 'react';

export const PLATFORM_ACCOUNT = {
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e' as `0x${string}`,
  chainId: 8453, // Base mainnet
};

export const BASE_ACCOUNT_CONFIG = {
  name: 'Base Account',
  description: 'Platform Base blockchain account for Baxela',
  network: 'Base',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
};

// Generate or retrieve a unique anonymous session ID per browser.
// Stored in localStorage so it persists across page refreshes.
function getOrCreateSessionId(): `0x${string}` {
  if (typeof window === 'undefined') return PLATFORM_ACCOUNT.address;

  const stored = localStorage.getItem('baxela_citizen_id');
  if (stored) return stored as `0x${string}`;

  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const id = `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
  localStorage.setItem('baxela_citizen_id', id);
  return id;
}

// Main identity hook — returns a stable per-user ID with no wallet required.
export const useBaseAccount = () => {
  const [address, setAddress] = useState<`0x${string}`>(PLATFORM_ACCOUNT.address);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAddress(getOrCreateSessionId());
    setMounted(true);
  }, []);

  return {
    address,
    isConnected: true,   // Always true — every visitor is a citizen
    chainId: PLATFORM_ACCOUNT.chainId,
    chain: { id: 8453, name: 'Base' },
    connector: { name: 'Baxela Citizen' },
    mounted,             // Use this to avoid SSR hydration mismatches
  };
};

// Short display version of the citizen ID, e.g. "0x1a2b...3c4d"
export const formatCitizenId = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

// Payment utilities
export const formatPaymentAmount = (amount: string | number): string =>
  typeof amount === 'string' ? amount : amount.toString();

export const validatePaymentAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

// Transaction utilities
export const generateTransactionId = (): string =>
  `baxela_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const simulateTransaction = async (amount: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const txHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  return txHash;
};

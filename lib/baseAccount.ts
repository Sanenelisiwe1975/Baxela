// Base Account Configuration
// This provides a default account for the application without requiring wallet connection

export const DEFAULT_BASE_ACCOUNT = {
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e' as `0x${string}`,
  isConnected: true,
  chainId: 8453, // Base mainnet
  balance: '0', // Will be updated dynamically if needed
};

export const BASE_ACCOUNT_CONFIG = {
  name: 'Base Account',
  description: 'Default Base blockchain account for Baxela platform',
  network: 'Base',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
};

// Mock account functions for compatibility with existing code
export const useBaseAccount = () => {
  return {
    address: DEFAULT_BASE_ACCOUNT.address,
    isConnected: DEFAULT_BASE_ACCOUNT.isConnected,
    chainId: DEFAULT_BASE_ACCOUNT.chainId,
    chain: { id: 8453, name: 'Base' },
    connector: { name: 'Base Account' },
  };
};

// Payment utilities
export const formatPaymentAmount = (amount: string | number): string => {
  return typeof amount === 'string' ? amount : amount.toString();
};

export const validatePaymentAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

// Transaction utilities
export const generateTransactionId = (): string => {
  return `base_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const simulateTransaction = async (amount: string): Promise<string> => {
  // Simulate transaction processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a mock transaction hash
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  return txHash;
};
"use client";

import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { toast } from 'react-hot-toast';
import { formatCitizenId } from '@/lib/baseAccount';

export default function SmartWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleSignIn = () => {
    connect(
      {
        connector: coinbaseWallet({
          appName: 'Baxela',
          preference: 'smartWalletOnly',
        }),
      },
      {
        onError: (err) => {
          // User cancelled — not an error worth toasting
          if (err.message?.toLowerCase().includes('user rejected')) return;
          toast.error('Sign in failed. Please try again.');
        },
        onSuccess: () => {
          toast.success('Signed in! Your identity is now linked across devices.');
        },
      }
    );
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          🛡️ {formatCitizenId(address)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isPending}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </div>
  );
}

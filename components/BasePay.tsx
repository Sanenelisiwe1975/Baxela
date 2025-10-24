"use client";

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains';

interface BasePayProps {
  amount: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

// Simple payment contract ABI for ETH transfers
const PAYMENT_ABI = [
  {
    inputs: [],
    name: 'pay',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Demo payment contract address (you would replace with actual contract)
const PAYMENT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

export default function BasePay({ 
  amount, 
  onSuccess, 
  onError, 
  disabled = false,
  className = ""
}: BasePayProps) {
  const { isConnected, address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { writeContract, data: hash, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle successful transaction
  if (isConfirmed && hash && !isProcessing) {
    setIsProcessing(true);
    onSuccess(hash);
  }

  // Handle transaction error
  if (error && !isProcessing) {
    setIsProcessing(true);
    onError(error);
  }

  const handlePayment = async () => {
    if (!isConnected || !address) {
      onError(new Error('Please connect your wallet first'));
      return;
    }

    try {
      setIsProcessing(true);
      
      // For demo purposes, we'll simulate a payment
      // In a real implementation, you would call your payment contract
      await writeContract({
        address: PAYMENT_CONTRACT_ADDRESS,
        abi: PAYMENT_ABI,
        functionName: 'pay',
        value: parseEther(amount),
        chainId: base.id,
      });
      
    } catch (err) {
      setIsProcessing(false);
      onError(err as Error);
    }
  };

  const isLoading = isProcessing || isConfirming;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Payment Amount</span>
          <span className="text-lg font-bold text-blue-900">{amount} ETH</span>
        </div>
        <div className="text-xs text-blue-700">
          Payment will be processed on Base network
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={disabled || isLoading || !isConnected}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
          text-white shadow-lg hover:shadow-xl
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>
              {isConfirming ? 'Confirming Payment...' : 'Processing Payment...'}
            </span>
          </div>
        ) : (
          `Pay ${amount} ETH on Base`
        )}
      </button>

      {!isConnected && (
        <p className="text-sm text-red-600 text-center">
          Please connect your wallet to make a payment
        </p>
      )}

      <div className="text-xs text-gray-500 text-center">
        <p>Secure payment powered by Base blockchain</p>
        <p>Transaction fees apply</p>
      </div>
    </div>
  );
}
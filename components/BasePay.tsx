"use client";

import { useState } from 'react';
import { useBaseAccount, simulateTransaction, validatePaymentAmount } from '@/lib/baseAccount';

interface BasePayProps {
  amount: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

export default function BasePay({ 
  amount, 
  onSuccess, 
  onError, 
  disabled = false,
  className = ""
}: BasePayProps) {
  const { address, isConnected } = useBaseAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!validatePaymentAmount(amount)) {
      onError(new Error('Invalid payment amount'));
      return;
    }

    try {
      setIsProcessing(true);
      
      // Simulate payment processing on Base network
      const transactionHash = await simulateTransaction(amount);
      
      // Simulate successful payment
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(transactionHash);
      }, 1000);
      
    } catch (err) {
      setIsProcessing(false);
      onError(err as Error);
    }
  };

  const isLoading = isProcessing;

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
        disabled={disabled || isLoading}
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
            <span>Processing Payment...</span>
          </div>
        ) : (
          `Pay ${amount} ETH on Base`
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>Secure payment powered by Base blockchain</p>
        <p>Transaction fees apply</p>
      </div>
    </div>
  );
}
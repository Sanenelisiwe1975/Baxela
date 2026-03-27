'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

// Coinbase Smart Wallet — passkey/biometric sign-in, no seed phrase required.
// Setting preference to 'smartWalletOnly' hides the "use extension" option
// so users only see the simple passkey flow.
const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'Baxela',
      appLogoUrl: 'https://baxela.app/logo.png',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              {children}
            </div>
            <Toaster position="top-right" />
          </WagmiProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

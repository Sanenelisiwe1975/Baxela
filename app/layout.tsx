'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

// Configure wagmi with Base chains only (no wallet connectors needed)
const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [], // No connectors - using default base account
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
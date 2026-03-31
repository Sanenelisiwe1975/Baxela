"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBaseAccount, formatCitizenId } from '@/lib/baseAccount';
import SmartWalletButton from '@/components/SmartWalletButton';

export default function Navigation() {
  const pathname = usePathname();
  const { address, mounted, isSignedIn } = useBaseAccount();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/incidents', label: 'Incidents', icon: '🚨' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/voting', label: 'Polls & Voting', icon: '🗳️' },
    { href: '/candidates', label: 'Candidates', icon: '👥' },
    { href: '/register', label: 'Voter Register', icon: '📝' },
    { href: '/admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Baxela</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Identity / Sign-in */}
          <div className="flex items-center gap-3">
            {mounted ? (
              <>
                {/* If not signed in, show anonymous badge + sign-in prompt */}
                {!isSignedIn && (
                  <span className="hidden sm:block px-2 py-1 rounded-full text-xs text-gray-400 border border-gray-200">
                    🏛️ {formatCitizenId(address)}
                  </span>
                )}
                <SmartWalletButton />
              </>
            ) : (
              <div className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-400">
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

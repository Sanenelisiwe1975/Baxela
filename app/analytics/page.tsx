"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import type { Connector } from 'wagmi';
// BasePay component not found – commented out to fix build
// import BasePay from '@/components/BasePay';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalIncidents: number;
    totalReports: number;
    averageSeverity: number;
    mostCommonCategory: string;
    trendsLastMonth: number;
  };
  regional: {
    [region: string]: {
      incidentCount: number;
      severityBreakdown: { [severity: string]: number };
      categoryBreakdown: { [category: string]: number };
      timeSeriesData: Array<{ date: string; count: number }>;
    };
  };
  insights: {
    hotspots: Array<{
      location: string;
      coordinates: [number, number];
      incidentCount: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }>;
    patterns: Array<{
      pattern: string;
      description: string;
      confidence: number;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  };
}

interface PremiumAccess {
  expiresAt?: number;
  daysRemaining?: number;
}

function WalletConnectSection() {
  const { connectors, connect, error, status } = useConnect();
  const isPending = status === 'pending';
  
  const coinbaseConnector = connectors.find((connector: Connector) => connector.name === 'Coinbase Wallet');
  
  return (
    <div className="space-y-2">
      {coinbaseConnector && (
        <button
          onClick={() => connect({ connector: coinbaseConnector })}
          disabled={isPending}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Connect Base Account
          {isPending ? ' (connecting...)' : ''}
        </button>
      )}
      {error && (
        <p className="text-sm text-red-600">{error?.message ?? String(error)}</p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { isConnected, address } = useAccount();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [premiumAccess, setPremiumAccess] = useState<PremiumAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Check premium access when connected
  useEffect(() => {
    if (isConnected && address) {
      checkPremiumAccess();
    }
  }, [isConnected, address]);

  const checkPremiumAccess = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/premium?address=${address}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
        setPremiumAccess(data.premiumAccess);
        setHasAccess(true);
      } else {
        const error = await response.json();
        if (error.premiumRequired) {
          setHasAccess(false);
        }
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      toast.error('Failed to check premium access');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setPaymentLoading(true);
    
    try {
      // Record the payment
      const response = await fetch('/api/analytics/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          transactionId
        })
      });

      if (response.ok) {
        toast.success('Payment successful! Premium access unlocked for 30 days');
        await checkPremiumAccess(); // Refresh access status
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Base Pay error:', error);
    toast.error('Payment failed. Please try again.');
    setPaymentLoading(false);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Premium Analytics</h1>
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Connect your Base Account to access premium analytics and insights.
                </p>
                <WalletConnectSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Premium Analytics</h1>
            
            {/* Preview Section */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8 relative">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-xl font-bold mb-2">Premium Content Locked</h3>
                    <p className="text-gray-300 mb-6">Unlock detailed analytics and insights for just $5 USDC</p>
                    {/* BasePay component not found – commented out to fix build */}
                    {/* <BasePay
                      amount="5"
                      currency="USDC"
                      description="Unlock premium analytics for 30 days"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={paymentLoading}
                    /> */}
                  </div>
                </div>
                
                {/* Blurred Preview */}
                <div className="filter blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-2">Total Incidents</h3>
                      <p className="text-3xl font-bold text-blue-900">1,247</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-green-600 mb-2">Total Reports</h3>
                      <p className="text-3xl font-bold text-green-900">3,891</p>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-yellow-600 mb-2">Avg Severity</h3>
                      <p className="text-3xl font-bold text-yellow-900">2.3</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-purple-600 mb-2">Trend</h3>
                      <p className="text-3xl font-bold text-purple-900">+12.5%</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Regional Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>North District</span>
                          <span className="font-semibold">342</span>
                        </div>
                        <div className="flex justify-between">
                          <span>East District</span>
                          <span className="font-semibold">387</span>
                        </div>
                        <div className="flex justify-between">
                          <span>South District</span>
                          <span className="font-semibold">298</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Risk Hotspots</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Downtown Intersection</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Critical</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Highway 101</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">High</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Central Park</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Medium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">Regional Analytics</h3>
                    <p className="text-gray-600">Detailed breakdowns by area and district</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">Risk Hotspots</h3>
                    <p className="text-gray-600">Identify high-risk locations and patterns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">Trend Analysis</h3>
                    <p className="text-gray-600">Time-series data and pattern recognition</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">AI Insights</h3>
                    <p className="text-gray-600">Smart recommendations and predictions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Analytics Dashboard</h1>
          {premiumAccess && (
            <p className="text-green-600">
              Premium access active • {premiumAccess.daysRemaining} days remaining
            </p>
          )}
        </div>

        {analyticsData && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-sm font-medium text-blue-600 mb-2">Total Incidents</h3>
                <p className="text-3xl font-bold text-blue-900">{analyticsData.overview.totalIncidents.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-sm font-medium text-green-600 mb-2">Total Reports</h3>
                <p className="text-3xl font-bold text-green-900">{analyticsData.overview.totalReports.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-sm font-medium text-yellow-600 mb-2">Avg Severity</h3>
                <p className="text-3xl font-bold text-yellow-900">{analyticsData.overview.averageSeverity}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-sm font-medium text-purple-600 mb-2">Top Category</h3>
                <p className="text-lg font-bold text-purple-900">{analyticsData.overview.mostCommonCategory}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-sm font-medium text-red-600 mb-2">Monthly Trend</h3>
                <p className="text-3xl font-bold text-red-900">+{analyticsData.overview.trendsLastMonth}%</p>
              </div>
            </div>

            {/* Regional Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Regional Breakdown</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(analyticsData.regional).map(([region, data]) => (
                  <div key={region} className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">{region}</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Incidents</p>
                        <p className="text-2xl font-bold">{data.incidentCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Severity Breakdown</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(data.severityBreakdown).map(([severity, count]) => (
                            <div key={severity} className="flex justify-between">
                              <span>{severity}:</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Category Breakdown</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(data.categoryBreakdown).map(([category, count]) => (
                            <div key={category} className="flex justify-between">
                              <span>{category}:</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Hotspots */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Hotspots</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analyticsData.insights.hotspots.map((hotspot, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{hotspot.location}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(hotspot.riskLevel)}`}>
                        {hotspot.riskLevel.charAt(0).toUpperCase() + hotspot.riskLevel.slice(1)}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{hotspot.incidentCount} incidents</p>
                    <p className="text-sm text-gray-600">
                      {hotspot.coordinates[0].toFixed(4)}, {hotspot.coordinates[1].toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Patterns */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Detected Patterns</h2>
                <div className="space-y-6">
                  {analyticsData.insights.patterns.map((pattern, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{pattern.pattern}</h3>
                      <p className="text-gray-600 mt-1">{pattern.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        Confidence: {(pattern.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Recommendations</h2>
                <div className="space-y-6">
                  {analyticsData.insights.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
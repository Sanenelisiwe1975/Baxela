'use client';

import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import type { Connector } from 'wagmi';

interface IncidentReport {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  reporter: string;
  status: 'pending' | 'verified' | 'resolved';
  category: 'voting_irregularity' | 'intimidation' | 'bribery' | 'violence' | 'other';
}

// Custom Wallet Connection Component
function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const coinbaseConnector = connectors.find((connector: Connector) => connector.name === 'Coinbase Wallet');

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {coinbaseConnector && (
        <button
          onClick={() => connect({ connector: coinbaseConnector })}
          disabled={status === 'pending'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {status === 'pending' ? 'Connecting...' : 'Connect Base Account'}
        </button>
      )}
      {error && (
        <div className="text-red-500 text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'voting_irregularity' as IncidentReport['category']
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet to submit a report');
      return;
    }

    const newReport: IncidentReport = {
      id: Date.now().toString(),
      ...formData,
      timestamp: new Date(),
      reporter: address || '',
      status: 'pending'
    };

    setReports([newReport, ...reports]);
    setFormData({
      title: '',
      description: '',
      location: '',
      category: 'voting_irregularity'
    });
    setShowReportForm(false);
    toast.success('Incident report submitted successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Baxela</h1>
          <p className="text-gray-600">Democracy & Election Incident Reporting Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/analytics" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analytics Dashboard
          </Link>
          <WalletConnection />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Transparent Democracy Through Blockchain
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Report election incidents, track transparency, and ensure democratic integrity 
            through decentralized technology.
          </p>
          <button
            onClick={() => setShowReportForm(true)}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Report an Incident
          </button>
        </div>
      </section>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Report Election Incident</h3>
            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as IncidentReport['category']})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="voting_irregularity">Voting Irregularity</option>
                  <option value="intimidation">Voter Intimidation</option>
                  <option value="bribery">Bribery</option>
                  <option value="violence">Violence</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <section className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Reports</h3>
        {reports.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No reports submitted yet. Be the first to report an incident.
          </p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{report.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>📍 {report.location}</span>
                  <span>{report.timestamp.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
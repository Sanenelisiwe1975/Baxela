"use client";

import React, { useState, useEffect } from 'react';
import { useBaseAccount } from '@/lib/baseAccount';
import { toast } from 'react-hot-toast';

interface Election {
  id: string;
  title: string;
  description: string;
  type: 'national' | 'provincial' | 'municipal';
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  positions: string[];
  totalVotes: number;
  eligibleVoters: number;
  createdBy: string;
  createdAt: Date;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  electionId: string;
  verified: boolean;
  voteCount: number;
}

interface AdminStats {
  totalElections: number;
  activeElections: number;
  totalCandidates: number;
  totalVotes: number;
  pendingVerifications: number;
}

// Mock admin addresses - in a real app, this would be managed properly
const ADMIN_ADDRESSES = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901'
];

// Base Account Connection Component
function BaseAccountSection() {
  const { address, isConnected } = useBaseAccount();

  if (!isConnected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Admin Access Required
        </h3>
        <p className="text-red-700 mb-4">
          You need to connect your admin wallet to access the election management dashboard.
        </p>
      </div>
    );
  }

  const isAdmin = ADMIN_ADDRESSES.includes(address.toLowerCase());

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Unauthorized Access
        </h3>
        <p className="text-yellow-700 mb-4">
          Your wallet address is not authorized for admin access.
        </p>
        <p className="text-yellow-600 text-sm">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-green-800">Admin Access Granted</h3>
          <p className="text-green-700 text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <div className="text-green-600 text-2xl">🛡️</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { address, isConnected } = useBaseAccount();
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'elections' | 'candidates' | 'create'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    type: 'municipal' as Election['type'],
    startDate: '',
    endDate: '',
    positions: ['']
  });

  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase());

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load elections
      const electionsResponse = await fetch('/api/elections');
      const electionsData = await electionsResponse.json();
      
      // Load candidates
      const candidatesResponse = await fetch('/api/candidates');
      const candidatesData = await candidatesResponse.json();
      
      if (electionsData.success) {
        setElections(electionsData.elections || []);
      }
      
      if (candidatesData.success) {
        setCandidates(candidatesData.candidates || []);
      }

      // Calculate stats
      const totalElections = electionsData.elections?.length || 0;
      const activeElections = electionsData.elections?.filter((e: Election) => e.status === 'active').length || 0;
      const totalCandidates = candidatesData.candidates?.length || 0;
      const pendingVerifications = candidatesData.candidates?.filter((c: Candidate) => !c.verified).length || 0;
      const totalVotes = electionsData.elections?.reduce((sum: number, e: Election) => sum + e.totalVotes, 0) || 0;

      setStats({
        totalElections,
        activeElections,
        totalCandidates,
        totalVotes,
        pendingVerifications
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Unauthorized');
      return;
    }

    try {
      const electionData = {
        ...newElection,
        positions: newElection.positions.filter(p => p.trim() !== ''),
        createdBy: address
      };

      const response = await fetch('/api/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(electionData),
      });

      if (response.ok) {
        toast.success('Election created successfully!');
        setShowCreateForm(false);
        setNewElection({
          title: '',
          description: '',
          type: 'municipal',
          startDate: '',
          endDate: '',
          positions: ['']
        });
        loadDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create election');
      }
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error('Failed to create election');
    }
  };

  const handleVerifyCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/admin/verify-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          adminAddress: address
        }),
      });

      if (response.ok) {
        toast.success('Candidate verified successfully!');
        loadDashboardData();
      } else {
        toast.error('Failed to verify candidate');
      }
    } catch (error) {
      console.error('Error verifying candidate:', error);
      toast.error('Failed to verify candidate');
    }
  };

  const handleUpdateElectionStatus = async (electionId: string, status: Election['status']) => {
    try {
      const response = await fetch(`/api/admin/election-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          electionId,
          status,
          adminAddress: address
        }),
      });

      if (response.ok) {
        toast.success(`Election status updated to ${status}!`);
        loadDashboardData();
      } else {
        toast.error('Failed to update election status');
      }
    } catch (error) {
      console.error('Error updating election status:', error);
      toast.error('Failed to update election status');
    }
  };

  // Show admin access status
  const showAdminPrompt = !isConnected || !isAdmin;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Election Management Dashboard</h1>
        <p className="text-gray-600">Administrative control panel for managing elections and candidates</p>
      </div>

      {/* Admin Access Status */}
      {showAdminPrompt ? (
        <div className="mb-6">
          <BaseAccountSection />
          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm">
                📋 You can view the dashboard, but admin actions require wallet connection.
              </p>
            </div>
          )}
          {isConnected && !isAdmin && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
              <p className="text-orange-800 text-sm">
                🔒 You can view the dashboard, but admin actions require authorized admin access.
              </p>
            </div>
          )}
        </div>
      ) : (
        <BaseAccountSection />
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalElections}</div>
            <div className="text-gray-600">Total Elections</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.activeElections}</div>
            <div className="text-gray-600">Active Elections</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCandidates}</div>
            <div className="text-gray-600">Total Candidates</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.totalVotes}</div>
            <div className="text-gray-600">Total Votes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.pendingVerifications}</div>
            <div className="text-gray-600">Pending Verifications</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'elections', label: 'Elections', icon: '🗳️' },
              { id: 'candidates', label: 'Candidates', icon: '👥' },
              { id: 'create', label: 'Create Election', icon: '➕' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">System Overview</h2>
              
              {/* Recent Activity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Elections</h3>
                {elections.slice(0, 3).map((election) => (
                  <div key={election.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{election.title}</h4>
                        <p className="text-gray-600 text-sm">{election.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        election.status === 'active' ? 'bg-green-100 text-green-800' :
                        election.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        election.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {election.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elections Tab */}
          {activeTab === 'elections' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Manage Elections</h2>
              
              <div className="space-y-4">
                {elections.map((election) => (
                  <div key={election.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{election.title}</h3>
                        <p className="text-gray-600">{election.description}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Type: {election.type} | Votes: {election.totalVotes} | Eligible: {election.eligibleVoters}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          election.status === 'active' ? 'bg-green-100 text-green-800' :
                          election.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          election.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {election.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {election.status === 'draft' && (
                        <button
                          onClick={() => handleUpdateElectionStatus(election.id, 'active')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Activate
                        </button>
                      )}
                      {election.status === 'active' && (
                        <button
                          onClick={() => handleUpdateElectionStatus(election.id, 'completed')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateElectionStatus(election.id, 'cancelled')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidates Tab */}
          {activeTab === 'candidates' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Manage Candidates</h2>
              
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{candidate.name}</h3>
                        <p className="text-gray-600">{candidate.party} - {candidate.position}</p>
                        <p className="text-gray-500 text-sm">Election: {candidate.electionId}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {candidate.verified ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✅ Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyCandidate(candidate.id)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Election Tab */}
          {activeTab === 'create' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Create New Election</h2>
              
              <form onSubmit={handleCreateElection} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election Title *
                    </label>
                    <input
                      type="text"
                      value={newElection.title}
                      onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election Type *
                    </label>
                    <select
                      value={newElection.type}
                      onChange={(e) => setNewElection({...newElection, type: e.target.value as Election['type']})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="municipal">Municipal</option>
                      <option value="provincial">Provincial</option>
                      <option value="national">National</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newElection.description}
                    onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newElection.startDate}
                      onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newElection.endDate}
                      onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Positions *
                  </label>
                  {newElection.positions.map((position, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => {
                          const newPositions = [...newElection.positions];
                          newPositions[index] = e.target.value;
                          setNewElection({...newElection, positions: newPositions});
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Position name"
                      />
                      {newElection.positions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newPositions = newElection.positions.filter((_, i) => i !== index);
                            setNewElection({...newElection, positions: newPositions});
                          }}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewElection({...newElection, positions: [...newElection.positions, '']})}
                    className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Add Position
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Election
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
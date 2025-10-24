"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import type { Connector } from 'wagmi';
import toast from 'react-hot-toast';

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  image?: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  candidates: Candidate[];
  totalVotes: number;
}

interface Vote {
  electionId: string;
  candidateId: string;
  voterAddress: string;
  timestamp: number;
  transactionHash?: string;
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

export default function VotingPage() {
  const { isConnected, address } = useAccount();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);

  // Load elections and user votes
  useEffect(() => {
    loadElections();
    if (isConnected && address) {
      loadUserVotes();
    }
  }, [isConnected, address]);

  const loadElections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/elections');
      if (response.ok) {
        const data = await response.json();
        setElections(data.elections);
      }
    } catch (error) {
      console.error('Error loading elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/votes?address=${address}`);
      if (response.ok) {
        const data = await response.json();
        setUserVotes(data.votes);
      }
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const hasVoted = (electionId: string) => {
    return userVotes.some(vote => vote.electionId === electionId);
  };

  const handleVote = async () => {
    if (!selectedElection || !selectedCandidate || !address) {
      toast.error('Please select a candidate');
      return;
    }

    if (hasVoted(selectedElection.id)) {
      toast.error('You have already voted in this election');
      return;
    }

    setVotingLoading(true);
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          electionId: selectedElection.id,
          candidateId: selectedCandidate,
          voterAddress: address
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Vote cast successfully!');
        
        // Update local state
        setUserVotes(prev => [...prev, data.vote]);
        setSelectedCandidate('');
        
        // Refresh elections to update vote counts
        await loadElections();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Voting error:', error);
      toast.error('Failed to cast vote. Please try again.');
    } finally {
      setVotingLoading(false);
    }
  };

  const getElectionStatus = (election: Election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Show wallet connection prompt only when trying to vote
  const showWalletPrompt = !isConnected;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Baxela Voting System</h1>
          <p className="text-gray-600 mt-2">Participate in secure, transparent democratic elections</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Elections List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Elections</h2>
              <div className="space-y-4">
                {elections.map((election) => {
                  const status = getElectionStatus(election);
                  const voted = hasVoted(election.id);
                  
                  return (
                    <div
                      key={election.id}
                      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 ${
                        selectedElection?.id === election.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                      }`}
                      onClick={() => setSelectedElection(election)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          {voted && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                              Voted
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{election.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Total Votes: {election.totalVotes}
                      </div>
                    </div>
                  );
                })}
                
                {elections.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No elections available at this time.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Voting Panel */}
            <div className="lg:col-span-1">
              {selectedElection ? (
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cast Your Vote</h3>
                  <h4 className="font-medium text-gray-700 mb-4">{selectedElection.title}</h4>
                  
                  {hasVoted(selectedElection.id) ? (
                    <div className="text-center py-8">
                      <div className="text-green-600 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium">You have already voted in this election</p>
                    </div>
                  ) : getElectionStatus(selectedElection) !== 'active' ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {getElectionStatus(selectedElection) === 'upcoming' 
                          ? 'This election has not started yet' 
                          : 'This election has ended'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-6">
                        {selectedElection.candidates.map((candidate) => (
                          <label
                            key={candidate.id}
                            className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedCandidate === candidate.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="candidate"
                              value={candidate.id}
                              checked={selectedCandidate === candidate.id}
                              onChange={(e) => setSelectedCandidate(e.target.value)}
                              className="sr-only"
                            />
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                selectedCandidate === candidate.id
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedCandidate === candidate.id && (
                                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{candidate.name}</div>
                                <div className="text-sm text-gray-600">{candidate.party}</div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {!isConnected ? (
                        <div className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="text-yellow-800 font-medium mb-2">Connect Wallet to Vote</h4>
                            <p className="text-yellow-700 text-sm mb-3">
                              You need to connect your Base Account to cast your vote.
                            </p>
                            <WalletConnectSection />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleVote}
                          disabled={!selectedCandidate || votingLoading}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                            !selectedCandidate || votingLoading
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {votingLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Casting Vote...</span>
                            </div>
                          ) : (
                            'Cast Vote'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select an Election</h3>
                  <p className="text-gray-600">Choose an election from the list to view candidates and cast your vote.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
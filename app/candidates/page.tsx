"use client";

import React, { useState, useEffect } from 'react';
import { useBaseAccount } from '@/lib/baseAccount';
import { toast } from 'react-hot-toast';

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  bio: string;
  experience: string;
  platform: string;
  walletAddress: string;
  profileImage?: string;
  verified: boolean;
  registrationDate: Date;
  electionId: string;
}

interface CandidateFormData {
  name: string;
  party: string;
  position: string;
  bio: string;
  experience: string;
  platform: string;
  electionId: string;
}

// Base Account Connection Component
function BaseAccountSection() {
  const { address, isConnected } = useBaseAccount();

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-yellow-700 mb-4">
          You need to connect your Base Account to register as a candidate or view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-green-800">Base Account Connected</h3>
          <p className="text-green-700 text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <div className="text-green-600 text-2xl">✅</div>
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  const { address, isConnected } = useBaseAccount();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userCandidate, setUserCandidate] = useState<Candidate | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CandidateFormData>({
    name: '',
    party: '',
    position: '',
    bio: '',
    experience: '',
    platform: '',
    electionId: ''
  });

  // Load candidates and check if user is already registered
  useEffect(() => {
    loadCandidates();
  }, [address]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
        
        // Check if current user is already a candidate
        if (address) {
          const userCand = data.candidates?.find((c: Candidate) => 
            c.walletAddress.toLowerCase() === address.toLowerCase()
          );
          setUserCandidate(userCand || null);
        }
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (userCandidate) {
      toast.error('You are already registered as a candidate');
      return;
    }

    try {
      setSubmitting(true);
      
      const candidateData = {
        ...formData,
        walletAddress: address
      };

      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Candidate registration submitted successfully!');
        setShowRegistrationForm(false);
        setFormData({
          name: '',
          party: '',
          position: '',
          bio: '',
          experience: '',
          platform: '',
          electionId: ''
        });
        loadCandidates(); // Reload to show new candidate
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to register candidate');
      }
    } catch (error) {
      console.error('Error registering candidate:', error);
      toast.error('Failed to register candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<CandidateFormData>) => {
    if (!userCandidate || !address) return;

    try {
      const response = await fetch(`/api/candidates/${userCandidate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedData,
          walletAddress: address
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        loadCandidates();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Candidate Management</h1>
        <p className="text-gray-600">Register as a candidate or manage your profile</p>
      </div>

      {/* Base Account Connection Status */}
      {isConnected && <BaseAccountSection />}

      {/* User's Candidate Profile */}
      {isConnected && userCandidate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-blue-900">Your Candidate Profile</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              userCandidate.verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {userCandidate.verified ? '✅ Verified' : '⏳ Pending Verification'}
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p><strong>Name:</strong> {userCandidate.name}</p>
              <p><strong>Party:</strong> {userCandidate.party}</p>
              <p><strong>Position:</strong> {userCandidate.position}</p>
              <p><strong>Registered:</strong> {new Date(userCandidate.registrationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Platform</h3>
              <p className="text-gray-700">{userCandidate.platform}</p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Section */}
      <div className="mb-8">
        {!isConnected ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Want to Register as a Candidate?
            </h3>
            <p className="text-yellow-700 mb-4">
              Connect your Base Account to register as a candidate and manage your profile.
            </p>
            <BaseAccountSection />
          </div>
        ) : !userCandidate ? (
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Register as Candidate
          </button>
        ) : null}
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Register as Candidate</h3>
            <form onSubmit={handleSubmitRegistration}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Political Party *
                  </label>
                  <input
                    type="text"
                    value={formData.party}
                    onChange={(e) => setFormData({...formData, party: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Running For *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="President">President</option>
                    <option value="Governor">Governor</option>
                    <option value="Senator">Senator</option>
                    <option value="Representative">Representative</option>
                    <option value="Mayor">Mayor</option>
                    <option value="Council Member">Council Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Election *
                  </label>
                  <select
                    value={formData.electionId}
                    onChange={(e) => setFormData({...formData, electionId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Election</option>
                    <option value="national-2024">National Election 2024</option>
                    <option value="provincial-2024">Provincial Election 2024</option>
                    <option value="municipal-2024">Municipal Election 2024</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biography *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell voters about yourself..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience *
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your relevant experience..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform & Policies *
                </label>
                <textarea
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Outline your key policies and platform..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Candidates List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Candidates</h2>
        
        {candidates.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No candidates registered yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                  {candidate.verified && (
                    <span className="text-green-600 text-sm">✅</span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Party:</strong> {candidate.party}</p>
                  <p><strong>Position:</strong> {candidate.position}</p>
                  <p className="text-gray-600">{candidate.bio}</p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Registered: {new Date(candidate.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
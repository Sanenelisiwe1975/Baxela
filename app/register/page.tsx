'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface VoterRegistration {
  id: string;
  walletAddress: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  registrationDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  eligibleElections: string[];
  documents: {
    idDocument: string;
    proofOfAddress: string;
  };
}

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  email: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Wallet connection component
function WalletConnectSection() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-green-800 font-medium">Wallet Connected</h3>
            <p className="text-green-600 text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => disconnect()}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="text-center">
        <h3 className="text-yellow-800 font-medium mb-2">Connect Your Wallet</h3>
        <p className="text-yellow-600 text-sm mb-4">
          You need to connect your wallet to register as a voter
        </p>
        <button
          onClick={() => connect({ connector: injected() })}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

export default function VoterRegistrationPage() {
  const { address, isConnected } = useAccount();
  const [registration, setRegistration] = useState<VoterRegistration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationalId: '',
    email: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  // Load existing registration
  useEffect(() => {
    if (isConnected && address) {
      loadRegistration();
    }
  }, [isConnected, address]);

  const loadRegistration = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/voter-registration?walletAddress=${address}`);
      const data = await response.json();

      if (data.success && data.registration) {
        setRegistration(data.registration);
      }
    } catch (error) {
      console.error('Error loading registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'nationalId', 
      'email', 'phoneNumber', 'street', 'city', 'state', 'zipCode'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof RegistrationFormData]?.trim()) {
        setError(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate date of birth (must be 18+ years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError('You must be at least 18 years old to register');
      return false;
    }

    // Validate national ID format (basic check)
    if (formData.nationalId.length < 5) {
      setError('National ID must be at least 5 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        walletAddress: address,
        ...formData
      };

      const response = await fetch('/api/voter-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration submitted successfully! Your application is pending verification.');
        setRegistration(data.registration);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationalId: '',
          email: '',
          phoneNumber: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setError('Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Voter Registration
          </h1>

          {/* Wallet Connection Status */}
          {isConnected && <WalletConnectSection />}

          {/* Always show registration form and status */}
            <>
              {/* Existing Registration Status */}
              {registration && (
                <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Your Registration Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{registration.firstName} {registration.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.verificationStatus)}`}>
                        {registration.verificationStatus.charAt(0).toUpperCase() + registration.verificationStatus.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registration Date</p>
                      <p className="font-medium">{new Date(registration.registrationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Eligible Elections</p>
                      <p className="font-medium">{registration.eligibleElections.length} elections</p>
                    </div>
                  </div>
                  
                  {registration.verificationStatus === 'verified' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✅ Your voter registration is verified!</p>
                      <p className="text-green-600 text-sm">You can now participate in eligible elections.</p>
                    </div>
                  )}
                  
                  {registration.verificationStatus === 'pending' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium">⏳ Your registration is under review</p>
                      <p className="text-yellow-600 text-sm">We'll notify you once verification is complete.</p>
                    </div>
                  )}
                  
                  {registration.verificationStatus === 'rejected' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">❌ Registration was rejected</p>
                      <p className="text-red-600 text-sm">Please contact support or submit a new registration with correct information.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Registration Form */}
              {(!registration || registration.verificationStatus === 'rejected') && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {registration ? 'Update Registration' : 'New Voter Registration'}
                  </h2>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        National ID / SSN *
                      </label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Error and Success Messages */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800">{success}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    {!isConnected ? (
                      <div className="w-full">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <h4 className="text-yellow-800 font-medium mb-2">Connect Wallet to Register</h4>
                          <p className="text-yellow-700 text-sm mb-3">
                            You need to connect your wallet to submit your voter registration.
                          </p>
                          <WalletConnectSection />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Submitting...' : 'Submit Registration'}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
        </div>
      </div>
    </div>
  );
}
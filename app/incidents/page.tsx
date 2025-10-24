'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface IncidentReport {
  id: string;
  title: string;
  category: 'voter_intimidation' | 'technical_issues' | 'irregularities' | 'violence' | 'other';
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  reportedBy: string;
  timestamp: Date;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  verified: boolean;
  verificationNotes?: string;
  assignedTo?: string;
  lastUpdated: Date;
}

interface IncidentStats {
  total: number;
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  verified: number;
  unverified: number;
}

// Wallet connection component
function WalletConnectSection() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Wallet Connection Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Please connect your wallet to view and report incidents.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Wallet Connected
          </h3>
          <div className="mt-1 text-sm text-green-700">
            <p>Connected as: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced map component with better visualization
function IncidentMap({ incidents, selectedIncident, onIncidentSelect }: {
  incidents: IncidentReport[];
  selectedIncident: IncidentReport | null;
  onIncidentSelect: (incident: IncidentReport | null) => void;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      case 'low': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg h-96 relative border-2 border-gray-300 overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>
        
        {/* Incident markers */}
        {incidents.map((incident, index) => {
          const x = incident.coordinates ? 
            Math.max(10, Math.min(90, (incident.coordinates.lng + 180) / 360 * 100)) : 
            20 + (index % 8) * 10;
          const y = incident.coordinates ? 
            Math.max(10, Math.min(90, (90 - incident.coordinates.lat) / 180 * 100)) : 
            20 + Math.floor(index / 8) * 15;
          
          return (
            <div
              key={incident.id}
              className={`absolute w-4 h-4 rounded-full border-2 cursor-pointer transform -translate-x-2 -translate-y-2 transition-all hover:scale-125 ${
                getSeverityColor(incident.severity)
              } ${
                selectedIncident?.id === incident.id ? 'scale-150 ring-4 ring-blue-300' : ''
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onIncidentSelect(incident)}
              title={`${incident.title} - ${incident.severity.toUpperCase()}`}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {incident.title}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="text-xs font-medium text-gray-900 mb-2">Severity Levels</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600 mr-2"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-orange-600 mr-2"></div>
            <span>High</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600 mr-2"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600 mr-2"></div>
            <span>Low</span>
          </div>
        </div>
      </div>
      
      {/* Map Info */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium text-gray-900">
          {incidents.length} Incidents Displayed
        </div>
        <div className="text-xs text-gray-500">
          Click markers for details
        </div>
      </div>
    </div>
  );
}

export default function IncidentMapPage() {
  const { isConnected } = useAccount();
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentReport[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    severity: 'all'
  });

  // Load incidents from API
  useEffect(() => {
    const loadIncidents = async () => {
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/incidents');
        const data = await response.json();
        
        if (data.success) {
          // Convert timestamp strings to Date objects
          const incidentsWithDates = data.incidents.map((incident: any) => ({
            ...incident,
            timestamp: new Date(incident.timestamp),
            lastUpdated: new Date(incident.lastUpdated)
          }));
          
          setIncidents(incidentsWithDates);
          setFilteredIncidents(incidentsWithDates);
          setStats(data.stats);
        } else {
          setError(data.message || 'Failed to load incidents');
        }
      } catch (error) {
        console.error('Error loading incidents:', error);
        setError('Failed to load incidents');
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, [isConnected]);

  // Apply filters
  useEffect(() => {
    let filtered = incidents;

    if (filters.category !== 'all') {
      filtered = filtered.filter(incident => incident.category === filters.category);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(incident => incident.status === filters.status);
    }

    if (filters.severity !== 'all') {
      filtered = filtered.filter(incident => incident.severity === filters.severity);
    }

    setFilteredIncidents(filtered);
    
    // Reset selected incident if it's no longer in filtered results
    if (selectedIncident && !filtered.find(i => i.id === selectedIncident.id)) {
      setSelectedIncident(null);
    }
  }, [incidents, filters, selectedIncident]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voter_intimidation':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
        );
      case 'technical_issues':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case 'irregularities':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'violence':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Incident Map</h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring of election incidents and irregularities
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading incidents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-500">Total Incidents</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-blue-600">{stats.investigating}</div>
                  <div className="text-sm text-gray-500">Investigating</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                  <div className="text-sm text-gray-500">Resolved</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                  <div className="text-sm text-gray-500">Critical</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
                  <div className="text-sm text-gray-500">High Priority</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="voter_intimidation">Voter Intimidation</option>
                    <option value="technical_issues">Technical Issues</option>
                    <option value="irregularities">Irregularities</option>
                    <option value="violence">Violence</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Map and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Locations</h3>
                <IncidentMap
                  incidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  onIncidentSelect={setSelectedIncident}
                />
              </div>

              {/* Incident Details */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedIncident ? 'Incident Details' : 'Recent Incidents'}
                </h3>
                
                {selectedIncident ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="mr-2 text-gray-600">
                          {getCategoryIcon(selectedIncident.category)}
                        </div>
                        <h4 className="font-medium text-gray-900">{selectedIncident.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500">{selectedIncident.location}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedIncident.severity)}`}>
                        {selectedIncident.severity.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIncident.status)}`}>
                        {selectedIncident.status.toUpperCase()}
                      </span>
                      {selectedIncident.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                      <p className="text-sm text-gray-600">{selectedIncident.description}</p>
                    </div>
                    
                    {selectedIncident.verificationNotes && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Verification Notes</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedIncident.verificationNotes}</p>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Details</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Reported:</span> {selectedIncident.timestamp.toLocaleString()}</p>
                        <p><span className="font-medium">Last Updated:</span> {selectedIncident.lastUpdated.toLocaleString()}</p>
                        <p><span className="font-medium">Reporter:</span> {selectedIncident.reportedBy.slice(0, 6)}...{selectedIncident.reportedBy.slice(-4)}</p>
                        <p><span className="font-medium">Category:</span> {selectedIncident.category.replace('_', ' ').toUpperCase()}</p>
                        {selectedIncident.assignedTo && (
                          <p><span className="font-medium">Assigned To:</span> {selectedIncident.assignedTo}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedIncident(null)}
                      className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Back to List
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredIncidents.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No incidents match the current filters.</p>
                    ) : (
                      filteredIncidents.slice(0, 10).map((incident) => (
                        <div
                          key={incident.id}
                          onClick={() => setSelectedIncident(incident)}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="mr-2 text-gray-600">
                                {getCategoryIcon(incident.category)}
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">{incident.title}</h4>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{incident.location}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                {incident.status}
                              </span>
                              {incident.verified && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {incident.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
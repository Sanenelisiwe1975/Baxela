'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useBaseAccount } from '@/lib/baseAccount';
import BasePay from '@/components/BasePay';

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

// Base Account Display Component
function BaseAccountDisplay() {
  const { address, isConnected } = useBaseAccount();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Base Account</span>
      </div>
      <div className="text-sm text-gray-600">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
        Connected
      </span>
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useBaseAccount();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'voting_irregularity' as IncidentReport['category']
  });
  const [attachments, setAttachments] = useState<{
    videos: File[];
    images: File[];
    documents: File[];
  }>({
    videos: [],
    images: [],
    documents: []
  });

  // File handling functions
  const handleFileUpload = (type: 'videos' | 'images' | 'documents', files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    fileArray.forEach(file => {
      // Validate file types
      if (type === 'videos' && file.type.startsWith('video/')) {
        validFiles.push(file);
      } else if (type === 'images' && file.type.startsWith('image/')) {
        validFiles.push(file);
      } else if (type === 'documents' && (
        file.type === 'application/pdf' ||
        file.type.startsWith('application/msword') ||
        file.type.startsWith('application/vnd.openxmlformats-officedocument') ||
        file.type === 'text/plain'
      )) {
        validFiles.push(file);
      }
    });
    
    setAttachments(prev => ({
      ...prev,
      [type]: [...prev[type], ...validFiles]
    }));
  };

  const removeFile = (type: 'videos' | 'images' | 'documents', index: number) => {
    setAttachments(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add text data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('category', formData.category === 'voting_irregularity' ? 'irregularities' : formData.category);
      formDataToSend.append('reportedBy', address || '');
      formDataToSend.append('severity', 'medium');
      
      // Add files
      attachments.videos.forEach((file, index) => {
        formDataToSend.append(`video_${index}`, file);
      });
      attachments.images.forEach((file, index) => {
        formDataToSend.append(`image_${index}`, file);
      });
      attachments.documents.forEach((file, index) => {
        formDataToSend.append(`document_${index}`, file);
      });

      const response = await fetch('/api/incidents', {
        method: 'POST',
        body: formDataToSend, // Remove Content-Type header to let browser set it with boundary
      });

      const data = await response.json();

      if (data.success) {
        const newReport: IncidentReport = {
          id: data.incident.id,
          ...formData,
          timestamp: new Date(data.incident.timestamp),
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
        setAttachments({
          videos: [],
          images: [],
          documents: []
        });
        setShowReportForm(false);
        
        if (data.ipfsHash) {
          const attachmentInfo = data.attachments?.total > 0 ? ` (${data.attachments.uploaded})` : '';
          toast.success(`Incident reported successfully and uploaded to IPFS! Hash: ${data.ipfsHash.substring(0, 10)}...${attachmentInfo}`);
        } else {
          const attachmentInfo = data.attachments?.total > 0 ? ` Files uploaded: ${data.attachments.uploaded}` : '';
          toast.success(`Incident reported successfully!${attachmentInfo}`);
        }
      } else {
        toast.error(data.message || 'Failed to submit incident report');
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast.error('Failed to submit incident report');
    }
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
            href="/voting" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🗳️ Vote Now
          </Link>
          <Link 
            href="/analytics" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📊 Analytics
          </Link>
          <BaseAccountDisplay />
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

              {/* Video Upload Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📹 Videos (Optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileUpload('videos', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {attachments.videos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.videos.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm text-gray-600">📹 {file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('videos', index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🖼️ Images (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload('images', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {attachments.images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.images.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm text-gray-600">🖼️ {file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('images', index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 Documents (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  onChange={(e) => handleFileUpload('documents', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, DOCX, TXT</p>
                {attachments.documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm text-gray-600">📄 {file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('documents', index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* BasePay Section */}
      <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Support Democracy</h3>
        <p className="text-gray-600 mb-6">
          Support transparent democracy by making a contribution through BasePay. 
          Your support helps maintain this platform and ensures election integrity.
        </p>
        <BasePay 
          amount="0.01"
          onSuccess={(transactionId) => {
            toast.success(`Payment successful! Transaction: ${transactionId.slice(0, 10)}...`);
          }}
          onError={(error) => {
            toast.error(`Payment failed: ${error.message}`);
          }}
        />
      </section>

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
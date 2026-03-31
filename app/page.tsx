'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useBaseAccount } from '@/lib/baseAccount';
import BasePay from '@/components/BasePay';

type ReportType = 'election' | 'building_compliance';

type ElectionCategory = 'voting_irregularity' | 'intimidation' | 'bribery' | 'violence' | 'other';
type ComplianceCategory = 'unauthorized_construction' | 'no_permit' | 'structural_risk' | 'illegal_land_use' | 'deviation_from_plans' | 'other';

interface IncidentReport {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  reporter: string;
  status: 'pending' | 'verified' | 'resolved';
  category: string;
  reportType: ReportType;
}

function BaseAccountDisplay() {
  const { address, mounted } = useBaseAccount();
  if (!mounted) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Citizen ID</span>
      </div>
      <div className="text-sm text-gray-600">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Active</span>
    </div>
  );
}

export default function Home() {
  const { address } = useBaseAccount();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('election');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'voting_irregularity' as string,
    erfNumber: '',
    permitNumber: '',
    constructionType: '',
  });
  const [attachments, setAttachments] = useState<{ videos: File[]; images: File[]; documents: File[] }>({
    videos: [], images: [], documents: [],
  });
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleFileUpload = (type: 'videos' | 'images' | 'documents', files: FileList | null) => {
    if (!files) return;
    const MAX_SIZE = 50 * 1024 * 1024;
    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (file.size > MAX_SIZE) { toast.error(`${file.name} is too large (max 50MB)`); return; }
      if (type === 'videos' && file.type.startsWith('video/')) validFiles.push(file);
      else if (type === 'images' && file.type.startsWith('image/')) validFiles.push(file);
      else if (type === 'documents' && (
        file.type === 'application/pdf' ||
        file.type.startsWith('application/msword') ||
        file.type.startsWith('application/vnd.openxmlformats-officedocument') ||
        file.type === 'text/plain'
      )) validFiles.push(file);
    });
    setAttachments(prev => ({ ...prev, [type]: [...prev[type], ...validFiles] }));
  };

  const removeFile = (type: 'videos' | 'images' | 'documents', index: number) => {
    setAttachments(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation is not supported by your browser.'); return; }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'Baxela/1.0' } }
          );
          const data = await response.json();
          setFormData(prev => ({ ...prev, location: data.display_name || `${latitude}, ${longitude}` }));
          setDetectedCoords({ lat: latitude, lon: longitude });
        } catch {
          setFormData(prev => ({ ...prev, location: `${latitude}, ${longitude}` }));
          setDetectedCoords({ lat: latitude, lon: longitude });
        } finally {
          setDetectingLocation(false);
        }
      },
      () => { setDetectingLocation(false); toast.error('Could not detect location. Please enter manually.'); }
    );
  };

  const switchReportType = (type: ReportType) => {
    setReportType(type);
    setFormData(prev => ({
      ...prev,
      category: type === 'election' ? 'voting_irregularity' : 'unauthorized_construction',
      erfNumber: '',
      permitNumber: '',
      constructionType: '',
    }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('location', formData.location);
      fd.append('category', formData.category === 'voting_irregularity' ? 'irregularities' : formData.category);
      fd.append('reportedBy', address || '');
      fd.append('severity', 'medium');
      fd.append('reportType', reportType);
      if (reportType === 'building_compliance') {
        if (formData.erfNumber) fd.append('erfNumber', formData.erfNumber);
        if (formData.permitNumber) fd.append('permitNumber', formData.permitNumber);
        if (formData.constructionType) fd.append('constructionType', formData.constructionType);
      }
      if (detectedCoords) {
        fd.append('latitude', String(detectedCoords.lat));
        fd.append('longitude', String(detectedCoords.lon));
      }
      attachments.videos.forEach((file, i) => fd.append(`video_${i}`, file));
      attachments.images.forEach((file, i) => fd.append(`image_${i}`, file));
      attachments.documents.forEach((file, i) => fd.append(`document_${i}`, file));

      const response = await fetch('/api/incidents', { method: 'POST', body: fd });
      const data = await response.json();

      if (data.success) {
        setReports([{
          id: data.incident.id,
          ...formData,
          reportType,
          timestamp: new Date(data.incident.timestamp),
          reporter: address || '',
          status: 'pending',
        }, ...reports]);
        setFormData({ title: '', description: '', location: '', category: reportType === 'election' ? 'voting_irregularity' : 'unauthorized_construction', erfNumber: '', permitNumber: '', constructionType: '' });
        setAttachments({ videos: [], images: [], documents: [] });
        setDetectedCoords(null);
        setShowReportForm(false);
        if (data.ipfsHash) {
          toast.success(`Report submitted and stored on IPFS! Hash: ${data.ipfsHash.substring(0, 10)}...`);
        } else {
          toast.success('Report submitted successfully!');
        }
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Baxela</h1>
          <p className="text-gray-600">Democracy, Election Integrity & Urban Compliance Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/voting" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Vote Now
          </Link>
          <Link href="/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Analytics
          </Link>
          <BaseAccountDisplay />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Transparent Governance Through Technology</h2>
          <p className="text-lg text-gray-600 mb-6">
            Report election irregularities or building compliance violations. Every report is stored permanently on IPFS and visible to the public.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => { setReportType('election'); setShowReportForm(true); }}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Report Election Incident
            </button>
            <button
              type="button"
              onClick={() => { setReportType('building_compliance'); setShowReportForm(true); }}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Report Building Violation
            </button>
          </div>
        </div>
      </section>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Report Type Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300 mb-6">
              <button
                type="button"
                onClick={() => switchReportType('election')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  reportType === 'election' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Election Incident
              </button>
              <button
                type="button"
                onClick={() => switchReportType('building_compliance')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  reportType === 'building_compliance' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Building Violation
              </button>
            </div>

            <h3 className="text-2xl font-bold mb-4">
              {reportType === 'election' ? 'Report Election Incident' : 'Report Building Violation'}
            </h3>

            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  id="report-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="report-category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  id="report-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {reportType === 'election' ? (
                    <>
                      <option value="voting_irregularity">Voting Irregularity</option>
                      <option value="intimidation">Voter Intimidation</option>
                      <option value="bribery">Bribery</option>
                      <option value="violence">Violence</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="unauthorized_construction">Unauthorized Construction</option>
                      <option value="no_permit">No Building Permit Displayed</option>
                      <option value="structural_risk">Structural Risk / Unsafe Structure</option>
                      <option value="illegal_land_use">Illegal Land Use / Rezoning Violation</option>
                      <option value="deviation_from_plans">Deviation from Approved Plans</option>
                      <option value="other">Other</option>
                    </>
                  )}
                </select>
              </div>

              {/* Building Compliance Extra Fields */}
              {reportType === 'building_compliance' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Erf / Property Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={formData.erfNumber}
                      onChange={(e) => setFormData({ ...formData, erfNumber: e.target.value })}
                      placeholder="e.g. ERF 1234"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permit Number <span className="text-gray-400 font-normal">(if visible)</span></label>
                    <input
                      type="text"
                      value={formData.permitNumber}
                      onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                      placeholder="e.g. BLD-2024-00123"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="construction-type" className="block text-sm font-medium text-gray-700 mb-2">Construction Type <span className="text-gray-400 font-normal">(optional)</span></label>
                    <select
                      id="construction-type"
                      value={formData.constructionType}
                      onChange={(e) => setFormData({ ...formData, constructionType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select type...</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="mixed_use">Mixed Use</option>
                      <option value="informal">Informal / Shack</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setDetectedCoords(null); }}
                    placeholder="Enter location or detect automatically"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60 whitespace-nowrap text-sm"
                  >
                    {detectingLocation ? (
                      <><span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span><span>Detecting...</span></>
                    ) : (
                      <span>Detect My Location</span>
                    )}
                  </button>
                </div>
                {detectedCoords && (
                  <p className="text-xs text-green-600 mt-1">
                    GPS coordinates captured ({detectedCoords.lat.toFixed(5)}, {detectedCoords.lon.toFixed(5)})
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="report-description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  id="report-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Video Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Videos (Optional)</label>
                <input type="file" accept="video/*" multiple onChange={(e) => handleFileUpload('videos', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                {attachments.videos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.videos.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button type="button" onClick={() => removeFile('videos', index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Images (Optional)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleFileUpload('images', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                {attachments.images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.images.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button type="button" onClick={() => removeFile('images', index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Documents (Optional)</label>
                <input type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={(e) => handleFileUpload('documents', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, DOCX, TXT</p>
                {attachments.documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button type="button" onClick={() => removeFile('documents', index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className={`flex-1 text-white py-2 rounded-lg transition-colors ${
                    reportType === 'building_compliance' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BasePay Section */}
      <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Support This Platform</h3>
        <p className="text-gray-600 mb-6">
          Your contribution helps maintain transparent governance tools for democracy and urban safety.
        </p>
        <BasePay
          amount="0.01"
          onSuccess={(transactionId) => toast.success(`Payment successful! Transaction: ${transactionId.slice(0, 10)}...`)}
          onError={(error) => toast.error(`Payment failed: ${error.message}`)}
        />
      </section>

      {/* Recent Reports */}
      <section className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Reports</h3>
        {reports.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No reports submitted yet. Be the first to report an incident.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      report.reportType === 'building_compliance' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.reportType === 'building_compliance' ? 'Building' : 'Election'}
                    </span>
                  </div>
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
                  <span>{report.location}</span>
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

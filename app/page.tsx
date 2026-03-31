'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useBaseAccount } from '@/lib/baseAccount';
import BasePay from '@/components/BasePay';

type ReportType = 'election' | 'building_compliance' | 'police' | 'social_services' | 'service_delivery';

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

const REPORT_TYPE_CONFIG: Record<ReportType, { label: string; color: string; defaultCategory: string }> = {
  election:          { label: 'Election Incident',  color: 'bg-green-600 hover:bg-green-700',   defaultCategory: 'voting_irregularity' },
  building_compliance: { label: 'Building Violation', color: 'bg-orange-600 hover:bg-orange-700', defaultCategory: 'unauthorized_construction' },
  police:            { label: 'Police Misconduct',  color: 'bg-red-600 hover:bg-red-700',       defaultCategory: 'brutality' },
  social_services:   { label: 'Social Services',    color: 'bg-purple-600 hover:bg-purple-700', defaultCategory: 'child_abuse' },
  service_delivery:  { label: 'Service Delivery',   color: 'bg-blue-600 hover:bg-blue-700',     defaultCategory: 'water_outage' },
};

const TYPE_BADGE: Record<string, string> = {
  election: 'bg-green-100 text-green-800',
  building_compliance: 'bg-orange-100 text-orange-800',
  police: 'bg-red-100 text-red-800',
  social_services: 'bg-purple-100 text-purple-800',
  service_delivery: 'bg-blue-100 text-blue-800',
};

const TYPE_LABEL: Record<string, string> = {
  election: 'Election',
  building_compliance: 'Building',
  police: 'Police',
  social_services: 'Social',
  service_delivery: 'Service',
};

function BaseAccountDisplay() {
  const { address, mounted } = useBaseAccount();
  if (!mounted) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Citizen ID</span>
      </div>
      <div className="text-sm text-gray-600">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
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
    title: '', description: '', location: '', category: 'voting_irregularity',
    erfNumber: '', permitNumber: '', constructionType: '',
    badgeNumber: '', stationName: '',
    caseReference: '',
    wardNumber: '', municipalTicket: '',
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
      category: REPORT_TYPE_CONFIG[type].defaultCategory,
      erfNumber: '', permitNumber: '', constructionType: '',
      badgeNumber: '', stationName: '',
      caseReference: '',
      wardNumber: '', municipalTicket: '',
    }));
  };

  const openForm = (type: ReportType) => {
    switchReportType(type);
    setShowReportForm(true);
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
      if (reportType === 'police') {
        if (formData.badgeNumber) fd.append('badgeNumber', formData.badgeNumber);
        if (formData.stationName) fd.append('stationName', formData.stationName);
      }
      if (reportType === 'social_services') {
        if (formData.caseReference) fd.append('caseReference', formData.caseReference);
      }
      if (reportType === 'service_delivery') {
        if (formData.wardNumber) fd.append('wardNumber', formData.wardNumber);
        if (formData.municipalTicket) fd.append('municipalTicket', formData.municipalTicket);
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
          title: formData.title,
          description: formData.description,
          location: formData.location,
          category: formData.category,
          reportType,
          timestamp: new Date(data.incident.timestamp),
          reporter: address || '',
          status: 'pending',
        }, ...reports]);
        setFormData({
          title: '', description: '', location: '', category: REPORT_TYPE_CONFIG[reportType].defaultCategory,
          erfNumber: '', permitNumber: '', constructionType: '',
          badgeNumber: '', stationName: '', caseReference: '',
          wardNumber: '', municipalTicket: '',
        });
        setAttachments({ videos: [], images: [], documents: [] });
        setDetectedCoords(null);
        setShowReportForm(false);
        toast.success(data.ipfsHash
          ? `Report submitted and stored on IPFS! Hash: ${data.ipfsHash.substring(0, 10)}...`
          : 'Report submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  const cfg = REPORT_TYPE_CONFIG[reportType];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Baxela</h1>
          <p className="text-gray-600">Transparent Governance & Community Accountability Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Analytics</Link>
          <BaseAccountDisplay />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Report. Track. Hold Accountable.</h2>
          <p className="text-lg text-gray-600">
            Every report is stored permanently on IPFS and visible to the public. No account required.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.entries(REPORT_TYPE_CONFIG) as [ReportType, typeof REPORT_TYPE_CONFIG[ReportType]][]).map(([type, config]) => (
            <button key={type} type="button" onClick={() => openForm(type)}
              className={`${config.color} text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors`}>
              {config.label}
            </button>
          ))}
        </div>
      </section>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">

            {/* Report Type Selector */}
            <div className="mb-5">
              <label htmlFor="report-type-select" className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select id="report-type-select" value={reportType}
                onChange={(e) => switchReportType(e.target.value as ReportType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="election">Election Incident</option>
                <option value="building_compliance">Building Violation</option>
                <option value="police">Police Misconduct</option>
                <option value="social_services">Social Services</option>
                <option value="service_delivery">Service Delivery</option>
              </select>
            </div>

            <h3 className="text-xl font-bold mb-4">{cfg.label}</h3>

            <form onSubmit={handleSubmitReport}>
              {/* Title */}
              <div className="mb-4">
                <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input id="report-title" type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="report-category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select id="report-category" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {reportType === 'election' && <>
                    <option value="voting_irregularity">Voting Irregularity</option>
                    <option value="intimidation">Voter Intimidation</option>
                    <option value="bribery">Bribery</option>
                    <option value="violence">Violence</option>
                    <option value="other">Other</option>
                  </>}
                  {reportType === 'building_compliance' && <>
                    <option value="unauthorized_construction">Unauthorized Construction</option>
                    <option value="no_permit">No Building Permit Displayed</option>
                    <option value="structural_risk">Structural Risk / Unsafe Structure</option>
                    <option value="illegal_land_use">Illegal Land Use / Rezoning Violation</option>
                    <option value="deviation_from_plans">Deviation from Approved Plans</option>
                    <option value="other">Other</option>
                  </>}
                  {reportType === 'police' && <>
                    <option value="brutality">Brutality / Excessive Force</option>
                    <option value="corruption_bribery">Corruption / Bribery</option>
                    <option value="unlawful_arrest">Unlawful Arrest / Detention</option>
                    <option value="theft_property_damage">Theft / Property Damage by Officer</option>
                    <option value="dereliction_of_duty">Dereliction of Duty</option>
                    <option value="racial_profiling">Racial Profiling</option>
                    <option value="other">Other</option>
                  </>}
                  {reportType === 'social_services' && <>
                    <option value="child_abuse">Child Abuse / Neglect</option>
                    <option value="elderly_abuse">Elderly Abuse</option>
                    <option value="domestic_violence">Domestic Violence</option>
                    <option value="social_worker_misconduct">Social Worker Misconduct</option>
                    <option value="fraudulent_grant">Fraudulent Grant Application</option>
                    <option value="child_abandonment">Child Abandonment</option>
                    <option value="other">Other</option>
                  </>}
                  {reportType === 'service_delivery' && <>
                    <option value="water_outage">Water Outage / Contamination</option>
                    <option value="no_electricity">Electricity / No Power</option>
                    <option value="roads_potholes">Roads / Potholes</option>
                    <option value="refuse_not_collected">Refuse Not Collected</option>
                    <option value="sewage_drainage">Sewage / Drainage Failure</option>
                    <option value="public_lighting">Public Lighting</option>
                    <option value="housing_rdp">Housing / RDP Issues</option>
                    <option value="other">Other</option>
                  </>}
                </select>
              </div>

              {/* Building Compliance extra fields */}
              {reportType === 'building_compliance' && (<>
                <div className="mb-4">
                  <label htmlFor="erf-number" className="block text-sm font-medium text-gray-700 mb-2">Erf / Property Number <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input id="erf-number" type="text" value={formData.erfNumber}
                    onChange={(e) => setFormData({ ...formData, erfNumber: e.target.value })}
                    placeholder="e.g. ERF 1234"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="mb-4">
                  <label htmlFor="permit-number" className="block text-sm font-medium text-gray-700 mb-2">Permit Number <span className="text-gray-400 font-normal">(if visible)</span></label>
                  <input id="permit-number" type="text" value={formData.permitNumber}
                    onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                    placeholder="e.g. BLD-2024-00123"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="mb-4">
                  <label htmlFor="construction-type" className="block text-sm font-medium text-gray-700 mb-2">Construction Type <span className="text-gray-400 font-normal">(optional)</span></label>
                  <select id="construction-type" value={formData.constructionType}
                    onChange={(e) => setFormData({ ...formData, constructionType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Select type...</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed_use">Mixed Use</option>
                    <option value="informal">Informal / Shack</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>)}

              {/* Police extra fields */}
              {reportType === 'police' && (<>
                <div className="mb-4">
                  <label htmlFor="badge-number" className="block text-sm font-medium text-gray-700 mb-2">Officer Badge Number <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input id="badge-number" type="text" value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="e.g. 12345"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="mb-4">
                  <label htmlFor="station-name" className="block text-sm font-medium text-gray-700 mb-2">Police Station <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input id="station-name" type="text" value={formData.stationName}
                    onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                    placeholder="e.g. Soweto Police Station"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </>)}

              {/* Social Services extra fields */}
              {reportType === 'social_services' && (
                <div className="mb-4">
                  <label htmlFor="case-reference" className="block text-sm font-medium text-gray-700 mb-2">Case Reference Number <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input id="case-reference" type="text" value={formData.caseReference}
                    onChange={(e) => setFormData({ ...formData, caseReference: e.target.value })}
                    placeholder="e.g. DSD-2024-00456"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              )}

              {/* Service Delivery extra fields */}
              {reportType === 'service_delivery' && (<>
                <div className="mb-4">
                  <label htmlFor="ward-number" className="block text-sm font-medium text-gray-700 mb-2">Ward Number <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input id="ward-number" type="text" value={formData.wardNumber}
                    onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                    placeholder="e.g. Ward 42"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-4">
                  <label htmlFor="municipal-ticket" className="block text-sm font-medium text-gray-700 mb-2">Municipal Reference / Ticket <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input id="municipal-ticket" type="text" value={formData.municipalTicket}
                    onChange={(e) => setFormData({ ...formData, municipalTicket: e.target.value })}
                    placeholder="e.g. COT-2024-789"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>)}

              {/* Location */}
              <div className="mb-4">
                <label htmlFor="report-location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex gap-2">
                  <input id="report-location" type="text" value={formData.location}
                    onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setDetectedCoords(null); }}
                    placeholder="Enter location or detect automatically"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  <button type="button" onClick={handleDetectLocation} disabled={detectingLocation}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60 whitespace-nowrap text-sm">
                    {detectingLocation
                      ? <><span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span><span>Detecting...</span></>
                      : <span>Detect Location</span>}
                  </button>
                </div>
                {detectedCoords && (
                  <p className="text-xs text-green-600 mt-1">GPS captured ({detectedCoords.lat.toFixed(5)}, {detectedCoords.lon.toFixed(5)})</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-5">
                <label htmlFor="report-description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea id="report-description" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              {/* File Uploads */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Videos (Optional)</label>
                <input type="file" accept="video/*" multiple onChange={(e) => handleFileUpload('videos', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                {attachments.videos.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded mt-1">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button type="button" onClick={() => removeFile('videos', i)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Images (Optional)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleFileUpload('images', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                {attachments.images.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded mt-1">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button type="button" onClick={() => removeFile('images', i)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Documents (Optional)</label>
                <input type="file" accept=".pdf,.doc,.docx,.txt" multiple title="Upload documents" onChange={(e) => handleFileUpload('documents', e.target.files)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, DOCX, TXT</p>
                {attachments.documents.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded mt-1">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button type="button" onClick={() => removeFile('documents', i)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
                <button type="submit" className={`flex-1 text-white py-2 rounded-lg transition-colors ${cfg.color}`}>
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BasePay Section */}
      <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Support This Platform</h3>
        <p className="text-gray-600 mb-6">
          Your contribution helps maintain transparent governance tools for democracy and community accountability.
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
          <p className="text-gray-600 text-center py-8">No reports submitted yet. Be the first to report.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[report.reportType] || 'bg-gray-100 text-gray-700'}`}>
                      {TYPE_LABEL[report.reportType] || report.reportType}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>{report.status}</span>
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

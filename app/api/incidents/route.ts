import { NextRequest, NextResponse } from 'next/server';
import { ipfsService } from '../../../lib/ipfs';

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
  attachments?: string[];
  verificationNotes?: string;
  assignedTo?: string;
  lastUpdated: Date;
  ipfsHash?: string; // IPFS hash for decentralized storage
}

interface CreateIncidentData {
  title: string;
  category: 'voter_intimidation' | 'technical_issues' | 'irregularities' | 'violence' | 'other';
  location: string;
  description: string;
  reportedBy: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Mock incident data - in a real app, this would be stored in a database
let mockIncidents: IncidentReport[] = [
  {
    id: 'incident-001',
    title: 'Voting Machine Malfunction',
    category: 'technical_issues',
    location: 'Downtown Community Center, New York, NY',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    description: 'Multiple voting machines not working properly, causing long delays.',
    reportedBy: '0x1234567890123456789012345678901234567890',
    timestamp: new Date('2024-11-05T10:30:00'),
    status: 'investigating',
    severity: 'high',
    verified: true,
    assignedTo: 'admin-001',
    lastUpdated: new Date('2024-11-05T11:00:00'),
    ipfsHash: 'QmTestHash1234567890abcdefghijklmnopqrstuvwxyz123'
  },
  {
    id: 'incident-002',
    title: 'Voter Intimidation Reported',
    category: 'voter_intimidation',
    location: 'Westside Polling Station, Los Angeles, CA',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    description: 'Reports of individuals intimidating voters outside polling location.',
    reportedBy: '0x2345678901234567890123456789012345678901',
    timestamp: new Date('2024-11-05T09:15:00'),
    status: 'resolved',
    severity: 'critical',
    verified: true,
    verificationNotes: 'Verified by local authorities. Security increased.',
    assignedTo: 'admin-002',
    lastUpdated: new Date('2024-11-05T15:30:00'),
    ipfsHash: 'QmTestHash5678901234abcdefghijklmnopqrstuvwxyz567'
  },
  {
    id: 'incident-003',
    title: 'Ballot Box Issues',
    category: 'irregularities',
    location: 'Central High School, Chicago, IL',
    coordinates: { lat: 41.8781, lng: -87.6298 },
    description: 'Ballot box appeared to be tampered with.',
    reportedBy: '0x3456789012345678901234567890123456789012',
    timestamp: new Date('2024-11-05T14:20:00'),
    status: 'pending',
    severity: 'high',
    verified: false,
    lastUpdated: new Date('2024-11-05T14:20:00')
  },
  {
    id: 'incident-004',
    title: 'Power Outage at Polling Site',
    category: 'technical_issues',
    location: 'Riverside Community Hall, Miami, FL',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    description: 'Complete power outage affecting all voting equipment.',
    reportedBy: '0x4567890123456789012345678901234567890123',
    timestamp: new Date('2024-11-05T11:45:00'),
    status: 'resolved',
    severity: 'medium',
    verified: true,
    verificationNotes: 'Power restored. Backup generators deployed.',
    assignedTo: 'admin-001',
    lastUpdated: new Date('2024-11-05T13:15:00')
  },
  {
    id: 'incident-005',
    title: 'Suspicious Activity',
    category: 'irregularities',
    location: 'North End Library, Boston, MA',
    coordinates: { lat: 42.3601, lng: -71.0589 },
    description: 'Unusual activity observed around ballot collection area.',
    reportedBy: '0x5678901234567890123456789012345678901234',
    timestamp: new Date('2024-11-05T16:10:00'),
    status: 'investigating',
    severity: 'medium',
    verified: false,
    assignedTo: 'admin-003',
    lastUpdated: new Date('2024-11-05T16:45:00')
  }
];

// Helper function to generate unique incident ID
function generateIncidentId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `incident-${timestamp}-${random}`;
}

// Helper function to validate incident data
function validateIncidentData(data: CreateIncidentData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!data.title?.trim()) {
    errors.push('Title is required');
  } else if (data.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  } else if (data.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (!data.description?.trim()) {
    errors.push('Description is required');
  } else if (data.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (!data.location?.trim()) {
    errors.push('Location is required');
  } else if (data.location.length < 5) {
    errors.push('Location must be at least 5 characters long');
  }

  if (!data.reportedBy?.trim()) {
    errors.push('Reporter wallet address is required');
  } else {
    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(data.reportedBy)) {
      errors.push('Invalid wallet address format');
    }
  }

  // Category validation
  const validCategories = ['voter_intimidation', 'technical_issues', 'irregularities', 'violence', 'other'];
  if (!validCategories.includes(data.category)) {
    errors.push('Invalid category');
  }

  // Severity validation (optional)
  if (data.severity) {
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(data.severity)) {
      errors.push('Invalid severity level');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to determine severity based on category and keywords
function determineSeverity(category: string, description: string): 'low' | 'medium' | 'high' | 'critical' {
  const criticalKeywords = ['violence', 'threat', 'weapon', 'assault', 'emergency'];
  const highKeywords = ['intimidation', 'malfunction', 'tampering', 'fraud'];
  const mediumKeywords = ['delay', 'confusion', 'technical', 'equipment'];

  const lowerDescription = description.toLowerCase();

  // Check for critical keywords
  if (criticalKeywords.some(keyword => lowerDescription.includes(keyword))) {
    return 'critical';
  }

  // Category-based severity
  if (category === 'violence' || category === 'voter_intimidation') {
    return 'critical';
  }

  // Check for high keywords
  if (highKeywords.some(keyword => lowerDescription.includes(keyword))) {
    return 'high';
  }

  // Check for medium keywords
  if (mediumKeywords.some(keyword => lowerDescription.includes(keyword))) {
    return 'medium';
  }

  // Default based on category
  switch (category) {
    case 'technical_issues':
      return 'medium';
    case 'irregularities':
      return 'high';
    default:
      return 'low';
  }
}

// Helper function to geocode location (mock implementation)
function geocodeLocation(location: string): { lat: number; lng: number } | null {
  // Mock geocoding - in a real app, this would use a geocoding service
  const locationMap: Record<string, { lat: number; lng: number }> = {
    'new york': { lat: 40.7128, lng: -74.0060 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'miami': { lat: 25.7617, lng: -80.1918 },
    'boston': { lat: 42.3601, lng: -71.0589 },
    'washington': { lat: 38.9072, lng: -77.0369 },
    'philadelphia': { lat: 39.9526, lng: -75.1652 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'phoenix': { lat: 33.4484, lng: -112.0740 },
    'san antonio': { lat: 29.4241, lng: -98.4936 }
  };

  const lowerLocation = location.toLowerCase();
  for (const [city, coords] of Object.entries(locationMap)) {
    if (lowerLocation.includes(city)) {
      return coords;
    }
  }

  // Return random coordinates if no match found (for demo purposes)
  return {
    lat: 39.8283 + (Math.random() - 0.5) * 20, // Roughly center of US ± 10 degrees
    lng: -98.5795 + (Math.random() - 0.5) * 40 // Roughly center of US ± 20 degrees
  };
}

// GET /api/incidents - Get all incidents with optional filtering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');
    const reportedBy = url.searchParams.get('reportedBy');
    const verified = url.searchParams.get('verified');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const includeIpfs = url.searchParams.get('includeIpfs') !== 'false'; // Default to true

    let filteredIncidents = [...mockIncidents];

    // Enhance incidents with IPFS data if available and requested
    if (includeIpfs) {
      const enhancedIncidents = await Promise.allSettled(
        filteredIncidents.map(async (incident) => {
          if (incident.ipfsHash) {
            try {
              // Fetch data from IPFS
              const ipfsData = await ipfsService.getIncidentData(incident.ipfsHash);
              
              // Merge IPFS data with local data, prioritizing IPFS for core incident data
              return {
                ...incident,
                title: ipfsData.title || incident.title,
                description: ipfsData.description || incident.description,
                location: ipfsData.location || incident.location,
                coordinates: ipfsData.coordinates || incident.coordinates,
                category: ipfsData.category || incident.category,
                severity: ipfsData.severity || incident.severity,
                attachments: ipfsData.attachments || incident.attachments,
                // Keep local metadata (status, verification, etc.)
                ipfsData: ipfsData, // Include full IPFS data for reference
                dataSource: 'ipfs_enhanced'
              };
            } catch (ipfsError) {
              console.warn(`Failed to fetch IPFS data for incident ${incident.id}:`, ipfsError);
              // Return original incident with error flag
              return {
                ...incident,
                dataSource: 'local_only',
                ipfsError: 'Failed to fetch from IPFS'
              };
            }
          }
          return {
            ...incident,
            dataSource: 'local_only'
          };
        })
      );

      // Process results and handle any failures
      filteredIncidents = enhancedIncidents.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.warn(`Failed to process incident ${filteredIncidents[index].id}:`, result.reason);
          return {
            ...filteredIncidents[index],
            dataSource: 'local_only',
            processingError: 'Failed to enhance with IPFS data'
          };
        }
      });
    }

    // Apply filters
    if (category && category !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => incident.category === category);
    }

    if (status && status !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => incident.status === status);
    }

    if (severity && severity !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => incident.severity === severity);
    }

    if (reportedBy) {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.reportedBy.toLowerCase() === reportedBy.toLowerCase()
      );
    }

    if (verified !== null && verified !== undefined) {
      const isVerified = verified === 'true';
      filteredIncidents = filteredIncidents.filter(incident => incident.verified === isVerified);
    }

    // Sort by timestamp (newest first)
    filteredIncidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const paginatedIncidents = filteredIncidents.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      total: filteredIncidents.length,
      pending: filteredIncidents.filter(i => i.status === 'pending').length,
      investigating: filteredIncidents.filter(i => i.status === 'investigating').length,
      resolved: filteredIncidents.filter(i => i.status === 'resolved').length,
      dismissed: filteredIncidents.filter(i => i.status === 'dismissed').length,
      critical: filteredIncidents.filter(i => i.severity === 'critical').length,
      high: filteredIncidents.filter(i => i.severity === 'high').length,
      medium: filteredIncidents.filter(i => i.severity === 'medium').length,
      low: filteredIncidents.filter(i => i.severity === 'low').length,
      verified: filteredIncidents.filter(i => i.verified).length,
      unverified: filteredIncidents.filter(i => !i.verified).length,
      // Add IPFS-specific stats
      ipfsStored: filteredIncidents.filter(i => i.ipfsHash).length,
      ipfsEnhanced: filteredIncidents.filter(i => (i as any).dataSource === 'ipfs_enhanced').length
    };

    return NextResponse.json({
      success: true,
      incidents: paginatedIncidents,
      stats,
      pagination: {
        total: filteredIncidents.length,
        limit,
        offset,
        hasMore: offset + limit < filteredIncidents.length
      },
      ipfsInfo: {
        enabled: includeIpfs,
        totalWithIpfs: filteredIncidents.filter(i => i.ipfsHash).length,
        successfullyEnhanced: filteredIncidents.filter(i => (i as any).dataSource === 'ipfs_enhanced').length
      }
    });

  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create new incident report
export async function POST(request: NextRequest) {
  try {
    // Check if request contains FormData (file uploads) or JSON
    const contentType = request.headers.get('content-type') || '';
    let body: CreateIncidentData;
    let files: { videos: File[]; images: File[]; documents: File[] } = { videos: [], images: [], documents: [] };

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with files
      const formData = await request.formData();
      
      // Extract text fields
      body = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        location: formData.get('location') as string,
        category: formData.get('category') as CreateIncidentData['category'],
        reportedBy: formData.get('reportedBy') as string,
        severity: formData.get('severity') as CreateIncidentData['severity']
      };

      // Extract files
      formData.forEach((value, key) => {
        if (key.startsWith('video_') && value instanceof File) {
          files.videos.push(value);
        } else if (key.startsWith('image_') && value instanceof File) {
          files.images.push(value);
        } else if (key.startsWith('document_') && value instanceof File) {
          files.documents.push(value);
        }
      });
    } else {
      // Handle JSON data (backward compatibility)
      body = await request.json() as CreateIncidentData;
    }

    // Validate incident data
    const validation = validateIncidentData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Determine severity if not provided
    const severity = body.severity || determineSeverity(body.category, body.description);

    // Geocode location
    const coordinates = geocodeLocation(body.location);

    // Create new incident
    const newIncident: IncidentReport = {
      id: generateIncidentId(),
      title: body.title.trim(),
      category: body.category,
      location: body.location.trim(),
      coordinates: coordinates || undefined,
      description: body.description.trim(),
      reportedBy: body.reportedBy.toLowerCase(),
      timestamp: new Date(),
      status: 'pending',
      severity,
      verified: false,
      lastUpdated: new Date()
    };

    // Upload files to IPFS first
    const attachmentHashes: string[] = [];
    const totalFiles = files.videos.length + files.images.length + files.documents.length;
    
    if (totalFiles > 0) {
      try {
        console.log(`Uploading ${totalFiles} files to IPFS...`);
        
        // Upload videos
        for (const video of files.videos) {
          try {
            const hash = await ipfsService.uploadFile(video);
            attachmentHashes.push(hash);
            console.log(`Video uploaded to IPFS: ${hash} (${video.name})`);
          } catch (error) {
            console.error(`Failed to upload video ${video.name}:`, error);
          }
        }
        
        // Upload images
        for (const image of files.images) {
          try {
            const hash = await ipfsService.uploadFile(image);
            attachmentHashes.push(hash);
            console.log(`Image uploaded to IPFS: ${hash} (${image.name})`);
          } catch (error) {
            console.error(`Failed to upload image ${image.name}:`, error);
          }
        }
        
        // Upload documents
        for (const document of files.documents) {
          try {
            const hash = await ipfsService.uploadFile(document);
            attachmentHashes.push(hash);
            console.log(`Document uploaded to IPFS: ${hash} (${document.name})`);
          } catch (error) {
            console.error(`Failed to upload document ${document.name}:`, error);
          }
        }
        
        // Add attachment hashes to incident
        newIncident.attachments = attachmentHashes;
        
      } catch (error) {
        console.error('Error uploading files to IPFS:', error);
      }
    }

    // Upload incident data to IPFS
    let ipfsHash: string | undefined;
    try {
      const ipfsData = {
        id: newIncident.id,
        title: newIncident.title,
        category: newIncident.category,
        location: newIncident.location,
        coordinates: newIncident.coordinates,
        description: newIncident.description,
        reportedBy: newIncident.reportedBy,
        timestamp: newIncident.timestamp.toISOString(),
        severity: newIncident.severity,
        attachments: newIncident.attachments
      };

      ipfsHash = await ipfsService.uploadIncidentData(ipfsData);
      newIncident.ipfsHash = ipfsHash;
      
      console.log(`Incident uploaded to IPFS: ${ipfsHash}`);
    } catch (ipfsError) {
      console.error('IPFS upload failed:', ipfsError);
      // Continue without IPFS hash - incident will still be stored locally
      console.log('Continuing without IPFS storage due to upload failure');
    }

    // Add to mock incidents
    mockIncidents.push(newIncident);

    // Log incident creation
    console.log(`New incident reported: ${newIncident.title} (${newIncident.id}) by ${newIncident.reportedBy} at ${new Date().toISOString()}`);
    if (ipfsHash) {
      console.log(`IPFS Hash: ${ipfsHash}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Incident reported successfully',
      incident: newIncident,
      ipfsHash: ipfsHash || null,
      attachments: {
        total: attachmentHashes.length,
        hashes: attachmentHashes,
        uploaded: totalFiles > 0 ? `${attachmentHashes.length}/${totalFiles} files uploaded successfully` : 'No files uploaded'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create incident report' },
      { status: 500 }
    );
  }
}

// PUT /api/incidents - Update incident (for admin/verification)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { incidentId, status, verified, verificationNotes, assignedTo, adminAddress } = body;

    // Validate required fields
    if (!incidentId) {
      return NextResponse.json(
        { success: false, message: 'Incident ID is required' },
        { status: 400 }
      );
    }

    // Find incident
    const incidentIndex = mockIncidents.findIndex(incident => incident.id === incidentId);
    if (incidentIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Incident not found' },
        { status: 404 }
      );
    }

    const incident = mockIncidents[incidentIndex];

    // Update incident
    const updatedIncident: IncidentReport = {
      ...incident,
      ...(status && { status }),
      ...(verified !== undefined && { verified }),
      ...(verificationNotes && { verificationNotes }),
      ...(assignedTo && { assignedTo }),
      lastUpdated: new Date()
    };

    mockIncidents[incidentIndex] = updatedIncident;

    // Log update action
    console.log(`Incident updated: ${incident.title} (${incidentId}) by ${adminAddress || 'system'} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Incident updated successfully',
      incident: updatedIncident
    });

  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

// DELETE /api/incidents - Delete incident
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const incidentId = url.searchParams.get('id');

    if (!incidentId) {
      return NextResponse.json(
        { success: false, message: 'Incident ID is required' },
        { status: 400 }
      );
    }

    // Find incident
    const incidentIndex = mockIncidents.findIndex(incident => incident.id === incidentId);
    if (incidentIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Incident not found' },
        { status: 404 }
      );
    }

    const incident = mockIncidents[incidentIndex];

    // Remove incident
    mockIncidents.splice(incidentIndex, 1);

    // Log deletion action
    console.log(`Incident deleted: ${incident.title} (${incidentId}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Incident deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete incident' },
      { status: 500 }
    );
  }
}
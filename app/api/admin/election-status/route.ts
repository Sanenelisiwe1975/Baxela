import { NextRequest, NextResponse } from 'next/server';

// Mock admin addresses - in a real app, this would be managed properly
const ADMIN_ADDRESSES = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901'
];

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

// Mock election data - should be shared with the main elections route
// In a real app, this would be stored in a database
let mockElections: Election[] = [
  {
    id: 'national-2024',
    title: 'National Presidential Election 2024',
    description: 'Presidential and parliamentary elections for the national government.',
    type: 'national',
    startDate: new Date('2024-11-05T08:00:00'),
    endDate: new Date('2024-11-05T20:00:00'),
    status: 'draft',
    positions: ['President', 'Vice President', 'Senator', 'Representative'],
    totalVotes: 0,
    eligibleVoters: 50000000,
    createdBy: '0x1234567890123456789012345678901234567890',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'provincial-2024',
    title: 'Provincial Election 2024',
    description: 'Provincial government elections for governors and provincial representatives.',
    type: 'provincial',
    startDate: new Date('2024-10-15T08:00:00'),
    endDate: new Date('2024-10-15T20:00:00'),
    status: 'active',
    positions: ['Governor', 'Provincial Representative'],
    totalVotes: 125000,
    eligibleVoters: 5000000,
    createdBy: '0x1234567890123456789012345678901234567890',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'municipal-2024',
    title: 'Municipal Election 2024',
    description: 'Local municipal elections for mayors and city council members.',
    type: 'municipal',
    startDate: new Date('2024-09-20T08:00:00'),
    endDate: new Date('2024-09-20T20:00:00'),
    status: 'completed',
    positions: ['Mayor', 'City Council Member'],
    totalVotes: 75000,
    eligibleVoters: 500000,
    createdBy: '0x2345678901234567890123456789012345678901',
    createdAt: new Date('2024-02-01')
  }
];

// Helper function to check if address is admin
function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

// Helper function to find election by ID
function findElectionById(id: string): Election | undefined {
  return mockElections.find(election => election.id === id);
}

// Helper function to validate status transition
function isValidStatusTransition(currentStatus: Election['status'], newStatus: Election['status']): boolean {
  const validTransitions: Record<Election['status'], Election['status'][]> = {
    'draft': ['active', 'cancelled'],
    'active': ['completed', 'cancelled'],
    'completed': [], // Completed elections cannot be changed
    'cancelled': ['draft'] // Cancelled elections can be reset to draft
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

// PUT /api/admin/election-status - Update election status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { electionId, status, adminAddress } = body;

    // Validate required fields
    if (!electionId || !status || !adminAddress) {
      return NextResponse.json(
        { success: false, message: 'Election ID, status, and admin address are required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: Election['status'][] = ['draft', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Check admin authorization
    if (!isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Find election
    const electionIndex = mockElections.findIndex(e => e.id === electionId);
    if (electionIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Election not found' },
        { status: 404 }
      );
    }

    const election = mockElections[electionIndex];

    // Check if status transition is valid
    if (!isValidStatusTransition(election.status, status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid status transition from '${election.status}' to '${status}'` 
        },
        { status: 400 }
      );
    }

    // Additional validation for specific status changes
    if (status === 'active') {
      const now = new Date();
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);

      if (startDate > now) {
        return NextResponse.json(
          { success: false, message: 'Cannot activate election before start date' },
          { status: 400 }
        );
      }

      if (endDate < now) {
        return NextResponse.json(
          { success: false, message: 'Cannot activate election after end date' },
          { status: 400 }
        );
      }
    }

    // Update election status
    mockElections[electionIndex] = {
      ...election,
      status
    };

    // Log status change action (in a real app, this would be stored in audit logs)
    console.log(`Admin ${adminAddress} changed election ${election.title} (${electionId}) status from '${election.status}' to '${status}' at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Election status updated to '${status}' successfully`,
      election: mockElections[electionIndex]
    });

  } catch (error) {
    console.error('Error updating election status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update election status' },
      { status: 500 }
    );
  }
}

// GET /api/admin/election-status - Get election status information
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const adminAddress = url.searchParams.get('adminAddress');
    const electionId = url.searchParams.get('electionId');

    // Check admin authorization
    if (!adminAddress || !isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    if (electionId) {
      // Get specific election
      const election = findElectionById(electionId);
      if (!election) {
        return NextResponse.json(
          { success: false, message: 'Election not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        election
      });
    } else {
      // Get all elections with status summary
      const statusSummary = mockElections.reduce((acc, election) => {
        acc[election.status] = (acc[election.status] || 0) + 1;
        return acc;
      }, {} as Record<Election['status'], number>);

      return NextResponse.json({
        success: true,
        elections: mockElections,
        statusSummary,
        total: mockElections.length
      });
    }

  } catch (error) {
    console.error('Error fetching election status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch election status' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

// Mock admin addresses - in a real app, this would be managed properly
const ADMIN_ADDRESSES = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901'
];

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

// Mock candidate data - should be shared with the main candidates route
// In a real app, this would be stored in a database
let mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    party: 'Progressive Party',
    position: 'Mayor',
    bio: 'Community organizer with 10 years of experience in local government.',
    experience: 'Former city council member, community development coordinator.',
    platform: 'Focus on sustainable development, affordable housing, and public transportation.',
    walletAddress: '0x1234567890123456789012345678901234567890',
    verified: true,
    registrationDate: new Date('2024-01-15'),
    electionId: 'municipal-2024'
  },
  {
    id: '2',
    name: 'Bob Smith',
    party: 'Citizens Alliance',
    position: 'Mayor',
    bio: 'Business owner and education advocate.',
    experience: 'Small business owner for 15 years, school board member.',
    platform: 'Economic growth, education reform, and fiscal responsibility.',
    walletAddress: '0x2345678901234567890123456789012345678901',
    verified: true,
    registrationDate: new Date('2024-01-20'),
    electionId: 'municipal-2024'
  },
  {
    id: '3',
    name: 'Carol Davis',
    party: 'Democratic Reform',
    position: 'Governor',
    bio: 'Former state senator with expertise in healthcare policy.',
    experience: 'State senator for 8 years, healthcare policy advisor.',
    platform: 'Universal healthcare, climate action, and social justice.',
    walletAddress: '0x3456789012345678901234567890123456789012',
    verified: false,
    registrationDate: new Date('2024-02-01'),
    electionId: 'provincial-2024'
  }
];

// Helper function to check if address is admin
function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

// Helper function to find candidate by ID
function findCandidateById(id: string): Candidate | undefined {
  return mockCandidates.find(candidate => candidate.id === id);
}

// POST /api/admin/verify-candidate - Verify a candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, adminAddress } = body;

    // Validate required fields
    if (!candidateId || !adminAddress) {
      return NextResponse.json(
        { success: false, message: 'Candidate ID and admin address are required' },
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

    // Find candidate
    const candidateIndex = mockCandidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Candidate not found' },
        { status: 404 }
      );
    }

    const candidate = mockCandidates[candidateIndex];

    // Check if already verified
    if (candidate.verified) {
      return NextResponse.json(
        { success: false, message: 'Candidate is already verified' },
        { status: 400 }
      );
    }

    // Update candidate verification status
    mockCandidates[candidateIndex] = {
      ...candidate,
      verified: true
    };

    // Log verification action (in a real app, this would be stored in audit logs)
    console.log(`Admin ${adminAddress} verified candidate ${candidate.name} (${candidateId}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Candidate verified successfully',
      candidate: mockCandidates[candidateIndex]
    });

  } catch (error) {
    console.error('Error verifying candidate:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify candidate' },
      { status: 500 }
    );
  }
}

// GET /api/admin/verify-candidate - Get pending verifications
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const adminAddress = url.searchParams.get('adminAddress');

    // Check admin authorization
    if (!adminAddress || !isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get unverified candidates
    const pendingCandidates = mockCandidates.filter(candidate => !candidate.verified);

    return NextResponse.json({
      success: true,
      pendingCandidates,
      total: pendingCandidates.length
    });

  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
}
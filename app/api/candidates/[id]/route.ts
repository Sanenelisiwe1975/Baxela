import { NextRequest, NextResponse } from 'next/server';

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

// Mock candidate data - should match the data from the main route
// In a real app, this would be shared from a database service
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

// Helper function to find candidate by ID
function findCandidateById(id: string): Candidate | undefined {
  return mockCandidates.find(candidate => candidate.id === id);
}

// Helper function to validate update data
function validateUpdateData(data: any): string | null {
  const allowedFields = ['name', 'party', 'position', 'bio', 'experience', 'platform', 'profileImage'];
  
  // Check if at least one field is provided
  const hasValidField = allowedFields.some(field => data[field] !== undefined);
  if (!hasValidField) {
    return 'At least one field must be provided for update';
  }
  
  // Validate non-empty strings for provided fields
  for (const field of allowedFields) {
    if (data[field] !== undefined && typeof data[field] === 'string' && data[field].trim() === '') {
      return `${field} cannot be empty`;
    }
  }
  
  return null;
}

// Helper function to check authorization (basic check)
function isAuthorized(candidate: Candidate, walletAddress: string): boolean {
  return candidate.walletAddress.toLowerCase() === walletAddress.toLowerCase();
}

// GET /api/candidates/[id] - Get specific candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = findCandidateById(params.id);
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, message: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate
    });

  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}

// PUT /api/candidates/[id] - Update candidate profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { walletAddress, ...updateData } = body;
    
    // Find candidate
    const candidateIndex = mockCandidates.findIndex(c => c.id === params.id);
    if (candidateIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Candidate not found' },
        { status: 404 }
      );
    }

    const candidate = mockCandidates[candidateIndex];

    // Check authorization
    if (!walletAddress || !isAuthorized(candidate, walletAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only update your own profile' },
        { status: 403 }
      );
    }

    // Validate update data
    const validationError = validateUpdateData(updateData);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    // Update candidate
    const updatedCandidate = {
      ...candidate,
      ...updateData,
      // Ensure these fields cannot be changed via update
      id: candidate.id,
      walletAddress: candidate.walletAddress,
      verified: candidate.verified,
      registrationDate: candidate.registrationDate,
      electionId: candidate.electionId
    };

    mockCandidates[candidateIndex] = updatedCandidate;

    return NextResponse.json({
      success: true,
      message: 'Candidate profile updated successfully',
      candidate: updatedCandidate
    });

  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}

// DELETE /api/candidates/[id] - Delete candidate registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { walletAddress } = body;
    
    // Find candidate
    const candidateIndex = mockCandidates.findIndex(c => c.id === params.id);
    if (candidateIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Candidate not found' },
        { status: 404 }
      );
    }

    const candidate = mockCandidates[candidateIndex];

    // Check authorization
    if (!walletAddress || !isAuthorized(candidate, walletAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only delete your own registration' },
        { status: 403 }
      );
    }

    // Remove candidate
    mockCandidates.splice(candidateIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Candidate registration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
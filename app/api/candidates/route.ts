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

// Mock candidate data - in a real app, this would be stored in a database
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

// Helper function to validate candidate data
function validateCandidateData(data: any): string | null {
  const required = ['name', 'party', 'position', 'bio', 'experience', 'platform', 'electionId', 'walletAddress'];
  
  for (const field of required) {
    if (!data[field] || data[field].trim() === '') {
      return `${field} is required`;
    }
  }
  
  // Validate wallet address format (basic check)
  if (!/^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)) {
    return 'Invalid wallet address format';
  }
  
  return null;
}

// Helper function to check if wallet is already registered
function isWalletAlreadyRegistered(walletAddress: string, excludeId?: string): boolean {
  return mockCandidates.some(candidate => 
    candidate.walletAddress.toLowerCase() === walletAddress.toLowerCase() && 
    candidate.id !== excludeId
  );
}

// GET /api/candidates - Get all candidates
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const electionId = url.searchParams.get('electionId');
    const position = url.searchParams.get('position');
    const verified = url.searchParams.get('verified');

    let filteredCandidates = [...mockCandidates];

    // Filter by election ID
    if (electionId) {
      filteredCandidates = filteredCandidates.filter(c => c.electionId === electionId);
    }

    // Filter by position
    if (position) {
      filteredCandidates = filteredCandidates.filter(c => c.position === position);
    }

    // Filter by verification status
    if (verified !== null) {
      const isVerified = verified === 'true';
      filteredCandidates = filteredCandidates.filter(c => c.verified === isVerified);
    }

    // Sort by registration date (newest first)
    filteredCandidates.sort((a, b) => 
      new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
    );

    return NextResponse.json({
      success: true,
      candidates: filteredCandidates,
      total: filteredCandidates.length
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

// POST /api/candidates - Register new candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validationError = validateCandidateData(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    // Check if wallet is already registered
    if (isWalletAlreadyRegistered(body.walletAddress)) {
      return NextResponse.json(
        { success: false, message: 'This wallet address is already registered as a candidate' },
        { status: 400 }
      );
    }

    // Create new candidate
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: body.name.trim(),
      party: body.party.trim(),
      position: body.position.trim(),
      bio: body.bio.trim(),
      experience: body.experience.trim(),
      platform: body.platform.trim(),
      walletAddress: body.walletAddress.toLowerCase(),
      verified: false, // New candidates start unverified
      registrationDate: new Date(),
      electionId: body.electionId,
      profileImage: body.profileImage || undefined
    };

    // Add to mock database
    mockCandidates.push(newCandidate);

    return NextResponse.json({
      success: true,
      message: 'Candidate registered successfully',
      candidate: newCandidate
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering candidate:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register candidate' },
      { status: 500 }
    );
  }
}
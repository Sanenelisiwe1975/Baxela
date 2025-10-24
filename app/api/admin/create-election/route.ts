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

interface CreateElectionData {
  title: string;
  description: string;
  type: 'national' | 'provincial' | 'municipal';
  startDate: string;
  endDate: string;
  positions: string[];
  eligibleVoters: number;
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

// Helper function to generate unique election ID
function generateElectionId(title: string, type: string): string {
  const sanitized = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-4);
  return `${type}-${sanitized}-${year}-${timestamp}`;
}

// Helper function to validate election data
function validateElectionData(data: CreateElectionData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.title?.trim()) {
    errors.push('Title is required');
  } else if (data.title.length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (data.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (!data.description?.trim()) {
    errors.push('Description is required');
  } else if (data.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (data.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // Type validation
  const validTypes = ['national', 'provincial', 'municipal'];
  if (!validTypes.includes(data.type)) {
    errors.push('Invalid election type');
  }

  // Date validation
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const now = new Date();

  if (isNaN(startDate.getTime())) {
    errors.push('Invalid start date');
  } else if (startDate < now) {
    errors.push('Start date cannot be in the past');
  }

  if (isNaN(endDate.getTime())) {
    errors.push('Invalid end date');
  } else if (endDate <= startDate) {
    errors.push('End date must be after start date');
  }

  // Duration validation (minimum 1 hour, maximum 30 days)
  if (startDate && endDate) {
    const duration = endDate.getTime() - startDate.getTime();
    const oneHour = 60 * 60 * 1000;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    if (duration < oneHour) {
      errors.push('Election must be at least 1 hour long');
    } else if (duration > thirtyDays) {
      errors.push('Election cannot be longer than 30 days');
    }
  }

  // Positions validation
  if (!Array.isArray(data.positions) || data.positions.length === 0) {
    errors.push('At least one position is required');
  } else {
    const validPositions = data.positions.filter(pos => 
      typeof pos === 'string' && pos.trim().length > 0
    );
    if (validPositions.length !== data.positions.length) {
      errors.push('All positions must be non-empty strings');
    }
    if (validPositions.length > 10) {
      errors.push('Maximum 10 positions allowed');
    }
  }

  // Eligible voters validation
  if (!Number.isInteger(data.eligibleVoters) || data.eligibleVoters < 1) {
    errors.push('Eligible voters must be a positive integer');
  } else if (data.eligibleVoters > 100000000) {
    errors.push('Eligible voters cannot exceed 100 million');
  }

  // Check for duplicate titles
  const existingElection = mockElections.find(
    election => election.title.toLowerCase() === data.title.toLowerCase()
  );
  if (existingElection) {
    errors.push('An election with this title already exists');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// POST /api/admin/create-election - Create new election
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminAddress, ...electionData } = body as { adminAddress: string } & CreateElectionData;

    // Validate admin authorization
    if (!adminAddress || !isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Validate election data
    const validation = validateElectionData(electionData);
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

    // Create new election
    const newElection: Election = {
      id: generateElectionId(electionData.title, electionData.type),
      title: electionData.title.trim(),
      description: electionData.description.trim(),
      type: electionData.type,
      startDate: new Date(electionData.startDate),
      endDate: new Date(electionData.endDate),
      status: 'draft',
      positions: electionData.positions.map(pos => pos.trim()),
      totalVotes: 0,
      eligibleVoters: electionData.eligibleVoters,
      createdBy: adminAddress,
      createdAt: new Date()
    };

    // Add to mock elections array
    mockElections.push(newElection);

    // Log creation action (in a real app, this would be stored in audit logs)
    console.log(`Admin ${adminAddress} created new election: ${newElection.title} (${newElection.id}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Election created successfully',
      election: newElection
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating election:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create election' },
      { status: 500 }
    );
  }
}

// GET /api/admin/create-election - Get election creation templates/info
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

    // Return election creation templates and guidelines
    const templates = {
      national: {
        type: 'national',
        suggestedPositions: ['President', 'Vice President', 'Senator', 'Representative'],
        minEligibleVoters: 1000000,
        maxDuration: '1 day',
        description: 'National-level elections for federal government positions'
      },
      provincial: {
        type: 'provincial',
        suggestedPositions: ['Governor', 'Provincial Representative', 'Provincial Senator'],
        minEligibleVoters: 100000,
        maxDuration: '1 day',
        description: 'Provincial-level elections for regional government positions'
      },
      municipal: {
        type: 'municipal',
        suggestedPositions: ['Mayor', 'City Council Member', 'School Board Member'],
        minEligibleVoters: 1000,
        maxDuration: '1 day',
        description: 'Municipal-level elections for local government positions'
      }
    };

    const guidelines = {
      title: {
        minLength: 3,
        maxLength: 100,
        requirements: 'Must be unique and descriptive'
      },
      description: {
        minLength: 10,
        maxLength: 500,
        requirements: 'Should clearly explain the election purpose and scope'
      },
      duration: {
        minimum: '1 hour',
        maximum: '30 days',
        recommended: '12-24 hours for most elections'
      },
      positions: {
        minimum: 1,
        maximum: 10,
        requirements: 'Each position should be clearly defined'
      },
      eligibleVoters: {
        minimum: 1,
        maximum: 100000000,
        note: 'Should reflect actual eligible voter population'
      }
    };

    return NextResponse.json({
      success: true,
      templates,
      guidelines,
      existingElections: mockElections.length,
      adminInfo: {
        address: adminAddress,
        canCreate: true
      }
    });

  } catch (error) {
    console.error('Error fetching election creation info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch election creation info' },
      { status: 500 }
    );
  }
}
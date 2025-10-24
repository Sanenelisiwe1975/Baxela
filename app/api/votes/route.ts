import { NextRequest, NextResponse } from 'next/server';

// Mock database for votes
const mockVotes = new Map<string, any[]>();

// Mock function to check if election is active
const isElectionActive = (electionId: string): boolean => {
  // In production, you would check the actual election dates from the database
  const activeElections = ['election-2024-national', 'election-2024-provincial-wc'];
  return activeElections.includes(electionId);
};

// Mock function to verify voter eligibility
const isVoterEligible = (address: string, electionId: string): boolean => {
  // In production, you would check voter registration database
  // For demo, all connected wallets are eligible
  return true;
};

// GET: Fetch votes for a specific address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Get votes for this address
    const userVotes = mockVotes.get(address.toLowerCase()) || [];

    return NextResponse.json({
      success: true,
      votes: userVotes
    });

  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Cast a vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { electionId, candidateId, voterAddress } = body;

    // Validate required fields
    if (!electionId || !candidateId || !voterAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: electionId, candidateId, voterAddress' },
        { status: 400 }
      );
    }

    // Check if election is active
    if (!isElectionActive(electionId)) {
      return NextResponse.json(
        { error: 'Election is not currently active' },
        { status: 400 }
      );
    }

    // Check voter eligibility
    if (!isVoterEligible(voterAddress, electionId)) {
      return NextResponse.json(
        { error: 'Voter is not eligible for this election' },
        { status: 403 }
      );
    }

    // Check if user has already voted in this election
    const userVotes = mockVotes.get(voterAddress.toLowerCase()) || [];
    const hasVoted = userVotes.some(vote => vote.electionId === electionId);

    if (hasVoted) {
      return NextResponse.json(
        { error: 'You have already voted in this election' },
        { status: 400 }
      );
    }

    // Create the vote record
    const vote = {
      id: `vote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      electionId,
      candidateId,
      voterAddress: voterAddress.toLowerCase(),
      timestamp: Date.now(),
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
      verified: true
    };

    // Store the vote
    const updatedUserVotes = [...userVotes, vote];
    mockVotes.set(voterAddress.toLowerCase(), updatedUserVotes);

    // In production, you would:
    // 1. Record the vote on the blockchain
    // 2. Store in encrypted database
    // 3. Update vote counts
    // 4. Emit events for real-time updates

    return NextResponse.json({
      success: true,
      vote,
      message: 'Vote cast successfully'
    });

  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update vote (for admin corrections only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { voteId, adminKey } = body;

    // In production, verify admin authentication
    if (adminKey !== 'admin-demo-key') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For demo purposes, just return success
    return NextResponse.json({
      success: true,
      message: 'Vote updated successfully'
    });

  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Invalidate vote (for admin use only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const voteId = searchParams.get('voteId');
    const adminKey = searchParams.get('adminKey');

    // In production, verify admin authentication
    if (adminKey !== 'admin-demo-key') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!voteId) {
      return NextResponse.json(
        { error: 'Vote ID is required' },
        { status: 400 }
      );
    }

    // For demo purposes, just return success
    return NextResponse.json({
      success: true,
      message: 'Vote invalidated successfully'
    });

  } catch (error) {
    console.error('Error invalidating vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    const votes = await prisma.vote.findMany({
      where: { voterAddress: address.toLowerCase() },
    });

    return NextResponse.json({ success: true, votes });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { electionId, candidateId, voterAddress } = body;

    if (!electionId || !candidateId || !voterAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: electionId, candidateId, voterAddress' },
        { status: 400 }
      );
    }

    // Check election exists and is active
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 });
    }
    if (election.status !== 'active') {
      return NextResponse.json({ error: 'Election is not currently active' }, { status: 400 });
    }

    // Check candidate belongs to this election
    const candidate = await prisma.electionCandidate.findFirst({
      where: { id: candidateId, electionId },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found in this election' }, { status: 404 });
    }

    // Cast vote (unique constraint handles double-voting)
    const vote = await prisma.vote.create({
      data: {
        electionId,
        candidateId,
        voterAddress: voterAddress.toLowerCase(),
        txHash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`,
      },
    });

    // Increment election total votes
    await prisma.election.update({
      where: { id: electionId },
      data: { totalVotes: { increment: 1 } },
    });

    return NextResponse.json({ success: true, vote, message: 'Vote cast successfully' });
  } catch (error: any) {
    // Unique constraint violation = already voted
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'You have already voted in this election' }, { status: 400 });
    }
    console.error('Error casting vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

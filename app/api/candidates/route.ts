import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const electionId = url.searchParams.get('electionId');
    const position = url.searchParams.get('position');
    const verified = url.searchParams.get('verified');

    const candidates = await prisma.candidate.findMany({
      where: {
        ...(electionId ? { electionId } : {}),
        ...(position ? { position } : {}),
        ...(verified !== null ? { verified: verified === 'true' } : {}),
      },
      orderBy: { registrationDate: 'desc' },
    });

    return NextResponse.json({ success: true, candidates, total: candidates.length });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch candidates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, party, position, bio, experience, platform, electionId, walletAddress, profileImage } = body;

    const required = { name, party, position, bio, experience, platform, electionId, walletAddress };
    for (const [field, val] of Object.entries(required)) {
      if (!val?.toString().trim()) {
        return NextResponse.json({ success: false, message: `${field} is required` }, { status: 400 });
      }
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ success: false, message: 'Invalid wallet address format' }, { status: 400 });
    }

    const candidate = await prisma.candidate.create({
      data: {
        name: name.trim(),
        party: party.trim(),
        position: position.trim(),
        bio: bio.trim(),
        experience: experience.trim(),
        platform: platform.trim(),
        walletAddress: walletAddress.toLowerCase(),
        electionId,
        profileImage: profileImage || null,
        verified: false,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Candidate registered successfully', candidate },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'This wallet address is already registered as a candidate' },
        { status: 400 }
      );
    }
    console.error('Error registering candidate:', error);
    return NextResponse.json({ success: false, message: 'Failed to register candidate' }, { status: 500 });
  }
}

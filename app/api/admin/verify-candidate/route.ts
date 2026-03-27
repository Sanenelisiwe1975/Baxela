import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ADMIN_ADDRESSES = [
  '0x742d35cc6634c0532925a3b8d4c9db96c4b5da5e',
  '0xf60ab179fe7ecdc1320b375b7185302ee23c4888',
];

function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, adminAddress } = body;

    if (!candidateId || !adminAddress) {
      return NextResponse.json(
        { success: false, message: 'Candidate ID and admin address are required' },
        { status: 400 }
      );
    }

    if (!isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, message: 'Candidate verified successfully', candidate });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Candidate not found' }, { status: 404 });
    }
    console.error('Error verifying candidate:', error);
    return NextResponse.json({ success: false, message: 'Failed to verify candidate' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminAddress = new URL(request.url).searchParams.get('adminAddress');

    if (!adminAddress || !isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const pendingCandidates = await prisma.candidate.findMany({ where: { verified: false } });

    return NextResponse.json({ success: true, pendingCandidates, total: pendingCandidates.length });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch pending verifications' }, { status: 500 });
  }
}

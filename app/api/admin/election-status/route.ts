import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ADMIN_ADDRESSES = [
  '0x742d35cc6634c0532925a3b8d4c9db96c4b5da5e',
  '0xf60ab179fe7ecdc1320b375b7185302ee23c4888',
];

function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

// PUT /api/admin/election-status - Update election status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { electionId, status, adminAddress } = body;

    if (!electionId || !status || !adminAddress) {
      return NextResponse.json(
        { success: false, message: 'Election ID, status, and admin address are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['draft', 'active', 'completed', 'cancelled', 'upcoming'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    if (!isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const election = await prisma.election.update({
      where: { id: electionId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Election status updated to '${status}' successfully`,
      election,
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Election not found' }, { status: 404 });
    }
    console.error('Error updating election status:', error);
    return NextResponse.json({ success: false, message: 'Failed to update election status' }, { status: 500 });
  }
}

// GET /api/admin/election-status - Get all elections or a specific one
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const adminAddress = url.searchParams.get('adminAddress');
    const electionId = url.searchParams.get('electionId');

    if (!adminAddress || !isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    if (electionId) {
      const election = await prisma.election.findUnique({ where: { id: electionId } });
      if (!election) {
        return NextResponse.json({ success: false, message: 'Election not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, election });
    }

    const elections = await prisma.election.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, elections, total: elections.length });
  } catch (error) {
    console.error('Error fetching election status:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch election status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ADMIN_ADDRESSES = [
  '0x742d35cc6634c0532925a3b8d4c9db96c4b5da5e',
  '0xf60ab179fe7ecdc1320b375b7185302ee23c4888',
];

function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

// POST /api/admin/create-election - Create new election
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminAddress, title, description, startDate, endDate } = body;

    if (!adminAddress || !isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    if (!title?.trim() || !description?.trim() || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Title, description, start date, and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date format' }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ success: false, message: 'End date must be after start date' }, { status: 400 });
    }

    const election = await prisma.election.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        startDate: start,
        endDate: end,
        status: 'draft',
      },
    });

    console.log(`Admin ${adminAddress} created election: ${election.title} (${election.id})`);

    return NextResponse.json({ success: true, message: 'Election created successfully', election }, { status: 201 });
  } catch (error) {
    console.error('Error creating election:', error);
    return NextResponse.json({ success: false, message: 'Failed to create election' }, { status: 500 });
  }
}

// GET /api/admin/create-election - Return election creation guidelines
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const adminAddress = url.searchParams.get('adminAddress');

    if (!adminAddress || !isAdmin(adminAddress)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const count = await prisma.election.count();

    return NextResponse.json({
      success: true,
      existingElections: count,
      adminInfo: { address: adminAddress, canCreate: true },
    });
  } catch (error) {
    console.error('Error fetching election creation info:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch election creation info' }, { status: 500 });
  }
}

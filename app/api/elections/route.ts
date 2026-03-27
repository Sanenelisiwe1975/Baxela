import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const elections = await prisma.election.findMany({
      include: { candidates: true },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ success: true, elections });
  } catch (error) {
    console.error('Error fetching elections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, candidates } = body;

    if (!title || !description || !startDate || !endDate || !candidates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const election = await prisma.election.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'upcoming',
        candidates: {
          create: candidates.map((c: { name: string; party: string; description: string; image?: string }) => ({
            name: c.name,
            party: c.party,
            description: c.description,
            image: c.image,
          })),
        },
      },
      include: { candidates: true },
    });

    return NextResponse.json({ success: true, election, message: 'Election created successfully' });
  } catch (error) {
    console.error('Error creating election:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

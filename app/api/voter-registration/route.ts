import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function determineEligibleElections(state: string, country: string): string[] {
  const elections = ['national-2024'];
  if (country === 'South Africa' || country === 'United States') {
    elections.push('provincial-2024');
    if (['NY', 'CA', 'TX', 'FL', 'Western Cape', 'Gauteng'].includes(state)) {
      elections.push('municipal-2024');
    }
  }
  return elections;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get('walletAddress');
    const id = url.searchParams.get('id');

    if (id) {
      const registration = await prisma.voterRegistration.findUnique({ where: { id } });
      if (!registration) return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
      return NextResponse.json({ success: true, registration });
    }

    if (walletAddress) {
      const registration = await prisma.voterRegistration.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });
      return NextResponse.json({ success: true, registration: registration || null });
    }

    const [registrations, stats] = await Promise.all([
      prisma.voterRegistration.findMany({ orderBy: { registrationDate: 'desc' } }),
      prisma.voterRegistration.groupBy({ by: ['verificationStatus'], _count: true }),
    ]);

    return NextResponse.json({
      success: true,
      registrations,
      stats: {
        total: registrations.length,
        ...Object.fromEntries(stats.map(s => [s.verificationStatus, s._count])),
      },
    });
  } catch (error) {
    console.error('Error fetching voter registration:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch voter registration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, firstName, lastName, dateOfBirth, nationalId, email, phoneNumber, street, city, state, zipCode, country } = body;

    const required = { walletAddress, firstName, lastName, dateOfBirth, nationalId, email, phoneNumber, street, city, state, zipCode, country };
    for (const [field, val] of Object.entries(required)) {
      if (!val?.toString().trim()) {
        return NextResponse.json({ success: false, message: `${field} is required`, errors: [`${field} is required`] }, { status: 400 });
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email format', errors: ['Invalid email format'] }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ success: false, message: 'Invalid wallet address format', errors: ['Invalid wallet address format'] }, { status: 400 });
    }

    // Age check
    const birthDate = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      return NextResponse.json({ success: false, message: 'Must be at least 18 years old', errors: ['Must be at least 18 years old to register'] }, { status: 400 });
    }

    const registration = await prisma.voterRegistration.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        nationalId: nationalId.trim(),
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        verificationStatus: 'pending',
        eligibleElections: [],
      },
    });

    return NextResponse.json(
      { success: true, message: 'Registration submitted successfully', registration },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json(
        { success: false, message: `${field} already registered`, errors: [`${field} is already registered`] },
        { status: 400 }
      );
    }
    console.error('Error creating voter registration:', error);
    return NextResponse.json({ success: false, message: 'Failed to create voter registration' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationId, verificationStatus, verificationNotes } = body;

    if (!registrationId || !verificationStatus) {
      return NextResponse.json({ success: false, message: 'Registration ID and verification status are required' }, { status: 400 });
    }

    const existing = await prisma.voterRegistration.findUnique({ where: { id: registrationId } });
    if (!existing) return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });

    const registration = await prisma.voterRegistration.update({
      where: { id: registrationId },
      data: {
        verificationStatus,
        verificationNotes: verificationNotes || null,
        eligibleElections: verificationStatus === 'verified'
          ? determineEligibleElections(existing.state, existing.country)
          : [],
      },
    });

    return NextResponse.json({ success: true, message: `Registration ${verificationStatus} successfully`, registration });
  } catch (error) {
    console.error('Error updating voter registration:', error);
    return NextResponse.json({ success: false, message: 'Failed to update voter registration' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const walletAddress = url.searchParams.get('walletAddress');

    if (!id && !walletAddress) {
      return NextResponse.json({ success: false, message: 'ID or wallet address is required' }, { status: 400 });
    }

    await prisma.voterRegistration.delete({
      where: id ? { id } : { walletAddress: walletAddress!.toLowerCase() },
    });

    return NextResponse.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }
    console.error('Error deleting voter registration:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete voter registration' }, { status: 500 });
  }
}

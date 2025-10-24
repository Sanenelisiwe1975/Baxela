import { NextRequest, NextResponse } from 'next/server';

// Mock database for elections
const mockElections = [
  {
    id: 'election-2024-national',
    title: '2024 National Elections',
    description: 'National parliamentary and presidential elections for South Africa',
    startDate: '2024-05-29T06:00:00Z',
    endDate: '2024-05-29T21:00:00Z',
    status: 'active',
    totalVotes: 15847,
    candidates: [
      {
        id: 'candidate-anc-ramaphosa',
        name: 'Cyril Ramaphosa',
        party: 'African National Congress (ANC)',
        description: 'Current President of South Africa, leading the ANC ticket for re-election.',
        image: '/images/candidates/ramaphosa.jpg'
      },
      {
        id: 'candidate-da-steenhuisen',
        name: 'John Steenhuisen',
        party: 'Democratic Alliance (DA)',
        description: 'Leader of the Democratic Alliance, advocating for economic reform and good governance.',
        image: '/images/candidates/steenhuisen.jpg'
      },
      {
        id: 'candidate-eff-malema',
        name: 'Julius Malema',
        party: 'Economic Freedom Fighters (EFF)',
        description: 'Commander-in-Chief of the EFF, promoting radical economic transformation.',
        image: '/images/candidates/malema.jpg'
      },
      {
        id: 'candidate-ifp-hlabisa',
        name: 'Velenkosini Hlabisa',
        party: 'Inkatha Freedom Party (IFP)',
        description: 'President of the IFP, focusing on traditional values and provincial autonomy.',
        image: '/images/candidates/hlabisa.jpg'
      }
    ]
  },
  {
    id: 'election-2024-provincial-wc',
    title: '2024 Western Cape Provincial Election',
    description: 'Provincial legislature elections for the Western Cape',
    startDate: '2024-05-29T06:00:00Z',
    endDate: '2024-05-29T21:00:00Z',
    status: 'active',
    totalVotes: 8923,
    candidates: [
      {
        id: 'candidate-da-winde',
        name: 'Alan Winde',
        party: 'Democratic Alliance (DA)',
        description: 'Current Premier of Western Cape, seeking re-election.',
        image: '/images/candidates/winde.jpg'
      },
      {
        id: 'candidate-anc-dugmore',
        name: 'Cameron Dugmore',
        party: 'African National Congress (ANC)',
        description: 'ANC provincial leader challenging for the premiership.',
        image: '/images/candidates/dugmore.jpg'
      },
      {
        id: 'candidate-eff-shivambu',
        name: 'Floyd Shivambu',
        party: 'Economic Freedom Fighters (EFF)',
        description: 'EFF Deputy President leading the provincial campaign.',
        image: '/images/candidates/shivambu.jpg'
      }
    ]
  },
  {
    id: 'election-2024-municipal-ct',
    title: '2024 Cape Town Municipal By-Election',
    description: 'By-election for Ward 54 in Cape Town',
    startDate: '2024-06-15T07:00:00Z',
    endDate: '2024-06-15T19:00:00Z',
    status: 'upcoming',
    totalVotes: 0,
    candidates: [
      {
        id: 'candidate-da-local-1',
        name: 'Sarah Johnson',
        party: 'Democratic Alliance (DA)',
        description: 'Local community leader with 10 years of civic engagement experience.',
        image: '/images/candidates/johnson.jpg'
      },
      {
        id: 'candidate-anc-local-1',
        name: 'Thabo Mthembu',
        party: 'African National Congress (ANC)',
        description: 'Former teacher and community organizer focused on education and housing.',
        image: '/images/candidates/mthembu.jpg'
      },
      {
        id: 'candidate-good-local-1',
        name: 'Patricia Adams',
        party: 'GOOD Party',
        description: 'Healthcare worker advocating for improved public services.',
        image: '/images/candidates/adams.jpg'
      }
    ]
  }
];

// GET: Fetch all elections
export async function GET(request: NextRequest) {
  try {
    // In production, you would fetch from a real database
    // For now, return mock data
    
    return NextResponse.json({
      success: true,
      elections: mockElections
    });
  } catch (error) {
    console.error('Error fetching elections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new election (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, candidates } = body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !candidates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Verify admin authentication
    // 2. Validate the data more thoroughly
    // 3. Save to database
    // 4. Return the created election

    const newElection = {
      id: `election-${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      status: 'upcoming',
      totalVotes: 0,
      candidates: candidates.map((candidate: any, index: number) => ({
        id: `candidate-${Date.now()}-${index}`,
        ...candidate
      }))
    };

    // For demo purposes, we'll just return success
    return NextResponse.json({
      success: true,
      election: newElection,
      message: 'Election created successfully'
    });

  } catch (error) {
    console.error('Error creating election:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
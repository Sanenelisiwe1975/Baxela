import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.vote.deleteMany();
  await prisma.electionCandidate.deleteMany();
  await prisma.election.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.voterRegistration.deleteMany();
  await prisma.premiumAccess.deleteMany();

  // ── Elections ──────────────────────────────────────────────────────────────
  const national = await prisma.election.create({
    data: {
      id: 'election-2024-national',
      title: '2024 National Elections',
      description: 'National parliamentary and presidential elections for South Africa',
      startDate: new Date('2024-05-29T06:00:00Z'),
      endDate: new Date('2024-05-29T21:00:00Z'),
      status: 'active',
      totalVotes: 15847,
      candidates: {
        create: [
          {
            id: 'candidate-anc-ramaphosa',
            name: 'Cyril Ramaphosa',
            party: 'African National Congress (ANC)',
            description: 'Current President of South Africa, leading the ANC ticket for re-election.',
          },
          {
            id: 'candidate-da-steenhuisen',
            name: 'John Steenhuisen',
            party: 'Democratic Alliance (DA)',
            description: 'Leader of the Democratic Alliance, advocating for economic reform and good governance.',
          },
          {
            id: 'candidate-eff-malema',
            name: 'Julius Malema',
            party: 'Economic Freedom Fighters (EFF)',
            description: 'Commander-in-Chief of the EFF, promoting radical economic transformation.',
          },
          {
            id: 'candidate-ifp-hlabisa',
            name: 'Velenkosini Hlabisa',
            party: 'Inkatha Freedom Party (IFP)',
            description: 'President of the IFP, focusing on traditional values and provincial autonomy.',
          },
        ],
      },
    },
  });

  const provincial = await prisma.election.create({
    data: {
      id: 'election-2024-provincial-wc',
      title: '2024 Western Cape Provincial Election',
      description: 'Provincial legislature elections for the Western Cape',
      startDate: new Date('2024-05-29T06:00:00Z'),
      endDate: new Date('2024-05-29T21:00:00Z'),
      status: 'active',
      totalVotes: 8923,
      candidates: {
        create: [
          {
            id: 'candidate-da-winde',
            name: 'Alan Winde',
            party: 'Democratic Alliance (DA)',
            description: 'Current Premier of Western Cape, seeking re-election.',
          },
          {
            id: 'candidate-anc-dugmore',
            name: 'Cameron Dugmore',
            party: 'African National Congress (ANC)',
            description: 'ANC provincial leader challenging for the premiership.',
          },
          {
            id: 'candidate-eff-shivambu',
            name: 'Floyd Shivambu',
            party: 'Economic Freedom Fighters (EFF)',
            description: 'EFF Deputy President leading the provincial campaign.',
          },
        ],
      },
    },
  });

  await prisma.election.create({
    data: {
      id: 'election-2024-municipal-ct',
      title: '2024 Cape Town Municipal By-Election',
      description: 'By-election for Ward 54 in Cape Town',
      startDate: new Date('2024-06-15T07:00:00Z'),
      endDate: new Date('2024-06-15T19:00:00Z'),
      status: 'upcoming',
      totalVotes: 0,
      candidates: {
        create: [
          {
            id: 'candidate-da-local-1',
            name: 'Sarah Johnson',
            party: 'Democratic Alliance (DA)',
            description: 'Local community leader with 10 years of civic engagement experience.',
          },
          {
            id: 'candidate-anc-local-1',
            name: 'Thabo Mthembu',
            party: 'African National Congress (ANC)',
            description: 'Former teacher and community organizer focused on education and housing.',
          },
          {
            id: 'candidate-good-local-1',
            name: 'Patricia Adams',
            party: 'GOOD Party',
            description: 'Healthcare worker advocating for improved public services.',
          },
        ],
      },
    },
  });

  // ── Incidents ──────────────────────────────────────────────────────────────
  await prisma.incident.createMany({
    data: [
      {
        id: 'incident-001',
        title: 'Voting Machine Malfunction',
        category: 'technical_issues',
        location: 'Downtown Community Center, New York, NY',
        latitude: 40.7128,
        longitude: -74.006,
        description: 'Multiple voting machines not working properly, causing long delays.',
        reportedBy: '0x1234567890123456789012345678901234567890',
        status: 'investigating',
        severity: 'high',
        verified: true,
        assignedTo: 'admin-001',
        ipfsHash: 'QmTestHash1234567890abcdefghijklmnopqrstuvwxyz123',
      },
      {
        id: 'incident-002',
        title: 'Voter Intimidation Reported',
        category: 'voter_intimidation',
        location: 'Westside Polling Station, Los Angeles, CA',
        latitude: 34.0522,
        longitude: -118.2437,
        description: 'Reports of individuals intimidating voters outside polling location.',
        reportedBy: '0x2345678901234567890123456789012345678901',
        status: 'resolved',
        severity: 'critical',
        verified: true,
        verificationNotes: 'Verified by local authorities. Security increased.',
        assignedTo: 'admin-002',
        ipfsHash: 'QmTestHash5678901234abcdefghijklmnopqrstuvwxyz567',
      },
      {
        id: 'incident-003',
        title: 'Ballot Box Issues',
        category: 'irregularities',
        location: 'Central High School, Chicago, IL',
        latitude: 41.8781,
        longitude: -87.6298,
        description: 'Ballot box appeared to be tampered with.',
        reportedBy: '0x3456789012345678901234567890123456789012',
        status: 'pending',
        severity: 'high',
        verified: false,
      },
      {
        id: 'incident-004',
        title: 'Power Outage at Polling Site',
        category: 'technical_issues',
        location: 'Riverside Community Hall, Miami, FL',
        latitude: 25.7617,
        longitude: -80.1918,
        description: 'Complete power outage affecting all voting equipment.',
        reportedBy: '0x4567890123456789012345678901234567890123',
        status: 'resolved',
        severity: 'medium',
        verified: true,
        verificationNotes: 'Power restored. Backup generators deployed.',
        assignedTo: 'admin-001',
      },
      {
        id: 'incident-005',
        title: 'Suspicious Activity',
        category: 'irregularities',
        location: 'North End Library, Boston, MA',
        latitude: 42.3601,
        longitude: -71.0589,
        description: 'Unusual activity observed around ballot collection area.',
        reportedBy: '0x5678901234567890123456789012345678901234',
        status: 'investigating',
        severity: 'medium',
        verified: false,
        assignedTo: 'admin-003',
      },
    ],
  });

  // ── Registered Candidates ──────────────────────────────────────────────────
  await prisma.candidate.createMany({
    data: [
      {
        id: '1',
        name: 'Alice Johnson',
        party: 'Progressive Party',
        position: 'Mayor',
        bio: 'Community organizer with 10 years of experience in local government.',
        experience: 'Former city council member, community development coordinator.',
        platform: 'Focus on sustainable development, affordable housing, and public transportation.',
        walletAddress: '0x1234567890123456789012345678901234567890',
        verified: true,
        electionId: 'municipal-2024',
        registrationDate: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Bob Smith',
        party: 'Citizens Alliance',
        position: 'Mayor',
        bio: 'Business owner and education advocate.',
        experience: 'Small business owner for 15 years, school board member.',
        platform: 'Economic growth, education reform, and fiscal responsibility.',
        walletAddress: '0x2345678901234567890123456789012345678901',
        verified: true,
        electionId: 'municipal-2024',
        registrationDate: new Date('2024-01-20'),
      },
      {
        id: '3',
        name: 'Carol Davis',
        party: 'Democratic Reform',
        position: 'Governor',
        bio: 'Former state senator with expertise in healthcare policy.',
        experience: 'State senator for 8 years, healthcare policy advisor.',
        platform: 'Universal healthcare, climate action, and social justice.',
        walletAddress: '0x3456789012345678901234567890123456789012',
        verified: false,
        electionId: 'provincial-2024',
        registrationDate: new Date('2024-02-01'),
      },
    ],
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

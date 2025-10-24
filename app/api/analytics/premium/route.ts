import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, you'd use a real database
const premiumUsers = new Map<string, { expiresAt: number; transactionId: string }>();

// Mock analytics data
const generateMockAnalyticsData = () => ({
  overview: {
    totalIncidents: 1247,
    totalReports: 892,
    averageSeverity: 3.2,
    mostCommonCategory: 'voting_irregularity',
    trendsLastMonth: 15.3
  },
  regional: {
    'Western Cape': {
      incidentCount: 234,
      severityBreakdown: { low: 45, medium: 123, high: 56, critical: 10 },
      categoryBreakdown: { 
        voting_irregularity: 89, 
        voter_intimidation: 67, 
        ballot_stuffing: 34, 
        technical_issues: 44 
      },
      timeSeriesData: [
        { date: '2024-01-01', count: 12 },
        { date: '2024-01-02', count: 18 },
        { date: '2024-01-03', count: 15 },
        { date: '2024-01-04', count: 22 },
        { date: '2024-01-05', count: 19 }
      ]
    },
    'Gauteng': {
      incidentCount: 456,
      severityBreakdown: { low: 78, medium: 234, high: 112, critical: 32 },
      categoryBreakdown: { 
        voting_irregularity: 167, 
        voter_intimidation: 134, 
        ballot_stuffing: 89, 
        technical_issues: 66 
      },
      timeSeriesData: [
        { date: '2024-01-01', count: 23 },
        { date: '2024-01-02', count: 31 },
        { date: '2024-01-03', count: 28 },
        { date: '2024-01-04', count: 35 },
        { date: '2024-01-05', count: 29 }
      ]
    },
    'KwaZulu-Natal': {
      incidentCount: 345,
      severityBreakdown: { low: 67, medium: 178, high: 89, critical: 11 },
      categoryBreakdown: { 
        voting_irregularity: 123, 
        voter_intimidation: 98, 
        ballot_stuffing: 67, 
        technical_issues: 57 
      },
      timeSeriesData: [
        { date: '2024-01-01', count: 17 },
        { date: '2024-01-02', count: 24 },
        { date: '2024-01-03', count: 21 },
        { date: '2024-01-04', count: 28 },
        { date: '2024-01-05', count: 25 }
      ]
    }
  },
  insights: {
    hotspots: [
      {
        location: 'Cape Town Central',
        coordinates: [-33.9249, 18.4241] as [number, number],
        incidentCount: 89,
        riskLevel: 'high' as const
      },
      {
        location: 'Johannesburg CBD',
        coordinates: [-26.2041, 28.0473] as [number, number],
        incidentCount: 156,
        riskLevel: 'critical' as const
      },
      {
        location: 'Durban Central',
        coordinates: [-29.8587, 31.0218] as [number, number],
        incidentCount: 67,
        riskLevel: 'medium' as const
      },
      {
        location: 'Pretoria Central',
        coordinates: [-25.7479, 28.2293] as [number, number],
        incidentCount: 45,
        riskLevel: 'medium' as const
      }
    ],
    patterns: [
      {
        pattern: 'Peak incident times',
        description: 'Most incidents occur between 10 AM - 2 PM during voting hours',
        confidence: 0.87
      },
      {
        pattern: 'Regional correlation',
        description: 'Urban areas show 3x higher incident rates than rural areas',
        confidence: 0.92
      },
      {
        pattern: 'Seasonal trends',
        description: 'Incident rates increase by 45% during election periods',
        confidence: 0.78
      }
    ],
    recommendations: [
      {
        title: 'Increase monitoring in Johannesburg CBD',
        description: 'Deploy additional observers and technical support in high-risk areas',
        priority: 'high' as const
      },
      {
        title: 'Implement real-time alert system',
        description: 'Set up automated alerts for incident clusters and anomalies',
        priority: 'high' as const
      },
      {
        title: 'Enhance voter education',
        description: 'Focus education campaigns on areas with high technical issue reports',
        priority: 'medium' as const
      },
      {
        title: 'Optimize polling station distribution',
        description: 'Consider additional polling stations in high-density incident areas',
        priority: 'medium' as const
      }
    ]
  }
});

// GET: Check premium access
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  const premiumAccess = premiumUsers.get(address.toLowerCase());
  
  if (!premiumAccess || premiumAccess.expiresAt < Date.now()) {
    return NextResponse.json(
      { 
        error: 'Premium access required',
        premiumRequired: true,
        message: 'Subscribe to premium analytics for detailed insights'
      },
      { status: 403 }
    );
  }

  const daysRemaining = Math.ceil((premiumAccess.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    success: true,
    data: generateMockAnalyticsData(),
    premiumAccess: {
      expiresAt: premiumAccess.expiresAt,
      daysRemaining
    }
  });
}

// POST: Purchase premium access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, transactionId } = body;

    if (!address || !transactionId) {
      return NextResponse.json(
        { error: 'Address and transaction ID are required' },
        { status: 400 }
      );
    }

    // In production, you would verify the transaction on the blockchain
    // For now, we'll simulate successful payment verification
    
    // Grant 30 days of premium access
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
    
    premiumUsers.set(address.toLowerCase(), {
      expiresAt,
      transactionId
    });

    return NextResponse.json({
      success: true,
      message: 'Premium access granted for 30 days',
      expiresAt,
      daysRemaining: 30
    });

  } catch (error) {
    console.error('Premium access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
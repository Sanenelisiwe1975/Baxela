import { NextRequest, NextResponse } from 'next/server';
import { ipfsService } from '../../../../../lib/ipfs';

// GET /api/incidents/ipfs/[hash] - Retrieve incident data directly from IPFS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    
    if (!hash) {
      return NextResponse.json(
        { success: false, message: 'IPFS hash is required' },
        { status: 400 }
      );
    }

    // Validate hash format (basic check)
    if (!/^[a-zA-Z0-9]{46,59}$/.test(hash)) {
      return NextResponse.json(
        { success: false, message: 'Invalid IPFS hash format' },
        { status: 400 }
      );
    }

    try {
      const incidentData = await ipfsService.getIncidentData(hash);
      
      return NextResponse.json({
        success: true,
        data: incidentData,
        ipfsHash: hash,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${hash}`,
        retrievedAt: new Date().toISOString()
      });
    } catch (ipfsError) {
      console.error(`Failed to retrieve incident from IPFS hash ${hash}:`, ipfsError);
      
      return NextResponse.json({
        success: false,
        message: 'Failed to retrieve incident data from IPFS',
        error: ipfsError instanceof Error ? ipfsError.message : 'Unknown error',
        ipfsHash: hash
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error in IPFS retrieval endpoint:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
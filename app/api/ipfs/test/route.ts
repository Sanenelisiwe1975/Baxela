import { NextRequest, NextResponse } from 'next/server';
import { ipfsService } from '../../../../lib/ipfs';

// GET /api/ipfs/test - Test IPFS connection
export async function GET(request: NextRequest) {
  try {
    const isConnected = await ipfsService.testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'IPFS connection successful',
        provider: 'Pinata',
        status: 'connected'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'IPFS connection failed',
        provider: 'Pinata',
        status: 'disconnected'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('IPFS test error:', error);
    return NextResponse.json({
      success: false,
      message: 'IPFS test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'Pinata',
      status: 'error'
    }, { status: 500 });
  }
}

// POST /api/ipfs/test - Test IPFS upload with sample data
export async function POST(request: NextRequest) {
  try {
    const testData = {
      id: 'test-' + Date.now(),
      title: 'IPFS Test Upload',
      category: 'technical_issues',
      location: 'Test Location',
      description: 'This is a test upload to verify IPFS functionality',
      reportedBy: '0x0000000000000000000000000000000000000000',
      timestamp: new Date().toISOString(),
      severity: 'low'
    };

    const ipfsHash = await ipfsService.uploadIncidentData(testData);
    
    return NextResponse.json({
      success: true,
      message: 'IPFS upload test successful',
      ipfsHash,
      testData,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });
  } catch (error) {
    console.error('IPFS upload test error:', error);
    return NextResponse.json({
      success: false,
      message: 'IPFS upload test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
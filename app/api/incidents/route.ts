import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ipfsService } from '../../../lib/ipfs';

function determineSeverity(category: string, description: string): string {
  const lower = description.toLowerCase();
  if (['violence', 'threat', 'weapon', 'assault', 'emergency'].some(k => lower.includes(k))) return 'critical';
  if (category === 'violence' || category === 'voter_intimidation') return 'critical';
  if (['intimidation', 'malfunction', 'tampering', 'fraud'].some(k => lower.includes(k))) return 'high';
  if (['delay', 'confusion', 'technical', 'equipment'].some(k => lower.includes(k))) return 'medium';
  switch (category) {
    case 'irregularities': return 'high';
    case 'technical_issues': return 'medium';
    default: return 'low';
  }
}

function geocodeLocation(location: string) {
  const map: Record<string, [number, number]> = {
    'new york': [40.7128, -74.006],
    'los angeles': [34.0522, -118.2437],
    'chicago': [41.8781, -87.6298],
    'miami': [25.7617, -80.1918],
    'boston': [42.3601, -71.0589],
    'cape town': [-33.9249, 18.4241],
    'johannesburg': [-26.2041, 28.0473],
    'durban': [-29.8587, 31.0218],
    'pretoria': [-25.7479, 28.2293],
  };
  const lower = location.toLowerCase();
  for (const [city, coords] of Object.entries(map)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');
    const reportedBy = url.searchParams.get('reportedBy');
    const verified = url.searchParams.get('verified');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const where = {
      ...(category && category !== 'all' ? { category } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(severity && severity !== 'all' ? { severity } : {}),
      ...(reportedBy ? { reportedBy: { equals: reportedBy, mode: 'insensitive' as const } } : {}),
      ...(verified !== null && verified !== '' ? { verified: verified === 'true' } : {}),
    };

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ]);

    const stats = await prisma.incident.groupBy({
      by: ['status'],
      _count: true,
    });

    const severityStats = await prisma.incident.groupBy({
      by: ['severity'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      incidents,
      stats: {
        total,
        ...Object.fromEntries(stats.map(s => [s.status, s._count])),
        ...Object.fromEntries(severityStats.map(s => [s.severity, s._count])),
      },
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch incidents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any;
    let files = { videos: [] as File[], images: [] as File[], documents: [] as File[] };

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        location: formData.get('location') as string,
        category: formData.get('category') as string,
        reportedBy: formData.get('reportedBy') as string,
        severity: formData.get('severity') as string,
      };
      formData.forEach((value, key) => {
        if (key.startsWith('video_') && value instanceof File) files.videos.push(value);
        else if (key.startsWith('image_') && value instanceof File) files.images.push(value);
        else if (key.startsWith('document_') && value instanceof File) files.documents.push(value);
      });
    } else {
      body = await request.json();
    }

    // Validate
    if (!body.title?.trim() || body.title.length < 5)
      return NextResponse.json({ success: false, message: 'Title must be at least 5 characters' }, { status: 400 });
    if (!body.description?.trim() || body.description.length < 10)
      return NextResponse.json({ success: false, message: 'Description must be at least 10 characters' }, { status: 400 });
    if (!body.location?.trim())
      return NextResponse.json({ success: false, message: 'Location is required' }, { status: 400 });
    if (!body.reportedBy?.trim() || !/^0x[a-fA-F0-9]{40}$/.test(body.reportedBy))
      return NextResponse.json({ success: false, message: 'Valid reporter address is required' }, { status: 400 });

    const severity = body.severity || determineSeverity(body.category, body.description);
    const coords = geocodeLocation(body.location);

    // Upload files to IPFS
    const attachmentHashes: string[] = [];
    for (const file of [...files.videos, ...files.images, ...files.documents]) {
      try {
        const hash = await ipfsService.uploadFile(file);
        attachmentHashes.push(hash);
      } catch (e) {
        console.error(`Failed to upload ${file.name} to IPFS:`, e);
      }
    }

    // Upload incident metadata to IPFS
    let ipfsHash: string | undefined;
    try {
      const tempId = `incident-${Date.now()}`;
      ipfsHash = await ipfsService.uploadIncidentData({
        id: tempId,
        title: body.title.trim(),
        category: body.category,
        location: body.location.trim(),
        description: body.description.trim(),
        reportedBy: body.reportedBy.toLowerCase(),
        timestamp: new Date().toISOString(),
        severity,
        attachments: attachmentHashes,
      });
    } catch (e) {
      console.error('IPFS upload failed, continuing without it:', e);
    }

    const incident = await prisma.incident.create({
      data: {
        title: body.title.trim(),
        category: body.category,
        location: body.location.trim(),
        latitude: coords ? coords[0] : null,
        longitude: coords ? coords[1] : null,
        description: body.description.trim(),
        reportedBy: body.reportedBy.toLowerCase(),
        severity,
        status: 'pending',
        verified: false,
        ipfsHash: ipfsHash || null,
        attachments: attachmentHashes,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Incident reported successfully', incident, ipfsHash: ipfsHash || null },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ success: false, message: 'Failed to create incident report' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { incidentId, status, verified, verificationNotes, assignedTo } = body;

    if (!incidentId) {
      return NextResponse.json({ success: false, message: 'Incident ID is required' }, { status: 400 });
    }

    const incident = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        ...(status ? { status } : {}),
        ...(verified !== undefined ? { verified } : {}),
        ...(verificationNotes ? { verificationNotes } : {}),
        ...(assignedTo ? { assignedTo } : {}),
      },
    });

    return NextResponse.json({ success: true, message: 'Incident updated successfully', incident });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
    }
    console.error('Error updating incident:', error);
    return NextResponse.json({ success: false, message: 'Failed to update incident' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Incident ID is required' }, { status: 400 });

    await prisma.incident.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Incident deleted successfully' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
    }
    console.error('Error deleting incident:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete incident' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CATEGORY_MAP: Record<string, string> = {
  '1': 'irregularities',
  '2': 'intimidation',
  '3': 'bribery',
  '4': 'violence',
  '5': 'other',
};

const COMPLIANCE_CATEGORY_MAP: Record<string, string> = {
  '1': 'unauthorized_construction',
  '2': 'no_permit',
  '3': 'structural_risk',
  '4': 'illegal_land_use',
  '5': 'deviation_from_plans',
  '6': 'other',
};

function con(message: string): NextResponse {
  return new NextResponse(`CON ${message}`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

function end(message: string): NextResponse {
  return new NextResponse(`END ${message}`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Africa's Talking sends application/x-www-form-urlencoded
    const body = await request.text();
    const params = new URLSearchParams(body);
    const sessionId = params.get('sessionId') || '';
    const phoneNumber = params.get('phoneNumber') || '';
    const text = params.get('text') || '';

    const parts = text === '' ? [] : text.split('*');

    // Main menu
    if (parts.length === 0) {
      return con(
        'Welcome to Baxela\n\n1. Report Election Incident\n2. Report Building Violation\n3. My Reports\n4. Active Elections'
      );
    }

    const choice = parts[0];

    // ── Option 1: Report Incident ──────────────────────────────────────────────
    if (choice === '1') {
      if (parts.length === 1) {
        return con('Report Incident (1/3)\nEnter the location:\n(town, ward or station name)');
      }

      const location = parts[1];

      if (parts.length === 2) {
        return con(
          'Report Incident (2/3)\nSelect category:\n1. Voting Irregularity\n2. Voter Intimidation\n3. Bribery\n4. Violence\n5. Other'
        );
      }

      const catInput = parts[2];

      if (parts.length === 3) {
        return con('Report Incident (3/3)\nDescribe what happened:\n(keep it brief)');
      }

      // parts.length >= 4 — we have all data; save and confirm
      const description = parts.slice(3).join('*');
      const category = CATEGORY_MAP[catInput] || 'other';
      const title =
        description.trim().substring(0, 50) || 'USSD Report';
      const ref = sessionId.slice(-6).toUpperCase();

      await prisma.incident.create({
        data: {
          title,
          category,
          location: location.trim(),
          description: description.trim(),
          reportedBy: phoneNumber,
          severity: 'medium',
          status: 'pending',
          verified: false,
          attachments: [],
        },
      });

      return end(
        `Report submitted!\nRef: INC-${ref}\n\nYour report has been recorded\nand will be investigated.\nDial again to report more.`
      );
    }

    // ── Option 2: Report Building Violation ───────────────────────────────────
    if (choice === '2') {
      if (parts.length === 1) {
        return con('Building Violation (1/3)\nEnter the location:\n(address, erf number or area)');
      }

      const location = parts[1];

      if (parts.length === 2) {
        return con(
          'Building Violation (2/3)\nSelect violation type:\n1. Unauthorized Construction\n2. No Permit Displayed\n3. Structural Risk\n4. Illegal Land Use\n5. Deviation from Plans\n6. Other'
        );
      }

      const catInput = parts[2];

      if (parts.length === 3) {
        return con('Building Violation (3/3)\nDescribe the violation:\n(keep it brief)');
      }

      const description = parts.slice(3).join('*');
      const category = COMPLIANCE_CATEGORY_MAP[catInput] || 'other';
      const title = description.trim().substring(0, 50) || 'Building Violation Report';
      const ref = sessionId.slice(-6).toUpperCase();

      await prisma.incident.create({
        data: {
          title,
          category,
          location: location.trim(),
          description: description.trim(),
          reportedBy: phoneNumber,
          severity: category === 'structural_risk' ? 'critical' : 'medium',
          status: 'pending',
          verified: false,
          reportType: 'building_compliance',
          attachments: [],
        },
      });

      return end(
        `Violation reported!\nRef: BLD-${ref}\n\nYour report has been recorded\nand will be investigated.\nDial again to report more.`
      );
    }

    // ── Option 3: My Reports ───────────────────────────────────────────────────
    if (choice === '3') {
      const incidents = await prisma.incident.findMany({
        where: { reportedBy: phoneNumber },
        orderBy: { timestamp: 'desc' },
        take: 3,
        select: { title: true, status: true },
      });

      if (incidents.length === 0) {
        return con('My Reports:\nNo reports found.\n\n0. Back');
      }

      const lines = incidents
        .map((inc, i) => `${i + 1}. ${inc.title.substring(0, 20)} - ${inc.status}`)
        .join('\n');

      return con(`My Reports:\n${lines}\n\n0. Back`);
    }

    // ── Option 4: Active Elections ─────────────────────────────────────────────
    if (choice === '4') {
      const elections = await prisma.election.findMany({
        where: { status: 'active' },
        orderBy: { startDate: 'asc' },
        take: 5,
        select: { title: true },
      });

      if (elections.length === 0) {
        return con('Active Elections:\nNo active elections.\n\n0. Back');
      }

      const lines = elections
        .map((el, i) => `${i + 1}. ${el.title.substring(0, 25)}`)
        .join('\n');

      return con(`Active Elections:\n${lines}\n\n0. Back`);
    }

    // ── Fallback ───────────────────────────────────────────────────────────────
    return con(
      'Welcome to Baxela\n\n1. Report Election Incident\n2. Report Building Violation\n3. My Reports\n4. Active Elections'
    );
  } catch (error) {
    console.error('USSD handler error:', error);
    return end('Service temporarily unavailable.\nPlease try again later.');
  }
}

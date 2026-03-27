import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CATEGORY_MAP: Record<string, string> = {
  '1': 'irregularities',
  '2': 'intimidation',
  '3': 'bribery',
  '4': 'violence',
  '5': 'other',
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
        'Welcome to Baxela\nElection Incident Reporting\n\n1. Report Incident\n2. My Reports\n3. Active Elections'
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

    // ── Option 2: My Reports ───────────────────────────────────────────────────
    if (choice === '2') {
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

    // ── Option 3: Active Elections ─────────────────────────────────────────────
    if (choice === '3') {
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
      'Welcome to Baxela\nElection Incident Reporting\n\n1. Report Incident\n2. My Reports\n3. Active Elections'
    );
  } catch (error) {
    console.error('USSD handler error:', error);
    return end('Service temporarily unavailable.\nPlease try again later.');
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ELECTION_CAT: Record<string, string> = {
  '1': 'irregularities', '2': 'intimidation', '3': 'bribery', '4': 'violence', '5': 'other',
};
const COMPLIANCE_CAT: Record<string, string> = {
  '1': 'unauthorized_construction', '2': 'no_permit', '3': 'structural_risk',
  '4': 'illegal_land_use', '5': 'deviation_from_plans', '6': 'other',
};
const POLICE_CAT: Record<string, string> = {
  '1': 'brutality', '2': 'corruption_bribery', '3': 'unlawful_arrest',
  '4': 'theft_property_damage', '5': 'dereliction_of_duty', '6': 'racial_profiling', '7': 'other',
};
const SOCIAL_CAT: Record<string, string> = {
  '1': 'child_abuse', '2': 'elderly_abuse', '3': 'domestic_violence',
  '4': 'social_worker_misconduct', '5': 'fraudulent_grant', '6': 'child_abandonment', '7': 'other',
};
const SERVICE_CAT: Record<string, string> = {
  '1': 'water_outage', '2': 'no_electricity', '3': 'roads_potholes',
  '4': 'refuse_not_collected', '5': 'sewage_drainage', '6': 'public_lighting', '7': 'housing_rdp', '8': 'other',
};

function con(message: string): NextResponse {
  return new NextResponse(`CON ${message}`, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}
function end(message: string): NextResponse {
  return new NextResponse(`END ${message}`, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}

const MAIN_MENU = 'Welcome to Baxela\n\n1. Election Incident\n2. Building Violation\n3. Police Misconduct\n4. Social Services\n5. Service Delivery\n6. My Reports\n7. Active Elections';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const sessionId = params.get('sessionId') || '';
    const phoneNumber = params.get('phoneNumber') || '';
    const text = params.get('text') || '';
    const parts = text === '' ? [] : text.split('*');

    if (parts.length === 0) return con(MAIN_MENU);

    const choice = parts[0];
    const ref = sessionId.slice(-6).toUpperCase();

    // Generic 3-step report flow
    async function handleReport(
      typeName: string,
      catMap: Record<string, string>,
      catMenu: string,
      reportType: string,
      refPrefix: string,
      severityFn: (cat: string) => string
    ): Promise<NextResponse> {
      if (parts.length === 1) return con(`${typeName} (1/3)\nEnter the location:`);
      const location = parts[1];
      if (parts.length === 2) return con(`${typeName} (2/3)\nSelect category:\n${catMenu}`);
      const catInput = parts[2];
      if (parts.length === 3) return con(`${typeName} (3/3)\nDescribe what happened:\n(keep it brief)`);
      const description = parts.slice(3).join('*');
      const category = catMap[catInput] || 'other';
      const title = description.trim().substring(0, 50) || `${typeName} Report`;
      await prisma.incident.create({
        data: {
          title, category, location: location.trim(), description: description.trim(),
          reportedBy: phoneNumber, severity: severityFn(category),
          status: 'pending', verified: false, reportType, attachments: [],
        },
      });
      return end(`Report submitted!\nRef: ${refPrefix}-${ref}\n\nRecorded and will be reviewed.\nDial again to report more.`);
    }

    // ── Option 1: Election Incident ──────────────────────────────────────────
    if (choice === '1') {
      return handleReport('Election Incident', ELECTION_CAT,
        '1. Voting Irregularity\n2. Voter Intimidation\n3. Bribery\n4. Violence\n5. Other',
        'election', 'INC',
        () => 'medium');
    }

    // ── Option 2: Building Violation ─────────────────────────────────────────
    if (choice === '2') {
      return handleReport('Building Violation', COMPLIANCE_CAT,
        '1. Unauthorized Construction\n2. No Permit\n3. Structural Risk\n4. Illegal Land Use\n5. Deviation from Plans\n6. Other',
        'building_compliance', 'BLD',
        (cat) => cat === 'structural_risk' ? 'critical' : 'medium');
    }

    // ── Option 3: Police Misconduct ──────────────────────────────────────────
    if (choice === '3') {
      return handleReport('Police Misconduct', POLICE_CAT,
        '1. Brutality\n2. Corruption/Bribery\n3. Unlawful Arrest\n4. Theft/Damage\n5. Dereliction\n6. Racial Profiling\n7. Other',
        'police', 'POL',
        (cat) => ['brutality', 'unlawful_arrest'].includes(cat) ? 'critical' : 'high');
    }

    // ── Option 4: Social Services ────────────────────────────────────────────
    if (choice === '4') {
      return handleReport('Social Services', SOCIAL_CAT,
        '1. Child Abuse/Neglect\n2. Elderly Abuse\n3. Domestic Violence\n4. SW Misconduct\n5. Fraudulent Grant\n6. Child Abandonment\n7. Other',
        'social_services', 'SOC',
        (cat) => ['child_abuse', 'child_abandonment', 'domestic_violence'].includes(cat) ? 'critical' : 'high');
    }

    // ── Option 5: Service Delivery ───────────────────────────────────────────
    if (choice === '5') {
      return handleReport('Service Delivery', SERVICE_CAT,
        '1. Water Outage\n2. No Electricity\n3. Roads/Potholes\n4. Refuse\n5. Sewage\n6. Lighting\n7. Housing/RDP\n8. Other',
        'service_delivery', 'SVC',
        (cat) => ['water_outage', 'sewage_drainage'].includes(cat) ? 'high' : 'medium');
    }

    // ── Option 6: My Reports ─────────────────────────────────────────────────
    if (choice === '6') {
      const incidents = await prisma.incident.findMany({
        where: { reportedBy: phoneNumber }, orderBy: { timestamp: 'desc' }, take: 3,
        select: { title: true, status: true },
      });
      if (incidents.length === 0) return con('My Reports:\nNo reports found.\n\n0. Back');
      const lines = incidents.map((inc, i) => `${i + 1}. ${inc.title.substring(0, 20)} - ${inc.status}`).join('\n');
      return con(`My Reports:\n${lines}\n\n0. Back`);
    }

    // ── Option 7: Active Elections ───────────────────────────────────────────
    if (choice === '7') {
      const elections = await prisma.election.findMany({
        where: { status: 'active' }, orderBy: { startDate: 'asc' }, take: 5,
        select: { title: true },
      });
      if (elections.length === 0) return con('Active Elections:\nNo active elections.\n\n0. Back');
      const lines = elections.map((el, i) => `${i + 1}. ${el.title.substring(0, 25)}`).join('\n');
      return con(`Active Elections:\n${lines}\n\n0. Back`);
    }

    return con(MAIN_MENU);
  } catch (error) {
    console.error('USSD handler error:', error);
    return end('Service temporarily unavailable.\nPlease try again later.');
  }
}

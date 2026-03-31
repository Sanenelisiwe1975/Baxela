/**
 * Department notification service.
 * Fires an email to the relevant government department whenever a report is submitted.
 * Uses Resend (https://resend.com) — set RESEND_API_KEY in your environment.
 *
 * All sends are fire-and-forget: a delivery failure never blocks or breaks the report submission.
 */

interface IncidentPayload {
  id: string;
  title: string;
  category: string;
  reportType: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  severity: string;
  ipfsHash?: string | null;
  // Police
  badgeNumber?: string | null;
  stationName?: string | null;
  caseReference?: string | null;
  // Building
  erfNumber?: string | null;
  permitNumber?: string | null;
  constructionType?: string | null;
  // Service delivery / social
  wardNumber?: string | null;
  municipalTicket?: string | null;
}


const DEPARTMENT_EMAILS: Record<string, string> = {
  police:            process.env.DEPT_EMAIL_POLICE            || 'complaints@ipid.gov.za',
  social_services:   process.env.DEPT_EMAIL_SOCIAL_SERVICES   || 'info@dsd.gov.za',
  building_compliance: process.env.DEPT_EMAIL_BUILDING        || 'info@nhbrc.org.za',
  service_delivery:  process.env.DEPT_EMAIL_SERVICE_DELIVERY  || 'info@cogta.gov.za',
  election:          process.env.DEPT_EMAIL_ELECTION          || 'complaints@elections.org.za',
};

const DEPARTMENT_NAMES: Record<string, string> = {
  police:              'Independent Police Investigative Directorate (IPID)',
  social_services:     'Department of Social Development (DSD)',
  building_compliance: 'National Home Builders Registration Council (NHBRC)',
  service_delivery:    'Department of Cooperative Governance and Traditional Affairs (CoGTA)',
  election:            'Electoral Commission of South Africa (IEC)',
};

const FROM_ADDRESS = process.env.NOTIFICATION_FROM_EMAIL || 'reports@baxela.vercel.app';
const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://baxela.vercel.app';


function severityLabel(severity: string): string {
  return severity === 'critical' ? '🔴 CRITICAL' :
         severity === 'high'     ? '🟠 HIGH' :
         severity === 'medium'   ? '🟡 MEDIUM' : '🟢 LOW';
}

function buildExtraFields(incident: IncidentPayload): string {
  const lines: string[] = [];
  if (incident.badgeNumber)    lines.push(`• Officer Badge Number: ${incident.badgeNumber}`);
  if (incident.stationName)    lines.push(`• Police Station: ${incident.stationName}`);
  if (incident.caseReference)  lines.push(`• Case Reference: ${incident.caseReference}`);
  if (incident.erfNumber)      lines.push(`• Erf / Property Number: ${incident.erfNumber}`);
  if (incident.permitNumber)   lines.push(`• Permit Number: ${incident.permitNumber}`);
  if (incident.constructionType) lines.push(`• Construction Type: ${incident.constructionType}`);
  if (incident.wardNumber)     lines.push(`• Ward Number: ${incident.wardNumber}`);
  if (incident.municipalTicket) lines.push(`• Municipal Ticket Ref: ${incident.municipalTicket}`);
  return lines.length ? `\n${lines.join('\n')}` : '';
}

function buildEmailBody(incident: IncidentPayload, deptName: string): string {
  const mapsLink = incident.latitude && incident.longitude
    ? `https://www.openstreetmap.org/?mlat=${incident.latitude}&mlon=${incident.longitude}&zoom=16`
    : null;

  const ipfsLink = incident.ipfsHash
    ? `https://gateway.pinata.cloud/ipfs/${incident.ipfsHash}`
    : null;

  const adminLink = `${PLATFORM_URL}/admin`;

  return `
Dear ${deptName},

A new public report has been submitted via the Baxela Community Accountability Platform and has been automatically forwarded to your department for review and action.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REPORT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reference ID : ${incident.id}
Severity     : ${severityLabel(incident.severity)}
Category     : ${incident.category.replace(/_/g, ' ').toUpperCase()}
Title        : ${incident.title}
Location     : ${incident.location}${buildExtraFields(incident)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${incident.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${mapsLink  ? `• Map Location  : ${mapsLink}\n` : ''}${ipfsLink ? `• Evidence (IPFS): ${ipfsLink}\n` : ''}• Admin Dashboard: ${adminLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This report was submitted anonymously by a citizen and has been preserved on the IPFS decentralised network. The evidence cannot be altered or deleted.

If you believe this report has been sent to your department in error, please forward it to the relevant authority.

— Baxela Accountability Platform
   ${PLATFORM_URL}
`.trim();
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[notifyDepartment] RESEND_API_KEY not set — skipping email notification.');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error ${response.status}: ${err}`);
  }
}


export async function notifyDepartment(incident: IncidentPayload): Promise<void> {
  const recipientEmail = DEPARTMENT_EMAILS[incident.reportType];
  const deptName       = DEPARTMENT_NAMES[incident.reportType];

  if (!recipientEmail || !deptName) {
    console.warn(`[notifyDepartment] No routing configured for reportType: ${incident.reportType}`);
    return;
  }

  const urgencyPrefix = ['critical', 'high'].includes(incident.severity) ? '[URGENT] ' : '';
  const subject = `${urgencyPrefix}Baxela Report #${incident.id.slice(0, 8)} — ${incident.category.replace(/_/g, ' ')} — ${incident.location}`;
  const body    = buildEmailBody(incident, deptName);

  try {
    await sendEmail(recipientEmail, subject, body);
    console.log(`[notifyDepartment] Notified ${deptName} at ${recipientEmail} for incident ${incident.id}`);
  } catch (err) {
    // Never let a notification failure surface to the citizen or break the submission
    console.error(`[notifyDepartment] Failed to notify ${deptName}:`, err);
  }
}

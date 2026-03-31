# Baxela — Community Accountability Platform

Baxela is a Web3-powered platform that enables citizens to report, track, and escalate governance failures across four critical domains: building compliance, police misconduct, social services failures, and municipal service delivery. Reports are stored permanently on IPFS, automatically forwarded to the relevant government department, and visible on a public map — all without requiring an account, wallet, or technical knowledge.

In addition to accountability reporting, Baxela includes a transparent polling and voting engine available to any organisation, student body, community group, or company that needs a trustworthy, tamper-proof decision-making tool.

**Live:** [baxela.vercel.app](https://baxela.vercel.app)

---

## Core Features

### Building Compliance Monitoring
- Report unauthorized construction, missing permits, structural risks, illegal land use, and deviations from approved plans
- Captures erf/property number, permit number, and construction type alongside GPS coordinates and photo evidence
- Reports automatically forwarded to NHBRC (info@nhbrc.org.za) on submission
- **Workflow:** pending → investigating → notice issued → enforcement action → resolved

### Police Misconduct Reporting
- Report brutality, corruption/bribery, unlawful arrests, theft, dereliction of duty, and racial profiling
- Captures badge number, station name, and case reference number
- Reports automatically forwarded to IPID (complaints@ipid.gov.za) on submission
- **Workflow:** pending → investigating → referred to IPID → resolved/dismissed

### Social Services Accountability
- Report child abuse/neglect, elderly abuse, domestic violence, social worker misconduct, fraudulent grants, and child abandonment
- Captures ward number and case reference for departmental follow-up
- Reports automatically forwarded to DSD (info@dsd.gov.za) on submission
- **Workflow:** pending → investigating → referred to department → resolved/dismissed

### Municipal Service Delivery
- Report water outages, electricity failures, potholes, refuse not collected, sewage/drainage issues, broken public lighting, and RDP/housing issues
- Captures ward number and municipal ticket reference
- Reports automatically forwarded to CoGTA (info@cogta.gov.za) on submission
- **Workflow:** pending → acknowledged → in progress → resolved/dismissed

### Election Integrity Reporting
- Report voter intimidation, bribery, ballot irregularities, and violence during election periods
- USSD accessible when phone data may be unavailable at voting stations
- Reports automatically forwarded to the IEC (complaints@elections.org.za) on submission
- **Workflow:** pending → investigating → resolved/dismissed

---

## Polls & Voting

Baxela includes a built-in transparent voting engine — a tool for any group that needs verifiable, tamper-proof voting without paying for dedicated software or trusting a manual count.

**Who uses it:**
- Student Representative Councils (SRCs) and student governance bodies
- Community organisations, ward committees, and civic bodies
- Companies for staff polls, shareholder resolutions, or board votes
- Trade unions for member ballots
- Body corporates, stokvels, faith communities, and NGOs

**How it works:**
- An administrator creates a named election or poll with a start/end date and a list of candidates or options
- Participants vote via web or USSD — one vote per Citizen ID per poll
- Results are visible in real time and preserved permanently
- The same IPFS immutability that protects incident evidence protects voting results

---

## Department Notification

Every submitted report is automatically emailed to its designated government department the moment it is saved. The email includes the full report details, GPS map link, and a permanent IPFS evidence link.

| Report Type | Notified Department | Default Address |
|---|---|---|
| Police Misconduct | IPID | complaints@ipid.gov.za |
| Social Services | DSD | info@dsd.gov.za |
| Building Compliance | NHBRC | info@nhbrc.org.za |
| Service Delivery | CoGTA | info@cogta.gov.za |
| Election Integrity | IEC | complaints@elections.org.za |

Recipient addresses can be overridden per department via environment variables (e.g. to route to a specific provincial office). Notifications use [Resend](https://resend.com) — see [Environment Variables](#environment-variables).

---

## Shared Infrastructure

- **GPS Geolocation** — Auto-detect location when reporting. Coordinates stored with every incident and displayed on the map.
- **Interactive Map** — All incidents as colour-coded pins (orange=pending, blue=verified, green=resolved).
- **IPFS Evidence Storage** — All attachments and report metadata uploaded to IPFS via Pinata. Permanent, immutable, publicly accessible.
- **Analytics** — Premium analytics dashboard with regional hotspots and incident patterns.
- **Admin Dashboard** — Manage all 5 report types with dedicated tabs, officer assignment, status transitions, and verification notes.
- **USSD Reporting** — Dial `*384*1#` on any basic phone to submit a report. No data, no smartphone, no account required.
- **Smart Wallet Sign-in** — Optional Coinbase Smart Wallet sign-in via passkey/biometrics. No seed phrase needed.
- **Anonymous Citizen ID** — Every visitor gets an auto-generated Citizen ID. No account required for anything.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Maps | Leaflet, OpenStreetMap, Nominatim (reverse geocoding) |
| Blockchain | Base chain (Wagmi, Viem), Coinbase Smart Wallet |
| Storage | PostgreSQL (Prisma ORM), IPFS (Pinata) |
| Email Notifications | Resend |
| USSD | Africa's Talking |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (free at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com))
- Resend account (free at [resend.com](https://resend.com)) for department notifications

### Installation

```bash
git clone https://github.com/Sanenelisiwe1975/Baxela.git
cd Baxela
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_PINATA_API_KEY` | Pinata API key for IPFS uploads | Yes |
| `NEXT_PUBLIC_PINATA_SECRET_API_KEY` | Pinata secret key | Yes |
| `RESEND_API_KEY` | Resend API key for department email notifications | Yes |
| `NOTIFICATION_FROM_EMAIL` | Sender address (must be a verified Resend domain) | Yes |
| `NEXT_PUBLIC_PLATFORM_URL` | Your deployment URL | Yes |
| `NEXT_PUBLIC_CDP_API_KEY` | Coinbase CDP key for Smart Wallet sign-in | Optional |
| `NEXT_PUBLIC_ONCHAINKIT_API_KEY` | OnchainKit API key | Optional |
| `DEPT_EMAIL_POLICE` | Override IPID recipient (default: complaints@ipid.gov.za) | Optional |
| `DEPT_EMAIL_SOCIAL_SERVICES` | Override DSD recipient (default: info@dsd.gov.za) | Optional |
| `DEPT_EMAIL_BUILDING` | Override NHBRC recipient (default: info@nhbrc.org.za) | Optional |
| `DEPT_EMAIL_SERVICE_DELIVERY` | Override CoGTA recipient (default: info@cogta.gov.za) | Optional |
| `DEPT_EMAIL_ELECTION` | Override IEC recipient (default: complaints@elections.org.za) | Optional |

### Database Setup

```bash
# Push schema to your database
npm run db:push

# Seed with demo data
npm run db:seed
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Commands

| Command | Description |
|---|---|
| `npm run db:push` | Push schema changes to the database |
| `npm run db:seed` | Seed demo data (elections, candidates, incidents) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:generate` | Regenerate Prisma client after schema changes |

---

## Project Structure

```
├── app/
│   ├── page.tsx              # Home — accountability reporting (4 types + election)
│   ├── voting/               # Polls & voting (SRCs, orgs, communities, companies)
│   ├── candidates/           # Candidate listing & registration
│   ├── register/             # Voter registration
│   ├── incidents/            # Incident viewer with map
│   ├── analytics/            # Premium analytics dashboard
│   ├── admin/                # Admin dashboard (all report types + elections)
│   └── api/
│       ├── incidents/        # Incident CRUD + IPFS upload + department notification
│       ├── elections/        # Elections API
│       ├── votes/            # Voting API
│       ├── candidates/       # Candidates API
│       ├── voter-registration/
│       ├── analytics/
│       └── ussd/             # Africa's Talking USSD handler
├── components/
│   ├── Navigation.tsx        # Top navigation bar
│   ├── SmartWalletButton.tsx # Sign in / sign out
│   ├── IncidentMap.tsx       # Leaflet map component
│   └── BasePay.tsx           # Payment component (premium analytics)
├── lib/
│   ├── baseAccount.ts        # Identity hook (Citizen ID + Smart Wallet)
│   ├── db.ts                 # Prisma client singleton
│   ├── ipfs.ts               # IPFS / Pinata service
│   └── notifyDepartment.ts   # Department email routing and notification
└── prisma/
    ├── schema.prisma         # Database schema
    └── seed.ts               # Demo data seed script
```

---

## Admin — Incident Workflows

### Building Compliance

| Action | Status transition | Description |
|---|---|---|
| Verify | pending → investigating | Confirms the violation is credible |
| Issue Notice | investigating → notice_issued | Formal compliance notice issued to property owner |
| Enforce | notice_issued → enforcement_action | Escalates to active enforcement |
| Resolve | any → resolved | Violation remediated |
| Dismiss | any → dismissed | False report or duplicate |

### Police Misconduct

| Action | Status transition | Description |
|---|---|---|
| Investigate | pending → investigating | Opens formal investigation |
| Refer to IPID | investigating → referred_to_ipid | Escalates to Independent Police Investigative Directorate |
| Resolve | any → resolved | Resolved |
| Dismiss | any → dismissed | Unfounded or duplicate |

### Social Services

| Action | Status transition | Description |
|---|---|---|
| Investigate | pending → investigating | Opens formal investigation |
| Refer to Dept | investigating → referred_to_department | Refers to relevant government department |
| Resolve | any → resolved | Resolved |
| Dismiss | any → dismissed | Unfounded or duplicate |

### Service Delivery

| Action | Status transition | Description |
|---|---|---|
| Acknowledge | pending → acknowledged | Municipality acknowledges the complaint |
| In Progress | acknowledged → in_progress | Active repair/resolution underway |
| Resolve | any → resolved | Resolved |
| Dismiss | any → dismissed | Unfounded or duplicate |

### Election Integrity

| Action | Status transition | Description |
|---|---|---|
| Verify | pending → investigating | Confirms the report is credible |
| Resolve | any → resolved | Resolved |
| Dismiss | any → dismissed | False report or duplicate |

Admin access is restricted to whitelisted wallet/Citizen ID addresses defined in `app/admin/page.tsx`.

---

## USSD Integration

Citizens without smartphones or internet can report via USSD on any basic mobile phone:

```
Dial *384*1#

1. Building Compliance   → Enter location → Select category → Describe → Submitted (Ref: BLD-XXXXXX)
2. Police Misconduct     → Enter location → Select category → Describe → Submitted (Ref: POL-XXXXXX)
3. Social Services       → Enter location → Select category → Describe → Submitted (Ref: SOC-XXXXXX)
4. Service Delivery      → Enter location → Select category → Describe → Submitted (Ref: SVC-XXXXXX)
5. Election Integrity    → Enter location → Select category → Describe → Submitted (Ref: INC-XXXXXX)
6. View Report Status    → Shows your last 3 submitted reports with current status
7. Emergency Contacts    → Key department numbers
```

Powered by **Africa's Talking**. USSD callback URL: `https://baxela.vercel.app/api/ussd`

---

## Report Type — Extra Fields

Each report type captures structured fields beyond title, location, category, and description:

| Report Type | Extra Fields |
|---|---|
| Building Compliance | Erf/Property Number, Permit Number, Construction Type |
| Police Misconduct | Badge Number, Station Name, Case Reference |
| Social Services | Ward Number, Case Reference |
| Service Delivery | Ward Number, Municipal Ticket Reference |

All types support GPS coordinates (auto-detected) and file evidence (photos, videos, documents up to 50MB) uploaded to IPFS.

---

## How Identity Works

1. **Anonymous (default)** — A unique Citizen ID is generated in the browser on first visit. No sign-up, no account. Immediately usable for reporting, voting, and browsing.
2. **Signed in** — Optional Coinbase Smart Wallet sign-in via Face ID / fingerprint / passkey. Wallet address becomes a persistent identity across devices. No seed phrase, no downloads.
3. **USSD** — Basic phone users are identified by phone number. No app, no internet, no wallet needed.

---

## Deployment

```bash
npx vercel --prod
```

Set the required environment variables in your Vercel project settings before deploying. After first deployment, run `npm run db:push` against your production database to create the schema.

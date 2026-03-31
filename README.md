# Baxela — Democracy, Integrity & Community Accountability Platform

Baxela is a Web3-powered platform for transparent governance. Citizens can report election irregularities, building compliance violations, police misconduct, social services failures, and service delivery issues — participate in elections, and track incident status — all without needing a crypto wallet or any blockchain knowledge.

**Live:** [baxela.vercel.app](https://baxela.vercel.app)

---

## Features

### Election Integrity
- **Election Incident Reporting** — Report voting irregularities, voter intimidation, bribery, or violence with title, location, category, and file attachments (video, images, documents up to 50MB). Evidence is stored on IPFS via Pinata for permanent, decentralized storage.
- **Voting** — Browse active elections and cast votes. No sign-in required.
- **Candidate Registration** — Register as a candidate with full profile and platform details.
- **Voter Registration** — Submit voter registration with identity verification.

### Building Compliance Monitoring
- **Building Violation Reporting** — Report unauthorized construction, missing permits, structural risks, illegal land use, and deviations from approved plans.
- **Compliance Fields** — Reports capture erf/property number, permit number, and construction type alongside GPS coordinates and photographic evidence.
- **Enforcement Workflow** — pending → investigating → notice issued → enforcement action → resolved.

### Police Misconduct Reporting
- **Police Misconduct Reporting** — Report brutality, corruption/bribery, unlawful arrests, theft or property damage, dereliction of duty, and racial profiling.
- **Police Fields** — Reports capture badge number, station name, and case reference number.
- **IPID Referral Workflow** — pending → investigating → referred to IPID → resolved/dismissed.

### Social Services Accountability
- **Social Services Reporting** — Report child abuse/neglect, elderly abuse, domestic violence, social worker misconduct, fraudulent grants, and child abandonment.
- **Social Fields** — Reports capture ward number and case reference for departmental follow-up.
- **Department Referral Workflow** — pending → investigating → referred to department → resolved/dismissed.

### Service Delivery Complaints
- **Service Delivery Reporting** — Report water outages, electricity failures, potholes/roads, refuse not collected, sewage/drainage issues, broken public lighting, and RDP/housing issues.
- **Service Fields** — Reports capture ward number and municipal ticket reference.
- **Municipal Workflow** — pending → acknowledged → in progress → resolved/dismissed.

### Shared Infrastructure
- **GPS Geolocation** — Auto-detect your location when reporting. Coordinates are stored with every incident and displayed on an interactive map.
- **Interactive Map** — View all incidents as colour-coded pins on a live map (orange=pending, blue=verified, green=resolved).
- **Analytics** — Premium analytics dashboard with regional incident hotspots and patterns.
- **Admin Dashboard** — Manage elections, verify candidates, and oversee all 5 report types with dedicated tabs, officer assignment, and notes.
- **USSD Reporting** — Citizens without smartphones can report any incident type by dialing `*384*1#` on any basic phone. No data or internet required.
- **Smart Wallet Sign-in** — Optional sign-in via Coinbase Smart Wallet (passkey/biometrics). No seed phrase needed.
- **Anonymous Browsing** — Every visitor gets an automatic anonymous Citizen ID. No account required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Maps | Leaflet, OpenStreetMap, Nominatim (reverse geocoding) |
| Blockchain | Base chain (Wagmi, Viem), Coinbase Smart Wallet |
| Storage | PostgreSQL (Prisma ORM), IPFS (Pinata) |
| USSD | Africa's Talking |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (free at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com))

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
| `NEXT_PUBLIC_CDP_API_KEY` | Coinbase CDP key for Smart Wallet sign-in | Optional |
| `NEXT_PUBLIC_ONCHAINKIT_API_KEY` | OnchainKit API key | Optional |

### Database Setup

```bash
# Push schema to your database
npm run db:push

# Seed with demo data (elections, candidates, incidents)
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
│   ├── page.tsx              # Home — 5-type reporting (election, building, police, social, service)
│   ├── voting/               # Elections & voting
│   ├── candidates/           # Candidate listing & registration
│   ├── register/             # Voter registration
│   ├── incidents/            # Incident viewer with map
│   ├── analytics/            # Premium analytics
│   ├── admin/                # Admin dashboard (9 tabs: elections, candidates, all 5 report types)
│   └── api/
│       ├── incidents/        # Incident CRUD + IPFS upload (all 5 report types)
│       ├── elections/        # Elections API
│       ├── votes/            # Voting API
│       ├── candidates/       # Candidates API
│       ├── voter-registration/
│       ├── analytics/
│       └── ussd/             # Africa's Talking USSD handler (7-option menu)
├── components/
│   ├── Navigation.tsx        # Top navigation bar
│   ├── SmartWalletButton.tsx # Sign in / sign out button
│   ├── IncidentMap.tsx       # Leaflet map component
│   └── BasePay.tsx           # Payment component
├── lib/
│   ├── baseAccount.ts        # Identity hook (session ID + Smart Wallet)
│   ├── db.ts                 # Prisma client singleton
│   └── ipfs.ts               # IPFS / Pinata service
└── prisma/
    ├── schema.prisma         # Database schema
    └── seed.ts               # Demo data seed script
```

---

## Admin — Incident Workflows

### Election Incidents (`/admin` → Incidents tab)

| Action | Status change | Description |
|---|---|---|
| **Verify** | pending → investigating | Confirms the report is credible; assigns for investigation |
| **Resolve** | any → resolved | Marks the incident as dealt with |
| **Dismiss** | any → dismissed | Marks as false report or duplicate |
| **Add Notes** | — | Admin writes verification notes and assigns to an officer |

### Building Compliance (`/admin` → Building Compliance tab)

| Action | Status change | Description |
|---|---|---|
| **Verify** | pending → investigating | Confirms the violation is credible |
| **Issue Notice** | investigating → notice_issued | Formal compliance notice issued to the property owner |
| **Enforce** | notice_issued → enforcement_action | Escalates to active enforcement |
| **Resolve** | any → resolved | Marks violation as remediated |
| **Dismiss** | any → dismissed | Marks as false report or duplicate |

### Police Misconduct (`/admin` → Police tab)

| Action | Status change | Description |
|---|---|---|
| **Investigate** | pending → investigating | Opens formal internal investigation |
| **Refer to IPID** | investigating → referred_to_ipid | Escalates to Independent Police Investigative Directorate |
| **Resolve** | any → resolved | Marks as resolved |
| **Dismiss** | any → dismissed | Marks as unfounded or duplicate |

### Social Services (`/admin` → Social Services tab)

| Action | Status change | Description |
|---|---|---|
| **Investigate** | pending → investigating | Opens formal investigation |
| **Refer to Dept** | investigating → referred_to_department | Refers to relevant government department |
| **Resolve** | any → resolved | Marks as resolved |
| **Dismiss** | any → dismissed | Marks as unfounded or duplicate |

### Service Delivery (`/admin` → Service Delivery tab)

| Action | Status change | Description |
|---|---|---|
| **Acknowledge** | pending → acknowledged | Municipality acknowledges the complaint |
| **In Progress** | acknowledged → in_progress | Active repair/resolution underway |
| **Resolve** | any → resolved | Marks as resolved |
| **Dismiss** | any → dismissed | Marks as unfounded or duplicate |

Admin access is restricted to whitelisted wallet/Citizen ID addresses defined in `app/admin/page.tsx`.

---

## USSD Integration

Citizens without smartphones or internet access can report incidents and violations via USSD on any basic mobile phone:

```
Dial *384*1#

1. Election Incident
   → Enter location → Select category → Describe → Submitted ✓  (Ref: INC-XXXXXX)
   Categories: Voting Irregularity, Voter Intimidation, Bribery, Violence, Other

2. Building Violation
   → Enter location → Select category → Describe → Submitted ✓  (Ref: BLD-XXXXXX)
   Categories: Unauthorized Construction, No Permit, Structural Risk,
               Illegal Land Use, Deviation from Plans, Other

3. Police Misconduct
   → Enter location → Select category → Describe → Submitted ✓  (Ref: POL-XXXXXX)
   Categories: Brutality, Corruption/Bribery, Unlawful Arrest, Theft/Damage,
               Dereliction of Duty, Racial Profiling, Other

4. Social Services
   → Enter location → Select category → Describe → Submitted ✓  (Ref: SOC-XXXXXX)
   Categories: Child Abuse/Neglect, Elderly Abuse, Domestic Violence,
               SW Misconduct, Fraudulent Grant, Child Abandonment, Other

5. Service Delivery
   → Enter location → Select category → Describe → Submitted ✓  (Ref: SVC-XXXXXX)
   Categories: Water Outage, No Electricity, Roads/Potholes, Refuse,
               Sewage, Public Lighting, Housing/RDP, Other

6. My Reports
   → Shows your last 3 submitted reports with status

7. Active Elections
   → Lists currently active elections
```

Powered by **Africa's Talking**. The USSD callback URL is:
```
https://baxela.vercel.app/api/ussd
```

---

## Report Type — Extra Fields

Each report type captures extra structured fields in addition to title, location, category, and description:

### Building Compliance

| Field | Description |
|---|---|
| Erf / Property Number | Optional — the municipal erf or stand number |
| Permit Number | Optional — the building permit reference if visible on site |
| Construction Type | Residential, Commercial, Industrial, Mixed Use, Informal, Other |

### Police Misconduct

| Field | Description |
|---|---|
| Badge Number | Optional — officer's badge/service number |
| Station Name | Optional — name of the police station |
| Case Reference | Optional — SAPS case or docket number |

### Social Services

| Field | Description |
|---|---|
| Ward Number | Optional — the ward in which the incident occurred |
| Case Reference | Optional — existing department case number |

### Service Delivery

| Field | Description |
|---|---|
| Ward Number | Optional — the ward/area affected |
| Municipal Ticket | Optional — existing municipal complaint ticket number |

All report types also support GPS coordinates (auto-detected) and file evidence (photos, videos, documents) uploaded to IPFS.

---

## Deployment

The project is configured for one-command Vercel deployment:

```bash
npx vercel --prod
```

Set the following environment variables in your Vercel project settings before deploying:
- `DATABASE_URL`
- `NEXT_PUBLIC_PINATA_API_KEY`
- `NEXT_PUBLIC_PINATA_SECRET_API_KEY`

After first deployment, run `npm run db:push` pointing at your production database to create the tables.

---

## How Identity Works

Baxela is designed for everyone — no crypto knowledge required:

1. **Anonymous** — On first visit, a unique Citizen ID is generated in the browser and stored locally. Users can immediately report incidents and vote.
2. **Signed in** — Clicking "Sign in" opens Coinbase Smart Wallet. Users approve with Face ID / fingerprint / passkey. Their wallet address becomes their persistent identity across devices. No seed phrase. No downloads.
3. **USSD** — Users on basic phones are identified by their phone number. No app, no internet, no wallet needed.

The blockchain layer runs entirely in the background.

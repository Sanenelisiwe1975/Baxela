# Baxela — Democracy & Election Integrity Platform

Baxela is a Web3-powered platform for transparent and secure elections. Citizens can report voting irregularities, participate in elections, and track incident status — all without needing a crypto wallet or any blockchain knowledge.

**Live:** [baxela.vercel.app](https://baxela.vercel.app)

---

## Features

- **Incident Reporting** — Submit reports with title, location, category, and file attachments (video, images, documents up to 50MB). Evidence is stored on IPFS via Pinata for permanent, decentralized storage.
- **GPS Geolocation** — Auto-detect your location when reporting. Coordinates are stored with the incident and displayed on an interactive map.
- **Interactive Map** — View all incidents as colour-coded pins on a live map (orange=pending, blue=verified, green=resolved).
- **Voting** — Browse active elections and cast votes. No sign-in required.
- **Candidate Registration** — Register as a candidate with full profile and platform details.
- **Voter Registration** — Submit voter registration with identity verification.
- **Analytics** — Premium analytics dashboard with regional incident hotspots and patterns.
- **Admin Dashboard** — Manage elections, verify candidates, and oversee incident reports. Admins can verify, investigate, resolve, or dismiss reports with notes and officer assignment.
- **USSD Reporting** — Citizens without smartphones can report incidents by dialing `*384*1#` on any basic phone. No data or internet required.
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
│   ├── page.tsx              # Home — incident reporting with geolocation
│   ├── voting/               # Elections & voting
│   ├── candidates/           # Candidate listing & registration
│   ├── register/             # Voter registration
│   ├── incidents/            # Incident viewer with map
│   ├── analytics/            # Premium analytics
│   ├── admin/                # Admin dashboard (elections, candidates, incidents)
│   └── api/
│       ├── incidents/        # Incident CRUD + IPFS upload
│       ├── elections/        # Elections API
│       ├── votes/            # Voting API
│       ├── candidates/       # Candidates API
│       ├── voter-registration/
│       ├── analytics/
│       └── ussd/             # Africa's Talking USSD handler
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

## Admin — Incident Approval

Reported incidents go through a review workflow managed from the **Admin Dashboard** (`/admin`):

| Action | Status change | Description |
|---|---|---|
| **Verify** | pending → investigating | Confirms the report is credible; assigns for investigation |
| **Resolve** | any → resolved | Marks the incident as dealt with |
| **Dismiss** | any → dismissed | Marks as false report or duplicate |
| **Add Notes** | — | Admin writes verification notes and assigns to an officer |

Admin access is restricted to whitelisted wallet/Citizen ID addresses defined in `app/admin/page.tsx`. The dashboard shows a **Pending Incidents** count and allows filtering by status (All / Pending / Investigating / Resolved / Dismissed).

---

## USSD Integration

Citizens without smartphones or internet access can report incidents via USSD on any basic mobile phone:

```
Dial *384*1#

1. Report Incident
   → Enter location → Select category → Describe → Submitted ✓

2. My Reports
   → Shows your last 3 submitted reports with status

3. Active Elections
   → Lists currently active elections
```

Powered by **Africa's Talking**. The USSD callback URL is:
```
https://baxela.vercel.app/api/ussd
```

Test the flow at: [baxela.vercel.app/api/ussd/test](https://baxela.vercel.app/api/ussd/test)

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

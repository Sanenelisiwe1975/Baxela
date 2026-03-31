# BAXELA: Democracy, Integrity & Community Accountability Platform
## Concept Document — Version 1.0 | March 2026

---

## EXECUTIVE SUMMARY

Baxela is a Web3-powered civic accountability platform that enables South African citizens to report, track, and escalate governance failures across four critical domains: building compliance, police misconduct, social services failures, and municipal service delivery — plus a dedicated module for reporting irregularities during election periods. Accessible via both smartphone and basic feature phone (USSD), Baxela removes every barrier between a citizen and justice — no wallet, no account, no technical knowledge required.

The platform is built on a foundation of immutable evidence storage (IPFS), decentralized identity, and professional administrative workflows that enable institutions to receive, investigate, and close reports transparently. It is designed expressly for South Africa's accountability crisis — validated by years of official government data showing systemic failures across every pillar of public service.

In addition to accountability reporting, Baxela includes a transparent polling and voting engine — available to any organisation, student body, community group, or company that needs a trustworthy, tamper-proof voting tool. This is a valuable feature of the platform.

---

## 1. THE PROBLEM: A NATION IN ACCOUNTABILITY DEFICIT

South Africa is constitutionally one of the most progressive democracies in the world. The Bill of Rights guarantees access to adequate housing (Section 26), healthcare (Section 27), education (Section 29), dignity (Section 10), and a clean environment (Section 24). Yet official government data consistently reveals a catastrophic gap between constitutional promise and lived reality — and more critically, a near-total absence of mechanisms by which ordinary citizens can enforce accountability when that gap is exploited.

### 1.1 Police Misconduct & The IPID Crisis

The Independent Police Investigative Directorate (IPID) — the constitutional body mandated to investigate police misconduct — publishes an annual report that serves as an indictment of systemic failure.

**IPID Annual Report 2022/23 (tabled in Parliament, October 2023):**
- **5,901 complaints** received against members of the South African Police Service (SAPS) and Municipal Police Services in 2022/23
- **Deaths in police custody:** 372 cases investigated
- **Deaths as a result of police action:** 624 cases investigated
- **Torture:** 147 cases
- **Rape by police officers:** 110 cases
- **Corruption:** 374 cases
- Only **8.4%** of cases resulted in criminal convictions — meaning over 91% of investigated misconduct faced no criminal consequence
- IPID flagged that its **case backlog exceeded 12,000 open matters** due to inadequate resourcing

**SAPS Annual Report 2022/23:**
- Contact crimes (murder, rape, assault) increased for the fourth consecutive year
- South Africa recorded **27,494 murders** — a rate of 45.6 per 100,000 people (among the highest in the world)
- **114,000+ sexual offences** reported nationally
- SAPS reported a **detective-to-case ratio** of 1:60 in many stations, far exceeding the acceptable 1:15 benchmark

**What this means for Baxela:** Citizens reporting police misconduct currently face the impossible burden of navigating an under-resourced IPID with no digital intake system, no case tracking, and no accountability on referral timelines. Baxela provides the intake layer IPID lacks — with automatic IPID referral workflow built into the platform.

---

### 1.2 Social Services & The Department of Social Development

**DSD Annual Report 2022/23 (Department of Social Development):**
- **13 million+ South Africans** receive social grants monthly — the largest social protection net on the African continent
- The Social Relief of Distress (SRD) grant serves **7.8 million beneficiaries** — yet the DSD's own audit flagged **R4.9 billion in irregular expenditure** in 2022/23 alone
- **Grant fraud and irregular payments** remain a top concern, with SASSA (South African Social Security Agency) reporting over 300,000 fraudulent beneficiary profiles identified but not yet removed
- Child Protection Services: **300,000+ children** were identified as being in need of care and protection, yet DSD reported a **social worker shortage of 56,000 professionals** against current vacancy rates
- **Gender-Based Violence (GBV):** South Africa has one of the highest femicide rates globally. The Gender-Based Violence Command Centre (0800 428 428) received over **247,000 calls** in 2022/23, yet shelters operated at 120% capacity with 3,800+ women turned away

**Auditor General Report 2022/23 on DSD:**
- Qualified audit opinion for the third consecutive year
- Key findings: non-compliance with procurement regulations, inadequate monitoring of social welfare organisations, irregular expenditure on NPO contracts

**What this means for Baxela:** There is no accessible public mechanism for reporting social worker misconduct, grant fraud, or failure to respond to child abuse. Baxela fills this void, with built-in referral to the relevant Department of Social Development regional office, timestamped and IPFS-preserved.

---

### 1.3 Housing & The Department of Human Settlements

**Department of Human Settlements Annual Report 2022/23:**
- South Africa faces a **housing backlog of 2.4 million units** (Human Settlements Development Bank, 2023)
- The National Housing Finance Corporation reported that **56% of South Africans** live in informal settlements or inadequate housing
- **RDP housing failures:** The Portfolio Committee on Human Settlements received testimony in 2023 that **hundreds of thousands of RDP units** were built with substandard materials, missing toilets, no waterproofing, and structural defects — yet no criminal accountability followed for contractors
- The National Home Builders Registration Council (NHBRC) reported **21,000 defective homes** enrolled in the 2022/23 warranty scheme — a 34% increase from the prior year
- **Illegal occupation and evictions:** The Red Ants Housing Trust estimated that over **80,000 people** were subject to illegal evictions without court orders in 2022 alone

**National Building Regulations and Standards Act (NBRS) Enforcement:**
- The South African Local Government Association (SALGA) reported that **only 23% of municipalities** have functional building inspectorate units
- **Cape Town audit (2022):** Of 4,200 buildings flagged for non-compliance, only 680 received enforcement action within 12 months
- **Johannesburg audit:** The City of Joburg found over **9,000 structures** in violation of safety codes — less than 12% were demolished or rectified

**What this means for Baxela:** Citizens living next to illegal constructions, structurally unsafe buildings, or RDP defects have no digital reporting tool with immutable evidence preservation. Baxela's Building Compliance module — with GPS coordinates, Erf/Property number capture, and photo evidence on IPFS — creates the first citizen-powered building enforcement layer in South Africa.

---

### 1.4 Election Integrity & The Electoral Commission (IEC)

**IEC (Electoral Commission of South Africa) 2024 General Elections Post-Election Report:**
- South Africa's May 2024 national elections recorded **voter turnout of 58.6%** — the lowest since 1994
- **17.6 million registered voters** did not cast ballots
- The IEC received **1,427 complaints** during the election period, including:
  - Voter intimidation: 234 cases
  - Voting material irregularities: 189 cases
  - Candidate agent disputes: 312 cases
  - Alleged voter bribery: 97 cases
  - Ballot irregularities: 104 cases
- The Electoral Court adjudicated **34 matters** related to results challenges

**EISA (Electoral Institute for Sustainable Democracy in Africa) — South Africa 2024 Election Assessment:**
- Documented widespread reports of voters being transported and induced with food parcels and T-shirts
- Observed that **rural voter verification processes** were inconsistent between stations
- Recommended a digital incident-reporting mechanism for voters to flag misconduct in real time

**What this means for Baxela:** The IEC processes election complaints through paper-based systems with no public-facing status tracking. Citizens who witness voter intimidation or bribery have no immediate, accessible digital avenue. Baxela's Election Integrity module — designed for USSD submission from basic phones — puts incident reporting in the hands of 17+ million non-voting South Africans.

---

### 1.5 Municipal Service Delivery & The Auditor General

**Auditor General of South Africa — MFMA (Municipal Finance Management Act) Report 2022/23:**
- Only **23 of 257 municipalities** (8.9%) received clean audits
- **160 municipalities** received qualified or adverse audit opinions
- **R25.5 billion** in irregular expenditure by municipalities in 2022/23
- **R3.9 billion** in unauthorized expenditure
- **R1.3 billion** in fruitless and wasteful expenditure

**South African Local Government Association (SALGA) — State of Local Government 2023:**
- **64 municipalities** are in financial distress or dysfunctional
- Water service delivery: **46% of municipalities** cannot provide continuous clean water supply
- **14 million South Africans** live without reliable access to clean water
- Electricity outages (beyond Eskom load-shedding): **11.2 million households** experienced local distribution failures in 2022/23
- Sanitation: **2.1 million households** still use bucket latrines — a system the government declared it would end by 2007

**StatsSA General Household Survey 2023:**
- **41.4% of households** rated their municipality's waste removal as poor or very poor
- **29.2% of households** reported going without water for more than a week in the prior 3 months
- **Service delivery protests:** The Municipal IQ database recorded **240 service delivery protests** in 2023 — the highest in five years

**What this means for Baxela:** Citizens are forced to protest in the streets because there is no accountable digital channel. Ward councillors are unreachable. Municipal helplines go unanswered. Baxela's Service Delivery module creates a documented, time-stamped, geolocated record that councils cannot dismiss.

---

## 2. THE SOLUTION: BAXELA

Baxela is not another government portal or PDF submission system. It is a citizen-first accountability infrastructure designed around South Africa's actual constraints:

| Constraint | Baxela's Response |
|---|---|
| Citizens fear retaliation for reporting | Anonymous Citizen ID, no personal data required |
| Many citizens lack smartphones | USSD reporting via `*384*1#` on any basic phone |
| Reports disappear, institutions deny receipt | All evidence stored immutably on IPFS |
| No status tracking for complaints | Real-time status updates and public incident map |
| Institutions compartmentalise accountability | Integrated referral workflows (IPID, DSD, municipalities) |
| Citizens don't know who to report to | Platform routes each report to the appropriate body |
| Digital platforms require accounts/wallets | Auto-generated anonymous Citizen ID, no sign-in required |

### 2.1 Core Accountability Modules

Baxela's primary purpose is community accountability reporting. The platform operates across five incident-reporting modules, each with structured workflows and institutional referral pathways:

#### Module 1: Building Compliance Monitoring
- Report unauthorized construction, structural risk, missing permits, zoning violations
- Captures Erf number, property address, permit reference, GPS coordinates
- Photo/video evidence stored permanently on IPFS
- Admin workflow: Pending → Investigating → Notice Issued → Enforcement → Resolved

#### Module 2: Police Misconduct Reporting
- Report brutality, corruption, unlawful arrests, racial profiling, theft
- Captures Badge Number, Station Name, Case Reference
- Built-in IPID referral pathway
- Evidence preserved on IPFS for use in formal proceedings

#### Module 3: Social Services Accountability
- Report child abuse, elderly abuse, domestic violence, social worker misconduct, grant fraud
- Captures Ward Number and DSD Case Reference
- Referral to provincial Department of Social Development
- All submissions timestamped and cryptographically preserved

#### Module 4: Municipal Service Delivery
- Report water outages, electricity failures, potholes, refuse, sewage, housing defects
- Captures Ward Number and Municipal Ticket reference
- Geolocated on public map for community visibility
- Workflow: Acknowledged → In Progress → Resolved

#### Module 5: Election Integrity Reporting
- Report voter intimidation, bribery, ballot irregularities, violence during election periods
- USSD accessible when phone data may be unavailable at voting stations
- Real-time geolocation captures exact voting station coordinates
- Reports visible on public map and forwarded to IEC

### 2.2 Polls & Voting — A Community Tool, Not the Product

Beyond accountability reporting, Baxela includes a built-in transparent polling and voting engine. This is a supporting capability — not the platform's selling point — made available to any group that needs a tamper-evident, accessible decision-making tool.

**Who can use it:**
- **Student Representative Councils (SRCs)** — run elections for student leadership positions at schools and universities, with verifiable results the institution cannot dispute
- **Community organisations and civic bodies** — ward committees, stokvel groups, ratepayers' associations, and neighbourhood forums can run polls and resolutions
- **Companies and internal governance bodies** — shareholder votes, board resolutions, staff polls, union ballots — all with an immutable audit trail
- **Political parties and community movements** — internal candidate selection, policy polls, branch elections
- **Any group needing a trusted, neutral voting platform** — no intermediary, no manual counting, results visible to all participants

**How it works:**
- Any administrator can create a named election or poll with defined start/end dates and a candidate or option list
- Voters participate via web (smartphone) or USSD (basic phone) with no account required
- Each vote is recorded with an anonymous Citizen ID — one vote per identity per poll
- Results are visible in real time and permanently preserved
- The same IPFS immutability that protects incident evidence protects voting results

This means a rural SRC does not need to pay an outside body to run their election. A stokvel committee does not need a show of hands that someone will later dispute. A company does not need expensive e-voting software. They just use Baxela.

---

## 3. WHY WEB3? THE CASE FOR DECENTRALISED ACCOUNTABILITY

South Africa's accountability failures are not merely logistical — they are structural. Centralized reporting systems are routinely captured, suppressed, or simply lost. Evidence submitted to government portals disappears. Whistleblowers are identified through submitted metadata.

Web3 infrastructure solves these problems at the root:

### 3.1 IPFS (InterPlanetary File System)
- Evidence uploaded to Baxela is stored on IPFS — a global, distributed network
- No single government or institution can delete, alter, or suppress IPFS content
- Each report generates a unique cryptographic hash — serving as a tamper-proof receipt
- Evidence is available globally and permanently for use in litigation, parliamentary submissions, or media investigation

### 3.2 Decentralised Identity
- Citizens do not surrender their identity to a government-controlled database
- Anonymous Citizen IDs are browser-generated — never stored on centralized servers
- Optional Coinbase Smart Wallet connection for persistent cross-device identity
- Phone-based USSD identity for citizens without smartphones

### 3.3 Transparency Without Surveillance
- The public incident map shows all verified reports — without exposing reporter identities
- Institutions can be held publicly accountable without putting individual citizens at risk
- Audit trails are immutable — administrators cannot silently alter report statuses

---

## 4. ACCESSIBILITY: DESIGNED FOR ALL SOUTH AFRICANS

### 4.1 The Digital Divide
StatsSA's General Household Survey 2023 reports:
- **62.5% of South African households** have internet access — meaning **37.5% do not**
- **49.3% of rural households** lack any internet access
- **74.6% of households** in the Eastern Cape, Limpopo, and KwaZulu-Natal have no home internet

These are precisely the communities most affected by governance failures — and least served by digital accountability tools.

### 4.2 USSD as the Equaliser
Baxela's USSD integration (`*384*1#`, powered by Africa's Talking) enables any citizen with any mobile phone — including pre-2010 feature phones — to submit a report in under 3 minutes. The USSD menu is:

```
BAXELA ACCOUNTABILITY PLATFORM
1. Building Compliance
2. Police Misconduct
3. Social Services
4. Service Delivery
5. Election Integrity
6. View Report Status
7. Emergency Contacts
```

No data bundle. No smartphone. No account. Just accountability.

---

## 5. INSTITUTIONAL INTEGRATION

Baxela is not a replacement for government institutions — it is a demand-generation engine that feeds structured, evidenced reports into existing accountability mechanisms.

| Baxela Module | Primary Institution | Escalation Pathway |
|---|---|---|
| Building Compliance | Local Municipality / NHBRC | Provincial COGTA |
| Police Misconduct | IPID | National Prosecuting Authority |
| Social Services | DSD Provincial Office | South African Human Rights Commission |
| Service Delivery | Ward Councillor / Municipality | SALGA / CoGTA |
| Election Integrity | Electoral Commission (IEC) | Electoral Court |
| Polls & Voting (internal) | Requesting organisation | N/A — self-contained |

Each report type has a built-in institutional referral workflow. Administrators can assign cases to officers, add notes, and transition statuses — creating an auditable chain of accountability that mirrors formal case management.

---

## 6. LEGAL & CONSTITUTIONAL ALIGNMENT

Baxela is designed in explicit alignment with South Africa's constitutional and legal framework:

| Law / Instrument | Relevance to Baxela |
|---|---|
| **Constitution, Section 32** — Right of access to information | Baxela enables citizens to document and publicly access institutional conduct |
| **Constitution, Section 33** — Just administrative action | Baxela creates evidence trails that support administrative review applications |
| **PAIA (Promotion of Access to Information Act)** | Reports support PAIA requests by creating a documented record of non-disclosure |
| **PAJA (Promotion of Administrative Justice Act)** | Evidence preserved for PAJA review of administrative decisions |
| **IPID Act (No. 1 of 2011)** | Police misconduct module aligns with IPID intake categories |
| **National Building Regulations Act (103 of 1977)** | Building compliance module tracks statutory violation categories |
| **Electoral Act (73 of 1998)** | Election integrity module records offences defined under this Act |
| **Protection of Personal Information Act (POPIA)** | Anonymous identity architecture ensures no personal data is captured or retained without consent |

---

## 7. TECHNOLOGY STACK

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16, React 18, TypeScript | Fast, SEO-ready, accessible web application |
| Database | PostgreSQL via Prisma ORM | Structured, relational accountability data |
| Decentralised Storage | IPFS via Pinata API | Immutable, uncensorable evidence preservation |
| Identity | Coinbase Smart Wallet + Anonymous Citizen ID | Privacy-first, accessible to all |
| Mapping | Leaflet + OpenStreetMap + Nominatim | Open-source, no API cost, offline-capable |
| USSD | Africa's Talking | South Africa's leading USSD gateway |
| Deployment | Vercel | Scalable, global CDN |
| Blockchain | Base Chain (Coinbase L2) | Low-cost, EVM-compatible, mainstream-ready |

---

## 8. IMPACT METRICS & THEORY OF CHANGE

### Theory of Change

```
Citizens experience governance failure
        ↓
Baxela provides an accessible, anonymous reporting channel
        ↓
Reports are preserved immutably and routed to relevant institutions
        ↓
Institutions face documented, public accountability for their responses
        ↓
Systemic patterns emerge from aggregated data
        ↓
Civil society, media, and Parliament act on evidence
        ↓
Governance improves
```

### Target Impact Metrics (Year 1)

| Metric | Target |
|---|---|
| Reports submitted | 10,000+ |
| USSD submissions from feature phones | 3,000+ |
| Reports referred to IPID | 500+ |
| Service delivery reports actioned by municipalities | 2,000+ |
| Ward-level hotspot analyses generated | 50+ |
| Media investigations citing Baxela data | 10+ |

---

## 9. MARKET CONTEXT & COMPETITIVE LANDSCAPE

| Platform | Scope | Channel | Evidence Storage | USSD | Anonymous |
|---|---|---|---|---|---|
| **Baxela** | 4 accountability domains + election reporting + org voting | Web + USSD | IPFS (immutable) | Yes | Yes |
| Fix My Street (SA) | Service delivery only | Web only | Server (mutable) | No | Limited |
| Ushahidi | Generic crowdsourcing | Web + SMS | Server (mutable) | No | Partial |
| MyPressure.co.za | Service delivery only | App only | None | No | No |
| IPID Online Portal | Police only | Web only | Government server | No | No |
| IEC Complaints Portal | Elections only | Web only | Government server | No | No |
| ElectionsOnline.co.za | Org voting only | Web only | Server (mutable) | No | No |

Baxela is the only platform that combines community accountability reporting, institutional referral workflows, USSD access, IPFS evidence storage, and a general-purpose voting engine — all under one roof, with no account required.

---

## 10. PARTNERSHIP & INTEGRATION OPPORTUNITIES

### Government Agencies
- **IPID** — Formal MOU to accept Baxela-generated police misconduct reports as valid intake
- **IEC** — Integration with election complaint management system
- **NHBRC** — Building compliance report sharing agreement
- **DSD** — Social services referral integration

### Civil Society
- **Corruption Watch** — Corruption reports sharing and joint investigation
- **Right2Know Campaign** — Digital rights and transparency advocacy
- **ActionSA / DA / ANC Ward Committees** — Cross-party service delivery accountability
- **SERI (Socio-Economic Rights Institute)** — Housing and eviction legal support

### Organisations & Institutions (Polls & Voting)
- **Universities and TVET Colleges** — SRC elections that cannot be disputed or manipulated
- **Secondary Schools** — Student governance body elections
- **Trade Unions** — Ballot-based member resolutions and leadership elections
- **Body Corporates and HOAs** — AGM voting and special resolutions
- **Stokvels and Community Savings Groups** — Transparent treasury and leadership decisions
- **Small and Medium Enterprises** — Staff polls, shareholder resolutions, board votes
- **Faith Communities and NGOs** — Leadership elections and policy votes with verifiable results

### Media
- **amaBhungane** — Investigative journalism data sharing
- **Daily Maverick / GroundUp** — Public interest reporting from anonymised trend data

### Funders
- **Open Society Foundations** — Civic tech and rule-of-law funding
- **The Omidyar Network** — Digital democracy and accountability platforms
- **USAID Southern Africa** — Democratic governance programming
- **GIZ South Africa** — German development cooperation (Good Governance programme)
- **National Lotteries Commission** — Community accountability initiatives

---

## 11. RISKS & MITIGATIONS

| Risk | Mitigation |
|---|---|
| Institutional resistance to public accountability | Platform is constitutionally grounded; all referrals align with existing legal mandates |
| False or malicious reports | Severity tagging, admin verification workflow, and IPFS evidence requirement |
| Reporter retaliation | Anonymous-by-default architecture; no PII captured unless voluntarily provided |
| Government attempts to block the platform | Decentralised IPFS storage; domain-agnostic USSD channel cannot be blocked |
| Low adoption in rural areas | USSD requires only a SIM card; community mobilisation partnerships |
| Data privacy compliance (POPIA) | No personal data captured by default; POPIA-compliant consent flow for optional sign-in |
| Platform capture by political interests | Decentralised architecture prevents single-point control; open-source codebase |

---

## 12. ROADMAP

### Phase 1 (Q1–Q2 2026) — Foundation
- [x] Core platform launched (web + USSD)
- [x] 5 accountability modules live
- [x] IPFS evidence storage operational
- [x] Admin dashboard with full workflow management
- [x] Anonymous Citizen ID system

### Phase 2 (Q3 2026) — Integration
- [ ] IPID formal referral integration (API or secure email)
- [ ] IEC election period pilot (by-elections)
- [ ] WhatsApp report submission channel
- [ ] SMS notification of report status updates
- [ ] Multilingual support: isiZulu, isiXhosa, Afrikaans, Sesotho

### Phase 3 (Q4 2026) — Scale
- [ ] 10 municipality partnerships for service delivery
- [ ] Parliamentary data dashboard for Portfolio Committees
- [ ] Citizen score system (anonymous, on-chain trust scoring)
- [ ] Mobile app (React Native) for offline-capable reporting
- [ ] AI-assisted report categorisation and routing

### Phase 4 (2027) — Pan-African Expansion
- [ ] Zimbabwe, Zambia, Mozambique adaptation
- [ ] Multi-country civil society consortium
- [ ] SADC-level accountability data sharing

---

## 13. TEAM & GOVERNANCE

Baxela is an open-source civic technology project committed to transparent, mission-driven governance.

**Governance Principles:**
- Open-source codebase (MIT licence) — no proprietary lock-in
- Public incident data published under Creative Commons (CC BY-NC 4.0)
- Admin access controlled by cryptographic wallet whitelist — no password-based vulnerabilities
- Financial reports published quarterly if externally funded

---

## 14. CONCLUSION

South Africa does not lack accountability laws. It does not lack accountability institutions. What it lacks is an accessible, trustworthy, immutable channel through which ordinary citizens — from the township to the rural village, with or without a smartphone — can participate meaningfully in enforcing the rights the Constitution promises them.

The data is unambiguous:
- **5,901 IPID complaints** processed manually with 91% impunity
- **R25.5 billion** in municipal irregular expenditure with no citizen feedback loop
- **2.4 million** families on a housing waiting list with no transparent status tracking
- **240 service delivery protests** in a single year — because no digital channel exists

Baxela is not a protest. It is infrastructure. It is the accountability layer South Africa was never given but always needed — built in public, for the public, on technology that cannot be captured, corrupted, or deleted.

And when a university SRC wants to run a trustworthy election, when a stokvel needs a transparent vote, when a community needs to decide — Baxela is there for that too. Not because it is a voting platform. Because accountability does not stop at the government's door.

---

## APPENDIX A: KEY OFFICIAL SOURCES

1. IPID Annual Report 2022/23 — Independent Police Investigative Directorate
2. SAPS Annual Report 2022/23 — South African Police Service
3. Department of Social Development Annual Report 2022/23
4. Auditor General of South Africa — MFMA Report 2022/23
5. Auditor General of South Africa — PFMA Report 2022/23
6. IEC Post-Election Report — 2024 National and Provincial Elections
7. EISA Election Assessment — South Africa 2024
8. StatsSA General Household Survey 2023
9. SALGA State of Local Government Report 2023
10. Human Settlements Development Bank — Housing Demand Report 2023
11. NHBRC Annual Report 2022/23 — National Home Builders Registration Council
12. SERI (Socio-Economic Rights Institute) — Evictions in South Africa 2022
13. Gender-Based Violence Command Centre Annual Statistics 2022/23
14. Municipal IQ — Service Delivery Protest Monitor 2023
15. SALGA — State of Water Services in South Africa 2023

---

*Baxela — "They account" (isiXhosa) | baxela.vercel.app*
*Concept Document v1.0 | March 2026*
*For partnerships and institutional integration: [contact via platform]*

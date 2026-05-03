# Spoke — Voice-First HOA Management

> Your voice runs the building now.

Spoke is a web app for Housing Societies and HOAs with two sides: residents file complaints by speaking, the board gets a live ops dashboard. No forms. No emails. Just voice.

**Live demo → [panchayat-mocha.vercel.app](https://panchayat-mocha.vercel.app)**

---

## What it does

**Residents**
- Tap mic → speak → AI auto-classifies the complaint and files it instantly
- Pay maintenance dues with a single tap
- Check gate activity (packages, guests, deliveries)
- Search the HOA rulebook in plain English

**Board**
- Live complaints feed with status controls and real-time stats
- Send notices to all residents or a specific unit
- Residents directory with onboarding status and dues tracking
- 6-month maintenance dues chart with mark-paid / remind actions
- Gate log with entry types, search, and add-entry form
- One-click CSV export of all complaints

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Vite + React 18 | Fast HMR, SPA build with hashed assets |
| Styling | Tailwind CSS 3 | Purged CSS, design tokens in config |
| Routing | React Router v6 | `AnimatePresence` page transitions |
| Animation | Framer Motion | Polished transitions |
| Voice | Web Speech API | Browser-native, no API key |
| State | React Context + useReducer | Sufficient for this scope |
| Persistence | localStorage (`spoke_v2`) | Zero backend for demo |
| Deploy | Vercel | Edge CDN, SPA rewrites, automatic SSL |

---

## Getting started

```bash
cd spoke
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173).

**Build for production:**

```bash
npm run build
npm run preview
```

---

## Project structure

```
spoke/
├── public/                 # Static assets: OG image, favicons, webmanifest
├── index.html              # Root HTML — fonts, meta, OG tags
├── vite.config.js
├── tailwind.config.js
│
└── src/
    ├── App.jsx             # Routes + AnimatePresence
    ├── main.jsx            # React root + ErrorBoundary
    │
    ├── context/
    │   └── AppContext.jsx  # Global state: user, complaints, toast
    │
    ├── hooks/
    │   ├── useVoiceRecording.js   # Web Speech API + simulation fallback
    │   └── useComplaints.js       # Complaint CRUD + status updates
    │
    ├── data/               # Seeded demo data (complaints, residents, gate, rules)
    ├── utils/              # Motion variants, formatters, voice classifier, timeAgo
    │
    ├── components/
    │   ├── ui/             # Button, Badge, Card, MicButton, Toast, ErrorBoundary
    │   ├── layout/         # TopBar, BottomNav, Sidebar
    │   └── shared/         # ComplaintRow, StatCard, GateItem, RuleCard
    │
    └── screens/
        ├── Landing/        # Hero, Features, HowItWorks, CTA
        ├── ResidentHome/   # Greeting, voice CTA, complaints, dues, gate preview
        ├── VoiceRecording/ # Mic + transcript + classify + submit
        ├── Confirmation/   # Success state
        ├── BoardDashboard/ # Stats, feed, gate preview, overdue, notices
        ├── Rulebook/       # Search + category chips + AI answer card
        ├── Residents/      # Directory, search, filter tabs, nudge
        ├── Maintenance/    # Dues tracker, bar chart, mark paid
        └── GateLog/        # Log entries, add form, type filters
```

---

## Screens

| Route | Screen |
|-------|--------|
| `/` | Landing |
| `/home` | Resident Home |
| `/voice` | Voice Recording + AI classify |
| `/confirmation` | Complaint filed |
| `/board` | Board Dashboard |
| `/rulebook` | HOA Rulebook search |
| `/residents` | Residents directory |
| `/maintenance` | Dues management |
| `/gate-log` | Gate activity log |

---

## Voice recording

Uses the browser's **Web Speech API**. On browsers where this is unavailable (Firefox, some Safari iOS), a typed-text fallback appears automatically. A simulation mode runs in non-API environments so the demo always works.

Mic permission blocked → clear error banner + text fallback.

---

## Deployment

Deployed on Vercel. The `vercel.json` at the repo root handles:
- SPA rewrite (`/*` → `/index.html`) so direct URL access works
- Security headers on all routes
- Long-term cache headers on `/assets/*`

Build config:
```
Install command: cd spoke && npm ci
Build command:   cd spoke && npm run build
Output dir:      spoke/dist
```

---

## Roadmap

- **Backend** — replace localStorage with Supabase (complaints, residents, dues)
- **Auth** — Clerk or Supabase Auth with resident vs board role gating
- **Real voice AI** — Whisper API for better accuracy + Firefox support
- **Push notifications** — board notified when complaint filed
- **Email notices** — SendGrid/Resend for the Send Notice feature
- **Stripe dues** — real payment flow
- **Multi-HOA** — org scoping for multiple societies

---

## License

MIT

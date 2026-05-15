Landing Page (/)
↓
Sign Up / Sign In (/auth)
↓
├── User Dashboard (/dashboard/user)
│ └── Request booking, see history
│
└── Worker Dashboard (/dashboard/worker)
└── See bookings, accept/decline


Create a stunning landing page at /app/page.tsx
for "KaamAI" with color #3e2b96 (deep purple).

Sections:

1. NAVBAR
- Logo: "KaamAI" left side
- Right side: "Sign In" button + "Get Started"
button (purple)

2. HERO SECTION
- Big heading: "Pakistan ka Pehla AI Service Agent"
- Subheading: "Plumber, electrician, carpenter —
Roman Urdu mein batao, AI dhund ke book kar dega"
- Two buttons: "Get Started Free" | "Watch Demo"
- Background: dark purple gradient

3. HOW IT WORKS (3 steps)
- Step 1: "Apna kaam batao" → text input icon
- Step 2: "AI dhundta hai" → robot icon
- Step 3: "Booking ho gayi" → checkmark icon

4. SERVICES SECTION
- Grid of service cards: Plumber, Electrician,
Carpenter, Painter, AC Repair, Cleaner
- Each card has emoji + name

5. FOOTER
- "KaamAI © 2026 — Built for Pakistan"

Make it fully responsive, modern, premium looking.
Animations: fade in on scroll for each section.

Create /app/auth/page.tsx — Auth page with
Supabase Auth:

Two tabs: "Sign In" | "Sign Up"

SIGN UP form:
- Full Name input
- Email input
- Password input
- Role selector: "I need a worker" | "I am a worker"
- Submit button "Create Account"

SIGN IN form:
- Email input
- Password input
- Submit button "Sign In"

After successful auth:
- If role = customer → redirect to /dashboard/user
- If role = worker → redirect to /dashboard/worker

Save role in Supabase profiles table.

Use Supabase MCP to:
1. Enable Email auth in Supabase
2. Create profiles table:
- id (uuid, references auth.users)
- full_name (text)
- role (text) — 'customer' or 'worker'
- created_at (timestamp)

Design: centered card, purple accents,
same brand as landing page.



Create /app/dashboard/user/page.tsx

Check auth on load — if not logged in redirect to /auth

Layout:
1. SIDEBAR (left, purple #3e2b96):
- KaamAI logo
- Menu items:
🏠 Home
📋 New Booking
🕐 My Bookings
👤 Profile
- Bottom: user email + Logout button

2. MAIN CONTENT (right):

HOME view (default):
- "Assalam o Alaikum, {name}!" greeting
- Stats cards: Total Bookings | Pending | Completed
- Recent bookings list (last 3)

NEW BOOKING view:
- Large textarea: "Apna kaam batao..."
- "Dhundo" button
- Agent Pipeline steps (4 steps lighting up)
- Reasoning Panel: "AI ne kya socha:"
- Result booking card

MY BOOKINGS view:
- All bookings from Supabase
- Each card: service, worker name, status badge,
date, location
- Status colors: yellow=pending, green=confirmed,
red=declined

Make responsive. Purple sidebar collapses on mobile.



Create /app/dashboard/worker/page.tsx

Check auth — if not worker role, redirect to /auth

Layout:
1. SIDEBAR (same purple style):
- Menu: 🏠 Home | 📋 Bookings | 👤 Profile
- Worker name + "🟢 Online" status toggle

2. MAIN CONTENT:

HOME view:
- "Welcome, {worker name}!"
- Stats: Total Received | Pending | Completed |
Declined
- Earnings estimate (rating * completed * 500 PKR)

BOOKINGS view:
- Realtime subscription to bookings table
- New booking shows with 🔔 animation
- Each card shows:
Customer request, service needed,
location, scheduled time
- "✅ Accept" | "❌ Decline" buttons
- On Accept: status → confirmed,
show in green
- On Decline: status → declined,
show in red

"🟢 Live" pulsing indicator top right


kaam-ai/
├── app/
│ ├── page.tsx ← Landing page
│ ├── auth/page.tsx ← Sign in/up
│ ├── dashboard/
│ │ ├── user/page.tsx ← Customer dashboard
│ │ └── worker/page.tsx ← Worker dashboard
│ └── api/
│ ├── intent/route.ts
│ ├── discover/route.ts
│ ├── rank/route.ts
│ └── book/route.ts
├── lib/
│ ├── gemini.ts
│ ├── supabase.ts
│ ├── auth.ts
│ └── mockWorkers.ts
└── middleware.ts


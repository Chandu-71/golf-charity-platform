# Digital Heroes — Golf for Good 🏌️

A premium full-stack platform that transforms golf subscriptions into a philanthropic experience. Players track Stableford scores, enter monthly prize draws, and direct a percentage of their subscription to a charity of their choice.

**Live Demo:**  https://golf-charity-platform-7.vercel.app

---

## What It Does

- **Score Tracking** — Players log Stableford scores (1–45). A PostgreSQL trigger automatically maintains a rolling average of their latest 5 rounds.
- **Monthly Prize Engine** — Admin-controlled draw system generates verifiable winning numbers from the active prize pool.
- **Winner Verification** — Players upload scorecard photos to Supabase Storage. Admins review, approve or reject, and mark claims as paid with real-time optimistic UI updates.
- **Charity CMS** — Full CRUD admin dashboard to add, edit, and remove supported charities without touching the database.
- **Role-Based Access** — Secure session routing separating standard users from admins.

---
## Demo Admin Access

To explore admin features:

Email: admin@gmail.com  
Password: 123456
---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router DOM, Lucide React |
| Backend | Node.js, Express (Vercel Serverless Functions) |
| Database & Auth | Supabase (PostgreSQL), Supabase Auth, Supabase Storage |
| Deployment | Vercel (monorepo) |


---

## Local Setup

**1. Clone the repo**
```bash
git clone https://github.com/Chandu-71/golf-charity-platform.git
cd golf-charity-platform
```

**2. Install frontend dependencies**
```bash
cd frontend
npm install
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Add environment variables**

`frontend/.env`
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpaykey
```

`.env` (root, for the backend)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**4. Run locally**
```bash
cd frontend
npm run dev
```
```bash
cd backend
node .\server.js
```

---

## Testing Admin Features

The prize engine, charity CMS, and winner verification are locked behind the admin role. To enable it:

1. Sign up for a new account via the platform.
2. Open your **Supabase Dashboard → Table Editor → profiles**.
3. Find your user row and change `role` from `user` to `admin`.
4. Refresh the app — the admin portal will unlock automatically.

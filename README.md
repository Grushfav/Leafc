# Leafc

Web application for L.E.A.F.C — static Next.js front-end with an Express API, Drizzle ORM, and Neon PostgreSQL.

## Structure

```
Leafc/
├── frontend/   # Next.js (static export)
└── backend/    # Express + Drizzle ORM + Neon
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Add your Neon DATABASE_URL, JWT_SECRET, and STAFF_INVITE_CODE to .env
npm install
npm run db:push      # push schema to Neon (or use db:generate + db:migrate)
npm run dev          # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Location   | Command           | Description                    |
|------------|-------------------|--------------------------------|
| `backend/` | `npm run dev`     | Start API with hot reload      |
| `backend/` | `npm run db:push` | Push Drizzle schema to Neon    |
| `backend/` | `npm run db:studio` | Open Drizzle Studio          |
| `frontend/`| `npm run dev`     | Next.js dev server             |
| `frontend/`| `npm run build`   | Static export to `frontend/out`|

## API

- `GET /` — API info
- `GET /health` — Health check (includes DB connectivity)
- `POST /auth/register` — Customer or LEAF-C member signup
- `POST /auth/login` — Sign in
- `PATCH /auth/me` — Update profile (Bearer token)
- `GET /cases` — List cases (admin: all; member: open + assigned)
- `POST /cases` — Create a case (admin)
- `GET /cases/:id` — Case detail (admin: any; member: open or assigned)
- `PATCH /cases/:id` — Update ticket status (admin)
- `POST /cases/:id/accept` — Accept an open case (agent, senior_agent)
- `POST /cases/:id/assignments` — Assign an agent (admin)
- `DELETE /cases/:id/assignments/:userId` — Remove an assigned agent (admin)
- `POST /cases/:id/notes` — Add a case notation (admin or assigned member)
- `GET /cases/agents` — List assignable agents (admin)
- `GET /training/sessions` — List training sessions (staff)
- `POST /training/sessions` — Create and schedule a session (admin)
- `PATCH /training/sessions/:id` — Update session date, title, or status (admin)
- `POST /inquiries` — Public service inquiry
- `GET /inquiries` — Inquiries for the signed-in user (staff see all)
- `GET /dashboard/summary` — Workspace counts (staff: open cases, inquiries, members, non-cancelled training sessions; customers: own inquiries)

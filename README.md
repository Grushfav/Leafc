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
# Add your Neon DATABASE_URL to .env
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

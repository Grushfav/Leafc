# LEAF-C API Schema

Database schema for the LEAF-C investigative and compliance platform. Implemented with Drizzle ORM against Neon PostgreSQL (`backend/src/db/schema.ts`).

## Entity Relationship Overview

```
divisions ──┬── users
            ├── cases
            └── training_programs

users ──┬── cases (assigned / client)
        ├── documents
        ├── enrollments
        ├── training_sessions (createdBy)
        ├── polygraph_sessions (examiner)
        ├── risk_assessments
        └── audit_logs

cases ──┬── documents
        ├── polygraph_sessions
        ├── risk_assessments
        ├── case_assignments
        └── case_notes

training_programs ──┬── enrollments
                    └── training_sessions
```

## Tables

### users

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| name | text | Required |
| email | text | Unique |
| role | enum | `admin`, `senior_agent`, `agent`, `customer` |
| customer_kind | enum | `individual`, `organization` — customers only |
| organization_name | text | Required for organisation customers |
| password_hash | text | bcrypt hash |
| division_id | integer | FK → divisions (optional) |
| is_active | boolean | Default true |
| last_login_at | timestamp | Nullable |
| avatar_url | text | Public path to profile photo (`/uploads/avatars/...`) |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### divisions

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| type | enum | `consultancy`, `operations`, `training`, `polygraph` — unique |
| name | text | Display name |
| description | text | Nullable |
| is_active | boolean | Default true |
| created_at | timestamp | Auto |

### cases

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| reference_number | text | Unique (e.g. INV-2026-0412) |
| title | text | Required |
| description | text | Nullable |
| status | text | `new`, `urgent`, `in_progress`, `paused`, `completed` |
| priority | enum | `low`, `medium`, `high`, `critical` |
| division_id | integer | FK → divisions |
| assigned_to_id | integer | FK → users (lead assigned agent) |
| client_id | integer | FK → users |
| jurisdiction | text | Nullable |
| opened_at | timestamp | Nullable |
| closed_at | timestamp | Nullable |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### case_assignments

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| case_id | integer | FK → cases |
| user_id | integer | FK → users (`senior_agent` or `agent`) |
| assigned_by_id | integer | FK → users |
| created_at | timestamp | Auto |

Unique constraint on `(case_id, user_id)`.

### case_notes

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| case_id | integer | FK → cases |
| author_id | integer | FK → users |
| body | text | Notation text |
| created_at | timestamp | Auto, append-only |

### documents

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| case_id | integer | FK → cases (nullable for standalone uploads) |
| uploaded_by_id | integer | FK → users |
| filename | text | Original filename |
| mime_type | text | MIME type |
| size_bytes | integer | File size |
| storage_key | text | S3/R2 object key |
| status | enum | `pending`, `uploaded`, `verified`, `archived` |
| is_encrypted | boolean | Default true |
| encryption_key_id | text | KMS key reference |
| checksum | text | SHA-256 hash |
| metadata | jsonb | Additional properties |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### training_programs

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| code | text | Unique (e.g. TRN-001) |
| title | text | Programme name |
| description | text | Nullable |
| duration_days | integer | Length in days |
| max_seats | integer | Capacity |
| level | text | Foundation / Intermediate / Advanced |
| division_id | integer | FK → divisions (training) |
| is_active | boolean | Default true |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### enrollments

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| program_id | integer | FK → training_programs |
| user_id | integer | FK → users |
| status | enum | `pending`, `confirmed`, `in_progress`, `completed`, `cancelled` |
| enrolled_at | timestamp | Auto |
| completed_at | timestamp | Nullable |
| certificate_issued | boolean | Default false |
| notes | text | Nullable |

Unique constraint on `(program_id, user_id)`.

### training_sessions

Dated offering of a training session. Standalone sessions are allowed (`program_id` nullable) so admins can schedule without catalogue CRUD.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| program_id | integer | FK → training_programs (nullable) |
| title | text | Required |
| description | text | Nullable |
| scheduled_at | timestamp | Required session date/time |
| location | text | Nullable venue |
| duration_days | integer | Nullable length in days |
| max_seats | integer | Nullable capacity |
| status | enum | `scheduled`, `cancelled`, `completed` |
| created_by_id | integer | FK → users |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### polygraph_sessions

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| reference_number | text | Unique (e.g. PLG-2026-0033) |
| case_id | integer | FK → cases (nullable) |
| examiner_id | integer | FK → users (polygraph_examiner) |
| requesting_agency | text | Required |
| examination_type | text | Type of examination |
| status | enum | `requested`, `scheduled`, `in_progress`, `completed`, `cancelled` |
| scheduled_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |
| result_summary | text | Encrypted at application layer |
| is_confidential | boolean | Default true |
| notes | text | Nullable |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### risk_assessments

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| case_id | integer | FK → cases (nullable) |
| assessed_by_id | integer | FK → users |
| title | text | Required |
| risk_level | enum | `low`, `medium`, `high`, `critical` |
| findings | text | Nullable |
| recommendations | text | Nullable |
| mitigation_plan | jsonb | Structured mitigation steps |
| valid_until | timestamp | Review expiry |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### audit_logs

| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| user_id | integer | FK → users (nullable for system actions) |
| action | text | e.g. `case.updated`, `document.encrypted` |
| resource_type | text | e.g. `case`, `document`, `session` |
| resource_id | text | Target resource identifier |
| ip_address | text | Nullable |
| user_agent | text | Nullable |
| metadata | jsonb | Additional context |
| created_at | timestamp | Auto, immutable |

## Seed Data (recommended)

```sql
INSERT INTO divisions (type, name, description) VALUES
  ('consultancy', 'Consultancy Division', 'Strategic advisory and compliance'),
  ('operations', 'Operations Division', 'Investigations and field operations'),
  ('training', 'Training Division', 'Professional development programmes'),
  ('polygraph', 'Polygraph & Integrity Testing Unit', 'Certified polygraph examinations');
```

## Migration

```bash
cd backend
npm run db:generate   # Generate migration from schema
npm run db:migrate    # Apply to Neon
```

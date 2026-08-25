# LEAF-C REST API Endpoints

Planned REST API surface for the LEAF-C platform. All endpoints require authentication unless noted. RBAC enforced via middleware.

**Base URL:** `https://api.leafc.example/v1`

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Email + password → JWT |
| POST | `/auth/refresh` | Bearer | Refresh access token |
| POST | `/auth/logout` | Bearer | Invalidate refresh token |
| GET | `/auth/me` | Bearer | Current user profile |

## Users & RBAC

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/users` | admin | List all users |
| POST | `/users` | admin | Create user |
| GET | `/users/:id` | admin, self | Get user by ID |
| PATCH | `/users/:id` | admin, self | Update user |
| DELETE | `/users/:id` | admin | Deactivate user |

### Role Permissions Matrix

| Resource | admin | investigator | client | trainer | polygraph_examiner |
|----------|-------|-------------|--------|---------|-------------------|
| All cases | CRUD | CRUD (assigned) | Read (own) | — | Read (linked) |
| Documents | CRUD | CRUD (case) | Read (own case) | — | Read (linked) |
| Training programmes | CRUD | Read | Read | CRUD | — |
| Enrollments | CRUD | — | Create/Read (self) | CRUD | — |
| Polygraph sessions | CRUD | Read (linked) | Create/Read (own) | — | CRUD |
| Risk assessments | CRUD | CRUD | Read (own case) | — | — |
| Audit logs | Read | — | — | — | — |

---

## Consultancy Division

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/consultancy/engagements` | admin, investigator, client | List consultancy engagements |
| POST | `/consultancy/engagements` | admin, client | Submit advisory inquiry |
| GET | `/consultancy/engagements/:id` | admin, investigator, client (own) | Engagement detail |
| PATCH | `/consultancy/engagements/:id` | admin, investigator | Update engagement status |
| GET | `/consultancy/engagements/:id/reports` | admin, investigator, client (own) | List reports for engagement |
| POST | `/consultancy/engagements/:id/reports` | admin, investigator | Submit advisory report |
| GET | `/consultancy/risk-assessments` | admin, investigator | List risk assessments |
| POST | `/consultancy/risk-assessments` | admin, investigator | Create risk assessment |
| GET | `/consultancy/risk-assessments/:id` | admin, investigator, client (linked) | Assessment detail |

---

## Operations Division

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/operations/cases` | admin, investigator | List investigation cases |
| POST | `/operations/cases` | admin, investigator | Create new case |
| GET | `/operations/cases/:id` | admin, investigator, client (own) | Case detail |
| PATCH | `/operations/cases/:id` | admin, investigator (assigned) | Update case |
| POST | `/operations/cases/:id/assign` | admin | Assign investigator |
| GET | `/operations/cases/:id/timeline` | admin, investigator | Case activity timeline |
| GET | `/operations/cases/:id/documents` | admin, investigator, client (own) | Case documents |
| POST | `/operations/cases/:id/documents` | admin, investigator | Upload document metadata |
| GET | `/operations/cases/:id/documents/:docId/download` | admin, investigator, client (own) | Presigned download URL |

---

## Training Division

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/training/programmes` | all authenticated | List active programmes |
| POST | `/training/programmes` | admin, trainer | Create programme |
| GET | `/training/programmes/:id` | all authenticated | Programme detail |
| PATCH | `/training/programmes/:id` | admin, trainer | Update programme |
| GET | `/training/programmes/:id/enrollments` | admin, trainer | List enrollments |
| POST | `/training/enrollments` | client, admin | Submit enrollment request |
| PATCH | `/training/enrollments/:id` | admin, trainer | Update enrollment status |
| POST | `/training/enrollments/:id/certificate` | admin, trainer | Issue certificate |

---

## Polygraph Division

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/polygraph/sessions` | admin, polygraph_examiner, investigator (linked) | List sessions |
| POST | `/polygraph/sessions` | admin, client, investigator | Request examination |
| GET | `/polygraph/sessions/:id` | admin, polygraph_examiner, client (own) | Session detail |
| PATCH | `/polygraph/sessions/:id` | admin, polygraph_examiner | Update session (schedule, results) |
| GET | `/polygraph/sessions/:id/calendar` | admin, polygraph_examiner | iCal export |
| GET | `/polygraph/examiners` | admin | List certified examiners |
| GET | `/polygraph/examiners/:id/availability` | admin, polygraph_examiner | Examiner schedule |

> **Note:** Polygraph result endpoints enforce field-level encryption. Clients receive redacted summaries only.

---

## Shared / Cross-Division

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/divisions` | all authenticated | List divisions |
| GET | `/dashboard/stats` | admin, investigator, trainer, polygraph_examiner | KPI aggregates |
| GET | `/audit-logs` | admin | Paginated audit trail |
| GET | `/health` | Public | Health check (existing) |
| GET | `/documents/:id` | role-based | Document metadata |
| DELETE | `/documents/:id` | admin, investigator (owner) | Soft-delete document |

---

## Error Responses

All endpoints return consistent error envelopes:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions for this resource",
    "details": {}
  }
}
```

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 401 | `UNAUTHORIZED` | Missing or expired token |
| 403 | `FORBIDDEN` | RBAC denial |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate enrollment, closed case, etc. |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

## Rate Limiting

- Public endpoints: 30 req/min per IP
- Authenticated: 120 req/min per user
- Document uploads: 10 req/min per user

## Versioning

URL path versioning (`/v1/`). Breaking changes increment major version. Deprecation notices sent via `Sunset` header 90 days before removal.

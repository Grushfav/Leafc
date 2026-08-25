# LEAF-C Deployment Plan — Cloudflare + AWS

Deployment strategy for the LEAF-C platform, optimised for global latency, security, and compliance.

## Architecture Summary

| Layer | Service | Region / Edge |
|-------|---------|---------------|
| Frontend | Cloudflare Pages | Global CDN (Miami, São Paulo PoPs) |
| API | Cloudflare Workers **or** AWS ECS/Lambda | Edge vs. sa-east-1 |
| Database | Neon Postgres | sa-east-1 (existing) |
| Documents | AWS S3 | sa-east-1 with SSE-KMS |
| DNS / WAF | Cloudflare | Global |

---

## Frontend — Cloudflare Pages

**Why:** Static Next.js export (`output: "export"`) deploys natively to Pages with zero server maintenance.

### Setup

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `cd frontend && npm ci && npm run build`
3. Output directory: `frontend/out`
4. Environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.leafc.example/v1`

### CDN & Global Latency

- Cloudflare anycast network serves static assets from nearest PoP
- Miami (MIA) and São Paulo (GRU) PoPs serve clients in the Americas
- Enable Brotli compression and HTTP/3
- Cache static assets with long TTL; HTML with short TTL + stale-while-revalidate

---

## Backend API — Cloudflare Workers vs AWS

### Option A: Cloudflare Workers (Recommended for MVP)

| Pros | Cons |
|------|------|
| Edge deployment — low latency for global clients | 128 MB memory limit per request |
| Native integration with Pages, WAF, Access | Drizzle/Postgres connection pooling via Hyperdrive needed |
| Pay-per-request, no idle cost | Express app requires Hono/itty-router rewrite |
| Built-in DDoS protection | Long-running operations need Queues |

**Integration:** Use Cloudflare Hyperdrive to pool connections to Neon Postgres in sa-east-1.

### Option B: AWS (ECS Fargate or Lambda)

| Pros | Cons |
|------|------|
| Keep existing Express codebase as-is | Higher baseline cost (ECS) or cold starts (Lambda) |
| Full Node.js runtime, no rewrite | Higher latency for distant regions unless CloudFront in front |
| Native S3, KMS, CloudWatch integration | More infrastructure to manage |
| VPC peering to Neon via private link | |

**Recommendation:** Start with **Cloudflare Workers + Hyperdrive** for API. Migrate compute-heavy workloads (document processing, report generation) to **AWS Lambda** as needed.

---

## Database — Neon Postgres

- **Region:** sa-east-1 (São Paulo) — already provisioned
- Connection pooling via Neon built-in pooler or Hyperdrive
- Branching for preview environments (PR → ephemeral DB branch)
- Automated backups with point-in-time recovery
- Row-level security (RLS) planned for multi-tenant client isolation

---

## Document Storage — AWS S3

| Setting | Value |
|---------|-------|
| Bucket | `leafc-documents-prod` |
| Region | sa-east-1 |
| Encryption | SSE-KMS (customer-managed key) |
| Access | Presigned URLs only (no public buckets) |
| Lifecycle | Transition to Glacier after 365 days |
| Versioning | Enabled |

Upload flow:
1. Client requests presigned URL from API
2. Direct upload to S3 from browser
3. API records metadata in `documents` table with `storage_key` and `encryption_key_id`

Optional: Cloudflare R2 as alternative (zero egress fees, S3-compatible API).

---

## Cloudflare Security Stack

| Feature | Configuration |
|---------|---------------|
| WAF | OWASP Core Ruleset + custom rules for API paths |
| DDoS | Automatic L3/L4/L7 protection |
| Bot Management | Challenge suspicious traffic on auth endpoints |
| SSL/TLS | Full (strict) mode, TLS 1.3 minimum |
| Cloudflare Access | Zero-trust gate for admin/staff routes |
| Rate Limiting | Per-endpoint rules (see endpoints.md) |

---

## Security Requirements

### Encryption

- **In transit:** TLS 1.3 everywhere (Pages, Workers, Neon, S3)
- **At rest:** S3 SSE-KMS, Neon encryption at rest, application-layer encryption for polygraph results
- **Keys:** AWS KMS for S3; Cloudflare Secrets Store or AWS Secrets Manager for API secrets

### RBAC

- JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie)
- Role claims embedded in JWT; middleware validates against endpoint matrix
- Field-level redaction for client role on sensitive resources

### Audit Trails

- All mutating API calls write to `audit_logs` table
- Immutable log — no UPDATE/DELETE permissions on audit table
- Cloudflare Logpush → S3 for edge request logs
- AWS CloudTrail for S3/KMS access events

---

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml (outline)
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci && npm run build && npm run lint
      - uses: cloudflare/pages-action@v1  # deploy on main only

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npm run typecheck
      - run: cd backend && npm run db:generate  # verify migrations compile
      - uses: cloudflare/wrangler-action@v3  # deploy Workers on main

  preview:
    if: github.event_name == 'pull_request'
    steps:
      - # Cloudflare Pages preview deployment
      - # Neon branch for PR database
```

### Environments

| Environment | Frontend | API | Database |
|-------------|----------|-----|----------|
| Production | `leafc.example` | `api.leafc.example` | Neon main branch |
| Staging | `staging.leafc.example` | `api-staging.leafc.example` | Neon staging branch |
| Preview | PR-specific Pages URL | PR Workers route | Neon PR branch |

---

## Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Cloudflare Analytics | Edge traffic, cache hit ratio, WAF events |
| Neon Dashboard | Query performance, connection pool metrics |
| AWS CloudWatch | S3 access, Lambda invocations |
| Sentry (optional) | Frontend + API error tracking |
| Uptime monitoring | Cloudflare Health Checks on `/health` |

---

## Cost Estimate (Monthly, MVP)

| Service | Estimate |
|---------|----------|
| Cloudflare Pages | Free tier |
| Cloudflare Workers | ~$5 (paid plan) |
| Neon Postgres | ~$19 (Launch plan) |
| AWS S3 (100 GB) | ~$3 |
| AWS KMS | ~$1 |
| **Total** | **~$28/month** |

---

## Rollout Phases

1. **Phase 1 (Current):** Static frontend on Pages, Express API on local/dev, schema deployed to Neon
2. **Phase 2:** Workers API with Hyperdrive, auth middleware, RBAC
3. **Phase 3:** S3 document pipeline, audit logging, Cloudflare Access for staff
4. **Phase 4:** Enterprise client onboarding, SLA monitoring, DR testing

# LEAF-C Architecture Overview

System architecture for the LEAF-C multidisciplinary investigative and compliance agency platform.

## High-Level System Architecture

```mermaid
graph TB
    subgraph clients [Clients & Staff]
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph cloudflare [Cloudflare Edge]
        Pages[Cloudflare Pages<br/>Static Next.js]
        WAF[Web Application Firewall]
        CDN[Global CDN]
        Workers[Cloudflare Workers<br/>API Gateway]
        Access[Cloudflare Access<br/>Zero Trust]
    end

    subgraph aws [AWS sa-east-1]
        S3[S3 Document Storage<br/>SSE-KMS Encrypted]
        KMS[AWS KMS<br/>Encryption Keys]
        Lambda[Lambda Functions<br/>Report Generation]
    end

    subgraph data [Data Layer]
        Neon[(Neon Postgres<br/>sa-east-1)]
        Hyperdrive[Hyperdrive<br/>Connection Pool]
    end

    Browser --> CDN
    Mobile --> CDN
    CDN --> WAF
    WAF --> Pages
    WAF --> Workers
    Access --> Workers
    Pages -->|NEXT_PUBLIC_API_URL| Workers
    Workers --> Hyperdrive
    Hyperdrive --> Neon
    Workers --> S3
    Workers --> Lambda
    S3 --> KMS
    Lambda --> S3
    Lambda --> Neon
```

## Application Layers

```mermaid
graph LR
    subgraph presentation [Presentation Layer]
        NextJS[Next.js 16 Static Export]
        UI[Component Library]
        Layout[Layout Shells]
    end

    subgraph api [API Layer]
        Express[Express / Workers API]
        Auth[JWT Auth Middleware]
        RBAC[RBAC Guard]
        Audit[Audit Logger]
    end

    subgraph domain [Domain Layer]
        Consultancy[Consultancy Module]
        Operations[Operations Module]
        Training[Training Module]
        Polygraph[Polygraph Module]
    end

    subgraph persistence [Persistence Layer]
        Drizzle[Drizzle ORM]
        Postgres[(Neon PostgreSQL)]
        ObjectStore[S3 / R2]
    end

    NextJS --> UI
    NextJS --> Layout
    NextJS -->|REST + JWT| Express
    Express --> Auth
    Auth --> RBAC
    RBAC --> Audit
    Audit --> Consultancy
    Audit --> Operations
    Audit --> Training
    Audit --> Polygraph
    Consultancy --> Drizzle
    Operations --> Drizzle
    Training --> Drizzle
    Polygraph --> Drizzle
    Drizzle --> Postgres
    Operations --> ObjectStore
    Polygraph --> ObjectStore
```

## Data Flow — Case Investigation Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant Frontend as Cloudflare Pages
    participant API as Workers API
    participant DB as Neon Postgres
    participant S3 as AWS S3
    participant Audit as Audit Log

    Client->>Frontend: Submit case inquiry
    Frontend->>API: POST /operations/cases
    API->>API: Validate JWT + RBAC
    API->>DB: INSERT cases (status: draft)
    API->>Audit: Log case.created
    API-->>Frontend: 201 Created

    Note over Client,S3: Document Upload Flow

    Client->>API: POST /operations/cases/:id/documents
    API->>S3: Generate presigned PUT URL
    API->>DB: INSERT documents (status: pending)
    API-->>Client: Presigned URL
    Client->>S3: PUT file (direct upload)
    Client->>API: PATCH document status → uploaded
    API->>DB: UPDATE documents
    API->>Audit: Log document.uploaded
```

## Data Flow — Polygraph Session

```mermaid
sequenceDiagram
    participant Agency as Requesting Agency
    participant API as Workers API
    participant DB as Neon Postgres
    participant Examiner as Polygraph Examiner
    participant Audit as Audit Log

    Agency->>API: POST /polygraph/sessions
    API->>DB: INSERT polygraph_sessions (requested)
    API->>Audit: Log session.requested
    API-->>Agency: 201 + reference number

    Examiner->>API: PATCH /polygraph/sessions/:id (scheduled)
    API->>DB: UPDATE status, scheduled_at
    API->>Audit: Log session.scheduled

    Examiner->>API: PATCH /polygraph/sessions/:id (completed)
    API->>API: Encrypt result_summary
    API->>DB: UPDATE status, encrypted result
    API->>Audit: Log session.completed

    Agency->>API: GET /polygraph/sessions/:id
    API->>API: RBAC check + redact for client role
    API-->>Agency: Redacted session summary
```

## Data Flow — Training Enrollment

```mermaid
sequenceDiagram
    participant Client
    participant API as Workers API
    participant DB as Neon Postgres

    Client->>API: GET /training/programmes
    API->>DB: SELECT active programmes
    API-->>Client: Programme list

    Client->>API: POST /training/enrollments
    API->>DB: Check seat availability
    API->>DB: INSERT enrollment (pending)
    API-->>Client: 201 Enrollment pending

    Note over API,DB: Trainer confirms

    API->>DB: UPDATE enrollment → confirmed
    API->>DB: Increment seat count
    API-->>Client: Notification (future)
```

## Frontend Route Map

```mermaid
graph TD
    Root["/"] --> Home[Homepage]
    Root --> Consultancy["/consultancy"]
    Root --> Operations["/operations"]
    Root --> Training["/training"]
    Root --> Polygraph["/polygraph"]
    Root --> Dashboard["/dashboard"]

    Dashboard --> KPIs[KPI Cards]
    Dashboard --> QuickActions[Quick Actions]
    Dashboard --> Charts[Chart Placeholders]
    Dashboard --> Activity[Audit Activity Table]

    Consultancy --> Engagements[Active Engagements]
    Consultancy --> InquiryForm[Advisory Inquiry Form]

    Operations --> CasePipeline[Case Pipeline]
    Operations --> CaseIntake[Case Intake Form]

    Training --> Programmes[Programme Cards]
    Training --> Enrollment[Enrollment Form]

    Polygraph --> SessionTypes[Examination Types]
    Polygraph --> Booking[Booking Form]
```

## Security Architecture

```mermaid
graph TB
    subgraph perimeter [Perimeter]
        CF_WAF[Cloudflare WAF]
        RateLimit[Rate Limiting]
        BotMgmt[Bot Management]
    end

    subgraph auth [Authentication & Authorization]
        JWT[JWT Tokens]
        RBAC[Role-Based Access Control]
        CF_Access[Cloudflare Access<br/>Staff Routes]
    end

    subgraph encryption [Encryption]
        TLS[TLS 1.3 In Transit]
        SSE[S3 SSE-KMS At Rest]
        AppEnc[App-Layer Encryption<br/>Polygraph Results]
    end

    subgraph audit [Audit & Compliance]
        AuditLog[audit_logs Table]
        CF_Logs[Cloudflare Logpush]
        CloudTrail[AWS CloudTrail]
    end

    CF_WAF --> JWT
    JWT --> RBAC
    RBAC --> TLS
    TLS --> SSE
    SSE --> AppEnc
    AppEnc --> AuditLog
    AuditLog --> CF_Logs
    AuditLog --> CloudTrail
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | Next.js (App Router, static export) | 16.x |
| Styling | Tailwind CSS | v4 |
| UI fonts | Montserrat + Inter | Google Fonts |
| Backend runtime | Express → Cloudflare Workers | 5.x |
| ORM | Drizzle ORM | 0.45.x |
| Database | Neon PostgreSQL | sa-east-1 |
| Document storage | AWS S3 | SSE-KMS |
| CDN / Edge | Cloudflare Pages + Workers | — |
| CI/CD | GitHub Actions | — |

## Monorepo Structure

```
Leafc/
├── frontend/           # Next.js static export
│   ├── app/            # App Router pages
│   ├── components/
│   │   ├── ui/         # Design system components
│   │   └── layout/     # Header, footer, dashboard shell
│   └── lib/            # Utilities
├── backend/            # Express API (→ Workers migration)
│   └── src/
│       ├── db/         # Drizzle schema + connection
│       └── routes/     # REST route handlers
├── docs/
│   ├── design/         # Design system documentation
│   ├── api/            # Schema + endpoint specs
│   ├── deployment/     # Infrastructure plan
│   └── architecture/   # This document
└── leafc_logo/         # Brand assets
```

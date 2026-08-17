# System architecture

OSS Contribution Manager is a Next.js web app that lets users track GitHub repositories and receive a filtered notification feed when maintainers or past contributors open new issues.

## High-level overview

```mermaid
flowchart TB
  subgraph clients [Clients]
    Browser[Browser dashboard]
  end

  subgraph vercel [Vercel]
    NextApp[Next.js App Router]
    API[API routes]
  end

  subgraph data [Data]
    Neon[(Neon Postgres)]
  end

  subgraph external [External services]
    GitHubOAuth[GitHub OAuth]
    GitHubAPI[GitHub REST API]
    GHA[GitHub Actions cron]
  end

  Browser --> NextApp
  NextApp --> API
  API --> Neon
  API --> GitHubOAuth
  API --> GitHubAPI
  GHA -->|"POST /api/poll"| API
```

| Layer | Technology | Role |
|-------|------------|------|
| Frontend | Next.js 14, React, Tailwind | Single-page dashboard at `/` |
| API | Next.js Route Handlers | Auth, repos, notifications, poll trigger |
| Auth | NextAuth v4 + GitHub OAuth | Sign-in, JWT sessions, token storage |
| Database | Prisma + Neon Postgres | Users, tracked repos, notifications |
| Polling | GitHub Actions + `/api/poll` | Scheduled issue checks every 15 min |
| Hosting | Vercel | Serverless deployment |

## Deployment topology

```mermaid
flowchart LR
  subgraph local [Local development]
    DevServer[npm run dev]
    NeonDev[(Neon dev branch)]
    DevServer --> NeonDev
  end

  subgraph production [Production]
    VercelApp[Vercel serverless]
    NeonMain[(Neon main branch)]
    VercelApp --> NeonMain
  end

  subgraph scheduling [Background polling]
    Workflow[GitHub Actions poll.yml]
    Workflow -->|"Bearer POLL_SECRET"| VercelApp
  end
```

- **Local:** `DATABASE_URL` points at a Neon **dev** branch.
- **Production:** Vercel env vars point at the Neon **main** branch.
- **Polling:** Does not run inside the app process by default — GitHub Actions POSTs to `/api/poll` on a cron schedule. Alternatively, run `npm run poll` locally or on any machine with DB access.

## Application layers

```
┌─────────────────────────────────────────────────────────┐
│  app/page.tsx              Dashboard UI (client)        │
│  app/providers.tsx         NextAuth SessionProvider     │
└────────────────────────────┬────────────────────────────┘
                             │ fetch /api/*
┌────────────────────────────▼────────────────────────────┐
│  app/api/                                               │
│    auth/[...nextauth]     GitHub OAuth (NextAuth)       │
│    repos/                 CRUD tracked repos            │
│    notifications/         List + mark read              │
│    poll/                  Trigger poll (secret-gated)   │
│    health/                Liveness check                │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│  lib/                                                   │
│    auth.ts                NextAuth config + callbacks   │
│    db.ts                  Prisma client singleton       │
│    github.ts              GitHub API + author filter    │
│    poll.ts                Poll orchestration            │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│  scripts/poll.ts           CLI entry → pollAllRepos()   │
└─────────────────────────────────────────────────────────┘
```

## Data model

```mermaid
erDiagram
  User ||--o{ TrackedRepo : tracks
  User ||--o{ Notification : receives
  TrackedRepo ||--o{ Notification : generates

  User {
    string id PK
    string githubId UK
    string githubLogin
    string accessToken
    datetime createdAt
  }

  TrackedRepo {
    string id PK
    string owner
    string name
    datetime addedAt
    datetime lastPolledAt
    int lastSeenIssueNumber
    string userId FK
  }

  Notification {
    string id PK
    int issueNumber
    string issueUrl
    string title
    string authorLogin
    string authorAssociation
    boolean read
    string repoId FK
    string userId FK
  }
```

**Key constraints:**
- One tracked repo per user per `owner/name` (`@@unique([userId, owner, name])`)
- One notification per repo per issue number (`@@unique([repoId, issueNumber])`)
- `lastSeenIssueNumber` on `TrackedRepo` is the poll cursor — only issues with a higher number are considered

## Core flows

### 1. Sign in

```mermaid
sequenceDiagram
  participant U as User browser
  participant N as Next.js
  participant GH as GitHub OAuth
  participant DB as Neon

  U->>N: GET /
  U->>N: Sign in with GitHub
  N->>GH: OAuth redirect
  GH->>N: Callback + access_token
  N->>DB: Upsert User (githubId, login, accessToken)
  N->>U: JWT session (userId in token)
```

- Session strategy is **JWT** (not database sessions).
- The GitHub `access_token` is stored on `User` and reused for authenticated GitHub API calls during polling (higher rate limits, private repo access).

### 2. Add a tracked repo

```mermaid
sequenceDiagram
  participant U as User browser
  participant N as POST /api/repos
  participant DB as Neon

  U->>N: { repo: "owner/name" or URL }
  N->>N: parseRepoInput()
  N->>DB: Create TrackedRepo (lastSeenIssueNumber = 0)
  N->>U: 201 Created
```

New repos start with `lastSeenIssueNumber = 0`, so the first poll only captures **future** issues — not historical ones.

### 3. Scheduled poll (production)

```mermaid
sequenceDiagram
  participant GHA as GitHub Actions
  participant P as POST /api/poll
  participant L as lib/poll.ts
  participant GH as GitHub API
  participant DB as Neon

  GHA->>P: Authorization: Bearer POLL_SECRET
  P->>P: Verify secret
  P->>L: pollAllRepos()
  loop Each TrackedRepo
    L->>GH: GET /repos/{owner}/{repo}/issues
    L->>L: Filter: number > lastSeenIssueNumber, not PR
    L->>L: Filter: author_association in OWNER|MEMBER|COLLABORATOR|CONTRIBUTOR
    L->>DB: Upsert Notification
    L->>DB: Update lastSeenIssueNumber, lastPolledAt
  end
  P->>GHA: { reposChecked, notificationsCreated, errors }
```

**Filter logic** lives in `lib/github.ts` (`MAINTAINER_ASSOCIATIONS`). Issues from `NONE`, `FIRST_TIMER`, etc. are silently skipped.

### 4. Dashboard refresh

```mermaid
sequenceDiagram
  participant U as User browser
  participant N as API
  participant DB as Neon

  loop Every 30 seconds while signed in
    U->>N: GET /api/repos + GET /api/notifications
    N->>DB: Query by session userId
    N->>U: JSON feed
  end
```

Mark-as-read: `POST /api/notifications/[id]/read` on hover.

## API surface

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/[...nextauth]` | GET/POST | — | GitHub OAuth flow |
| `/api/repos` | GET | Session | List user's tracked repos |
| `/api/repos` | POST | Session | Add repo |
| `/api/repos/[id]` | DELETE | Session | Remove repo |
| `/api/notifications` | GET | Session | Latest 100 notifications |
| `/api/notifications/[id]/read` | POST | Session | Mark notification read |
| `/api/poll` | POST | `Bearer POLL_SECRET` | Run poll job |
| `/api/health` | GET | — | `{ ok: true }` liveness |

## Security boundaries

| Asset | Protection |
|-------|------------|
| User sessions | NextAuth JWT encrypted with `NEXTAUTH_SECRET` |
| Poll endpoint | Shared secret `POLL_SECRET` (header check) |
| GitHub tokens | Stored in Postgres on `User.accessToken` |
| Database | Neon connection over TLS; pooled URL for runtime, direct for migrations |

**OAuth scopes:** `read:user repo` — enough to read user profile and repo issues (including private repos the user can access).

## External dependencies

```mermaid
flowchart LR
  App[OSS Manager]

  App --> Neon[Neon Postgres]
  App --> GitHubOAuth[GitHub OAuth App]
  App --> GitHubAPI[api.github.com]
  App --> Vercel[Vercel hosting]
  GHA[GitHub Actions] --> App
```

| Service | Required for | Free tier |
|---------|--------------|-----------|
| Neon | Persistent data | Yes |
| GitHub OAuth | User sign-in | Yes |
| GitHub API | Issue fetching | 5000 req/hr (authenticated) |
| Vercel | Production hosting | Yes |
| GitHub Actions | Scheduled polling | Yes (public repos) |

## Design decisions

1. **Poll via HTTP cron, not in-process timer** — Vercel serverless has no long-running workers; GitHub Actions (or external cron) triggers `/api/poll`.
2. **Per-user GitHub tokens for polling** — Uses each user's OAuth token so private repos and higher rate limits work without a global PAT.
3. **Issue number cursor** — Simple incremental polling; no webhook infrastructure required.
4. **Author association filter** — Uses GitHub's built-in `author_association` field instead of maintaining a contributor allowlist.
5. **Single dashboard page** — MVP UI in `app/page.tsx`; no separate component library yet.

## Related docs

- [Setup guide](setup.md) — provisioning Neon, OAuth, Vercel, and Actions
- [Environment variables](../.env.example) — full env template

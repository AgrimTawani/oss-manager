# OSS Contribution Manager

Track the open source repos you want to contribute to, and only get notified
when a maintainer, org member, collaborator, or past contributor opens a new
issue — never random drive-by issues from strangers.

## How it works

- Add any public (or, with access, private) GitHub repo by URL or `owner/name`.
- A background poller checks each tracked repo on a schedule and reads each
  new issue's `author_association` from the GitHub API.
- Only issues opened by someone with association `OWNER`, `MEMBER`,
  `COLLABORATOR`, or `CONTRIBUTOR` turn into a notification in your feed.
  Everyone else's issues are silently ignored.

## Stack

Next.js (App Router) · Prisma · Neon Postgres · NextAuth (GitHub OAuth) · Tailwind CSS · Vercel

## Quick start (local)

```bash
git clone https://github.com/AgrimTawani/oss-manager
cd oss-contrib-manager
npm install
cp .env.example .env
```

### 1. Neon database

1. Create a project at [neon.tech](https://neon.tech) (free tier).
2. Create a **dev** branch for local development; keep **main** for production.
3. Copy connection strings into `.env`:
   - `DATABASE_URL` — **pooled** URL (hostname includes `-pooler`)
   - `DATABASE_URL_UNPOOLED` — **direct** URL (no `-pooler`, for migrations)

Or run the Neon CLI wizard:

```bash
npx neon@latest init
```

Apply migrations to your dev branch:

```bash
npx prisma migrate dev
```

### 2. GitHub OAuth

Create an OAuth App at https://github.com/settings/developers

| Field | Local value |
|-------|-------------|
| Homepage URL | `http://localhost:3000` |
| Callback URL | `http://localhost:3000/api/auth/callback/github` |

Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`.

Generate secrets:

```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Set `NEXTAUTH_SECRET` and `POLL_SECRET` in `.env`.

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000, sign in with GitHub, add a repo, then:

```bash
npm run poll
```

## Environment variables

| Variable | Local | Vercel (production) |
|----------|-------|---------------------|
| `DATABASE_URL` | Neon dev branch (pooled) | Neon main branch (pooled) |
| `DATABASE_URL_UNPOOLED` | Neon dev branch (direct) | Neon main branch (direct) |
| `GITHUB_CLIENT_ID` | OAuth app | Same |
| `GITHUB_CLIENT_SECRET` | OAuth app | Same |
| `NEXTAUTH_SECRET` | Random | New random (prod) |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |
| `POLL_SECRET` | Random | New random (prod) |

See [`.env.example`](.env.example) for the full template.

## Deploy to Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Set all production env vars (Neon **main** branch URLs).
3. Add production OAuth callback: `https://your-app.vercel.app/api/auth/callback/github`
4. Deploy — build runs `prisma migrate deploy` automatically.

### GitHub Actions polling (production)

Add repo secrets under **Settings → Secrets → Actions**:

| Secret | Value |
|--------|-------|
| `APP_URL` | `https://your-app.vercel.app` |
| `POLL_SECRET` | Same as Vercel |

The workflow at [`.github/workflows/poll.yml`](.github/workflows/poll.yml) calls `/api/poll` every 15 minutes.

Manual poll (local or prod):

```bash
curl -X POST http://localhost:3000/api/poll -H "Authorization: Bearer YOUR_POLL_SECRET"
```

## Health check

```
GET /api/health
```

## Project structure

```
app/
  api/
    auth/[...nextauth]/  # GitHub OAuth
    repos/               # add/list/remove tracked repos
    notifications/       # read the feed, mark as read
    poll/                # triggers a poll run (called by cron/Actions)
    health/              # liveness check
  page.tsx               # the dashboard UI
lib/
  github.ts              # GitHub API + maintainer filter
  poll.ts                # core polling logic
  auth.ts                # NextAuth config
scripts/
  poll.ts                # run a poll from cron without HTTP
.agents/skills/          # Cursor agent skills (Neon, Vercel)
```

## Adjusting the filter

Edit `MAINTAINER_ASSOCIATIONS` in `lib/github.ts`. Possible values: `OWNER`, `MEMBER`,
`COLLABORATOR`, `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, `FIRST_TIMER`, `NONE`.

## License

MIT

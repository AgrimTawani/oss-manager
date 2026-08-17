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

## Quick start

```bash
git clone https://github.com/AgrimTawani/oss-manager
cd oss-contrib-manager
npm install
cp .env.example .env
```

Fill in `.env` (Neon URLs, GitHub OAuth, secrets), then:

```bash
npx prisma migrate deploy
npm run dev
```

See the **[docs/](docs/README.md)** folder for the full setup, deployment, and environment variable guides.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/architecture.md](docs/architecture.md) | System design, data model, and core flows |
| [docs/setup.md](docs/setup.md) | Neon, OAuth, Vercel deploy, GitHub Actions |
| [docs/README.md](docs/README.md) | Doc index and quick links |
| [.env.example](.env.example) | Environment variable template |

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
docs/                    # setup and deployment guides
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

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

## Quick start (local)

```bash
git clone <this-repo-url>
cd oss-contrib-manager
npm install
cp .env.example .env
```

1. Create a GitHub OAuth App at https://github.com/settings/developers
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy the client ID and secret into `.env`
2. Generate two secrets and add them to `.env`:
   ```bash
   openssl rand -base64 32   # -> NEXTAUTH_SECRET
   openssl rand -base64 32   # -> POLL_SECRET
   ```
3. Create the database and run the app:
   ```bash
   npm run db:push
   npm run dev
   ```
4. Open http://localhost:3000 and sign in with GitHub.

## Keeping it polling

The feed only updates when something actually polls GitHub. Pick one:

**Option A — GitHub Actions (recommended for deployed instances)**
The included workflow at `.github/workflows/poll.yml` calls your app's
`/api/poll` endpoint every 15 minutes. After deploying, add two repo secrets
in your fork's GitHub settings:
- `APP_URL` — your deployed URL (e.g. `https://your-app.vercel.app`)
- `POLL_SECRET` — the same value as in your `.env`

**Option B — your own cron**
Run `npm run poll` on any schedule (crontab, systemd timer, etc.) on a machine
that has access to the same database and `.env`.

**Option C — a hosted cron pinger**
Point any scheduled-HTTP service (cron-job.org, EasyCron, Vercel Cron) at:
```
POST https://your-app-url/api/poll
Authorization: Bearer <POLL_SECRET>
```

## Deploying

This is a standard Next.js + Prisma app — it deploys to Vercel, Railway,
Fly.io, or any Node host. For multi-user or production use, switch the
database from SQLite to Postgres:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`
2. Set `DATABASE_URL` to your Postgres connection string
3. Run `npm run db:push`

Remember to update your GitHub OAuth App's callback URL and `NEXTAUTH_URL`
to match your deployed domain.

## Tech stack

Next.js (App Router) · Prisma · NextAuth (GitHub OAuth) · Tailwind CSS

## Project structure

```
app/
  api/
    auth/[...nextauth]/  # GitHub OAuth
    repos/               # add/list/remove tracked repos
    notifications/       # read the feed, mark as read
    poll/                # triggers a poll run (called by cron/Actions)
  page.tsx               # the dashboard UI
lib/
  github.ts               # GitHub API calls + the maintainer/contributor filter
  poll.ts                 # core polling logic
  auth.ts                 # NextAuth config
scripts/
  poll.ts                 # run a poll from a plain cron job, no HTTP needed
```

## Adjusting the filter

To change which associations count as "official", edit `MAINTAINER_ASSOCIATIONS`
in `lib/github.ts`. Full list of possible values: `OWNER`, `MEMBER`,
`COLLABORATOR`, `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, `FIRST_TIMER`, `NONE`.

## License

MIT — do whatever you want with it.

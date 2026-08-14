# Remaining setup (requires your accounts)

Complete these steps after pulling the latest code. The codebase is wired for Neon + Vercel; you only need to plug in credentials.

## 1. Neon (required)

```powershell
npx neon@latest init
```

Or manually:

1. Create a project at https://neon.tech
2. Create a **dev** branch for local work
3. Copy **pooled** and **direct** connection strings into `.env`:
   - `DATABASE_URL` (pooled, `-pooler` in hostname)
   - `DATABASE_URL_UNPOOLED` (direct, no `-pooler`)

Apply migrations:

```powershell
npx prisma migrate deploy
```

## 2. GitHub OAuth (required)

1. https://github.com/settings/developers → New OAuth App
2. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`

## 3. Verify locally

```powershell
npm run dev
# Sign in, add a repo, then:
npm run poll
```

## 4. Deploy to Vercel

```powershell
npx vercel
```

Set production env vars in the Vercel dashboard (Neon **main** branch URLs, prod `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `POLL_SECRET`).

Add production OAuth callback: `https://<your-app>.vercel.app/api/auth/callback/github`

## 5. GitHub Actions secrets

In https://github.com/AgrimTawani/oss-manager/settings/secrets/actions:

| Secret | Value |
|--------|-------|
| `APP_URL` | Your Vercel URL |
| `POLL_SECRET` | Same as Vercel |

Then run the **Poll tracked repos** workflow manually once to verify.

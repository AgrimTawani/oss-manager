# Setup guide

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

Project linked: **agrimtawanis-projects/oss-manager**

Production URL (once env vars are set and build succeeds):

```
https://oss-manager-agrimtawanis-projects.vercel.app
```

Add these in the [Vercel dashboard](https://vercel.com/agrimtawanis-projects/oss-manager/settings/environment-variables):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon **main** branch pooled URL |
| `DATABASE_URL_UNPOOLED` | Neon **main** branch direct URL |
| `GITHUB_CLIENT_ID` | Your OAuth app |
| `GITHUB_CLIENT_SECRET` | Your OAuth app |
| `NEXTAUTH_SECRET` | New random secret for prod |
| `NEXTAUTH_URL` | `https://oss-manager-agrimtawanis-projects.vercel.app` |
| `POLL_SECRET` | Must match GitHub Actions secret (already set) |

Redeploy after adding env vars:

```powershell
npx vercel --prod
```

## 5. GitHub Actions secrets

Already configured on the repo:

| Secret | Value |
|--------|-------|
| `APP_URL` | `https://oss-manager-agrimtawanis-projects.vercel.app` |
| `POLL_SECRET` | Set (must match Vercel `POLL_SECRET`) |

Settings: https://github.com/AgrimTawani/oss-manager/settings/secrets/actions

Add production OAuth callback:

`https://oss-manager-agrimtawanis-projects.vercel.app/api/auth/callback/github`

Then run the **Poll tracked repos** workflow manually once to verify.

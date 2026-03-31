# RLink

Centralized access platform for RLink: an internal admin portal built on Next.js. It covers **CMS** (content and project listings), **CRM** (leads, reservations, inquiries, newsletter), and **IAM** (users, modules, activity logs), with email flows powered by Resend and authentication via Better Auth.

## Stack

| Area | Technology |
|------|------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com/) 4, [shadcn/ui](https://ui.shadcn.com/) (New York), [Radix UI](https://www.radix-ui.com/) |
| Data | [TanStack Query](https://tanstack.com/query), [TanStack Form](https://tanstack.com/form) |
| Database | [Neon](https://neon.tech/) (PostgreSQL) via `@neondatabase/serverless`, [Drizzle ORM](https://orm.drizzle.team/) |
| Auth | [Better Auth](https://www.better-auth.com/) (email/password, 2FA, admin plugin) |
| Email | [React Email](https://react.email/) + [Resend](https://resend.com/) |

## Project structure

```
rlink/
├── app/                    # App Router: pages and API routes
│   ├── api/                # Route handlers (REST-style resources, auth, cron, webhooks)
│   ├── home/               # Authenticated app (/home/*): cms, crm, iam, settings
│   ├── login/              # Public auth entry
│   ├── forgot-password/
│   ├── reset-password/
│   ├── globals.css
│   └── layout.tsx
├── components/             # Shared UI (layout, tables, modals, shadcn primitives)
├── db/
│   ├── schema.ts           # Application tables
│   └── auth-schema.ts      # Better Auth tables
├── drizzle/                # Generated SQL migrations (Drizzle Kit output)
├── hooks/                  # React hooks
├── lib/                    # Server/client utilities, auth, db, email, domain helpers
│   ├── cms/                # CMS types, queries, cache helpers
│   ├── crm/
│   ├── iam/
│   └── email/
├── templates/email/        # React Email templates
├── public/                 # Static assets
├── __tests__/              # Jest tests (API / lib)
├── drizzle.config.ts       # Drizzle Kit configuration
├── next.config.ts          # Images, security headers, CORS-related headers
├── proxy.ts                # Session redirect + API CORS helpers (use from root `middleware.ts` if you want edge-level gating)
└── vercel.json             # Cron schedule (activity log retention)
```

## Prerequisites

- **Node.js** (LTS recommended; align with your deployment target)
- **npm** (this repo uses `package-lock.json`)

## Setup

1. **Clone the repository** and install dependencies:

   ```bash
   npm install
   ```

2. **Environment variables** — create a `.env` file in the project root. Use the names below; values depend on your Neon project, Resend account, and deployment URL.

   | Variable | Purpose |
   |----------|---------|
   | `DATABASE_URL` | Neon PostgreSQL connection string (required for `lib/db.ts` and Drizzle) |
   | `NEXT_PUBLIC_APP_URL` | Public site URL (e.g. `http://localhost:3000` in dev); used by the auth client |
   | `BETTER_AUTH_URL` | Optional; fallback for app origin in some email/config paths |
   | `SITE_URL` | Used by health checks and cache-related tooling |
   | `ALLOWED_ORIGIN` | Production browser origin for API CORS (defaults in code exist for dev / a dev deploy host) |
   | `RESEND_API_KEY` | Sending transactional and campaign email |
   | `RESEND_FROM` | Default “from” address (falls back to a Resend onboarding sender if unset) |
   | `CRON_SECRET` | Bearer secret for `/api/cron/activity-logs-retention` (Vercel Cron) |
   | `REVALIDATION_SECRET` | Bearer secret for developer cache-clear API routes |

   Better Auth also expects its standard secret (commonly `BETTER_AUTH_SECRET`) and URL configuration per [Better Auth environment docs](https://www.better-auth.com/docs/installation); set those to match your `NEXT_PUBLIC_APP_URL` / deployment.

3. **Database schema** — apply migrations already committed under `drizzle/`, or generate and run new ones after editing `db/schema.ts` or `db/auth-schema.ts`:

   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

   For quick local iteration against a disposable database, `npx drizzle-kit push` is an alternative (use with care in production).

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login`. The dashboard under `/home` uses client-side protection (`ProtectedRoute`) and authenticated API routes; optional edge-level redirects/CORS logic is available in `proxy.ts` if you add a root `middleware.ts` that calls it.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | ESLint |
| `npm test` | Jest (`__tests__/**/*.test.ts`) |
| `npm run test:watch` | Jest in watch mode |

## Deployment notes

- **Vercel**: `vercel.json` defines a daily cron hitting `/api/cron/activity-logs-retention`. Set `CRON_SECRET` in the project environment and configure the cron job to send the expected `Authorization` header (see the route’s comment in `app/api/cron/activity-logs-retention/route.ts`).
- Set **`ALLOWED_ORIGIN`** to your real production origin so API CORS and `next.config.ts` stay aligned.
- Ensure **`NEXT_PUBLIC_APP_URL`** matches the deployed URL so the auth client and links resolve correctly.

## License

Private project (`"private": true` in `package.json`).

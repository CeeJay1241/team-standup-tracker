# Team Standup Tracker

A full-stack web app for small teams to log daily standup updates and track progress over time. Built with Next.js, PostgreSQL, Prisma, and Clerk.

## Features

- **Authentication** — Sign up / sign in via Clerk (email, Google, GitHub)
- **Team management** — Create teams, invite members by email, role-based access (admin/member)
- **Daily standups** — Submit entries with yesterday / today / blockers fields
- **Team feed** — View all team members' updates for today and recent days
- **Member timeline** — Chronological history of any member's standups
- **Missing detection** — Flags members who haven't posted by the configurable deadline
- **Streak tracking** — Consecutive-day posting streaks per member
- **Deadline configuration** — Admins set a daily deadline hour and timezone per team

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Clerk
- **Styling**: Tailwind CSS
- **Deployment**: Railway

## Database Schema

```
User         ← synced from Clerk via webhook
Team         ← name, deadline hour/minute, timezone
TeamMembership ← user + team + role (ADMIN | MEMBER), unique per pair
StandupEntry ← user + team + date + yesterday/today/blockers, unique per user/team/day
TeamInvite   ← email + team + status (PENDING | ACCEPTED | REVOKED)
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Clerk account (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd team-standup-tracker
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks (create one for `user.created`, `user.updated`, `user.deleted` pointing at `<your-url>/api/webhooks/clerk`) |
| `DATABASE_URL` | Your PostgreSQL connection string |

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Set up Clerk webhook

In the Clerk dashboard:

1. Go to **Webhooks** → **Add Endpoint**
2. URL: `https://<your-domain>/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret into `CLERK_WEBHOOK_SECRET`

For local development, use [ngrok](https://ngrok.com) to expose your local server.

## Deploy to Railway

1. Push your code to a GitHub repo
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Add a **PostgreSQL** service to the project
4. Railway auto-sets `DATABASE_URL`. Add the remaining env vars from `.env.example`
5. Set the build command: `npm run build`
6. Set the start command: `npm start`
7. Deploy. Railway gives you a public URL
8. Update your Clerk webhook endpoint to use the Railway URL

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── teams/          — CRUD for teams, invites, members
│   │   ├── standups/       — Submit and query standup entries
│   │   └── webhooks/clerk/ — Clerk user sync
│   ├── dashboard/          — Team list with today's status
│   ├── team/[teamId]/      — Team feed, standup form, member status
│   │   ├── settings/       — Admin: rename team, change deadline
│   │   └── member/[userId] — Individual member's standup timeline
│   ├── sign-in/            — Clerk sign-in
│   └── sign-up/            — Clerk sign-up
├── components/             — Reusable UI components
├── lib/
│   ├── prisma.ts           — Prisma client singleton
│   ├── auth.ts             — Auth helpers (getDbUser, requireAdmin)
│   ├── utils.ts            — Date formatting, deadline checks
│   └── types.ts            — Shared TypeScript types
└── middleware.ts            — Clerk route protection
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/teams` | User | List user's teams |
| POST | `/api/teams` | User | Create a team (creator becomes admin) |
| GET | `/api/teams/:id` | Member | Team details with today's status |
| PATCH | `/api/teams/:id` | Admin | Update team settings |
| POST | `/api/teams/:id/invite` | Admin | Invite by email |
| GET | `/api/teams/:id/invite` | Admin | List pending invites |
| DELETE | `/api/teams/:id/members` | Admin | Remove a member |
| GET | `/api/teams/:id/standups` | Member | Query standups (filterable by days, userId) |
| POST | `/api/standups` | Member | Submit or update today's standup |
| GET | `/api/standups?teamId=x` | Member | Get current user's streak |
| POST | `/api/webhooks/clerk` | Svix | Clerk webhook for user sync |

## License

MIT

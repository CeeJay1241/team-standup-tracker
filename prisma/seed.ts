import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "alex.chen@demo.com" },
      update: {},
      create: {
        clerkId: "demo_alex",
        email: "alex.chen@demo.com",
        name: "Alex Chen",
      },
    }),
    prisma.user.upsert({
      where: { email: "priya.sharma@demo.com" },
      update: {},
      create: {
        clerkId: "demo_priya",
        email: "priya.sharma@demo.com",
        name: "Priya Sharma",
      },
    }),
    prisma.user.upsert({
      where: { email: "jordan.lee@demo.com" },
      update: {},
      create: {
        clerkId: "demo_jordan",
        email: "jordan.lee@demo.com",
        name: "Jordan Lee",
      },
    }),
    prisma.user.upsert({
      where: { email: "maya.williams@demo.com" },
      update: {},
      create: {
        clerkId: "demo_maya",
        email: "maya.williams@demo.com",
        name: "Maya Williams",
      },
    }),
    prisma.user.upsert({
      where: { email: "sam.nakamura@demo.com" },
      update: {},
      create: {
        clerkId: "demo_sam",
        email: "sam.nakamura@demo.com",
        name: "Sam Nakamura",
      },
    }),
  ]);

  const [alex, priya, jordan, maya, sam] = users;

  // Create demo team
  const team = await prisma.team.upsert({
    where: { id: "demo-team-001" },
    update: {},
    create: {
      id: "demo-team-001",
      name: "Frontend Squad",
      deadlineHour: 10,
      deadlineMinute: 0,
      timezone: "America/New_York",
    },
  });

  // Add memberships
  for (const [user, role] of [
    [alex, "ADMIN"],
    [priya, "MEMBER"],
    [jordan, "MEMBER"],
    [maya, "MEMBER"],
    [sam, "MEMBER"],
  ] as const) {
    await prisma.teamMembership.upsert({
      where: { userId_teamId: { userId: user.id, teamId: team.id } },
      update: {},
      create: { userId: user.id, teamId: team.id, role },
    });
  }

  // Seed standups for the past 7 days
  const standups = [
    {
      user: alex,
      entries: [
        { day: 0, y: "Shipped the new dashboard layout", t: "Fixing responsive issues on mobile", b: "" },
        { day: 1, y: "Code review for auth PR", t: "Dashboard layout redesign", b: "Waiting on design specs for the sidebar" },
        { day: 2, y: "Fixed pagination bug in team feed", t: "Start dashboard redesign", b: "" },
        { day: 3, y: "Sprint planning meeting", t: "Pagination bug in team feed", b: "" },
        { day: 4, y: "Deployed v2.1 to staging", t: "Sprint planning prep", b: "" },
        { day: 5, y: "Finished notification system", t: "Deploy v2.1 to staging", b: "CI pipeline is slow" },
        { day: 6, y: "Worked on notification system", t: "Finish notifications and write tests", b: "" },
      ],
    },
    {
      user: priya,
      entries: [
        { day: 0, y: "Wrote unit tests for the API layer", t: "Integration tests for standup endpoints", b: "" },
        { day: 1, y: "Refactored auth middleware", t: "Unit tests for API layer", b: "" },
        { day: 2, y: "Helped Jordan debug the invite flow", t: "Refactor auth middleware", b: "" },
        { day: 3, y: "Set up error monitoring with Sentry", t: "Debug invite flow with Jordan", b: "" },
        { day: 5, y: "Database migration for new fields", t: "Set up Sentry", b: "Need Sentry credentials from ops" },
        { day: 6, y: "API endpoint for streak calculation", t: "Database migration planning", b: "" },
      ],
    },
    {
      user: jordan,
      entries: [
        { day: 0, y: "Fixed the email invite flow", t: "Add bulk invite feature", b: "SMTP rate limits on free tier" },
        { day: 1, y: "Debugged webhook retry logic", t: "Fix email invite flow", b: "Clerk webhook occasionally times out" },
        { day: 3, y: "Built the team settings page", t: "Webhook retry logic", b: "" },
        { day: 4, y: "Implemented role-based access checks", t: "Team settings UI", b: "" },
        { day: 5, y: "Started invite flow implementation", t: "Role-based access control", b: "" },
        { day: 6, y: "Reviewed Priya's migration PR", t: "Invite flow — email sending", b: "" },
      ],
    },
    {
      user: maya,
      entries: [
        { day: 0, y: "Designed the empty state illustrations", t: "Standup form UX improvements", b: "" },
        { day: 1, y: "Accessibility audit on all forms", t: "Empty state illustrations", b: "" },
        { day: 2, y: "Updated the color system for dark mode", t: "Accessibility audit", b: "" },
        { day: 3, y: "Built the streak badge component", t: "Dark mode color system", b: "" },
        { day: 4, y: "Created loading skeleton components", t: "Streak badge component", b: "" },
        { day: 5, y: "Responsive fixes for the team feed", t: "Loading skeletons", b: "" },
        { day: 6, y: "Design review with the team", t: "Responsive fixes", b: "Need to decide on mobile nav pattern" },
      ],
    },
    {
      user: sam,
      entries: [
        { day: 1, y: "Set up CI/CD pipeline", t: "Add preview deployments for PRs", b: "" },
        { day: 2, y: "Optimized database queries for feed", t: "CI/CD pipeline setup", b: "" },
        { day: 4, y: "Wrote the seed script for demo data", t: "Query optimization for feed page", b: "" },
        { day: 5, y: "Docker compose for local dev", t: "Seed script", b: "" },
        { day: 6, y: "README and setup documentation", t: "Docker compose setup", b: "" },
      ],
    },
  ];

  for (const { user, entries } of standups) {
    for (const entry of entries) {
      const date = new Date();
      date.setDate(date.getDate() - entry.day);
      date.setHours(0, 0, 0, 0);

      await prisma.standupEntry.upsert({
        where: {
          userId_teamId_date: {
            userId: user.id,
            teamId: team.id,
            date,
          },
        },
        update: {
          yesterday: entry.y,
          today: entry.t,
          blockers: entry.b,
        },
        create: {
          userId: user.id,
          teamId: team.id,
          date,
          yesterday: entry.y,
          today: entry.t,
          blockers: entry.b,
        },
      });
    }
  }

  console.log("Seeded demo data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
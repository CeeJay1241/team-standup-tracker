import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_TEAM_ID = "demo-team-001";

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sorted = dates
    .map((d) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    })
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Must have posted today or yesterday to have a streak
  if (sorted[0] !== today.getTime() && sorted[0] !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i - 1] - sorted[i];
    const oneDay = 86400000;
    if (diff === oneDay) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const [team, standups, members, allStandupDates] = await Promise.all([
    prisma.team.findUnique({ where: { id: DEMO_TEAM_ID } }),
    prisma.standupEntry.findMany({
      where: { teamId: DEMO_TEAM_ID, date: { gte: weekAgo } },
      include: {
        user: { select: { id: true, name: true, email: true, imageUrl: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.teamMembership.findMany({
      where: { teamId: DEMO_TEAM_ID },
      include: {
        user: { select: { id: true, name: true, email: true, imageUrl: true } },
      },
    }),
    // Get all standup dates per user for streak calculation
    prisma.standupEntry.findMany({
      where: { teamId: DEMO_TEAM_ID },
      select: { userId: true, date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  if (!team) {
    return NextResponse.json(
      { error: "Demo team not found. Run: npx prisma db seed" },
      { status: 404 }
    );
  }

  const todayStandups = standups.filter((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const postedUserIds = new Set(todayStandups.map((s) => s.userId));

  // Group dates by user for streak calculation
  const datesByUser = new Map<string, Date[]>();
  for (const entry of allStandupDates) {
    const dates = datesByUser.get(entry.userId) || [];
    dates.push(entry.date);
    datesByUser.set(entry.userId, dates);
  }

  return NextResponse.json({
    team,
    standups,
    members: members.map((m) => ({
      ...m,
      hasPostedToday: postedUserIds.has(m.userId),
      streak: calculateStreak(datesByUser.get(m.userId) || []),
    })),
  });
}
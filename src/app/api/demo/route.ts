import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_TEAM_ID = "demo-team-001";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const [team, standups, members] = await Promise.all([
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
  ]);

  if (!team) {
    return NextResponse.json({ error: "Demo team not found. Run: npx prisma db seed" }, { status: 404 });
  }

  const todayStandups = standups.filter((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const postedUserIds = new Set(todayStandups.map((s) => s.userId));

  return NextResponse.json({
    team,
    standups,
    members: members.map((m) => ({
      ...m,
      hasPostedToday: postedUserIds.has(m.userId),
    })),
  });
}
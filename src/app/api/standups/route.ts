import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, getUserMembership } from "@/lib/auth";

// POST /api/standups — submit a standup entry
export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId, yesterday, today, blockers } = await req.json();

  if (!teamId || !yesterday || !today) {
    return NextResponse.json(
      { error: "teamId, yesterday, and today are required" },
      { status: 400 }
    );
  }

  const membership = await getUserMembership(user.id, teamId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const standup = await prisma.standupEntry.upsert({
    where: {
      userId_teamId_date: {
        userId: user.id,
        teamId,
        date: todayDate,
      },
    },
    update: { yesterday, today, blockers: blockers || "" },
    create: {
      userId: user.id,
      teamId,
      date: todayDate,
      yesterday,
      today,
      blockers: blockers || "",
    },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
  });

  return NextResponse.json(standup, { status: 201 });
}

// GET /api/standups?teamId=xxx — get streak for current user
export async function GET(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  // Calculate streak: count consecutive days with entries going back from today
  const entries = await prisma.standupEntry.findMany({
    where: { userId: user.id, teamId },
    orderBy: { date: "desc" },
    select: { date: true },
    take: 365,
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < entries.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    const entryDate = new Date(entries[i].date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return NextResponse.json({ streak });
}

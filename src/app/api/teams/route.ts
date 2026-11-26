import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/auth";

// GET /api/teams — list teams for the current user
export async function GET() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(teams);
}

// POST /api/teams — create a new team
export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, deadlineHour, deadlineMinute, timezone } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name,
      deadlineHour: deadlineHour ?? 10,
      deadlineMinute: deadlineMinute ?? 0,
      timezone: timezone ?? "America/New_York",
      members: {
        create: { userId: user.id, role: "ADMIN" },
      },
    },
  });

  return NextResponse.json(team, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, requireAdmin } from "@/lib/auth";

// GET /api/teams/:teamId — get team details with members and today's status
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.teamMembership.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
      standups: {
        where: { date: today },
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Calculate who posted today
  const postedUserIds = new Set(team.standups.map((s) => s.userId));
  const membersWithStatus = team.members.map((m) => ({
    ...m,
    hasPostedToday: postedUserIds.has(m.userId),
  }));

  return NextResponse.json({
    ...team,
    members: membersWithStatus,
    currentUserRole: membership.role,
  });
}

// PATCH /api/teams/:teamId — update team settings (admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await requireAdmin(teamId);
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { name, deadlineHour, deadlineMinute, timezone } = await req.json();

  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(name && { name }),
      ...(deadlineHour !== undefined && { deadlineHour }),
      ...(deadlineMinute !== undefined && { deadlineMinute }),
      ...(timezone && { timezone }),
    },
  });

  return NextResponse.json(team);
}

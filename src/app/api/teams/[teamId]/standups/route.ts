import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, getUserMembership } from "@/lib/auth";

// GET /api/teams/:teamId/standups?days=7&userId=xxx
export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserMembership(user.id, teamId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");
  const filterUserId = searchParams.get("userId");

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const standups = await prisma.standupEntry.findMany({
    where: {
      teamId,
      date: { gte: since },
      ...(filterUserId && { userId: filterUserId }),
    },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(standups);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, requireAdmin } from "@/lib/auth";

// DELETE /api/teams/:teamId/members — remove a member (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await requireAdmin(user.id);
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { userId } = await req.json();

  // Can't remove yourself as the last admin
  if (userId === user.id) {
    const adminCount = await prisma.teamMembership.count({
      where: { teamId, role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Can't remove the last admin" },
        { status: 400 }
      );
    }
  }

  await prisma.teamMembership.delete({
    where: { userId_teamId: { userId, teamId } },
  });

  return NextResponse.json({ removed: true });
}

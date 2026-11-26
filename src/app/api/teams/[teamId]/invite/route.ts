import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, requireAdmin } from "@/lib/auth";

// POST /api/teams/:teamId/invite — invite a user by email (admin only)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await requireAdmin(user.id, teamId);
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Check if already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMembership = await prisma.teamMembership.findUnique({
      where: { userId_teamId: { userId: existingUser.id, teamId } },
    });
    if (existingMembership) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    // User exists, add them directly
    await prisma.teamMembership.create({
      data: { userId: existingUser.id, teamId, role: "MEMBER" },
    });

    // Also create an accepted invite record
    await prisma.teamInvite.upsert({
      where: { email_teamId: { email, teamId } },
      update: { status: "ACCEPTED" },
      create: { email, teamId, status: "ACCEPTED" },
    });

    return NextResponse.json({ status: "added" }, { status: 201 });
  }

  // User doesn't exist yet — create a pending invite
  const invite = await prisma.teamInvite.upsert({
    where: { email_teamId: { email, teamId } },
    update: { status: "PENDING" },
    create: { email, teamId, status: "PENDING" },
  });

  return NextResponse.json({ status: "invited", invite }, { status: 201 });
}

// GET /api/teams/:teamId/invite — list invites (admin only)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await requireAdmin(user.id, teamId);
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const invites = await prisma.teamInvite.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}

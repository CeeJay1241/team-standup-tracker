import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  // Try to find existing user
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    // Auto-create from Clerk session data
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@unknown.com`;
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      null;

    user = await prisma.user.upsert({
      where: { clerkId },
      update: { email, name, imageUrl: clerkUser.imageUrl },
      create: { clerkId, email, name, imageUrl: clerkUser.imageUrl },
    });

    // Auto-accept any pending invites for this email
    const pendingInvites = await prisma.teamInvite.findMany({
      where: { email, status: "PENDING" },
    });

    for (const invite of pendingInvites) {
      await prisma.teamMembership.create({
        data: { userId: user.id, teamId: invite.teamId, role: "MEMBER" },
      });
      await prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      });
    }
  }

  return user;
}

export async function getUserMembership(teamId: string) {
  const user = await getDbUser();
  if (!user) return null;

  return prisma.teamMembership.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
  });
}

export async function requireAdmin(teamId: string) {
  const membership = await getUserMembership(teamId);
  if (!membership || membership.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return membership;
}
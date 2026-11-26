import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  // If user doesn't exist yet (webhook hasn't fired), create them
  if (!user) {
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;
    return prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  return user;
}

export async function getUserMembership(userId: string, teamId: string) {
  return prisma.teamMembership.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
}

export async function requireAdmin(userId: string, teamId: string) {
  const membership = await getUserMembership(userId, teamId);
  if (!membership || membership.role !== "ADMIN") {
    return false;
  }
  return true;
}

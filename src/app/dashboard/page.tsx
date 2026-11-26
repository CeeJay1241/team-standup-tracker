import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      _count: { select: { members: true } },
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check if user has posted today for each team
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntries = await prisma.standupEntry.findMany({
    where: {
      userId: user.id,
      date: today,
    },
    select: { teamId: true },
  });

  const postedTeamIds = new Set(todayEntries.map((e) => e.teamId));

  const teamsWithStatus = teams.map((t) => ({
    id: t.id,
    name: t.name,
    memberCount: t._count.members,
    role: t.members[0]?.role || "MEMBER",
    hasPostedToday: postedTeamIds.has(t.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardClient />
      </div>

      {teamsWithStatus.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-500">You&apos;re not on any teams yet.</p>
          <p className="text-sm text-gray-400">
            Create a team to get started, or ask an admin to invite you.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teamsWithStatus.map((team) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              className="block rounded-xl border bg-white p-5 hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{team.name}</h2>
                <span className="text-xs text-gray-400">
                  {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">
                  {team.role.toLowerCase()}
                </span>
                {team.hasPostedToday ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    ✓ Posted today
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Post standup →
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

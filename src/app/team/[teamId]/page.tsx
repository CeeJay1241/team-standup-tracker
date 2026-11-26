import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isBeforeDeadline } from "@/lib/utils";
import StandupCard from "@/components/StandupCard";
import MemberStatusList from "@/components/MemberStatusList";
import TeamPageClient from "./TeamPageClient";
import StandupForm from "@/components/StandupForm";
import Link from "next/link";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const membership = await prisma.teamMembership.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
  });
  if (!membership) redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      },
    },
  });

  if (!team) redirect("/dashboard");

  // Today's standups
  const todayStandups = await prisma.standupEntry.findMany({
    where: { teamId, date: today },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const postedUserIds = new Set(todayStandups.map((s) => s.userId));
  const membersWithStatus = team.members.map((m) => ({
    ...m,
    role: m.role as string,
    hasPostedToday: postedUserIds.has(m.userId),
  }));

  const pastDeadline = !isBeforeDeadline(
    team.deadlineHour,
    team.deadlineMinute,
    team.timezone
  );

  // Current user's existing entry for today
  const myEntry = todayStandups.find((s) => s.userId === user.id) || null;

  // Recent entries (last 7 days, excluding today)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const recentStandups = await prisma.standupEntry.findMany({
    where: {
      teamId,
      date: { gte: weekAgo, lt: today },
    },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-1">{team.name}</h1>
        </div>
        {membership.role === "ADMIN" && (
          <TeamPageClient teamId={teamId} />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: standup form + feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Standup form */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-4">
              {myEntry ? "Update Today's Standup" : "Post Today's Standup"}
            </h2>
            <StandupForm
              teamId={teamId}
              existingEntry={
                myEntry
                  ? {
                      yesterday: myEntry.yesterday,
                      today: myEntry.today,
                      blockers: myEntry.blockers,
                    }
                  : null
              }
            />
          </div>

          {/* Today's feed */}
          {todayStandups.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Today&apos;s Standups</h2>
              <div className="space-y-3">
                {todayStandups.map((entry) => (
                  <StandupCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {/* Recent feed */}
          {recentStandups.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Recent Updates</h2>
              <div className="space-y-3">
                {recentStandups.map((entry) => (
                  <StandupCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: member status */}
        <div>
          <div className="rounded-xl border bg-white p-5 sticky top-20">
            <h2 className="font-semibold mb-3">Team Status</h2>
            <MemberStatusList
              members={membersWithStatus}
              pastDeadline={pastDeadline}
            />

            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Members
              </h3>
              {team.members.map((m) => (
                <Link
                  key={m.id}
                  href={`/team/${teamId}/member/${m.user.id}`}
                  className="flex items-center gap-2 py-1.5 text-sm text-blue-600 hover:underline"
                >
                  {m.user.name || m.user.email} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

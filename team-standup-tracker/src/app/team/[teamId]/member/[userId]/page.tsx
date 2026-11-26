import { prisma } from "@/lib/prisma";
import { getDbUser, getUserMembership } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import StandupCard from "@/components/StandupCard";
import StreakBadge from "@/components/StreakBadge";

export default async function MemberTimelinePage({
  params,
}: {
  params: Promise<{ teamId: string; userId: string }>;
}) {
  const { teamId, userId: memberUserId } = await params;
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const membership = await getUserMembership(user.id, teamId);
  if (!membership) redirect("/dashboard");

  const member = await prisma.user.findUnique({
    where: { id: memberUserId },
    select: { id: true, name: true, email: true, imageUrl: true },
  });

  if (!member) redirect(`/team/${teamId}`);

  // Get all standups for this member on this team
  const standups = await prisma.standupEntry.findMany({
    where: { userId: memberUserId, teamId },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
    orderBy: { date: "desc" },
    take: 60,
  });

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < standups.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    const entryDate = new Date(standups[i].date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  const displayName = member.name || member.email;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/team/${teamId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to team
        </Link>

        <div className="flex items-center gap-3 mt-2">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-medium text-blue-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">
                {standups.length} standup{standups.length !== 1 ? "s" : ""}
              </span>
              <StreakBadge streak={streak} />
            </div>
          </div>
        </div>
      </div>

      {standups.length === 0 ? (
        <p className="text-gray-500 text-sm">No standups yet.</p>
      ) : (
        <div className="space-y-3">
          {standups.map((entry) => (
            <StandupCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

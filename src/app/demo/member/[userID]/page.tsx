import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StandupCard from "@/components/StandupCard";
import StreakBadge from "@/components/StreakBadge";
import Link from "next/link";

const DEMO_TEAM_ID = "demo-team-001";

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sorted = dates
    .map((d) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    })
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (sorted[0] !== today.getTime() && sorted[0] !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i - 1] - sorted[i];
    if (diff === 86400000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default async function DemoMemberPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const membership = await prisma.teamMembership.findFirst({
    where: { teamId: DEMO_TEAM_ID, userId },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
  });

  if (!membership) return notFound();

  const standups = await prisma.standupEntry.findMany({
    where: { teamId: DEMO_TEAM_ID, userId },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
    orderBy: { date: "desc" },
  });

  const streak = calculateStreak(standups.map((s) => s.date));
  const name = membership.user.name || membership.user.email;

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back to demo
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-medium text-blue-700">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-sm text-gray-500 capitalize">{membership.role.toLowerCase()}</p>
          </div>
          {streak > 1 && <StreakBadge streak={streak} />}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {standups.length} standup{standups.length !== 1 ? "s" : ""} logged
        </p>

        <div className="space-y-3">
          {standups.map((entry) => (
            <StandupCard key={entry.id} entry={entry} />
          ))}
        </div>

        {standups.length === 0 && (
          <p className="text-gray-400 text-center py-8">No standups yet.</p>
        )}
      </div>
    </div>
  );
}
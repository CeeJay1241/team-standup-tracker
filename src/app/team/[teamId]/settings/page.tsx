import { prisma } from "@/lib/prisma";
import { getDbUser, requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const isAdmin = await requireAdmin(user.id, teamId);
  if (!isAdmin) redirect(`/team/${teamId}`);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      invites: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!team) redirect("/dashboard");

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link
          href={`/team/${teamId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to team
        </Link>
        <h1 className="text-2xl font-bold mt-1">Team Settings</h1>
      </div>

      <SettingsForm
        teamId={teamId}
        initialName={team.name}
        initialDeadlineHour={team.deadlineHour}
        initialTimezone={team.timezone}
      />

      {/* Members */}
      <div className="rounded-xl border bg-white p-5 space-y-3">
        <h2 className="font-semibold">Members</h2>
        {team.members.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-1">
            <span className="text-sm">
              {m.user.name || m.user.email}
              {m.role === "ADMIN" && (
                <span className="ml-2 text-xs text-gray-400">admin</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Pending invites */}
      {team.invites.length > 0 && (
        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h2 className="font-semibold">Pending Invites</h2>
          {team.invites.map((inv) => (
            <div key={inv.id} className="text-sm text-gray-600">
              {inv.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

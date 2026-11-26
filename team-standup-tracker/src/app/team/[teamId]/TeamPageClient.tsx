"use client";

import { useState } from "react";
import InviteModal from "@/components/InviteModal";
import Link from "next/link";

type Props = {
  teamId: string;
};

export default function TeamPageClient({ teamId }: Props) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowInvite(true)}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-blue-700 transition"
      >
        + Invite
      </button>
      <Link
        href={`/team/${teamId}/settings`}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
      >
        Settings
      </Link>
      {showInvite && (
        <InviteModal
          teamId={teamId}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import CreateTeamModal from "@/components/CreateTeamModal";

export default function DashboardClient() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowCreate(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 transition"
      >
        + New Team
      </button>
      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}
    </>
  );
}

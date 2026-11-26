"use client";

import { useEffect, useState } from "react";
import StandupCard from "./StandupCard";
import StreakBadge from "./StreakBadge";
import Link from "next/link";

type Member = {
  id: string;
  role: string;
  hasPostedToday: boolean;
  streak: number;
  userId: string;
  user: { id: string; name: string | null; email: string; imageUrl: string | null };
};

type Standup = {
  id: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string; imageUrl: string | null };
};

type DemoData = {
  team: { name: string; deadlineHour: number };
  standups: Standup[];
  members: Member[];
};

export default function DemoFeed() {
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/demo")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Loading demo...</div>;
  }

  if (!data || !data.team) {
    return (
      <div className="text-center text-gray-500 py-8">
        Demo data not loaded. Run <code className="bg-gray-100 px-2 py-0.5 rounded">npx prisma db seed</code> to populate.
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayStandups = data.standups.filter(
    (s) => new Date(s.date).toISOString().split("T")[0] === today
  );
  const olderStandups = data.standups.filter(
    (s) => new Date(s.date).toISOString().split("T")[0] !== today
  );
  const posted = data.members.filter((m) => m.hasPostedToday);
  const missing = data.members.filter((m) => !m.hasPostedToday);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Feed */}
      <div className="lg:col-span-2 space-y-6">
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

        {olderStandups.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">Recent Updates</h2>
            <div className="space-y-3">
              {olderStandups.map((entry) => (
                <StandupCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div>
        <div className="rounded-xl border bg-white p-5 sticky top-20 space-y-4">
          <h2 className="font-semibold">{data.team.name}</h2>

          <div className="text-sm text-gray-500">
            {posted.length}/{data.members.length} posted today
            {missing.length > 0 && (
              <span className="text-red-500 ml-1">
                · {missing.length} missing
              </span>
            )}
          </div>

          <div className="space-y-1">
            {data.members.map((m) => {
              const name = m.user.name || m.user.email;
              return (
                <Link
                  href={`/demo/member/${m.user.id}`}
                  key={m.id}
                  className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded px-1 -mx-1 transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                      {name.charAt(0)}
                    </div>
                    <span className="text-sm">{name}</span>
                    {m.streak > 1 && <StreakBadge streak={m.streak} />}
                  </div>
                  {m.hasPostedToday ? (
                    <span className="text-xs text-green-600 font-medium">✓ Posted</span>
                  ) : (
                    <span className="text-xs text-red-500 font-medium">✗ Missing</span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t text-xs text-gray-400">
            Deadline: {data.team.deadlineHour}:00 AM · Demo data
          </div>
        </div>
      </div>
    </div>
  );
}
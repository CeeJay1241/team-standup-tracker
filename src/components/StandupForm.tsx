"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  teamId: string;
  existingEntry?: {
    yesterday: string;
    today: string;
    blockers: string;
  } | null;
};

export default function StandupForm({ teamId, existingEntry }: Props) {
  const router = useRouter();
  const [yesterday, setYesterday] = useState(existingEntry?.yesterday || "");
  const [today, setToday] = useState(existingEntry?.today || "");
  const [blockers, setBlockers] = useState(existingEntry?.blockers || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/standups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, yesterday, today, blockers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      router.push(`/team/${teamId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What did you do yesterday?
        </label>
        <textarea
          value={yesterday}
          onChange={(e) => setYesterday(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Finished the auth flow, reviewed PRs..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What are you doing today?
        </label>
        <textarea
          value={today}
          onChange={(e) => setToday(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Working on the dashboard, pair programming..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Any blockers?
        </label>
        <textarea
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="None / Waiting on API access..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {submitting
          ? "Submitting..."
          : existingEntry
          ? "Update Standup"
          : "Submit Standup"}
      </button>
    </form>
  );
}

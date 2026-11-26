"use client";

import { useState } from "react";

export default function DemoStandupForm() {
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center space-y-3">
        <div className="text-2xl">✓</div>
        <p className="font-medium">Standup submitted!</p>
        <p className="text-sm text-gray-500">
          In the full app, this saves to the database and shows up in your team&apos;s feed.
        </p>
        <button
          onClick={() => {
            setYesterday("");
            setToday("");
            setBlockers("");
            setSubmitted(false);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-4">
      <h3 className="font-semibold">Try submitting a standup</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What did you do yesterday?
        </label>
        <textarea
          value={yesterday}
          onChange={(e) => setYesterday(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Shipped the new dashboard layout..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What are you working on today?
        </label>
        <textarea
          value={today}
          onChange={(e) => setToday(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Fixing responsive issues on mobile..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Any blockers?
        </label>
        <textarea
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Waiting on design specs..."
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 transition"
      >
        Submit Standup
      </button>
    </form>
  );
}
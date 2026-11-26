"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  teamId: string;
  initialName: string;
  initialDeadlineHour: number;
  initialTimezone: string;
};

export default function SettingsForm({
  teamId,
  initialName,
  initialDeadlineHour,
  initialTimezone,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [deadlineHour, setDeadlineHour] = useState(initialDeadlineHour);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch(`/api/teams/${teamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, deadlineHour, timezone }),
    });

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-5 space-y-4"
    >
      <h2 className="font-semibold">General</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Team Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Standup Deadline
        </label>
        <select
          value={deadlineHour}
          onChange={(e) => setDeadlineHour(parseInt(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {i === 0
                ? "12:00 AM"
                : i < 12
                ? `${i}:00 AM`
                : i === 12
                ? "12:00 PM"
                : `${i - 12}:00 PM`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="America/New_York">Eastern (ET)</option>
          <option value="America/Chicago">Central (CT)</option>
          <option value="America/Denver">Mountain (MT)</option>
          <option value="America/Los_Angeles">Pacific (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Berlin">Berlin (CET)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </form>
  );
}

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Team Standup Tracker
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Keep your team aligned with daily standup updates.
            Track progress, spot blockers, and build streaks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-100 transition"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 text-sm text-gray-500">
          <div>
            <div className="text-2xl font-bold text-gray-900">📝</div>
            <div className="mt-1">Daily entries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">🔥</div>
            <div className="mt-1">Streak tracking</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">👥</div>
            <div className="mt-1">Team feeds</div>
          </div>
        </div>
      </div>
    </div>
  );
}

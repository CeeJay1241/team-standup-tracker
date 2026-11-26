import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import DemoFeed from "@/components/DemoFeed";
import DemoStandupForm from "@/components/DemoStandupForm";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-lg">Standup Tracker</span>
          <div className="flex gap-2">
            {userId ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white font-medium hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white font-medium hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Team Standup Tracker
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-xl mx-auto">
          Daily standups, streak tracking, and blocker detection for small teams.
          Here&apos;s a live demo with the Frontend Squad.
        </p>
      </div>

      {/* Demo feed */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <DemoFeed />
      </div>

      {/* Try it sandbox */}
      <div className="max-w-xl mx-auto px-4 pb-16">
        <DemoStandupForm />
      </div>
    </div>
  );
}
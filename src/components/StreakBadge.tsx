type Props = {
  streak: number;
};

export default function StreakBadge({ streak }: Props) {
  if (streak === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
      🔥 {streak} day{streak !== 1 ? "s" : ""}
    </span>
  );
}

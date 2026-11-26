import { formatDate } from "@/lib/utils";

type Props = {
  entry: {
    id: string;
    date: Date | string;
    yesterday: string;
    today: string;
    blockers: string;
    createdAt: Date | string;
    user: {
      name: string | null;
      email: string;
      imageUrl: string | null;
    };
  };
};

export default function StandupCard({ entry }: Props) {
  const displayName = entry.user.name || entry.user.email;

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {entry.user.imageUrl ? (
            <img
              src={entry.user.imageUrl}
              alt=""
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium">{displayName}</span>
        </div>
        <span className="text-xs text-gray-500">
          {formatDate(entry.date)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-500">Yesterday: </span>
          <span className="text-gray-900">{entry.yesterday}</span>
        </div>
        <div>
          <span className="font-medium text-gray-500">Today: </span>
          <span className="text-gray-900">{entry.today}</span>
        </div>
        {entry.blockers && (
          <div>
            <span className="font-medium text-red-500">Blockers: </span>
            <span className="text-gray-900">{entry.blockers}</span>
          </div>
        )}
      </div>
    </div>
  );
}

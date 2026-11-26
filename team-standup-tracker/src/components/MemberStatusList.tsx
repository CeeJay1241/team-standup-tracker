"use client";

type Member = {
  id: string;
  role: string;
  hasPostedToday: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
};

type Props = {
  members: Member[];
  pastDeadline: boolean;
};

export default function MemberStatusList({ members, pastDeadline }: Props) {
  const posted = members.filter((m) => m.hasPostedToday);
  const missing = members.filter((m) => !m.hasPostedToday);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium">
          {posted.length}/{members.length} posted today
        </span>
        {pastDeadline && missing.length > 0 && (
          <span className="text-red-500 font-medium">
            • {missing.length} missing
          </span>
        )}
      </div>

      <div className="space-y-1">
        {members.map((m) => {
          const name = m.user.name || m.user.email;
          return (
            <div
              key={m.id}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex items-center gap-2">
                {m.user.imageUrl ? (
                  <img
                    src={m.user.imageUrl}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm">{name}</span>
                {m.role === "ADMIN" && (
                  <span className="text-xs text-gray-400">admin</span>
                )}
              </div>

              {m.hasPostedToday ? (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Posted
                </span>
              ) : pastDeadline ? (
                <span className="text-xs text-red-500 font-medium">
                  ✗ Missing
                </span>
              ) : (
                <span className="text-xs text-gray-400">Pending</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

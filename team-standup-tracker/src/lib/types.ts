export type MemberWithStatus = {
  id: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
  hasPostedToday: boolean;
  streak: number;
};

export type StandupWithUser = {
  id: string;
  date: Date;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
};

export type TeamWithMembers = {
  id: string;
  name: string;
  deadlineHour: number;
  deadlineMinute: number;
  timezone: string;
  _count: { members: number };
};

export type OverviewResponse = {
  activeMissions: number;
  upcomingSessions: number;
  totalUsers: number;
  totalSchedules: number;
  pendingSubmissions: number;
};

export type ScheduleItemResponse = {
  id: string;
  day: string;
  startsAt: string;
  endsAt: string;
  title: string;
  location: string;
};

export type MissionResponse = {
  id: string;
  title: string;
  points: number;
  active: boolean;
  pendingApprovals: number;
};

export type SessionResponse = {
  id: string;
  team: string;
  title: string;
  speaker: string;
  room: string;
  liveQa: boolean;
  pendingQuestions: number;
};

export type UserResponse = {
  id: string;
  name: string;
  team: string;
  department: string;
  role: string;
};

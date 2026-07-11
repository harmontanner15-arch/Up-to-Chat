export type DurationOption = {
  label: string;
  minutes: number;
};

export type ActivityOption = {
  id: string;
  label: string;
};

export type Member = {
  id: string;
  initials: string;
  colorIndex: number;
};

export type Circle = {
  id: string;
  name: string;
  members: Member[];
  memberCount: number;
  activeCount: number;
};

export type UpToChatStatus = {
  isActive: boolean;
  activity: string | null;
  durationMinutes: number | null;
  startedAt: number | null;
  circleIds: string[];
};

export type AlertItem = {
  id: string;
  member: Member;
  name: string;
  isLive: boolean;
  activity: string;
  timeLabel: string;
  relativeTime: string;
  quote?: string;
};

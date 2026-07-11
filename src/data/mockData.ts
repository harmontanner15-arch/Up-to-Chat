import { ActivityOption, AlertItem, Circle, DurationOption, Member } from './types';

export const currentUser = {
  id: 'u-tanner',
  firstName: 'Tanner',
  initials: 'T',
};

export const durationOptions: DurationOption[] = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: 'Custom', minutes: 0 },
];

export const activityOptions: ActivityOption[] = [
  { id: 'coffee', label: 'Coffee' },
  { id: 'driving', label: 'Driving' },
  { id: 'road-trip', label: 'Road trip' },
  { id: 'morning-walk', label: 'Morning walk' },
  { id: 'dog-walk', label: 'Walking the dog' },
  { id: 'free', label: 'Free time' },
];

const member = (id: string, initials: string, colorIndex: number): Member => ({
  id,
  initials,
  colorIndex,
});

export const circles: Circle[] = [
  {
    id: 'c-family',
    name: 'Family',
    memberCount: 6,
    activeCount: 1,
    members: [member('m1', 'M', 0), member('m2', 'D', 1), member('m3', 'S', 2)],
  },
  {
    id: 'c-college',
    name: 'College crew',
    memberCount: 8,
    activeCount: 0,
    members: [member('m4', 'J', 2), member('m5', 'K', 4)],
  },
  {
    id: 'c-highschool',
    name: 'High school',
    memberCount: 5,
    activeCount: 0,
    members: [member('m6', 'R', 0)],
  },
];

export const initialAlerts: AlertItem[] = [
  {
    id: 'a-sarah',
    member: member('m3', 'S', 0),
    name: 'Sarah',
    isLive: false,
    activity: 'Morning walk',
    timeLabel: 'now',
    relativeTime: '2h',
  },
  {
    id: 'a-mom',
    member: member('m2', 'M', 1),
    name: 'Mom',
    isLive: false,
    activity: 'Evening',
    timeLabel: 'now',
    relativeTime: '1d',
  },
];

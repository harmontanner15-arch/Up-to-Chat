import { ActivityOption, DurationOption } from './types';

export const durationOptions: DurationOption[] = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: 'Custom', minutes: 0 },
];

export const CUSTOM_ACTIVITY_ID = 'custom';

export const activityOptions: ActivityOption[] = [
  { id: 'coffee', label: 'Coffee' },
  { id: 'driving', label: 'Driving' },
  { id: 'road-trip', label: 'Road trip' },
  { id: 'morning-walk', label: 'Morning walk' },
  { id: 'dog-walk', label: 'Walking the dog' },
  { id: 'free', label: 'Free time' },
  { id: CUSTOM_ACTIVITY_ID, label: 'Custom…' },
];

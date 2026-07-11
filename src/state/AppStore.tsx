import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { activityOptions, circles as seedCircles, currentUser, initialAlerts } from '../data/mockData';
import { AlertItem, Circle, Member, UpToChatStatus } from '../data/types';

type NewCircleInput = {
  name: string;
};

type AppState = {
  user: typeof currentUser;
  circles: Circle[];
  alerts: AlertItem[];
  status: UpToChatStatus;
  selectedDurationMinutes: number;
  selectedActivityId: string;
  selectedCircleIds: string[];
  toggleCircleSelected: (circleId: string) => void;
  setSelectedDuration: (minutes: number) => void;
  setSelectedActivity: (activityId: string) => void;
  goUpToChat: () => void;
  cancelUpToChat: () => void;
  dismissAlert: (alertId: string) => void;
  createCircle: (input: NewCircleInput) => void;
};

const AppStoreContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [circles, setCircles] = useState<Circle[]>(seedCircles);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [status, setStatus] = useState<UpToChatStatus>({
    isActive: false,
    activity: null,
    durationMinutes: null,
    startedAt: null,
    circleIds: [],
  });
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(15);
  const [selectedActivityId, setSelectedActivityId] = useState(activityOptions[0].id);
  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>([seedCircles[0].id]);

  const toggleCircleSelected = useCallback((circleId: string) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId) ? prev.filter((id) => id !== circleId) : [...prev, circleId]
    );
  }, []);

  const goUpToChat = useCallback(() => {
    const activity = activityOptions.find((a) => a.id === selectedActivityId)?.label ?? 'Free time';
    setStatus({
      isActive: true,
      activity,
      durationMinutes: selectedDurationMinutes,
      startedAt: Date.now(),
      circleIds: selectedCircleIds,
    });
    setCircles((prev) =>
      prev.map((circle) =>
        selectedCircleIds.includes(circle.id)
          ? { ...circle, activeCount: circle.activeCount + (status.isActive ? 0 : 1) }
          : circle
      )
    );
  }, [selectedActivityId, selectedDurationMinutes, selectedCircleIds, status.isActive]);

  const cancelUpToChat = useCallback(() => {
    setCircles((prev) =>
      prev.map((circle) =>
        status.circleIds.includes(circle.id)
          ? { ...circle, activeCount: Math.max(0, circle.activeCount - 1) }
          : circle
      )
    );
    setStatus({ isActive: false, activity: null, durationMinutes: null, startedAt: null, circleIds: [] });
  }, [status.circleIds]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const createCircle = useCallback(({ name }: NewCircleInput) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newCircle: Circle = {
      id: `c-${Date.now()}`,
      name: trimmed,
      memberCount: 1,
      activeCount: 0,
      members: [{ id: 'me', initials: currentUser.initials, colorIndex: 0 } as Member],
    };
    setCircles((prev) => [...prev, newCircle]);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      user: currentUser,
      circles,
      alerts,
      status,
      selectedDurationMinutes,
      selectedActivityId,
      selectedCircleIds,
      toggleCircleSelected,
      setSelectedDuration: setSelectedDurationMinutes,
      setSelectedActivity: setSelectedActivityId,
      goUpToChat,
      cancelUpToChat,
      dismissAlert,
      createCircle,
    }),
    [
      circles,
      alerts,
      status,
      selectedDurationMinutes,
      selectedActivityId,
      selectedCircleIds,
      toggleCircleSelected,
      goUpToChat,
      cancelUpToChat,
      dismissAlert,
      createCircle,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../data/api';
import { getErrorMessage } from '../data/errors';
import { AlertItem, Circle, UpToChatStatus } from '../data/types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type NewCircleInput = {
  name: string;
};

type AppState = {
  userId: string;
  firstName: string;
  initials: string;
  circles: Circle[];
  alerts: AlertItem[];
  liveAlertsCount: number;
  status: UpToChatStatus;
  isLoadingCircles: boolean;
  isLoadingAlerts: boolean;
  error: string | null;
  clearError: () => void;
  selectedCircleIds: string[];
  toggleCircleSelected: (circleId: string) => void;
  goUpToChat: (activity: string, durationMinutes: number) => Promise<void>;
  cancelUpToChat: () => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  createCircle: (input: NewCircleInput) => Promise<void>;
  inviteToCircle: (circleId: string, email: string) => Promise<{ error: string | null }>;
};

const AppStoreContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const [firstName, setFirstName] = useState('');
  const [initials, setInitials] = useState('');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeStatusId, setActiveStatusId] = useState<string | null>(null);
  const [status, setStatus] = useState<UpToChatStatus>({
    isActive: false,
    activity: null,
    durationMinutes: null,
    startedAt: null,
    circleIds: [],
  });
  const [isLoadingCircles, setIsLoadingCircles] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>([]);
  const seenLiveAlertIdsRef = useRef<Set<string> | null>(null);

  const toggleCircleSelected = useCallback((circleId: string) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId) ? prev.filter((id) => id !== circleId) : [...prev, circleId]
    );
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const profile = await api.fetchProfile(userId);
      if (profile) {
        setFirstName(profile.first_name);
        setInitials(profile.first_name.charAt(0).toUpperCase());
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load profile'));
    }
  }, [userId]);

  const refreshCircles = useCallback(async () => {
    if (!userId) return;
    setIsLoadingCircles(true);
    try {
      const data = await api.fetchCircles(userId);
      setCircles(data);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load circles'));
    } finally {
      setIsLoadingCircles(false);
    }
  }, [userId]);

  const refreshAlerts = useCallback(async () => {
    if (!userId) return;
    setIsLoadingAlerts(true);
    try {
      const data = await api.fetchAlerts(userId);
      const liveIds = new Set(data.filter((a) => a.isLive).map((a) => a.id));
      const previouslySeen = seenLiveAlertIdsRef.current;
      if (previouslySeen !== null) {
        const hasNewLiveAlert = [...liveIds].some((id) => !previouslySeen.has(id));
        if (hasNewLiveAlert) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      }
      seenLiveAlertIdsRef.current = liveIds;
      setAlerts(data);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load alerts'));
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [userId]);

  const refreshMyStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const myStatus = await api.fetchMyActiveStatus(userId);
      if (myStatus) {
        setActiveStatusId(myStatus.id);
        setStatus({
          isActive: true,
          activity: myStatus.activity,
          durationMinutes: myStatus.duration_minutes,
          startedAt: new Date(myStatus.started_at).getTime(),
          circleIds: status.circleIds,
        });
      } else {
        setActiveStatusId(null);
        setStatus({ isActive: false, activity: null, durationMinutes: null, startedAt: null, circleIds: [] });
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load status'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    refreshProfile();
    refreshCircles();
    refreshAlerts();
    refreshMyStatus();
  }, [userId, refreshProfile, refreshCircles, refreshAlerts, refreshMyStatus]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('availability_status_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_status' }, () => {
        refreshAlerts();
        refreshCircles();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshAlerts, refreshCircles]);

  const goUpToChat = useCallback(
    async (activity: string, durationMinutes: number) => {
      if (!userId || selectedCircleIds.length === 0) return;
      setError(null);
      try {
        const created = await api.goUpToChat(userId, activity, durationMinutes, selectedCircleIds);
        setActiveStatusId(created.id);
        setStatus({
          isActive: true,
          activity: created.activity,
          durationMinutes: created.duration_minutes,
          startedAt: new Date(created.started_at).getTime(),
          circleIds: selectedCircleIds,
        });
        await refreshCircles();
      } catch (e) {
        setError(getErrorMessage(e, 'Failed to go up to chat'));
      }
    },
    [userId, selectedCircleIds, refreshCircles]
  );

  const cancelUpToChat = useCallback(async () => {
    if (!activeStatusId) return;
    setError(null);
    try {
      await api.cancelUpToChat(activeStatusId);
      setActiveStatusId(null);
      setStatus({ isActive: false, activity: null, durationMinutes: null, startedAt: null, circleIds: [] });
      await refreshCircles();
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to cancel'));
    }
  }, [activeStatusId, refreshCircles]);

  const dismissAlert = useCallback(
    async (alertId: string) => {
      if (!userId) return;
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      try {
        await api.dismissAlert(userId, alertId);
      } catch (e) {
        setError(getErrorMessage(e, 'Failed to dismiss alert'));
      }
    },
    [userId]
  );

  const createCircle = useCallback(
    async ({ name }: NewCircleInput) => {
      const trimmed = name.trim();
      if (!trimmed || !userId) return;
      setError(null);
      try {
        const circle = await api.createCircle(userId, trimmed);
        setCircles((prev) => [...prev, circle]);
      } catch (e) {
        setError(getErrorMessage(e, 'Failed to create circle'));
      }
    },
    [userId]
  );

  const inviteToCircle = useCallback(async (circleId: string, email: string): Promise<{ error: string | null }> => {
    try {
      const member = await api.inviteToCircle(circleId, email);
      setCircles((prev) =>
        prev.map((circle) =>
          circle.id === circleId
            ? { ...circle, memberCount: circle.memberCount + 1, members: [...circle.members, member] }
            : circle
        )
      );
      return { error: null };
    } catch (e) {
      return { error: getErrorMessage(e, 'Failed to invite') };
    }
  }, []);

  const liveAlertsCount = useMemo(() => alerts.filter((a) => a.isLive).length, [alerts]);

  const value = useMemo<AppState>(
    () => ({
      userId,
      firstName,
      initials,
      circles,
      alerts,
      liveAlertsCount,
      status,
      isLoadingCircles,
      isLoadingAlerts,
      error,
      clearError: () => setError(null),
      selectedCircleIds,
      toggleCircleSelected,
      goUpToChat,
      cancelUpToChat,
      dismissAlert,
      createCircle,
      inviteToCircle,
    }),
    [
      userId,
      firstName,
      initials,
      circles,
      alerts,
      liveAlertsCount,
      status,
      isLoadingCircles,
      isLoadingAlerts,
      error,
      selectedCircleIds,
      toggleCircleSelected,
      goUpToChat,
      cancelUpToChat,
      dismissAlert,
      createCircle,
      inviteToCircle,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

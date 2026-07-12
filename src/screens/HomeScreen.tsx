import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { CUSTOM_ACTIVITY_ID, activityOptions, durationOptions } from '../data/options';
import { useAppStore } from '../state/AppStore';
import { useAuth } from '../state/AuthContext';
import { colors, radii, spacing, typography } from '../theme/theme';

const MAX_CUSTOM_MINUTES = 1440;

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function HomeScreen() {
  const { firstName, initials, circles, status, selectedCircleIds, toggleCircleSelected, goUpToChat, cancelUpToChat } =
    useAppStore();
  const { signOut } = useAuth();

  const [now, setNow] = useState(Date.now());
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);

  const [presetMinutes, setPresetMinutes] = useState(15);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationText, setCustomDurationText] = useState('');

  const [presetActivityId, setPresetActivityId] = useState(activityOptions[0].id);
  const [customActivityText, setCustomActivityText] = useState('');
  const isCustomActivity = presetActivityId === CUSTOM_ACTIVITY_ID;

  useEffect(() => {
    if (circles.length > 0 && selectedCircleIds.length === 0) {
      toggleCircleSelected(circles[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circles]);

  useEffect(() => {
    if (!status.isActive) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status.isActive]);

  const remainingMs =
    status.isActive && status.startedAt && status.durationMinutes
      ? status.startedAt + status.durationMinutes * 60 * 1000 - now
      : 0;

  const hasExpired = status.isActive && remainingMs <= 0;

  useEffect(() => {
    if (hasExpired) cancelUpToChat();
  }, [hasExpired, cancelUpToChat]);

  const parsedCustomMinutes = parseInt(customDurationText, 10);
  const isValidCustomDuration =
    Number.isInteger(parsedCustomMinutes) && parsedCustomMinutes > 0 && parsedCustomMinutes <= MAX_CUSTOM_MINUTES;
  const resolvedDurationMinutes = isCustomDuration ? (isValidCustomDuration ? parsedCustomMinutes : null) : presetMinutes;

  const trimmedCustomActivity = customActivityText.trim();
  const resolvedActivity = isCustomActivity
    ? trimmedCustomActivity
    : activityOptions.find((a) => a.id === presetActivityId)?.label ?? 'Free time';
  const isValidActivity = isCustomActivity ? trimmedCustomActivity.length > 0 : true;

  const canGoActive = selectedCircleIds.length > 0 && resolvedDurationMinutes !== null && isValidActivity;

  const handlePress = () => {
    if (status.isActive) {
      cancelUpToChat();
    } else if (canGoActive && resolvedDurationMinutes !== null) {
      goUpToChat(resolvedActivity, resolvedDurationMinutes);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={typography.display}>
            {greeting},
          </Text>
          <Text style={[typography.display, styles.accentName]}>{firstName || 'there'}.</Text>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert('Sign out?', undefined, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: signOut },
            ])
          }
        >
          <Avatar initials={initials || '?'} colorIndex={0} size={48} />
        </Pressable>
      </View>

      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.toggleCard,
          status.isActive ? styles.toggleCardActive : styles.toggleCardIdle,
          pressed && styles.pressed,
          !status.isActive && !canGoActive && styles.toggleCardDisabled,
        ]}
      >
        <View style={[styles.toggleDot, status.isActive ? styles.toggleDotActive : styles.toggleDotIdle]}>
          <View style={status.isActive ? styles.toggleDotInnerActive : styles.toggleDotInnerIdle} />
        </View>
        <Text style={[styles.toggleTitle, status.isActive && styles.toggleTitleActive]}>
          {status.isActive ? "I'm up to chat" : "I'm up to chat"}
        </Text>
        <Text style={[styles.toggleSubtitle, status.isActive && styles.toggleSubtitleActive]}>
          {status.isActive
            ? `Ends in ${formatCountdown(remainingMs)} · tap to cancel`
            : canGoActive
            ? 'Tap to let your people know'
            : 'Pick a circle below first'}
        </Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={typography.label}>FOR HOW LONG?</Text>
        <View style={styles.chipRow}>
          {durationOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={option.minutes === 0 ? isCustomDuration : !isCustomDuration && presetMinutes === option.minutes}
              onPress={() => {
                if (option.minutes === 0) {
                  setIsCustomDuration(true);
                } else {
                  setIsCustomDuration(false);
                  setPresetMinutes(option.minutes);
                }
              }}
            />
          ))}
        </View>
        {isCustomDuration && (
          <TextInput
            value={customDurationText}
            onChangeText={setCustomDurationText}
            placeholder="Minutes, e.g. 90"
            placeholderTextColor={colors.textMuted}
            style={styles.customInput}
            keyboardType="number-pad"
            maxLength={4}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={typography.label}>WHAT ARE YOU UP TO?</Text>
        <View style={styles.chipRow}>
          {activityOptions.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={presetActivityId === option.id}
              onPress={() => setPresetActivityId(option.id)}
            />
          ))}
        </View>
        {isCustomActivity && (
          <TextInput
            value={customActivityText}
            onChangeText={setCustomActivityText}
            placeholder="e.g. Driving to the airport"
            placeholderTextColor={colors.textMuted}
            style={styles.customInput}
            maxLength={60}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={typography.label}>WHO SHOULD KNOW?</Text>
        <View style={styles.chipRow}>
          {circles.map((circle) => (
            <Chip
              key={circle.id}
              label={circle.name}
              selected={selectedCircleIds.includes(circle.id)}
              onPress={() => toggleCircleSelected(circle.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  accentName: {
    color: colors.accent,
  },
  toggleCard: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  toggleCardIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  toggleCardActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toggleCardDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  toggleDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  toggleDotIdle: {
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  toggleDotActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  toggleDotInnerIdle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textMuted,
  },
  toggleDotInnerActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A0D0B',
  },
  toggleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleTitleActive: {
    color: '#0A0D0B',
  },
  toggleSubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },
  toggleSubtitleActive: {
    color: 'rgba(10,13,11,0.7)',
  },
  section: {
    marginBottom: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  customInput: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.surface,
  },
});

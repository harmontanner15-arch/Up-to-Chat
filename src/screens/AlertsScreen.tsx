import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { AlertItem } from '../data/types';
import { useAppStore } from '../state/AppStore';
import { colors, radii, spacing, typography } from '../theme/theme';

function HistoryRow({ item }: { item: AlertItem }) {
  return (
    <Card style={styles.historyCard}>
      <Avatar initials={item.member.initials} colorIndex={item.member.colorIndex} size={44} />
      <View style={styles.historyBody}>
        <Text style={typography.title}>{item.name}</Text>
        <Text style={styles.historySubtitle}>
          Was free · {item.relativeTime} ago · {item.activity}
        </Text>
      </View>
      <Text style={styles.historyTime}>{item.relativeTime}</Text>
    </Card>
  );
}

function LiveRow({ item, onDismiss }: { item: AlertItem; onDismiss: () => void }) {
  return (
    <Card style={styles.liveCard}>
      <View style={styles.liveHeader}>
        <Avatar initials={item.member.initials} colorIndex={item.member.colorIndex} size={44} />
        <View style={styles.liveHeaderText}>
          <View style={styles.liveNameRow}>
            <Text style={styles.liveName}>{item.name}</Text>
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.liveMeta}>Up to chat · {item.activity}</Text>
        </View>
        <Text style={styles.liveTime}>{item.timeLabel}</Text>
      </View>
      <Text style={styles.liveQuote}>
        &quot;{item.name} is free for a chat — grab them before they disappear.&quot;
      </Text>
      <View style={styles.liveActions}>
        <Pressable style={styles.callButton}>
          <Text style={styles.callButtonText}>Call now</Text>
        </Pressable>
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>×</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export function AlertsScreen() {
  const { alerts, isLoadingAlerts, dismissAlert } = useAppStore();

  const liveAlerts = useMemo(() => alerts.filter((a) => a.isLive), [alerts]);
  const historyAlerts = useMemo(() => alerts.filter((a) => !a.isLive), [alerts]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={historyAlerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={[typography.display, styles.heading]}>Alerts</Text>
            {liveAlerts.map((item) => (
              <LiveRow key={item.id} item={item} onDismiss={() => dismissAlert(item.id)} />
            ))}
          </>
        }
        renderItem={({ item }) => <HistoryRow item={item} />}
        ListEmptyComponent={
          !isLoadingAlerts && liveAlerts.length === 0 ? (
            <Text style={styles.emptyText}>
              No alerts yet. When your circles are up to chat, they will show up here.
            </Text>
          ) : null
        }
      />
    </View>
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
  heading: {
    marginBottom: spacing.lg,
  },
  liveCard: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accentBorder,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveHeaderText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  liveNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 17,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  liveMeta: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  liveTime: {
    color: colors.textMuted,
    fontSize: 13,
  },
  liveQuote: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  liveActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#0A0D0B',
    fontWeight: '700',
  },
  dismissButton: {
    width: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: colors.textSecondary,
    fontSize: 20,
    lineHeight: 20,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  historyBody: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  historySubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  historyTime: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

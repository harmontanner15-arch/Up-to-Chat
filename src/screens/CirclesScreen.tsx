import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar, AvatarOverflow } from '../components/Avatar';
import { Card } from '../components/Card';
import { useAppStore } from '../state/AppStore';
import { Circle } from '../data/types';
import { colors, radii, spacing, typography } from '../theme/theme';

const VISIBLE_AVATARS = 3;

function CircleRow({ circle }: { circle: Circle }) {
  const overflow = circle.memberCount - VISIBLE_AVATARS;
  return (
    <Card style={styles.circleCard}>
      <View style={styles.circleHeader}>
        <View>
          <Text style={typography.title}>{circle.name}</Text>
          <Text style={styles.memberCount}>{circle.memberCount} members</Text>
        </View>
        {circle.activeCount > 0 ? (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{circle.activeCount} active</Text>
          </View>
        ) : (
          <Text style={styles.quietText}>all quiet</Text>
        )}
      </View>
      <View style={styles.avatarRow}>
        {circle.members.slice(0, VISIBLE_AVATARS).map((m, idx) => (
          <Avatar
            key={m.id}
            initials={m.initials}
            colorIndex={m.colorIndex}
            size={40}
            style={idx > 0 ? styles.avatarOverlap : undefined}
          />
        ))}
        {overflow > 0 && <AvatarOverflow count={overflow} size={40} style={styles.avatarOverlap} />}
      </View>
    </Card>
  );
}

export function CirclesScreen() {
  const { circles, createCircle } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    createCircle({ name });
    setName('');
    setModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={circles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={[typography.display, styles.heading]}>My circles</Text>}
        renderItem={({ item }) => <CircleRow circle={item} />}
        ListFooterComponent={
          <Pressable style={styles.newCircleButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.newCircleText}>+ new circle</Text>
          </Pressable>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={typography.heading}>New circle</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Running Group"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonGhost]}
                onPress={() => {
                  setName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, !name.trim() && styles.modalButtonDisabled]}
                onPress={handleCreate}
                disabled={!name.trim()}
              >
                <Text style={styles.modalButtonPrimaryText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  circleCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  memberCount: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  activeText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  quietText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatarOverlap: {
    marginLeft: -10,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  newCircleButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  newCircleText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  modalButtonGhost: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonGhostText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    backgroundColor: colors.accent,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonPrimaryText: {
    color: '#0A0D0B',
    fontWeight: '700',
  },
});

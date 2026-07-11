import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar, AvatarOverflow } from '../components/Avatar';
import { Card } from '../components/Card';
import { Circle } from '../data/types';
import { useAppStore } from '../state/AppStore';
import { colors, radii, spacing, typography } from '../theme/theme';

const VISIBLE_AVATARS = 3;

function CircleRow({ circle, onInvite }: { circle: Circle; onInvite: () => void }) {
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
      <View style={styles.circleFooter}>
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
        <Pressable onPress={onInvite} style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>+ invite</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export function CirclesScreen() {
  const { circles, createCircle, inviteToCircle } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [inviteCircle, setInviteCircle] = useState<Circle | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await createCircle({ name });
    setIsCreating(false);
    setName('');
    setModalVisible(false);
  };

  const closeInviteModal = () => {
    setInviteCircle(null);
    setInviteEmail('');
    setInviteError(null);
  };

  const handleInvite = async () => {
    if (!inviteCircle) return;
    setIsInviting(true);
    setInviteError(null);
    const { error } = await inviteToCircle(inviteCircle.id, inviteEmail);
    setIsInviting(false);
    if (error) {
      setInviteError(error);
      return;
    }
    closeInviteModal();
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={circles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={[typography.display, styles.heading]}>My circles</Text>}
        renderItem={({ item }) => <CircleRow circle={item} onInvite={() => setInviteCircle(item)} />}
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
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  (!name.trim() || isCreating) && styles.modalButtonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!name.trim() || isCreating}
              >
                <Text style={styles.modalButtonPrimaryText}>{isCreating ? 'Creating…' : 'Create'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!inviteCircle} animationType="slide" transparent onRequestClose={closeInviteModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={typography.heading}>Invite to {inviteCircle?.name}</Text>
            <Text style={styles.inviteHint}>
              They need an Up to Chat account already. Ask them to sign up first, then invite their email.
            </Text>
            <TextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="friend@example.com"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            {inviteError && <Text style={styles.inviteError}>{inviteError}</Text>}
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonGhost]} onPress={closeInviteModal}>
                <Text style={styles.modalButtonGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  (!inviteEmail.trim() || isInviting) && styles.modalButtonDisabled,
                ]}
                onPress={handleInvite}
                disabled={!inviteEmail.trim() || isInviting}
              >
                <Text style={styles.modalButtonPrimaryText}>{isInviting ? 'Inviting…' : 'Invite'}</Text>
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
  circleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatarOverlap: {
    marginLeft: -10,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  inviteButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
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
  inviteHint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -spacing.sm,
  },
  inviteError: {
    color: colors.danger,
    fontSize: 13,
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

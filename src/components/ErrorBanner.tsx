import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../state/AppStore';
import { colors, radii, spacing } from '../theme/theme';

export function ErrorBanner() {
  const { error, clearError } = useAppStore();
  if (!error) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text} numberOfLines={3}>
        {error}
      </Text>
      <Pressable onPress={clearError} hitSlop={8}>
        <Text style={styles.dismiss}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(224, 114, 95, 0.16)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  text: {
    color: colors.danger,
    flex: 1,
    fontSize: 13,
  },
  dismiss: {
    color: colors.danger,
    fontSize: 18,
    marginLeft: spacing.sm,
  },
});

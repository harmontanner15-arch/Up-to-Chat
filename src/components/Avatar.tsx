import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/theme';

type Props = {
  initials: string;
  colorIndex?: number;
  size?: number;
  style?: ViewStyle;
};

export function Avatar({ initials, colorIndex = 0, size = 40, style }: Props) {
  const backgroundColor = colors.avatarPalette[colorIndex % colors.avatarPalette.length];
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

export function AvatarOverflow({ count, size = 40, style }: { count: number; size?: number; style?: ViewStyle }) {
  return (
    <View
      style={[
        styles.base,
        styles.overflow,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.overflowText, { fontSize: size * 0.34 }]}>+{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  overflow: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overflowText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

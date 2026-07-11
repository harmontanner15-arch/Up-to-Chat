import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radii } from '../theme/theme';

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.base, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
});

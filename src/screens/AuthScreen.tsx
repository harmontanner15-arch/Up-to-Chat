import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../state/AuthContext';
import { colors, radii, spacing, typography } from '../theme/theme';

export function AuthScreen() {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === 'signUp';
  const canSubmit = email.trim().length > 3 && password.length >= 6 && (!isSignUp || firstName.trim().length > 0);

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    const result = isSignUp
      ? await signUp(email.trim(), password, firstName.trim())
      : await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (isSignUp) {
      setInfo('Check your email to confirm your account, then sign in.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.display}>Up to Chat</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create an account to start letting your circles know when you\'re free.' : 'Welcome back.'}
        </Text>

        {isSignUp && (
          <View style={styles.field}>
            <Text style={typography.label}>FIRST NAME</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Tanner"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={typography.label}>EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={typography.label}>PASSWORD</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            secureTextEntry
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {info && <Text style={styles.infoText}>{info}</Text>}

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0A0D0B" />
          ) : (
            <Text style={styles.submitButtonText}>{isSignUp ? 'Create account' : 'Sign in'}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode(isSignUp ? 'signIn' : 'signUp');
            setError(null);
            setInfo(null);
          }}
          style={styles.switchModeButton}
        >
          <Text style={styles.switchModeText}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  field: {
    marginBottom: spacing.md,
  },
  input: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  infoText: {
    color: colors.accent,
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#0A0D0B',
    fontWeight: '700',
    fontSize: 16,
  },
  switchModeButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  switchModeText: {
    color: colors.textSecondary,
  },
});

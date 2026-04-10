/**
 * ForgotPasswordScreen — Request a password reset link via email.
 *
 * Minimal screen: email input, submit button, and success/error feedback.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useAuthStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme, spacing, fontFamily, radii } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ForgotPasswordScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'Settings'>>();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleReset = async () => {
    setAuthError('');
    setSuccessMessage('');
    const result = await resetPassword(email.trim());
    if (result.error) {
      setAuthError(result.error);
    } else {
      setSuccessMessage('Check your email for the reset link.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={base.gold} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Reset Password"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        {/* Explanatory text */}
        <Text style={[styles.description, { color: base.textDim }]}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {/* Email input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: base.bgElevated,
              borderColor: base.border,
              color: base.text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={base.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        {/* Send Reset Link button */}
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.primaryButton, { backgroundColor: base.gold, marginTop: spacing.lg }]}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Send Reset Link</Text>
        </TouchableOpacity>

        {/* Success message */}
        {successMessage ? (
          <Text style={[styles.successText, { color: base.gold }]}>{successMessage}</Text>
        ) : null}

        {/* Error */}
        {authError ? (
          <Text style={[styles.errorText, { color: base.danger }]}>{authError}</Text>
        ) : null}

        {/* Back to Sign In link */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Login')}
          style={styles.bottomLink}
          activeOpacity={0.6}
        >
          <Text style={[styles.linkText, { color: base.gold }]}>Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerSpacing: {
    marginBottom: spacing.lg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  description: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.ui,
    fontSize: 15,
  },
  primaryButton: {
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 16,
    color: '#1a1a1a', // data-color: intentional
  },
  successText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    // color set inline via base.danger
    textAlign: 'center',
    marginTop: spacing.md,
  },
  bottomLink: {
    alignSelf: 'center',
    marginTop: spacing.xl,
  },
  linkText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
});

export default withErrorBoundary(ForgotPasswordScreen);

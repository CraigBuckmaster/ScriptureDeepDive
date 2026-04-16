/**
 * SignUpScreen — Create a new account with email/password or social providers.
 *
 * On success shows a confirmation message prompting the user to verify
 * their email. Does not navigate away automatically.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
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
import { AuthInput } from '../components/AuthInput';
import { useTheme, spacing, fontFamily, radii } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function SignUpScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'SignUp'>>();
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithFacebook = useAuthStore((s) => s.signInWithFacebook);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailSignUp = async () => {
    setAuthError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    const result = await signUpWithEmail(email.trim(), password);
    if (result.error) {
      setAuthError(result.error);
    } else {
      setSuccessMessage('Check your email to confirm your account.');
    }
  };

  const handleGoogle = async () => {
    setAuthError('');
    setSuccessMessage('');
    const result = await signInWithGoogle();
    if (result.error) {
      setAuthError(result.error);
    } else {
      navigation.goBack();
    }
  };

  const handleFacebook = async () => {
    setAuthError('');
    setSuccessMessage('');
    const result = await signInWithFacebook();
    if (result.error) {
      setAuthError(result.error);
    } else {
      navigation.goBack();
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
          title="Create Account"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        {/* Social buttons */}
        <TouchableOpacity
          onPress={handleGoogle}
          style={[styles.socialButton, { backgroundColor: '#fff' }]} // brand-color: intentional (Google white)
          activeOpacity={0.7}
        >
          <Text style={[styles.socialButtonText, { color: '#1f1f1f' }]}>{/* brand-color: intentional (Google dark) */}Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFacebook}
          style={[styles.socialButton, { backgroundColor: '#1877F2', marginTop: spacing.sm }]} // brand-color: intentional (Facebook blue)
          activeOpacity={0.7}
        >
          <Text style={[styles.socialButtonText, { color: '#fff' }]}>{/* brand-color: intentional (Facebook white) */}Continue with Facebook</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: base.border }]} />
          <Text style={[styles.dividerText, { color: base.textMuted }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: base.border }]} />
        </View>

        {/* Email input */}
        <AuthInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        {/* Password input */}
        <View style={styles.inputSpacer} />
        <AuthInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        {/* Confirm Password input */}
        <View style={styles.inputSpacer} />
        <AuthInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        {/* Create Account button */}
        <TouchableOpacity
          onPress={handleEmailSignUp}
          style={[styles.primaryButton, { backgroundColor: base.gold, marginTop: spacing.lg }]}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Success message */}
        {successMessage ? (
          <Text style={[styles.successText, { color: base.gold }]}>{successMessage}</Text>
        ) : null}

        {/* Error */}
        {authError ? (
          <Text style={[styles.errorText, { color: base.danger }]}>{authError}</Text>
        ) : null}

        {/* Bottom link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.bottomLink}
          activeOpacity={0.6}
        >
          <Text style={[styles.bottomLinkText, { color: base.textDim }]}>
            Already have an account?{' '}
            <Text style={{ color: base.gold }}>Sign In</Text>
          </Text>
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', // overlay-color: intentional
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  socialButton: {
    height: 44,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginHorizontal: spacing.md,
  },
  inputSpacer: {
    height: spacing.sm,
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
    color: '#1a1a1a', // data-color: intentional (dark text on gold button)
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
  bottomLinkText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  headerSpacing: {
    marginBottom: spacing.lg,
  },
});

export default withErrorBoundary(SignUpScreen);

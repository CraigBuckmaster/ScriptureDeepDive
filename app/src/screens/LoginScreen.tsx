/**
 * LoginScreen — Email/password and social sign-in.
 *
 * Provides Google, Facebook, and email/password authentication.
 * On success navigates back to the previous screen.
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

function LoginScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'Settings'>>();
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithFacebook = useAuthStore((s) => s.signInWithFacebook);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleEmailSignIn = async () => {
    setAuthError('');
    const result = await signInWithEmail(email.trim(), password);
    if (result.error) {
      setAuthError(result.error);
    } else {
      navigation.goBack();
    }
  };

  const handleGoogle = async () => {
    setAuthError('');
    const result = await signInWithGoogle();
    if (result.error) {
      setAuthError(result.error);
    } else {
      navigation.goBack();
    }
  };

  const handleFacebook = async () => {
    setAuthError('');
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
          title="Sign In"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: base.textDim }]}>
          Sign in to unlock premium features and sync your study data across devices.
        </Text>

        {/* Social buttons */}
        <TouchableOpacity
          onPress={handleGoogle}
          style={[styles.socialButton, { backgroundColor: '#fff' }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.socialButtonText, { color: '#1f1f1f' }]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFacebook}
          style={[styles.socialButton, { backgroundColor: '#1877F2', marginTop: spacing.sm }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.socialButtonText, { color: '#fff' }]}>Continue with Facebook</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: base.border }]} />
          <Text style={[styles.dividerText, { color: base.textMuted }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: base.border }]} />
        </View>

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

        {/* Password input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: base.bgElevated,
              borderColor: base.border,
              color: base.text,
              marginTop: spacing.sm,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={base.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('ForgotPassword')}
          style={styles.forgotRow}
          activeOpacity={0.6}
        >
          <Text style={[styles.linkText, { color: base.gold }]}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign In button */}
        <TouchableOpacity
          onPress={handleEmailSignIn}
          style={[styles.primaryButton, { backgroundColor: base.gold }]}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Error */}
        {authError ? (
          <Text style={styles.errorText}>{authError}</Text>
        ) : null}

        {/* Bottom link */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('SignUp')}
          style={styles.bottomLink}
          activeOpacity={0.6}
        >
          <Text style={[styles.bottomLinkText, { color: base.textDim }]}>
            Don't have an account?{' '}
            <Text style={{ color: base.gold }}>Sign Up</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.lg,
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
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.ui,
    fontSize: 15,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  linkText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
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
    color: '#1a1a1a',
  },
  errorText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    color: '#e05a6a',
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

export default withErrorBoundary(LoginScreen);

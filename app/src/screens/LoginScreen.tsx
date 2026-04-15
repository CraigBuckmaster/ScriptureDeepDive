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
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useAuthStore } from '../stores';
import { useAuth } from '../hooks/useAuth';
import { ScreenHeader } from '../components/ScreenHeader';
import { AuthInput } from '../components/AuthInput';
import { useTheme, spacing, fontFamily, radii } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function LoginScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'Login'>>();
  const { signIn, signInWithMagicLink, isLoading } = useAuth();
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithFacebook = useAuthStore((s) => s.signInWithFacebook);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleEmailSignIn = async () => {
    setAuthError('');
    setMagicLinkSent(false);
    const result = await signIn(email.trim(), password);
    if (result.error) {
      setAuthError(result.error);
    } else {
      navigation.goBack();
    }
  };

  const handleMagicLink = async () => {
    setAuthError('');
    setMagicLinkSent(false);
    if (!email.trim()) {
      setAuthError('Please enter your email address first.');
      return;
    }
    const result = await signInWithMagicLink(email.trim());
    if (result.error) {
      setAuthError(result.error);
    } else {
      setMagicLinkSent(true);
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
          textContentType="password"
        />

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
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

        {/* Magic link option */}
        <TouchableOpacity
          onPress={handleMagicLink}
          style={[styles.magicLinkButton, { borderColor: base.gold }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.magicLinkButtonText, { color: base.gold }]}>
            Sign in with email link
          </Text>
        </TouchableOpacity>

        {/* Magic link sent confirmation */}
        {magicLinkSent ? (
          <Text style={[styles.successText, { color: base.gold }]}>
            Check your email for a sign-in link.
          </Text>
        ) : null}

        {/* Error */}
        {authError ? (
          <Text style={[styles.errorText, { color: base.danger }]}>{authError}</Text>
        ) : null}

        {/* Bottom link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.bottomLink}
          activeOpacity={0.6}
        >
          <Text style={[styles.bottomLinkText, { color: base.textDim }]}>
            Don&apos;t have an account?{' '}
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
    backgroundColor: 'rgba(0,0,0,0.5)', // overlay-color: intentional
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
  inputSpacer: {
    height: spacing.sm,
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
    color: '#1a1a1a', // data-color: intentional (dark text on gold button)
  },
  magicLinkButton: {
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  magicLinkButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 15,
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

export default withErrorBoundary(LoginScreen);

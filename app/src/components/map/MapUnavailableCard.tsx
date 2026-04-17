/**
 * MapUnavailableCard — Friendly placeholder shown when MapLibre's native
 * module isn't linked into the current binary (Expo Go, or a dev build
 * created before the MapLibre plugin was added to app.json), or when the
 * native module loaded but threw during render (caught by MapErrorBoundary).
 *
 * Matches the parchment aesthetic of the real map: bgElevated card with
 * a gold border and a short explanation of the limitation plus a link
 * to the Expo docs on development builds.
 *
 * The optional `reason` prop is shown in dev builds AND in production
 * when the reason suggests an unexpected failure (i.e. not the vanilla
 * Expo Go case). This turns "the map screen is broken" on TestFlight
 * into something diagnosable without an Xcode device-log session.
 */

import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

const DEV_BUILD_DOCS_URL = 'https://docs.expo.dev/develop/development-builds/introduction/';

/**
 * Reasons the probe returns when MapLibre genuinely isn't linked into
 * the binary (Expo Go case). For any OTHER reason we show the
 * diagnostic even in production, because it means something unexpected
 * is wrong and we can't fix what we can't see.
 */
const EXPECTED_EXPO_GO_REASONS = [
  'Cannot find module',
  'Unable to resolve module',
];

function isExpoGoReason(reason: string | null | undefined): boolean {
  if (!reason) return false;
  return EXPECTED_EXPO_GO_REASONS.some((s) => reason.includes(s));
}

interface Props {
  /**
   * Optional diagnostic reason from `getMapUnavailableReason()`. Always
   * rendered in `__DEV__`; in production builds it's rendered when the
   * reason is unexpected (not the Expo Go fingerprint), so real end
   * users don't see diagnostics they can't act on but TestFlight
   * testers surface novel breakage.
   */
  reason?: string;
}

export function MapUnavailableCard({ reason }: Props = {}) {
  const { base } = useTheme();
  const isExpoGo = isExpoGoReason(reason);
  const showDiagnostic = !!reason && (__DEV__ || !isExpoGo);

  const heading = isExpoGo ? 'Map unavailable in Expo Go' : 'Map unavailable';
  const body = isExpoGo
    ? "The biblical map uses MapLibre, a native module that can't run inside Expo Go. Install a Companion Study development build to see the parchment world map, place markers, and story overlays."
    : "The biblical map couldn't initialise on this build. This usually means the MapLibre native module failed to link correctly. The diagnostic below may help identify what happened.";

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: base.bgElevated, borderColor: base.gold + '55' },
        ]}
        accessibilityRole="alert"
        accessibilityLabel={heading}
      >
        <MapPinOff size={28} color={base.gold} style={styles.icon} />
        <Text style={[styles.heading, { color: base.text }]}>
          {heading}
        </Text>
        <Text style={[styles.body, { color: base.textDim }]}>
          {body}
        </Text>
        {isExpoGo ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(DEV_BUILD_DOCS_URL)}
            accessibilityRole="link"
            accessibilityLabel="Learn how to create an Expo development build"
          >
            <Text style={[styles.link, { color: base.gold }]}>
              How to create a development build →
            </Text>
          </TouchableOpacity>
        ) : null}
        {showDiagnostic ? (
          <Text
            style={[styles.diagnostic, { color: base.textMuted }]}
            numberOfLines={4}
          >
            {reason}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    maxWidth: 360,
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.sm,
  },
  heading: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  link: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  diagnostic: {
    fontFamily: fontFamily.body,
    fontSize: 10,
    marginTop: spacing.md,
    textAlign: 'center',
    opacity: 0.7,
  },
});

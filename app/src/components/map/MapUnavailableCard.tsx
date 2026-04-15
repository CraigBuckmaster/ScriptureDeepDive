/**
 * MapUnavailableCard — Friendly placeholder shown when MapLibre's native
 * module isn't linked into the current binary (Expo Go, or a dev build
 * created before the MapLibre plugin was added to app.json).
 *
 * Matches the parchment aesthetic of the real map: bgElevated card with
 * a gold border and a short explanation of the limitation plus a link
 * to the Expo docs on development builds.
 */

import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

const DEV_BUILD_DOCS_URL = 'https://docs.expo.dev/develop/development-builds/introduction/';

export function MapUnavailableCard() {
  const { base } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: base.bgElevated, borderColor: base.gold + '55' },
        ]}
        accessibilityRole="alert"
        accessibilityLabel="Map requires a development build"
      >
        <MapPinOff size={28} color={base.gold} style={styles.icon} />
        <Text style={[styles.heading, { color: base.text }]}>
          Map unavailable in Expo Go
        </Text>
        <Text style={[styles.body, { color: base.textDim }]}>
          The biblical map uses MapLibre, a native module that can&apos;t run
          inside Expo Go. Install a Companion Study development build to
          see the parchment world map, place markers, and story overlays.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(DEV_BUILD_DOCS_URL)}
          accessibilityRole="link"
          accessibilityLabel="Learn how to create an Expo development build"
        >
          <Text style={[styles.link, { color: base.gold }]}>
            How to create a development build →
          </Text>
        </TouchableOpacity>
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
});

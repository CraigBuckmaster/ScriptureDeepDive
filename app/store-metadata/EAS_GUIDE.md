# EAS Build & Submission Guide

## Prerequisites

1. **Apple Developer Program** — $99/year at [developer.apple.com](https://developer.apple.com)
2. **Google Play Developer Console** — $25 one-time at [play.google.com/console](https://play.google.com/console)
3. **EAS CLI** installed: `npm install -g eas-cli`
4. **Expo account** — sign up at [expo.dev](https://expo.dev)

## First-Time Setup

```bash
cd app

# Login to Expo
eas login

# Initialize project (links to Expo, gets projectId)
eas init

# Configure credentials
eas credentials
# iOS: creates provisioning profiles and certificates
# Android: creates or imports keystore
```

After `eas init`, update `app.json` with the projectId it gives you:
- Replace `PLACEHOLDER_PROJECT_ID` in `extra.eas.projectId`
- Replace `PLACEHOLDER_PROJECT_ID` in `updates.url`

After `eas credentials` for iOS, update `eas.json`:
- Replace `PLACEHOLDER_APPLE_ID` with your Apple ID email
- Replace `PLACEHOLDER_ASC_APP_ID` with the App Store Connect app ID
- Replace `PLACEHOLDER_TEAM_ID` with your Apple Team ID

## Building

```bash
# Preview build (internal testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production build (store submission)
eas build --profile production --platform ios
eas build --profile production --platform android

# Both platforms at once
eas build --profile production --platform all
```

## Submitting

```bash
# iOS — submits to TestFlight / App Store
eas submit --platform ios

# Android — submits to Google Play internal track
eas submit --platform android
```

## OTA Updates

After the app is live, push content updates without an app store review:

```bash
eas update --branch production --message "Add Jeremiah chapters 1-10"
```

Users receive the update next time they open the app.

## Screenshot Capture

Screenshots should be taken from a running app for store listings.
See `store-metadata/` for the 8 required screenshots per platform.

Required sizes:
- **iOS 6.7"**: 1320×2868 (iPhone 16 Pro Max)
- **Android**: 1080×1920 minimum
- **Google Play Feature Graphic**: 1024×500

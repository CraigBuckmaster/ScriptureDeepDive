# Phase 9: Store Submission — Implementation Plan

## Overview

**Goal:** Submit Scripture Deep Dive to both the Apple App Store and Google Play Store. This includes developer account setup, build configuration, all store metadata (descriptions, screenshots, icons, legal pages), pre-submission testing on physical devices via TestFlight and internal testing tracks, and the OTA content update pipeline.

**Dependencies:** Phase 8 complete. All tests passing, performance targets met, accessibility audit done, visual polish complete.

**Total tasks: 50** across 5 categories: build config, metadata/copy, legal, screenshots, pre-submission testing.

**Important:** Developer account enrollment (Apple $99/year, Google $25 one-time) is a manual step the user must complete BEFORE this phase begins. The plan assumes accounts are active.

---

## Pre-Phase Checklist (user action required)

These cannot be automated and must be done by the user before Batch 9A:

- [ ] **Apple Developer Program** enrolled ($99/year) at developer.apple.com
- [ ] **Google Play Developer Console** enrolled ($25 one-time) at play.google.com/console
- [ ] Apple ID associated with the developer account ready for EAS
- [ ] Physical iOS device available for TestFlight testing
- [ ] Physical Android device available for internal testing track

---

## App Identity

| Field | Value |
|-------|-------|
| App name | Scripture Deep Dive |
| iOS bundle ID | `com.scripturedeepive.app` |
| Android package | `com.scripturedeepive.app` |
| Version | `1.0.0` |
| Build number | `1` |
| Expo slug | `scripture-deep-dive` |
| Expo scheme | `scripture` |
| Category (iOS) | Reference > Bible Study |
| Category (Android) | Books & Reference |
| Age rating | 4+ (iOS) / Everyone (Android) |
| Price | Free |

---

## Batch 9A: EAS Build Configuration + First Builds
*Configure Expo Application Services, create build profiles, produce first binaries.*

### Prompt for Batch 9A

```
Phase 9A: Configure EAS Build and produce first iOS + Android binaries.

READ _tools/PHASE_9_PLAN.md (Batch 9A section + App Identity table).

PREREQUISITE: User has enrolled in Apple Developer Program and Google
Play Developer Console. Accounts are active.

1. CREATE app/eas.json:
   ```json
   {
     "cli": { "version": ">= 12.0.0" },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal",
         "ios": { "simulator": true }
       },
       "preview": {
         "distribution": "internal",
         "ios": { "simulator": false },
         "android": { "buildType": "apk" }
       },
       "production": {
         "ios": {
           "autoIncrement": true
         },
         "android": {
           "autoIncrement": true,
           "buildType": "app-bundle"
         }
       }
     },
     "submit": {
       "production": {
         "ios": {
           "appleId": "PLACEHOLDER — user fills in",
           "ascAppId": "PLACEHOLDER — from App Store Connect",
           "appleTeamId": "PLACEHOLDER — from developer account"
         },
         "android": {
           "serviceAccountKeyPath": "./google-service-account.json",
           "track": "internal"
         }
       }
     }
   }
   ```

2. UPDATE app/app.json — complete Expo configuration:
   ```json
   {
     "expo": {
       "name": "Scripture Deep Dive",
       "slug": "scripture-deep-dive",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/images/icon.png",
       "scheme": "scripture",
       "userInterfaceStyle": "dark",
       "splash": {
         "image": "./assets/images/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#0c0a07"
       },
       "assetBundlePatterns": ["**/*"],
       "ios": {
         "supportsTablet": true,
         "bundleIdentifier": "com.scripturedeepive.app",
         "buildNumber": "1",
         "infoPlist": {
           "NSMicrophoneUsageDescription": "Not used",
           "UIBackgroundModes": ["audio"]
         }
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/images/adaptive-icon.png",
           "backgroundColor": "#0c0a07"
         },
         "package": "com.scripturedeepive.app",
         "versionCode": 1
       },
       "plugins": [
         "expo-sqlite",
         "expo-font",
         "expo-notifications",
         "expo-speech",
         "expo-updates"
       ],
       "updates": {
         "url": "https://u.expo.dev/PROJECT_ID",
         "enabled": true,
         "fallbackToCacheTimeout": 0
       },
       "runtimeVersion": {
         "policy": "appVersion"
       },
       "extra": {
         "eas": { "projectId": "PLACEHOLDER — from eas init" }
       }
     }
   }
   ```

3. INITIALIZE EAS:
   cd app
   eas init  (links to Expo project, gets projectId)
   eas credentials  (configure iOS provisioning + Android keystore)

4. CREATE splash screen image:
   assets/images/splash.png — 1284×2778 (iPhone 16 Pro Max resolution)
   Golden cross icon centred on #0c0a07 background.
   Simple, clean — matches the app's dark gold aesthetic.

5. CREATE adaptive icon:
   assets/images/adaptive-icon.png — 1024×1024 foreground layer
   (the golden cross, with padding for Android's adaptive masking)

6. VERIFY icon 1024×1024:
   assets/images/icon.png must be exactly 1024×1024, no alpha channel,
   no rounded corners (Apple and Google add their own rounding).
   The existing assets/icon-512.png may need upscaling or the original
   source re-exported at 1024.

7. BUILD preview binaries:
   eas build --profile preview --platform ios
   eas build --profile preview --platform android
   These are internal-distribution builds for testing (not store builds).
   Wait for builds to complete on EAS servers.

8. VERIFY:
   - iOS preview build installs on iOS simulator or physical device
   - Android APK installs on emulator or physical device
   - App launches, shows splash, transitions to HomeScreen
   - Database loads, chapters browsable
   - Print build URLs and file sizes
```

---

## Batch 9B: Store Metadata — Copy + Legal Pages
*Write all marketing copy, descriptions, keywords. Create legal pages.*

### Prompt for Batch 9B

```
Phase 9B: Write all store metadata copy and create legal pages.

READ _tools/PHASE_9_PLAN.md (Batch 9B section + App Identity).

1. CREATE app/store-metadata/ios.md — All iOS App Store copy:

   a. App Name (30 chars): "Scripture Deep Dive"
   b. Subtitle (30 chars): "Scholarly Bible Study"
   c. Promotional Text (170 chars):
      "Explore the Bible with 40+ scholars, Hebrew/Greek word studies,
      an interactive family tree, a biblical world map, and verse-by-verse
      commentary. Offline. Free."

   d. Description (4000 chars max):
      Write compelling marketing copy covering:
      - What the app is: verse-by-verse Bible study with 30+ books,
        879 chapters, 15+ scholarly panel types per section
      - Key features: dual translation (NIV/ESV), Hebrew/Greek word studies,
        43 scholar commentaries, interactive genealogy tree (211 people),
        biblical world map (60+ places, 28 narrative journeys), timeline
        (216 events), parallel passage comparison, cross-reference engine
      - User features: personal notes, bookmarks, color highlights,
        reading plans, text-to-speech, verse sharing
      - Offline: entire database ships with the app, no internet required
      - Free: no ads, no subscriptions, no in-app purchases
      Tone: scholarly but accessible, reverent but engaging.
      Must NOT make claims about specific denominations or theological positions.

   e. Keywords (100 chars, comma-separated):
      "bible study,commentary,hebrew,greek,word study,devotional,
      NIV,ESV,genealogy,map,timeline,scholarly"

   f. What's New (version 1.0.0):
      "Welcome to Scripture Deep Dive — the first release! Explore 30 books
      and 879 chapters with verse-by-verse scholarly commentary, Hebrew and
      Greek word studies, and interactive exploration tools."

   g. Support URL: "https://github.com/CraigBuckmaster/ScriptureDeepDive/issues"
      (or a dedicated support page)

   h. Marketing URL: "https://craigbuckmaster.github.io/ScriptureDeepDive/"
      (the archived PWA serves as a marketing site)

2. CREATE app/store-metadata/android.md — All Google Play copy:

   a. App Name (50 chars): "Scripture Deep Dive — Bible Study"
   b. Short Description (80 chars):
      "Scholarly Bible study with 40+ commentators, word studies, maps,
      and timelines."
   c. Full Description (4000 chars):
      Can reuse the iOS description with minor tweaks for Google's style.
      Google allows more formatting (basic HTML: <b>, <br>, bullet points).
   d. App Category: Books & Reference
   e. Content Rating: complete IARC questionnaire
      - No violence, no sexual content, no profanity, no gambling
      - Religious content: yes (educational/scholarly)
      - Result: Everyone (PEGI 3 / ESRB E)
   f. Target Audience: General (NOT "primarily for children" —
      that triggers COPPA/GDPR-K requirements)

3. CREATE app/store-metadata/privacy-policy.md:
   Privacy policy that can be hosted as a static page.
   Content:
   - App name and developer
   - Data collected: NONE (no accounts, no server-side data, no tracking)
   - Analytics: PostHog for anonymous usage patterns only (no PII)
   - Data stored locally: notes, bookmarks, highlights, reading progress
     — NEVER transmitted, NEVER shared, stored only on device
   - Third-party services: Expo Push Notifications (if enabled by user),
     PostHog Analytics (anonymous)
   - No ads, no in-app purchases, no account creation
   - Children's privacy: app is suitable for all ages, does not
     knowingly collect data from children
   - Contact: developer email
   - Effective date

4. HOST privacy policy:
   Create a simple static HTML page from the markdown.
   Host at: https://craigbuckmaster.github.io/ScriptureDeepDive/privacy.html
   (GitHub Pages — the archived PWA site can host this)
   OR create a separate privacy-policy repo page.

5. CREATE app/store-metadata/open-source-licenses.md:
   List all open-source dependencies with their licenses:
   - React Native (MIT)
   - Expo (MIT)
   - d3-hierarchy (ISC)
   - react-native-maps (MIT)
   - react-native-svg (MIT)
   - @gorhom/bottom-sheet (MIT)
   - lucide-react-native (ISC)
   - victory-native (MIT)
   - zustand (MIT)
   - nativewind (MIT)
   - react-native-reanimated (MIT)
   - react-native-gesture-handler (MIT)
   ... etc. (extract from package.json)
   All are MIT/ISC — no copyleft concerns.

6. VERIFY: all copy fits within character limits.
   Print word counts for each field.
```

---

## Batch 9C: Screenshots
*Capture polished screenshots for every required device size.*

### Prompt for Batch 9C

```
Phase 9C: Capture store screenshots for iOS and Android.

READ _tools/PHASE_9_PLAN.md (Batch 9C section).

Screenshots are the single most important factor in store conversion.
They need to show the app's best features with real content visible.

TARGET SCREENS (8 screenshots, ordered by importance):

1. "Chapter Reading" — Genesis 1 with verse text visible, section header,
   VHL highlighted words in pink/green/gold. The core experience.
2. "Hebrew Word Study" — Genesis 1 Hebrew panel expanded, showing
   בְּרֵאשִׁית with transliteration and gloss. Scholarly depth.
3. "Genealogy Tree" — zoomed to the Patriarchal era (Abraham, Isaac,
   Jacob visible), era colors, marriage bars. Interactive exploration.
4. "Biblical World Map" — Abraham's Call story active, polyline journey
   visible from Ur to Canaan, place labels in Cinzel font. Geographic context.
5. "Timeline" — zoomed to NT era, several events visible with detail
   panel open for "Crucifixion". Historical context.
6. "Search" — results for "covenant" showing verse matches and
   ḥesed word study. Discoverability.
7. "Home Screen" — Continue Reading chips, book grid with OT section
   expanded, LIVE badges. First impression.
8. "Word Study Detail" — ḥesed full lexicon card with glosses,
   semantic range, occurrences. Scholarly depth.

PROCESS:

1. OPTION A — Maestro screenshot capture (automated):
   Extend existing Maestro flows to capture screenshots at key moments.
   ```yaml
   - takeScreenshot: chapter_reading
   ```
   Maestro saves to a screenshots/ directory.
   Run on iOS Simulator at 6.7" (iPhone 16 Pro Max) and 6.5" sizes.
   Run on Android Emulator at 1080×1920.

   OPTION B — Manual capture:
   Run the app on iOS Simulator (iPhone 16 Pro Max) and manually
   navigate to each screen. Capture with Cmd+S or xcrun simctl.

2. POST-PROCESSING:
   Each screenshot may need:
   - Status bar: clean (full battery, no carrier, clean time)
     Use Simulator → Features → Appearance → Clean Status Bar
   - Frame: optionally add device frame (mockup)
   - No frame is also acceptable (Apple and Google both accept raw)

3. SIZE REQUIREMENTS:
   iOS:
   - 6.7" (iPhone 16 Pro Max): 1320×2868 — REQUIRED
   - 6.5" (iPhone 15 Plus): 1290×2796 — recommended
   - iPad 12.9": 2048×2732 — required IF supporting iPad
   Android:
   - Phone: 1080×1920 minimum — at least 2 required, up to 8
   Google Play also needs:
   - Feature graphic: 1024×500 (banner image for store listing)

4. CREATE feature graphic (Google Play):
   1024×500 image with:
   - Dark background (#0c0a07)
   - App icon (golden cross) on left
   - "Scripture Deep Dive" title in Cinzel gold
   - Tagline: "Scholarly Bible Study" in Source Sans
   - Optional: faded screenshot montage behind text

5. SAVE all screenshots to app/store-metadata/screenshots/:
   ios-6.7/01-chapter.png through ios-6.7/08-word-study.png
   android/01-chapter.png through android/08-word-study.png
   android/feature-graphic.png

6. VERIFY:
   - All 8 screenshots captured for 6.7" iOS
   - All 8 screenshots captured for Android
   - Feature graphic created
   - All images meet minimum resolution requirements
   - No placeholder data visible (real Genesis 1 content, real names)
   - Dark theme consistent across all screenshots
   - Print file sizes and dimensions
```

---

## Batch 9D: Production Builds + Pre-Submission Testing
*Build production binaries. Test on physical devices via TestFlight and internal track.*

### Prompt for Batch 9D

```
Phase 9D: Production builds + pre-submission testing on physical devices.

READ _tools/PHASE_9_PLAN.md (Batch 9D section).

1. BUILD production binaries:
   cd app
   eas build --profile production --platform ios
   eas build --profile production --platform android
   Wait for EAS server builds to complete.
   iOS: produces .ipa file
   Android: produces .aab (Android App Bundle)

2. iOS TESTFLIGHT:
   a. eas submit --platform ios --profile production
      This uploads the .ipa to App Store Connect.
   b. In App Store Connect:
      - The build appears under TestFlight
      - Add test information (what to test, contact email)
      - Add internal testers (developer's Apple ID at minimum)
      - Wait for Apple's automated TestFlight review (~24 hours)
   c. Once approved: install via TestFlight on physical iPhone
   d. Run full E2E test on physical device:
      - App launches from cold start
      - All 5 tabs navigate correctly
      - ChapterScreen: verse text renders, panels expand, VHL works
      - Qnav: opens, searches, navigates
      - Genealogy tree: pinch-to-zoom smooth on real device
      - Map: terrain tiles load, markers render, story overlays work
      - Timeline: pan works on real device touch
      - TTS: audio plays through device speaker
      - Notifications: permission prompt appears, daily verse schedulable
      - Notes/bookmarks/highlights persist after app restart
      - No crashes, no white screens, no missing content

3. ANDROID INTERNAL TESTING:
   a. eas submit --platform android --profile production
      This uploads the .aab to Google Play Console.
   b. In Google Play Console:
      - Create the app listing (name, description, screenshots — from 9B/9C)
      - The build appears under "Internal testing" track
      - Add test email addresses
      - Publish to internal track
   c. Install via Google Play (internal testers get a link)
   d. Run full E2E test on physical Android device:
      - Same checklist as iOS above
      - Verify Android-specific: back button navigation, notification channel

4. OTA UPDATE TEST:
   a. Make a trivial content change:
      - Edit one chapter JSON (e.g., add a test note to a panel)
      - Rebuild scripture.db
   b. Push OTA update:
      eas update --branch production --message "Test OTA update"
   c. On physical device (TestFlight/internal):
      - Relaunch app
      - Verify the content change appears (expo-updates pulls the update)
   d. Revert the test change. Push another OTA to restore.
   This proves the content pipeline works end-to-end: author → JSON → SQLite → OTA → device.

5. FIX any issues found on physical devices.
   Common physical-device-only issues:
   - Font rendering differences from simulator
   - Touch target sizes that felt fine in simulator but are too small on real glass
   - Map tile loading speed on cellular (vs simulator's localhost)
   - TTS audio routing (speaker vs headphones)
   - Notification permission flow differences between iOS versions

6. RE-BUILD if fixes are needed:
   eas build --profile production --platform all
   Re-submit to TestFlight/internal. Re-test.
   Iterate until zero issues on physical devices.

7. VERIFY:
   - iOS TestFlight build: installs, runs, no crashes
   - Android internal build: installs, runs, no crashes
   - OTA update: deploys and receives within minutes
   - All core flows work on physical devices
   - Print: build numbers, file sizes, TestFlight/internal track status
```

---

## Batch 9E: Store Submission + Review
*Submit to both stores. Handle review feedback.*

### Prompt for Batch 9E

```
Phase 9E: Submit to App Store and Google Play. Handle review process.

READ _tools/PHASE_9_PLAN.md (Batch 9E section).

1. iOS APP STORE SUBMISSION:
   In App Store Connect:
   a. Create new app (if not already created during TestFlight):
      - Bundle ID: com.scripturedeepive.app
      - Primary language: English
      - Name: Scripture Deep Dive
   b. Fill in all metadata from app/store-metadata/ios.md:
      - Subtitle, description, keywords, promotional text, What's New
      - Support URL, marketing URL
      - Privacy policy URL
   c. Upload screenshots from app/store-metadata/screenshots/ios-6.7/
   d. Set pricing: Free
   e. Set age rating: 4+ (complete the questionnaire — no objectionable content)
   f. App Review Information:
      - Contact: developer name, email, phone
      - Notes: "This is a Bible study app with offline scholarly commentary.
        No account required. No internet required after install.
        No user-generated content visible to other users."
      - Demo account: none needed (no login)
   g. Select the TestFlight build that passed testing
   h. Submit for review

   Apple review typically takes 24-48 hours.
   Common reasons for rejection (and why we should be fine):
   - "Wrapper app" → We're fully native with SQLite, no WebViews ✅
   - "Spam / minimal functionality" → 879 chapters, 30+ features ✅
   - "Crashes" → Phase 8 testing passed, TestFlight verified ✅
   - "Privacy" → No data collection beyond anonymous analytics ✅
   - "Metadata" → Accurate description, real screenshots ✅

2. GOOGLE PLAY SUBMISSION:
   In Google Play Console:
   a. Complete app listing (if not done during internal testing):
      - All metadata from app/store-metadata/android.md
      - Feature graphic from screenshots/android/feature-graphic.png
      - Screenshots from screenshots/android/
   b. Complete content rating questionnaire (IARC):
      - Violence: None
      - Sexual content: None
      - Language: None
      - Controlled substances: None
      - Miscellaneous: Contains religious content (educational)
      → Expected rating: Everyone / PEGI 3 / USK 0
   c. Set pricing: Free
   d. Privacy policy URL (same as iOS)
   e. Target audience and content: General
   f. Data safety form:
      - Data collected: None (or "Analytics" if PostHog enabled)
      - Data shared: None
      - Encryption: Yes (HTTPS for OTA updates)
   g. Promote the internal testing build to "Production" track
   h. Submit for review (roll out to 100%)

   Google review typically takes 1-7 days for first submission.
   Common reasons for rejection (and why we should be fine):
   - "Policy violation" → No user content, no ads, no restricted content ✅
   - "Broken functionality" → Internal testing verified ✅
   - "Metadata mismatch" → Real screenshots, accurate description ✅

3. MONITOR review status:
   - Check App Store Connect daily for status updates
   - Check Google Play Console daily
   - If rejected: read the rejection reason carefully, fix, resubmit
   - If approved: verify the app appears in store search

4. POST-APPROVAL:
   a. Verify store listing looks correct (screenshots, description, icon)
   b. Download from each store on a clean device — confirm installation works
   c. Push first real OTA update (not a test): any pending content improvements
   d. Monitor crash reports (Expo error reporting or PostHog)
   e. Announce launch (social media, GitHub repo, PWA site)

5. DOCUMENT the release:
   - Git tag: v1.0.0
   - Update README.md with App Store and Google Play badges/links
   - Update the archived PWA homepage to link to the native app
   - Write RELEASE_NOTES.md with version history
```

---

## Batch Summary

| Batch | Description | Deliverables | Tool calls |
|-------|-------------|-------------|-----------|
| **9A** | EAS config (eas.json, app.json, credentials), splash/icon assets, first preview builds | 2 config files, 3 image assets, 2 preview builds | ~12 |
| **9B** | Store metadata (iOS + Android descriptions, keywords, copy), privacy policy, open-source licenses | 5 markdown files, 1 HTML page hosted | ~10 |
| **9C** | Screenshots (8 screens × 2 platforms), feature graphic, post-processing | 16+ screenshot files, 1 feature graphic | ~10 |
| **9D** | Production builds, TestFlight + internal track distribution, physical device testing, OTA pipeline verification | 2 production builds, verified on physical devices | ~12 |
| **9E** | Store submission (both platforms), review monitoring, post-approval verification, release documentation | Live on App Store + Google Play | ~8 |

**Total: 5 batches, ~52 tool calls, targeting 2-3 sessions (plus review wait time).**

**Dependency graph:**
```
9A ──→ 9B ──→ 9C ──→ 9D ──→ 9E
```

Strictly linear. Each batch depends on the previous. 9A (builds) must work before 9B (metadata) is useful. 9C (screenshots) requires a working app. 9D (TestFlight) requires production builds. 9E (submission) requires everything.

**External wait times:**
- EAS build: ~15-30 minutes per platform
- TestFlight automated review: ~24 hours
- App Store human review: ~24-48 hours
- Google Play review: ~1-7 days (first submission)

---

## Session Planning

**Session 1:** Batches 9A + 9B (build config + metadata/legal)
**Session 2:** Batches 9C + 9D (screenshots + production builds + physical testing)
**Session 3:** Batch 9E (submission + monitoring) — may span multiple days due to review wait

---

## Verification Checklist (run after Phase 9 is complete)

**Build configuration:**
- [ ] eas.json has development, preview, and production profiles
- [ ] app.json has complete Expo config (name, slug, version, icons, splash, plugins)
- [ ] iOS bundle identifier: com.scripturedeepive.app
- [ ] Android package: com.scripturedeepive.app
- [ ] EAS credentials configured (provisioning profiles, keystore)
- [ ] expo-updates configured with project ID and runtime version

**Store metadata:**
- [ ] iOS description: under 4000 chars, compelling, accurate
- [ ] iOS keywords: under 100 chars, relevant, no duplicates
- [ ] iOS subtitle: under 30 chars
- [ ] Android short description: under 80 chars
- [ ] Android full description: under 4000 chars
- [ ] Both descriptions mention: offline, free, scholarly, Hebrew/Greek, 40+ scholars

**Legal:**
- [ ] Privacy policy hosted at public URL
- [ ] Privacy policy accurately states: no PII collected, local-only data
- [ ] Open-source license file complete (all npm dependencies)

**Assets:**
- [ ] App icon 1024×1024 (no alpha, no rounded corners)
- [ ] Adaptive icon foreground 1024×1024
- [ ] Splash screen image with golden cross
- [ ] 8 iOS screenshots at 1320×2868 (6.7" required)
- [ ] 8 Android screenshots at 1080×1920+
- [ ] Google Play feature graphic 1024×500

**Testing:**
- [ ] TestFlight build installs and runs on physical iPhone
- [ ] Internal testing build installs and runs on physical Android
- [ ] All core flows verified on physical devices (not just simulator)
- [ ] OTA update deploys and device receives it within minutes
- [ ] No crashes on physical devices

**Store status:**
- [ ] iOS: submitted to App Store review
- [ ] Android: submitted to Google Play review
- [ ] Both: approved and live in store
- [ ] Store search: "Scripture Deep Dive" returns the app
- [ ] Store listing: screenshots, description, icon all display correctly
- [ ] Clean install from store on new device: app works

**Post-launch:**
- [ ] Git tag v1.0.0 created
- [ ] README.md updated with store links/badges
- [ ] First OTA content update pushed successfully
- [ ] Crash monitoring active (PostHog or Expo)

# App Store Submission — Complete Step-by-Step Guide

> **Current state:** All code is written. This guide takes you from "code on GitHub" to "live on the App Store and Google Play."
>
> **Time estimate:** 2-4 hours of active work + 1-7 days waiting for reviews.
>
> **Cost:** Apple Developer Program ($99/year) + Google Play Console ($25 one-time).

---

## Phase 1: Prerequisites (One-Time Setup)

### 1.1 Install Required Tools

On your Windows machine, open Command Prompt or PowerShell:

```
npm install -g eas-cli
```

Verify:
```
eas --version
```

### 1.2 Create an Expo Account

1. Go to [https://expo.dev/signup](https://expo.dev/signup)
2. Create a free account
3. In Command Prompt:
   ```
   eas login
   ```
   Enter your Expo credentials.

### 1.3 Enroll in Apple Developer Program

1. Go to [https://developer.apple.com/programs/enroll/](https://developer.apple.com/programs/enroll/)
2. Sign in with your Apple ID (or create one)
3. Enroll as an **Individual** ($99/year)
4. Apple takes 24-48 hours to process enrollment
5. Once approved, note your **Team ID** (visible at [https://developer.apple.com/account/#/membership](https://developer.apple.com/account/#/membership))

### 1.4 Enroll in Google Play Developer Console

1. Go to [https://play.google.com/console/signup](https://play.google.com/console/signup)
2. Pay the $25 one-time fee
3. Complete your developer profile (name, address, email)
4. Account is usually active within minutes

### 1.5 Create a Google Service Account (for automated Android submission)

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Go to **IAM & Admin → Service Accounts**
4. Click **Create Service Account**
   - Name: `scripture-deep-dive-play`
   - Role: none needed here
5. Click the new service account → **Keys** tab → **Add Key → Create New Key → JSON**
6. Download the JSON file
7. Save it as `D:\REPOS\ScriptureDeepDive\app\google-service-account.json`
   (this file is in `.gitignore` — it won't be committed)
8. Go to [Google Play Console](https://play.google.com/console) → **Settings → API access**
9. Link the Google Cloud project
10. Grant the service account **Release manager** permissions

---

## Phase 2: Initialize EAS in Your Project

Open Command Prompt:

```
cd /d D:\REPOS\ScriptureDeepDive\app

eas init
```

This will:
- Ask you to select your Expo account
- Create a project on Expo's servers
- Give you a **Project ID** (looks like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**Now update two files with the Project ID:**

### 2.1 Update app.json

Open `D:\REPOS\ScriptureDeepDive\app\app.json` in a text editor.

Find and replace:
- `PLACEHOLDER_PROJECT_ID` → your actual Project ID (appears twice: in `updates.url` and `extra.eas.projectId`)

Example:
```json
"updates": {
  "url": "https://u.expo.dev/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
},
"extra": {
  "eas": {
    "projectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### 2.2 Update eas.json

Open `D:\REPOS\ScriptureDeepDive\app\eas.json` in a text editor.

Find and replace:
- `PLACEHOLDER_APPLE_ID` → your Apple ID email (e.g., `craig@example.com`)
- `PLACEHOLDER_TEAM_ID` → your Apple Team ID from step 1.3 (e.g., `ABC123DEF4`)
- `PLACEHOLDER_ASC_APP_ID` → leave this for now, you'll get it in Phase 4

---

## Phase 3: Configure Credentials

```
cd /d D:\REPOS\ScriptureDeepDive\app

eas credentials
```

### 3.1 iOS Credentials

Select **iOS** when prompted. EAS will:
- Ask if you want to log in to your Apple Developer account
- Log in with your Apple ID + password
- May ask for 2FA code
- Automatically create:
  - A **Distribution Certificate**
  - A **Provisioning Profile**
- These are stored securely on Expo's servers (you don't need to manage them)

### 3.2 Android Credentials

Select **Android** when prompted. EAS will:
- Ask if you want to generate a new keystore
- Select **Yes, generate a new keystore**
- EAS creates and stores the keystore securely
- You never need to touch the keystore file directly

---

## Phase 4: First Preview Build (Test Before Store)

This creates installable builds for testing — NOT for the store yet.

```
cd /d D:\REPOS\ScriptureDeepDive\app

eas build --profile preview --platform ios
```

This sends your code to Expo's cloud build servers. Wait ~15-30 minutes. When done:
- EAS prints a URL to download the `.ipa` file
- Go to that URL on your iPhone → it installs via an ad-hoc profile

```
eas build --profile preview --platform android
```

Same process. When done:
- Download the `.apk` file on your Android device (or email it to yourself)
- Open the APK → it installs directly

### 4.1 Test on Your iPhone

Open the installed app and verify:
- App launches with dark background and gold loading indicator
- Splash screen transitions to Home screen
- "Scripture Deep Dive" title visible
- Tab bar works (Home, Read, Explore, Search, More)
- Tap a book → chapter grid → chapter screen with verse text
- VHL highlighted words visible in colors
- Panel buttons toggle correctly
- Qnav overlay opens and closes
- Settings screen: translation toggle, font size slider

**If anything crashes:** Check the build logs at [https://expo.dev](https://expo.dev) → your project → Builds. The error will be in the build or runtime logs.

### 4.2 Test on Android

Same verification steps as iPhone.

---

## Phase 5: Create App Store Connect Listing

### 5.1 Create the App in App Store Connect

1. Go to [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps → + (New App)**
3. Fill in:
   - **Platform:** iOS
   - **Name:** `Scripture Deep Dive`
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.scripturedeepive.app` (should appear in dropdown after credentials setup)
   - **SKU:** `scripture-deep-dive-v1`
4. Click **Create**
5. Note the **Apple ID** shown on the app page (a number like `1234567890`)
6. Go back to `eas.json` and replace `PLACEHOLDER_ASC_APP_ID` with this number

### 5.2 Fill In App Store Metadata

In App Store Connect, on your app's page:

**App Information tab:**
- Subtitle: `Scholarly Bible Study`
- Category: `Reference` → subcategory: leave blank (no Bible Study subcategory — Reference is correct)
- Content Rights: "This app does not contain third-party content" → select and acknowledge

**Pricing and Availability tab:**
- Price: Free
- Availability: All territories

**App Privacy tab:**
- Privacy Policy URL: `https://craigbuckmaster.github.io/ScriptureDeepDive/privacy.html`
- Data types collected: Select **"None of the above"** (we collect no data)
  - If you plan to add analytics later, select "Analytics" → "Not linked to identity"

### 5.3 Prepare the Version (1.0.0)

Click **1.0 Prepare for Submission** in the sidebar:

**Screenshots** (required — see Phase 7 below for how to capture):
- You need at least **6.7-inch** screenshots (iPhone 16 Pro Max: 1320×2868)
- Upload 3-8 screenshots showing key features

**Description:**
Copy from `app/store-metadata/ios.md` → the Description section.

**Keywords:**
```
bible study,commentary,hebrew,greek,word study,devotional,NIV,ESV,genealogy,map,timeline,scholarly
```

**Promotional Text:**
```
Explore the Bible with 40+ scholars, Hebrew & Greek word studies, an interactive family tree, a biblical world map, and verse-by-verse commentary. Offline. Free.
```

**Support URL:** `https://github.com/CraigBuckmaster/ScriptureDeepDive/issues`

**Marketing URL:** `https://craigbuckmaster.github.io/ScriptureDeepDive/`

**What's New:**
```
Welcome to Scripture Deep Dive! Explore 30 books and 879 chapters with verse-by-verse scholarly commentary, Hebrew and Greek word studies, interactive exploration tools, and personal study features.
```

**App Review Information:**
- Contact: Your name, email, phone
- Notes to reviewer:
  ```
  This is a Bible study app with offline scholarly commentary.
  No account required. No internet required after install.
  No user-generated content visible to other users.
  All content is pre-bundled in the app's SQLite database.
  ```
- Demo account: None (no login required)

**Age Rating:**
Complete the questionnaire:
- All answers: **None** (no violence, no sexual content, etc.)
- Result: **4+**

---

## Phase 6: Create Google Play Listing

### 6.1 Create the App in Google Play Console

1. Go to [https://play.google.com/console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - **App name:** `Scripture Deep Dive — Bible Study`
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
4. Accept declarations and click **Create app**

### 6.2 Fill In Store Listing

Go to **Grow → Store presence → Main store listing:**

- **Short description:** `Scholarly Bible study with 40+ commentators, word studies, maps, and timelines.`
- **Full description:** Copy from `app/store-metadata/android.md` → Full Description section
- **App icon:** Upload `app/assets/images/icon-512.png` (Google requires 512×512)
- **Feature graphic:** You'll need to create a 1024×500 banner image (see Phase 7)
- **Screenshots:** Upload 3-8 screenshots (minimum 1080×1920)

### 6.3 Content Rating

Go to **Policy → App content → Content rating:**
1. Start the IARC questionnaire
2. All answers: **No** (no violence, sex, language, gambling, etc.)
3. Additional: "Contains religious content" — select if asked
4. Result: **Everyone** / PEGI 3

### 6.4 Data Safety

Go to **Policy → App content → Data safety:**
1. "Does your app collect or share any of the required user data types?" → **No**
2. (If you add analytics later: select "Analytics" → "Not shared" → "Not linked to identity")
3. Privacy policy URL: `https://craigbuckmaster.github.io/ScriptureDeepDive/privacy.html`

### 6.5 Target Audience

Go to **Policy → App content → Target audience:**
- Select: **13 and older** or **General / Not specifically designed for children**
- Do NOT select "Primarily for children" (triggers COPPA requirements)

---

## Phase 7: Capture Screenshots

You need screenshots from the running app. Two approaches:

### Option A: From Expo Go on Your Phone (Easiest)

1. Run the app: `cd /d D:\REPOS\ScriptureDeepDive\app && npx expo start`
2. Open on your iPhone via Expo Go
3. Navigate to each screen and take a screenshot (iPhone: Side button + Volume Up)
4. Transfer screenshots to your computer (AirDrop, email, or Photos sync)

**8 screenshots to capture (in order of importance):**

| # | Screen | What to show | How to get there |
|---|--------|-------------|-----------------|
| 1 | Chapter Reading | Genesis 1 with verse text, VHL colors, section header | Home → Genesis → Chapter 1 |
| 2 | Hebrew Panel | Genesis 1 Hebrew panel expanded with בְּרֵאשִׁית | Chapter 1 → tap "Hebrew ▾" |
| 3 | Genealogy Tree | Zoomed to Patriarchs (Abraham, Isaac, Jacob visible) | Explore → People → pinch zoom |
| 4 | Biblical Map | Abraham's Call story active with journey lines | Explore → Map → Patriarchal → Abraham's Call |
| 5 | Timeline | Several events visible, one detail panel open | Explore → Timeline → tap an event |
| 6 | Search Results | Results for "covenant" showing verses + word study | Search tab → type "covenant" |
| 7 | Home Screen | Continue Reading chips, book grid with LIVE badges | Home tab (after reading a chapter) |
| 8 | Word Study | Full lexicon card with glosses and occurrences | Explore → Word Studies → tap entry |

### Option B: From iOS Simulator (Better Quality, Requires Mac)

If you have access to a Mac:
1. Install Xcode
2. Run `npx expo start --ios` → opens in Simulator
3. Simulator → File → New Screen Shot (or Cmd+S)
4. Screenshots save to Desktop

### Google Play Feature Graphic

You need a 1024×500 banner image. Create one using:
- [Canva](https://canva.com) (free)
- Dark background `#0c0a07`
- App name "Scripture Deep Dive" in gold
- Tagline "Scholarly Bible Study"
- Optional: small screenshots or the app icon

---

## Phase 8: Production Build + TestFlight

### 8.1 Build for Production

```
cd /d D:\REPOS\ScriptureDeepDive\app

eas build --profile production --platform ios
```

Wait 15-30 minutes. When complete, the build is stored on Expo's servers.

### 8.2 Submit to TestFlight

```
eas submit --platform ios
```

EAS will:
- Ask you to confirm the build to submit
- Upload the `.ipa` to App Store Connect
- Apple runs an automated review (takes ~24 hours)

### 8.3 Test via TestFlight

1. Apple sends you an email when the build is processed
2. Open **TestFlight** app on your iPhone
3. Your build appears under your app
4. Tap **Install** → test the app
5. Verify all core flows work on the actual TestFlight build

### 8.4 Android Internal Testing

```
eas build --profile production --platform android
eas submit --platform android
```

This uploads to Google Play's **internal testing** track.

1. Go to Google Play Console → your app → **Testing → Internal testing**
2. Create an email list with your Google account
3. Download the app from the internal testing link
4. Verify on your Android device

---

## Phase 9: Submit for Review

### 9.1 iOS App Store Submission

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → your app
2. Under **1.0 Prepare for Submission:**
   - Select the TestFlight build that you tested
   - Verify all metadata, screenshots, and description are filled in
   - Verify privacy policy URL is accessible
3. Click **Submit for Review**

**Review timeline:** Apple typically reviews within 24-48 hours (sometimes same day, rarely up to a week).

**Common rejection reasons (and why you should be fine):**
| Reason | Our status |
|--------|-----------|
| Crashes | Tested on TestFlight ✅ |
| WebView wrapper | Fully native, no WebViews ✅ |
| Minimal functionality | 879 chapters, 21 screens, 63 components ✅ |
| Privacy issues | No data collection, policy published ✅ |
| Misleading metadata | Real screenshots, accurate description ✅ |

**If rejected:**
- Read the rejection reason carefully in App Store Connect
- Fix the issue
- Rebuild: `eas build --profile production --platform ios`
- Resubmit: `eas submit --platform ios`
- Reply to the reviewer in the Resolution Center

### 9.2 Google Play Submission

1. Go to Google Play Console → your app → **Production**
2. Click **Create new release**
3. The internal testing build should be promotable — click **Promote release** from internal testing
4. Add release notes (copy from `store-metadata/RELEASE_NOTES.md`)
5. Click **Review release** → **Start rollout to Production**
6. Choose rollout percentage: **100%** (or staged: 10% → 50% → 100%)

**Review timeline:** Google typically reviews within 1-7 days for first submission.

---

## Phase 10: Post-Launch

### 10.1 Verify Store Listing

Once approved:
1. Search "Scripture Deep Dive" on the App Store / Google Play
2. Verify the listing looks correct (icon, screenshots, description)
3. Download on a clean device (one that never had the dev build)
4. Confirm the app installs and runs correctly from the store

### 10.2 Push Your First OTA Update

After the app is live, you can push content updates without a new store review:

```
cd /d D:\REPOS\ScriptureDeepDive\app

eas update --branch production --message "Initial launch polish"
```

Users receive the update next time they open the app (within seconds).

### 10.3 Git Tag the Release

```
cd /d D:\REPOS\ScriptureDeepDive
git tag v1.0.0
git push origin v1.0.0
```

### 10.4 Monitor

- **App Store Connect → Analytics:** download numbers, crash reports
- **Google Play Console → Statistics:** installs, ratings, crash reports
- **Expo dashboard → Updates:** OTA update adoption rate

### 10.5 Future Content Updates

Adding new books/chapters uses OTA — no app review needed:

```
# On your dev machine (or have Claude build the chapters):
python3 /tmp/gen_jeremiah_1_10.py
python3 _tools/build_sqlite.py

# Push the updated database:
eas update --branch production --message "Add Jeremiah 1-10"
```

Users get the new content next time they open the app.

---

## Quick Reference: Key Commands

```bash
# Development
cd /d D:\REPOS\ScriptureDeepDive\app
npm install
npx expo start                          # Expo Go dev server
npx expo start --web                    # Web preview

# Building
eas build --profile preview --platform ios      # Test build (internal)
eas build --profile preview --platform android
eas build --profile production --platform ios   # Store build
eas build --profile production --platform android
eas build --profile production --platform all   # Both at once

# Submitting
eas submit --platform ios               # To TestFlight / App Store
eas submit --platform android           # To Google Play

# OTA Updates (no app review needed)
eas update --branch production --message "Description of changes"

# Credentials management
eas credentials                         # View/configure signing certs
```

## Key URLs

| What | URL |
|------|-----|
| Expo Dashboard | [https://expo.dev](https://expo.dev) |
| App Store Connect | [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com) |
| Google Play Console | [https://play.google.com/console](https://play.google.com/console) |
| Apple Developer | [https://developer.apple.com](https://developer.apple.com) |
| Privacy Policy | [https://craigbuckmaster.github.io/ScriptureDeepDive/privacy.html](https://craigbuckmaster.github.io/ScriptureDeepDive/privacy.html) |
| GitHub Repo | [https://github.com/CraigBuckmaster/ScriptureDeepDive](https://github.com/CraigBuckmaster/ScriptureDeepDive) |

## Checklist

```
[ ] Apple Developer enrolled ($99/year)
[ ] Google Play Console enrolled ($25)
[ ] eas-cli installed globally
[ ] eas login completed
[ ] eas init completed (Project ID obtained)
[ ] app.json updated with Project ID
[ ] eas.json updated with Apple credentials
[ ] eas credentials configured (iOS + Android)
[ ] Preview builds tested on physical devices
[ ] Screenshots captured (8 per platform)
[ ] App Store Connect listing created
[ ] Google Play Console listing created
[ ] Privacy policy page live
[ ] Production iOS build completed
[ ] TestFlight testing passed
[ ] Production Android build completed
[ ] Internal testing passed
[ ] iOS submitted for review
[ ] Android submitted for review
[ ] iOS approved and live
[ ] Android approved and live
[ ] Store search returns the app
[ ] Clean install from store works
[ ] v1.0.0 git tag pushed
[ ] First OTA update tested
```

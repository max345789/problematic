# Google Play Store Distribution Kit — Problematic v1.0.0

This document contains everything needed to publish **Problematic** to the Google Play Store through the [Google Play Console](https://play.google.com/console).

---

## 1. Release Artifacts Summary

| Artifact | File Location | Size | SHA-256 Checksum |
| :--- | :--- | :--- | :--- |
| **Android App Bundle (.aab)** | `release/problematic-v1.0.0.aab` | ~70.6 MB | `A05CAD1317C125C663DF22D72637AD2EB5A3F77B690169363A81D871F85122F8` |
| **Release APK (Direct sideload)** | `release/problematic-v1.0.0.apk` | ~70.7 MB | `D589680FE81B694F3EDA71E0C3DD53209B2B26EB3C5226A8CA2E450CAF826AC8` |
| **Release Signing Keystore** | `release/problematic-release.keystore` | 2.8 KB | `1C2D75F0C2556EEBA3037E86529C6550233A1FF2D6560B4B47C59DBD67343502` |

> **IMPORTANT:** Google Play requires the **`.aab`** file (`problematic-v1.0.0.aab`) for app releases. The APK is provided for internal direct testing on physical test devices.

---

## 2. Keystore Credentials

Keep these credentials safe for signing future updates:

- **Keystore File:** `release/problematic-release.keystore`
- **Alias:** `problematic-release-key`
- **Store Password:** `problematic2026release`
- **Key Password:** `problematic2026release`
- **Algorithm:** RSA 2048-bit (Validity: 10,000 days / ~27 years)

---

## 3. Google Play Store Listing Copy

### App Title (Max 30 characters)
```text
Problematic
```

### Short Description (Max 80 characters)
```text
Worldwide problem-solving network. Broadcast challenges, collaborate, resolve.
```

### Full Description (Max 4000 characters)
```text
Problematic is the global problem-solving network built for thinkers, builders, and community solvers.

Have an intractable bug, hardware issue, design puzzle, or technical roadblock? Broadcast your challenge worldwide to a network of real problem solvers.

KEY FEATURES:
• Global Problem Broadcasting: Post your problem with code snippets, tags, categories, and interactive polls.
• Verified Solution Acceptance: Mark verified resolutions that solved your problem. Give credit where it's due.
• Respectadeo Reputation Economy: Earn community standing for verified, high-impact solutions.
• Real-time Notification Engine: Get instant updates when community members propose solutions.
• Fast, Clean Dark Design: Pure OLED black aesthetic with responsive motion and zero visual clutter.
• Offline-First Resilience: Browse cached feeds, draft problems, and sync seamlessly once reconnected.

Join Problematic today and turn complex challenges into community victories.
```

### Category & Tags
- **Primary Category:** Social / Productivity
- **Tags:** Social Networking, Problem Solving, Developer Tools, Collaboration, Community

---

## 4. Google Play Data Safety Form Questionnaire Answers

When completing the **Data Safety** section in the Google Play Console, use these declarations:

| Question | Answer | Details |
| :--- | :--- | :--- |
| **Does your app collect or share user data?** | **Yes** | Account info and user-generated posts/comments |
| **Is all user data encrypted in transit?** | **Yes** | All network traffic uses HTTPS/TLS encryption |
| **Do you provide a way for users to request data deletion?** | **Yes** | Via in-app profile clearance or email to `support@problematic.app` |
| **Data types collected:** | | |
| • *Personal info — Name & User ID/Handle* | Collected | Required for account creation and attribution |
| • *Messages/User Content — Posts & Comments* | Collected | Core functionality (problems, replies, polls) |
| • *App activity — App interactions* | Collected | Likes and votes for ranking solutions |
| **Is any data shared with third parties or data brokers?** | **No** | 0 third-party analytics or advertising SDKs |

---

## 5. Step-by-Step Google Play Console Submission Guide

### Step 1: Log in to Google Play Console
1. Navigate to [https://play.google.com/console](https://play.google.com/console).
2. Click **Create app**.
   - **App name:** `Problematic`
   - **Default language:** `English (United States)`
   - **App or Game:** `App`
   - **Free or Paid:** `Free`
   - Accept the Developer Program Policies and US Export Laws, then click **Create app**.

### Step 2: Set up Store Presence
1. Under **Grow > Store presence > Main store listing**:
   - Paste the **App Title**, **Short description**, and **Full description** from Section 3 above.
   - Upload App Icon (512 x 512 px PNG).
   - Upload Feature Graphic (1024 x 500 px JPEG/PNG).
   - Upload phone screenshots (at least 2 screenshots, 16:9 or 9:16 aspect ratio).

### Step 3: Complete App Content Policies
Under **Policy and programs > App content**, complete:
1. **Privacy Policy:** Link to your hosted privacy policy (e.g., hosted on GitHub Pages or company domain using `docs/PRIVACY_POLICY.md`).
2. **App Access:** Select "All functionality is available without special access" or provide credentials for tester account (`@rohitha` / `password`).
3. **Ads:** Select "No, my app does not contain ads".
4. **Content Rating:** Start questionnaire, select "Social or Communication", answer content prompts (no violence, no gambling), and save rating.
5. **Target Audience:** Select `18 and over` (or `13 and over`).
6. **Data Safety:** Fill using Section 4 table above.
7. **Government Apps:** Select "No".
8. **Financial Features:** Select "My app doesn't provide financial features".

### Step 4: Create a Release
1. Under **Release > Testing > Internal testing** (recommended for immediate test without Google review):
   - Click **Create new release**.
   - Upload `release/problematic-v1.0.0.aab`.
   - Release name: `1.0.0 (1)`.
   - Release notes:
     ```text
     Initial release of Problematic — The worldwide problem-solving network.
     - Real-time problem broadcasting & solution acceptance
     - Community standing & Respectadeo reputation
     - Pure OLED black dark interface
     ```
   - Click **Next** > **Save and publish**.
2. Under the **Testers** tab:
   - Add tester email addresses or create an email list.
   - Copy the shareable invite link and open it on Android devices to download directly from Google Play.

### Step 5: Promote to Production
Once internal testing confirms satisfaction:
- Click **Promote release > Production**, review details, and submit for Google Play review!

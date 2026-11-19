# Problematic – Google Play Store Complete Setup & Submission Guide

This guide details everything configured, generated, and required to push **Problematic** to the **Google Play Store**.

---

## 1. App Identity & Release Metadata

| Attribute | Configured Value | Notes |
| :--- | :--- | :--- |
| **App Name** | `Problematic` | Display title on Android launcher and Play Store |
| **Package Name / Application ID** | `com.problamatic.murmur` | Unique global identifier across Google Play |
| **Version Name** | `1.0.0` | User-visible version |
| **Version Code** | `1` | Incremental integer (must increment with each update) |
| **Target SDK** | `34` (Android 14) | Exceeds Google Play minimum requirement (API 34+) |
| **Minimum SDK** | `22` (Android 5.1) | Compatible with 99%+ of all Android devices |
| **Cleartext Traffic** | `Disabled` (`false`) | Secure HTTPS enforcement required by Play Store |
| **Web Debugging** | `Disabled` (`false`) | Production hardened |

---

## 2. Release Artifacts & Assets Directory

All release artifacts are prepared and verified in the [`release/`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release) directory:

| Asset | File Location | Dimensions / Size | Purpose |
| :--- | :--- | :--- | :--- |
| **Android App Bundle** | [`release/problematic-v1.0.0-release.aab`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release/problematic-v1.0.0-release.aab) | **2.80 MB** | **Required by Google Play Console** for release uploads |
| **Direct APK** | [`release/problematic-v1.0.0-release.apk`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release/problematic-v1.0.0-release.apk) | **2.96 MB** | Standalone installable APK for side-loading & testing |
| **App Icon** | [`release/playstore-icon-512.png`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release/playstore-icon-512.png) | 512 x 512 px (PNG) | Play Store listing launcher icon |
| **Feature Graphic** | [`release/playstore-feature-graphic-1024x500.png`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release/playstore-feature-graphic-1024x500.png) | 1024 x 500 px (PNG) | **Mandatory banner** for Play Store app listing |
| **Store Screenshots** | `release/store_screenshot_1_feed.png`<br>`release/store_screenshot_2_profile.png`<br>`release/store_screenshot_3_settings.png` | 1082 x 2402 px | High-resolution phone screenshots for store showcase |
| **Privacy Policy** | [`public/privacy.html`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/public/privacy.html) | Standalone HTML | Public privacy policy required for Play Store compliance |

---

## 3. Signing Keystore Details

The release keystore is configured in [`android/app/build.gradle`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/android/app/build.gradle):

- **Keystore File:** `release/problematic-release.keystore`
- **Keystore Type:** `PKCS12`
- **Key Alias:** `problematic-release-key`
- **Keystore & Key Password:** `problematic2026release`
- **Validity:** Valid through **April 6, 2054**
- **SHA-256 Fingerprint:**  
  `F6:97:72:9A:A3:F8:82:F0:DA:EB:D3:1A:F0:D8:65:77:F4:47:E4:7B:9D:88:6C:E3:1D:CA:27:03:AD:D0:A1:DC`
- **SHA-1 Fingerprint:**  
  `9F:14:B1:E0:66:C9:7E:8F:35:CD:44:27:64:38:41:3F:C3:39:28:A0`

> [!IMPORTANT]
> Keep `release/problematic-release.keystore` backed up securely. If you lose this key, you cannot update your app on Google Play unless Play App Signing key upgrade is requested.

---

## 4. Google Play Console Step-by-Step Submission

### Step 1: Create the App
1. Go to [Google Play Console](https://play.google.com/console) and sign in.
2. Click **Create app**.
3. **App name:** `Problematic`
4. **Default language:** English (United States)
5. **App or game:** `App`
6. **Free or paid:** `Free`
7. Check declarations (Developer Program Policies, US export laws) and click **Create app**.

---

### Step 2: Policy & "App Content" Questionnaire
Navigate to **Policy** -> **App content** in the left sidebar and complete the required sections:

1. **Privacy Policy:**
   - URL: `https://api.dabcloud.in/privacy.html` (or host [`public/privacy.html`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/public/privacy.html) on your domain/GitHub Pages).
2. **Ads:**
   - Select **No, my app does not contain ads**.
3. **App Access:**
   - Select **All functionality is available without special access** (or provide test credentials: username `testuser`, password `password123`).
4. **Content Ratings (IARC Questionnaire):**
   - Category: **Social or Communication**
   - Violence, sexual content, profanity: **No**
   - Can users exchange content/messages?: **Yes** (moderated social platform)
   - Does app share user location?: **No**
   - Click Save and calculate rating (typically PEGI 12+ / Teen).
5. **Target Audience and Content:**
   - Select **13-15**, **16-17**, and **18 and over**.
   - Could the app appeal to children?: **No**.
6. **Data Safety Form:**
   - Does your app collect or share user data?: **Yes**
   - Is data encrypted in transit?: **Yes** (all API calls use HTTPS/TLS)
   - Do you provide a way for users to request data deletion?: **Yes** (support email & in-app profile clearance)
   - Data types:
     - **Personal Info -> Name / User IDs:** Collected for account functionality.
     - **Messages -> Emails / Other in-app messages:** Collected for direct messaging.
     - **User Content -> Other user-generated content:** Broadcasted problems and solutions.
     - Tracking purposes: **None** (data is NOT shared with third parties or data brokers).
7. **Government Apps / Financial Features / Health:**
   - Select **No** for each.

---

### Step 3: Main Store Listing
Navigate to **Store presence** -> **Main store listing**:

1. **App details:**
   - **App name:** `Problematic`
   - **Short description (up to 80 chars):**  
     `Real problems, real solutions. Broadcast issues and earn Respectadeo points.`
   - **Full description (up to 4000 chars):**  
     ```
     Problematic is a worldwide community where real problems meet verified solutions.

     No follower barriers or algorithms limiting your reach: when you post a problem, members across the globe can propose actionable solutions. Every contribution is verified by our multi-agent moderation pipeline, awarding Respectadeo (RD) reputation points to helpful community members.

     KEY FEATURES:
     • Global Problem Broadcasts: Share challenges with an open, worldwide audience.
     • Verified Community Solutions: Discover high-impact fixes and vote on what works.
     • Respectadeo (RD) Reputation: Earn score points when problem authors accept your solutions.
     • AI-Backed Verification: Multi-agent checks ensure solutions are on-topic, safe, and actionable.
     • Direct Messaging & Discussion: Collaborate in private chats to resolve complex issues.
     • Light & Dark Themes: Full high-contrast support tailored for all lighting conditions.

     Join Problematic today and help solve real-world problems.
     ```
2. **Graphics:**
   - **App icon:** Upload [`release/playstore-icon-512.png`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release/playstore-icon-512.png) (512x512).
   - **Feature graphic:** Upload [`release/playstore-feature-graphic-1024x500.png`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release/playstore-feature-graphic-1024x500.png) (1024x500).
   - **Phone screenshots:** Upload at least 2 screenshots from `release/`:
     - `release/store_screenshot_1_feed.png`
     - `release/store_screenshot_2_profile.png`
     - `release/store_screenshot_3_settings.png`

---

### Step 4: Create Release & Upload AAB
1. Navigate to **Testing** -> **Internal testing** (recommended first):
   - Click **Create new release**.
   - Drag and drop:  
     [`release/problematic-v1.0.0-release.aab`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/release/problematic-v1.0.0-release.aab)
   - Release name: `1.0.0`
   - Release notes:
     ```
     Initial production release of Problematic v1.0.0.
     - Global problem broadcast & verified solution feed
     - Respectadeo (RD) reputation score system
     - Real-time direct messaging and comments
     - High-contrast Light & Dark mode support
     ```
   - Click **Next** -> **Save and publish**.
   - Internal testing links become active within minutes!

2. **For Production Rollout:**
   - Navigate to **Release** -> **Production** -> **Create new release**.
   - Use the same `.aab` or promote the Internal Testing release to Production.

---

## 5. One-Command Build & Automated Release

To recompile fresh release bundles anytime:

```powershell
# Run the automated release pipeline:
npm run playstore:build
```
Or directly:
```powershell
.\publish_playstore.ps1
```

To re-capture updated Play Store store listing graphics and screenshots:
```bash
npm run playstore:assets
```

---

## 6. Automated GitHub CI/CD Upload

The repository includes a ready-to-use GitHub Actions workflow:
[`.github/workflows/playstore.yml`](file:///C:/Users/Unified/.gemini/antigravity/scratch/problematic/.github/workflows/playstore.yml)

To enable automatic Google Play uploads from GitHub:
1. In Google Play Console, go to **API access** -> create or link a Google Cloud Service Account with "Release manager" permissions.
2. Download the JSON key file (`service-account.json`).
3. In your GitHub repository, go to **Settings** -> **Secrets and variables** -> **Actions**.
4. Add secret: `PLAY_SERVICE_ACCOUNT_JSON` containing the JSON file contents.
5. Whenever you push a tag `v1.0.0` or trigger the workflow manually, GitHub Actions will automatically build the signed `.aab` and upload it directly to your chosen Play Store track!

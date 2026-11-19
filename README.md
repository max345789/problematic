# Problematic

A calm micro-blogging and social thought-sharing app built with **React + Vite + Capacitor**.
It runs as a **real Android app** (and iOS/web) with **real, persistent, on-device data** — no
mocked screens, no fake counters.

---

## ✅ What actually works (real, not simulated)

- **Real accounts & auth** — create an account, log in, log out. Passwords are stored as a salted
  local hash, sessions persist across app restarts. Wrong credentials show a real error.
- **Real posts** — write text posts with hashtags, publish them, and they stay after you close the app.
- **Real photo posts** — pick a photo from the device gallery/camera; it is resized + compressed to a
  data URL and stored with the post.
- **Real polls** — add 2–4 options, publish, vote once, and see live percentage results that persist.
- **Real likes** — toggle like, counts update, and state persists per user.
- **Real comments** — open a thread, post a comment, delete your own comments. Every comment persists.
- **Real notifications** — a welcome notification is created on sign-up; like/comment/share actions
  are recorded. Grouped into Today / Yesterday / Earlier with live relative times. Mark one/all read,
  or clear all.
- **Real profile editing** — change name, username, bio and avatar color; changes persist and propagate
  to your existing posts.
- **Real theming** — Forest / Ocean / Dusk / Plain, persisted.
- **Real delete** — delete your own posts (and their comments) from the post menu.
- **Real sharing** — uses the native share sheet when available, clipboard fallback otherwise.
- **Live status bar clock** — renders the actual device time.

All data is stored through **`@capacitor/preferences`**:
- Android → SharedPreferences
- iOS → UserDefaults
- Web → `localStorage`

### Demo account

```
username: rohitha
password: password
```
The app is seeded with community users (Meera, Arjun, Nila, Sanjay) and realistic posts, polls and
comments on first launch. Use **Create account** to make your own real account too.

---

## 🧱 Project structure

```
src/
  App.jsx                     App shell: nav dock, theme sheet, toasts, status bar
  context/AppContext.jsx      Real state + actions (auth, posts, comments, notifications)
  services/
    storage.js                Persistent data layer (CRUD + seeding) via Capacitor Preferences
    utils.js                  Relative time, grouping, image compression
    native.js                 Splash / status bar / keyboard native boot
    useClock.js               Live clock hook
  components/
    Icons.jsx                 SVG icon set
    PostCard.jsx              Post + real like/comment/share/poll/delete
    CommentsSheet.jsx         Real comment thread
    ComposerSheet.jsx         Text / poll / photo composer
    ImagePicker.jsx           Real device image picker
    EditProfileSheet.jsx      Real profile editor
  screens/
    LoginScreen.jsx           Real login + sign-up
    FeedScreen.jsx            Feed + FAB speed dial
    NotificationsScreen.jsx   Grouped real notifications
    ProfileScreen.jsx         Profile, stats, own posts, logout
```

---

## 🚀 Run in the browser

```bash
npm install
npm run dev
```
Open http://localhost:5173/.

## 📦 Production build

```bash
npm run build
```

---

## 🤖 Build the Android app

The Android project is already added under `android/` and configured
(`com.problematic.app`). Requires **JDK 17** and the **Android SDK**.

```bash
# 1. Build web assets + sync into the Android project
npm run android:build

# 2. Open in Android Studio (installs the SDK-based toolchain if present)
npm run android
# or: npx cap open android
```

In Android Studio: **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)**, or press **Run**.

Or build from the command line (once a JDK + Android SDK are installed):

```bash
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

> This machine does not currently have a JDK or the Android SDK installed, so the APK cannot be
> compiled here. Install Android Studio (which bundles both) and run the commands above — the
> project is already wired and synced.

### Native configuration

- `capacitor.config.json` — app id `com.problematic.app`, splash + status bar + keyboard plugins.
- `android/app/src/main/res/values/colors.xml` — brand palette.
- `android/app/src/main/res/values/styles.xml` — forest splash theme → app theme.
- Plugins installed: `@capacitor/preferences`, `@capacitor/splash-screen`, `@capacitor/status-bar`,
  `@capacitor/keyboard`.

---

## 🍎 iOS (optional)

```bash
npx cap add ios
npm run sync
npx cap open ios
```
Then run from Xcode with your signing team.

---

## 🛠 Tech stack

- React 18 + Vite 5
- Capacitor 6 (core, android, preferences, splash-screen, status-bar, keyboard)
- Hand-rolled CSS design system (Figtree, glassmorphism, spring dock)

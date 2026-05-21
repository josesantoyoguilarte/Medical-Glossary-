# Medical Glossary

A bilingual (English / French / Cree) medical glossary mobile and web app for
Aboriginal interpreters. Users can browse categories, search terms, view body
diagrams, hear pronunciation audio, and walk through conversational phrases
(e.g. the McGill Pain Questionnaire).

## Repository layout

| Folder | Status | Description |
|---|---|---|
| `MedicalGlossary/` | **Legacy** (Ionic 1 / AngularJS / Cordova, 2015) | Original app. Runs in the browser but the toolchain is end-of-life. |
| `MedicalGlossaryV2/` | **Active** (Ionic 8 / Angular 20 / Capacitor 8) | Modern rewrite that targets web (PWA), iOS, and Android from a single codebase. |
| `Medical Glossary for Aboriginal Interpreters Final report.pdf` | Reference | Project background, glossary content credits. |

## Modernization roadmap

The goal is to retire `MedicalGlossary/` and ship a single modern app
(`MedicalGlossaryV2/`) that builds for **browser (PWA)**, **iOS**, and
**Android**. Phased plan (tracked in commit history):

1. Repo hygiene (`.gitignore`, drop the `.7z`, stop tracking generated folders). ?
2. Scaffold `MedicalGlossaryV2` with Ionic 8 + Angular 20 + Capacitor 8. ?
3. Typed data layer (`GlossaryService` over the existing JSON in `src/assets/data/`) with Fuse.js full-text search. ?
4. Port screens tab-by-tab (Glossary, Diagrams, More/Settings, Conversation). ?
5. Features: search, favorites, history, dark mode, font scaling, PWA offline cache. ?
6. CI on GitHub Actions: web build artifact + Android debug APK artifact. ?
7. i18n for UI strings (UI language ? glossary language) — *optional, pending*.
8. Delete `MedicalGlossary/` once V2 has been validated by users.

## Running the legacy app (`MedicalGlossary/`) in a browser

No Node.js required — just Python:

```powershell
cd MedicalGlossary\www
py -3 -m http.server 8100
```

Then open <http://localhost:8100/index.html>. A 404 for `cordova.js` in the
console is expected when running outside a device.

> Note: the JSON data under `MedicalGlossary/www/data/` is required. If your
> clone is missing it, copy it from `MedicalGlossary/platforms/android/assets/www/data/`.

## Running the modern app (`MedicalGlossaryV2/`)

Prerequisites:

- **Node.js 22 LTS** (? 22.12) — required by Angular 20.
- **Android Studio** + JDK 21 — only needed to build the Android app.
- **Xcode + CocoaPods** on macOS — only needed to build the iOS app.

```powershell
cd MedicalGlossaryV2
npm install

# 1. Browser (live reload; production build is also an installable PWA that works offline)
npm start                  # http://localhost:8100
npm run build              # produces ./www/ (deployable static site + ngsw service worker)

# 2. Android (device or emulator, requires Android Studio one time)
npm run build
npx cap sync android
npx cap open android       # build & run from Android Studio
# or, headless:
cd android && ./gradlew assembleDebug

# 3. iOS (macOS only)
npm run build
npx cap add ios            # one-time, only on macOS
npx cap sync ios
npx cap open ios           # build & run from Xcode
```

### Continuous integration

The workflow at `.github/workflows/ci.yml` runs on every push / PR to
`master`:

1. Installs Node 22 + caches `npm`.
2. Builds the PWA (`npm run build`) and uploads `www/` as an artifact named
   **`web-pwa`**.
3. Sets up JDK 21 + Gradle, syncs Capacitor, and builds a **debug APK**
   (`assembleDebug`), uploaded as **`app-debug-apk`**.

Open **GitHub ? Actions ? latest run ? Artifacts** to download either zip and
test a build without any local toolchain.

---

## Using the web build (PWA)

`npm run build` produces a self-contained `MedicalGlossaryV2/www/` folder —
just static files (HTML, JS, CSS, JSON data, audio, images, manifest,
service worker). The CI job above publishes the same folder as the
`web-pwa` artifact.

### Run it locally

A service worker only activates over HTTP, so open it through a server, not
from `file://`:

```powershell
cd MedicalGlossaryV2\www       # or wherever you unzipped web-pwa.zip
py -3 -m http.server 8080
# http://localhost:8080
```

After the first load, disconnect from the network and reload — the app
should still work. That confirms the service worker has cached everything.

### Install it as a standalone app

When the site is served over HTTPS (or `http://localhost`), Chrome / Edge
show an **install icon** in the address bar, and iOS Safari offers
**Share ? Add to Home Screen**. The installed app launches in its own
window with no browser chrome and works offline. No app store required.

### Deploy it

The `www/` folder works on any static host:

| Host | How |
|---|---|
| **GitHub Pages** | `npm i -D angular-cli-ghpages` then `npm run build -- --base-href "/Medical-Glossary-/"` and `npx angular-cli-ghpages --dir=www`. Repo URL becomes `https://<user>.github.io/Medical-Glossary-/`. |
| **Netlify / Vercel / Cloudflare Pages** | Build command `cd MedicalGlossaryV2 && npm ci && npm run build`, publish dir `MedicalGlossaryV2/www`. SPA fallback is automatic. |
| **nginx / IIS / S3** | Upload `www/` contents. Configure (a) an `index.html` fallback for unknown paths, and (b) `Cache-Control: no-cache` on `ngsw-worker.js` so updates roll out. |

Updating an already-installed PWA is push-based: deploy a new `www/`, and
the next online visit downloads the new version in the background.

---

## Using the Android APK

The CI workflow uploads `app-debug-apk` on every successful build. To
install it on a phone:

1. **GitHub ? Actions ? latest green run ? Artifacts ? `app-debug-apk`**
   ? download ? unzip ? you should have `app-debug.apk`.
2. On the Android device, enable **Settings ? Security ? Install unknown
   apps** for whichever app you'll transfer the file with (Chrome, Files,
   Drive, …). This is required because the APK is unsigned for the Play
   Store.
3. Copy the APK to the device (USB, email, Google Drive, ADB) and tap it
   to install.
4. The first launch primes the offline cache from local assets — no
   network required after that.

### Install via ADB (developer machine)

```powershell
# device connected with USB debugging enabled
adb install -r app-debug.apk
```

### Build it yourself

```powershell
cd MedicalGlossaryV2
npm run build
npx cap sync android
# Option A — full IDE
npx cap open android        # press ? in Android Studio
# Option B — headless
cd android
./gradlew assembleDebug     # outputs app/build/outputs/apk/debug/app-debug.apk
```

> The committed `gradlew` has its executable bit set, so the Linux/macOS
> command above works without `chmod`.

For a Play Store release, build a signed AAB instead:
`./gradlew bundleRelease` (requires a `keystore.properties` with your
signing keys — not committed).

---

## Building for iOS

iOS builds **require macOS + Xcode 15+** (Apple's toolchain doesn't run on
Windows or Linux). The Capacitor project is otherwise ready to go.

```sh
# one-time, on macOS
cd MedicalGlossaryV2
npm install
sudo gem install cocoapods           # if not already installed
npx cap add ios                      # creates ./ios/ — commit it

# each build
npm run build
npx cap sync ios
npx cap open ios                     # opens MedicalGlossary.xcworkspace in Xcode
```

In Xcode:

1. Select the **App** target ? **Signing & Capabilities** ? pick your Apple
   Developer team. A free Apple ID works for sideloading to a personal
   device.
2. Pick a connected iPhone (or a simulator) from the device dropdown.
3. Press ? (**Cmd + R**) to build and run.
4. For TestFlight / App Store: **Product ? Archive**, then distribute via
   Xcode Organizer.

If you don't have a Mac, the cheapest options are:

- A short-term rental on a Mac-in-the-cloud service (MacStadium, MacinCloud,
  Scaleway, GitHub-hosted macOS runners).
- A friend / colleague with a Mac who can run the four commands above and
  hand back the `.ipa`.

Either path: once iOS is added once and committed, every push can produce a
new build, the same way the Android job does today. See the optional
"iOS archive" CI job under *Modernization roadmap* item 7.

## License & credits

Glossary content and original app credits are documented in
`Medical Glossary for Aboriginal Interpreters Final report.pdf`. A code
license file will be added with the V2 scaffold.

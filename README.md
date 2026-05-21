# Medical Glossary

A bilingual (English / French / Cree) medical glossary mobile and web app for
Aboriginal interpreters. Users can browse categories, search terms, view body
diagrams, hear pronunciation audio, and walk through conversational phrases
(e.g. the McGill Pain Questionnaire).

## Repository layout

| Folder | Status | Description |
|---|---|---|
| `MedicalGlossary/` | **Legacy** (Ionic 1 / AngularJS / Cordova, 2015) | Original app. Runs in the browser but the toolchain is end-of-life. |
| `MedicalGlossaryV2/` | **Active** (Ionic 7 / Angular / Capacitor) — *to be scaffolded* | Modern rewrite that targets web, iOS and Android from a single codebase. |
| `Medical Glossary for Aboriginal Interpreters Final report.pdf` | Reference | Project background, glossary content credits. |

## Modernization roadmap

The goal is to retire `MedicalGlossary/` and ship a single modern app
(`MedicalGlossaryV2/`) that builds for **browser (PWA)**, **iOS**, and
**Android**. See the phased plan tracked in issues / commit history. High
level steps:

1. Repo hygiene (`.gitignore`, drop the `.7z`, stop tracking generated folders). ?
2. Scaffold `MedicalGlossaryV2` with Ionic 7 + Angular + Capacitor.
3. Port data layer (typed services over the existing JSON in `MedicalGlossary/www/data/`).
4. Port screens tab-by-tab (glossary, diagrams, conversation, more/settings).
5. Add features: full-text search, favorites, history, i18n, dark mode, PWA.
6. CI on GitHub Actions: web build, Android `.aab`, iOS archive.
7. Delete `MedicalGlossary/` once V2 reaches parity.

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
- **Android Studio** + JDK 17 — only needed to build the Android app.
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
2. Builds the PWA (`npm run build`) and uploads `www/` as an artifact.
3. Sets up JDK 17 + Gradle, syncs Capacitor, and builds a **debug APK**
   (`assembleDebug`), uploaded as `app-debug-apk`.

Download either artifact from the Actions tab to test a build without a
local toolchain.

## License & credits

Glossary content and original app credits are documented in
`Medical Glossary for Aboriginal Interpreters Final report.pdf`. A code
license file will be added with the V2 scaffold.

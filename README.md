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

*(To be added once Phase 2 lands.)* Expected commands:

```powershell
# Prerequisites: Node.js 20 LTS, Android Studio (for Android), Xcode + CocoaPods (for iOS on macOS)
cd MedicalGlossaryV2
npm install

# Web (browser, with live reload)
npm run start

# Android (device or emulator)
npx cap sync android
npx cap run android

# iOS (macOS only)
npx cap sync ios
npx cap run ios
```

## License & credits

Glossary content and original app credits are documented in
`Medical Glossary for Aboriginal Interpreters Final report.pdf`. A code
license file will be added with the V2 scaffold.

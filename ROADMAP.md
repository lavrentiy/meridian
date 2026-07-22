# Meridian roadmap

Meridian is currently a local-first browser workstation for research and
education. The roadmap below keeps the existing browser experience as the
reference implementation and treats Android as a final delivery milestone.

## Before Android

### 1. Establish a reproducible release baseline

- Document supported desktop browsers, minimum versions, and WebGL2
  expectations.
- Extend the existing real-entrypoint Advanced Volume browser regression into a
  clean-checkout import and full-workstation smoke test.
- Add representative, de-identified test studies and a golden-path checklist:
  import, choose a series, inspect MPR/3D, measure, save annotations, restore,
  switch series, and recover from invalid input.
- Record known DICOM limitations and expected behavior for unsupported files.

### 2. Prove mobile-browser behavior

- Test the current app in Android Chrome on low-, mid-, and high-end devices.
- Validate touch-only workflows for import, navigation, window/level, pinch
  zoom, measurements, cine, layout changes, and 3D orbit/zoom.
- Replace or supplement wheel/keyboard-only affordances where the mobile tests
  show a missing touch path.
- Verify orientation changes, small screens, browser back, tab suspension,
  WebGL context loss, and returning to a previously loaded study.

### 3. Bound memory and performance

- Measure peak memory and load time for realistic CT, MR, multiframe, color,
  and compressed studies.
- Extend the renderer's device-scaled 64/128 MB GPU proxy budget with an
  explicit whole-study memory budget and a preflight estimate before decoding.
- Add safe handling for oversized studies: series-first loading, cancellation,
  progressive/deferred decoding, and a user-visible recovery path.
- Reduce duplicate decoded/normalized/GPU volume copies where measurements show
  pressure, and validate WebGL texture limits on target devices.

### 4. Make storage and file contracts portable

- Define the study import contract for individual files, folders, and Android
  content URIs; preserve user privacy and avoid copying PHI unnecessarily.
- Version annotation records and add corruption/reset behavior for IndexedDB.
- Decide whether Android needs durable study/session recovery beyond the current
  annotation persistence.
- Add export/import behavior for annotations if users need to move studies or
  sessions between devices.

### 5. Harden the browser release

- Extend the existing real-entrypoint Advanced Volume and WebGL recovery
  coverage to file selection, persistence, unsupported-WebGL fallback, and the
  primary failure/retry paths.
- Add accessibility and localization checks for compact/touch layouts.
- Pin the release asset set, document third-party licenses, and produce a
  versioned offline bundle with a known-issues list.
- Re-run the golden-path matrix on a clean checkout before starting Android
  packaging.

## Final milestone: Android port

Only begin this milestone after the preceding gates pass on the target device
matrix.

- Choose the delivery surface: Android Chrome/PWA, a WebView shell, or a
  native rendering/data layer. Start with a WebView feasibility prototype
  unless profiling proves that native decoding/storage is required.
- Create the Android project, pinned toolchain, signing configuration, and
  reproducible debug/release builds.
- Implement the host bridge for JavaScript enablement, offline asset loading,
  multi-file/folder selection, Android content-URI permissions, save/export,
  back navigation, fullscreen, and lifecycle pause/resume.
- Package and validate all vendored JavaScript/WASM assets offline; do not add
  network or analytics dependencies without an explicit privacy decision.
- Re-run the complete import, viewer, annotation, recovery, performance, and
  privacy matrix on supported Android versions and device classes.
- Add crash/diagnostic reporting appropriate for a research tool, publish the
  Android known-issues and support policy, and release only after a cold-user
  acceptance pass on physical devices.

### Android exit criteria

- A clean checkout produces a signed installable build.
- A user can import a representative study without desktop-only gestures or
  undocumented setup.
- MPR, measurements, annotations, and supported 3D workflows survive rotation,
  background/foreground, and recoverable WebGL/file errors.
- Peak memory, load time, and unsupported-input behavior meet documented limits.
- No patient data leaves the device without an explicit, reviewed product and
  privacy decision.

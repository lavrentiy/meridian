# Changelog

All notable changes to Meridian are recorded here.

This project follows the structure of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The repository has not published version tags yet, so the historical sections
below are grouped by commit date. Dates and contents were reconstructed from the
Git history; transient changes that were added and removed on the same day are
not presented as released capabilities.

## Changelog policy

Updating this file is mandatory for every change. Add a concise entry under
**Unreleased** in the same pull request or commit as the code, documentation,
dependency, workflow, or maintenance change. Historical sections are immutable
apart from factual corrections. Move Unreleased entries into a dated, versioned
section only when cutting a release.

## [Unreleased]

### Added

- Introduced the **Advanced Volume** workspace with maximized viewing, patient-
  axis camera presets, keyboard navigation, shift-drag panning, six-sided crop
  controls, filled MPR planes, and oblique-aware clipping.
- Added half-float MIP, depth MIP, composite, and surface rendering with a live
  density histogram, editable opacity, and HU-aware soft-tissue, bone, lung,
  vascular, and tissue-plus-bone transfer functions.
- Added visible interactive/refined rendering states and bounded rendering
  proxies based on the device's 3D-texture limit and memory budget.
- Added a dependency-free browser regression that renders a synthetic calibrated
  CT volume, exercises advanced controls and oblique geometry, reinitializes the
  renderer, checks WebGL errors, and forces context loss/restoration.
- Added Advanced Volume architecture and validation documentation.
- Added this retrospective changelog, mandatory contributor guidance, a pull-
  request checklist, and an automated pull-request changelog check.

### Changed

- Replaced the 8-bit GPU volume with an `R16F` half-float representation, using
  nearest filtering only when linear half-float filtering is unavailable.
- Made composite opacity independent of ray sample count, calculated gradients
  from raw scalar values, corrected depth-MIP normalization, and added adaptive
  interaction quality followed by automatic refinement.
- Disabled permanent drawing-buffer preservation and now renders immediately
  before snapshot capture.

### Fixed

- Prevented pointer, wheel, and keyboard handlers from accumulating when a
  series rebuilds the 3D renderer.
- Reworked WebGL context recovery so the restoration listener survives context
  loss and rebuilds the active volume successfully.
- Made 3D slice outlines, filled planes, and crosshair clipping follow the true
  oblique MPR basis instead of remaining axis-aligned.
- Added explicit WebGL2 fallback and recovery status instead of leaving a silent
  or dead 3D canvas.

### Maintenance

- Reconciled the README, contributor guide, renderer contract, and roadmap with
  the implemented Advanced Volume behavior, automated coverage, test-runtime
  requirements, and remaining release work.

## [2026-07-19]

### Added

- Added initial WebGL context-loss and restoration hooks around the 3D renderer.

### Changed

- Animated the command palette, settings, help, and information overlays with
  consistent visibility, focus, backdrop, and reduced-motion behavior.
- Hardened HTML escaping for dynamically rendered application content.

## [2026-07-14]

### Added

- Persisted distance measurements and elliptical ROIs in browser-local IndexedDB,
  keyed by DICOM study and series identifiers, with restore and clear actions.
- Added touch-oriented labels and compact 3D controls for coarse-pointer and
  constrained viewport layouts.

### Changed

- Restyled the application as neutral clinical workstation chrome with a teal
  interaction accent while retaining semantic plane colors.
- Improved navigation and tool-rail accessibility, focus treatment, control
  labels, and small-cell degradation behavior.
- Made auto-packed grids stretch incomplete trailing rows to use the available
  viewport more effectively.
- Split the tool rail into scrollable primary tools and fixed workspace controls.

## [2026-07-13]

### Added

- Expanded Meridian from a viewer into a routed local-first workstation with
  Overview, Viewer, and Series workspaces, deep links, a searchable series
  inventory, and a command palette.
- Added resizable and fixed-grid hanging protocols, physical-scale matching,
  linked zoom, distraction-free viewing, and aspect-aware acquired-series layout.
- Added primary acquired-series hanging so one series occupies the long edge
  while companion acquisitions remain visible.
- Added 6–24 fps cine playback for acquired stacks and MPR planes.
- Added quantitative slice-attached elliptical ROIs reporting physical area,
  mean, and standard deviation from source voxels.
- Exposed multiple stored DICOM VOI windows and CT-specific brain, stroke,
  subdural, abdomen, lung, and bone presets.

### Changed

- Reframed the product and application shell around private, local study review
  while preserving the portable offline HTML entrypoint.
- Improved series filtering, selection, patient context, responsive navigation,
  and cross-workspace state restoration.

## [2026-07-12]

### Added

- Created Meridian as a single-entry, fully offline DICOM study viewer for
  research and education, with all parsers, codecs, Three.js, and WASM assets
  vendored locally.
- Added linked axial, coronal, and sagittal MPR views plus WebGL2 MIP, depth-MIP,
  and gradient-shaded composite volume rendering.
- Added patient-space cross-series linking, geometric localizer lines, acquired
  versus reformatted provenance badges, patient orientation markers, obliquity
  reporting, multi-angle slab handling, and true physical spacing readouts.
- Added semi-automatic spinal-canal tracing and linked straightened-spine CPR
  views with explicitly estimated vertebral-level assistance.
- Added uncompressed, RLE Lossless, JPEG Lossless, JPEG-LS, JPEG 2000, and 8-bit
  JPEG Baseline decoding; monochrome, RGB, YBR, and multiframe support.
- Added window/level, presets, probe readout, distance measurement, colormaps,
  inversion, mirroring, snapshots, study information, and PNG export.
- Added touch pinch zoom, trackpad-safe slice navigation, keyboard window/level
  controls, an orientation-aware 3D gizmo, and the first responsive tool rail.
- Added the MIT license, third-party notices, offline quick start, sample-data
  guidance, privacy warnings, and research-only disclaimer.

### Fixed

- Prevented a completed pinch gesture from placing a stray crosshair.
- Preserved series-selection state styling during hover interactions.

[Unreleased]: https://github.com/lavrentiy/meridian/compare/1e02bcd...HEAD
[2026-07-19]: https://github.com/lavrentiy/meridian/compare/b47457f...1e02bcd
[2026-07-14]: https://github.com/lavrentiy/meridian/compare/2fce605...b47457f
[2026-07-13]: https://github.com/lavrentiy/meridian/compare/79cb24e...2fce605
[2026-07-12]: https://github.com/lavrentiy/meridian/commits/79cb24e

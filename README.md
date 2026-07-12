# Meridian

**A single-file, fully offline DICOM MPR & 3D volume viewer.**

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Single file](https://img.shields.io/badge/build-single%20HTML%20file-black)
![Offline](https://img.shields.io/badge/network-none%20(runs%20in%20tab)-brightgreen)
![WebGL2](https://img.shields.io/badge/3D-WebGL2%20raycast-magenta)

> [!WARNING]
> **For research and education only — not a medical device.** This viewer is
> not cleared or certified for clinical or diagnostic use. Do not use it to
> make medical decisions. See [Disclaimer](#disclaimer).

The name comes from the three orthogonal planes it crosses through the volume —
axial, coronal, and sagittal meridians meeting at the linked crosshair (that's
the logomark, too).

Open [index.html](index.html) in a browser, drop a study folder on it, and get
linked axial / coronal / sagittal MPR views plus a WebGL2 raycast 3D volume
(MIP, depth-colored MIP, or gradient-shaded composite). No server, no upload —
everything runs in the tab.

The UI is a quiet near-black workspace with a sans interface and monospace
reserved for numeric readouts. Color is used semantically, not decoratively:
axial red · coronal green · sagittal yellow · 3D magenta, with a muted
steel-blue accent for controls. Every viewport carries its plane color on its
border, tag, slider and crosshair/localizer lines.

Each 2D view is tagged **ACQUIRED** (native pixel arrays as scanned) or
**REFORMAT** (synthesized from the slice stack); the 3D view is tagged
**RENDERED**. Non-square acquisitions are flagged: any stack tilted ≥1° off
the patient axes gets an orange **∠x.x°** badge and its tag chip (the small
outline square) rotates by the actual angle. A series that mixes several
angled slabs (e.g. disc-angled axials) is kept as **one** series, not split;
its tag shows the angle range (**∠4°–29°**), and a thin **angle-profile bar**
under the tag shows each slab as a segment coloured by its tilt (green →
yellow → orange → red), sized by its slice count, with a marker for the
current slice. As you scroll the acquired view, a live badge and the info
line show the exact angle of the slice you are on. The info line of every
view shows its effective pixel size, so the lower through-plane resolution of
reformats is always visible. Patient orientation letters (L/R · A/P · S/I)
mark all four edges of every 2D view, colored like the plane each axis
pierces — the same coloring as the orbiting patient-axis gizmo in the 3D
view's corner. Hovering any slice shows the voxel position and rescaled
value in the status bar.

Two layouts (header dropdown): **MPR + 3D** (linked crosshair views of one
series) and **Acquired series** (every series of the study side by side in
its native plane, full resolution, no reformats — grouped sagittal → coronal
→ axial, each with its own slider and window). Both layouts pack their cells
by aspect ratio to maximize displayed image area. In MPR mode the acquired
view is always the hero — it is the real, full-resolution data and is never
squeezed by the reformats (which for a thin slab degenerate into near-useless
wide strips). It fills the full window height on the left, or the full width
across the top, whichever makes it largest, and the two reformats + 3D tile
into the remaining region (the 3D view has no intrinsic aspect and absorbs
leftover space). The hero carries a bright plane-colored frame, and the window
is always essentially fully used. The acquired-series layout is a reading
hierarchy: a **primary** (hero) rendered at full window height on the left, a
large **secondary** beside it, and the rest shrunk to thumbnails — the spine
mindset of sagittal to survey, axial to read, everything else for reference.
The primary defaults to the survey plane (first in reading order, sagittal →
coronal → axial, never a single-slice localizer) and is marked with a bright
plane-colored frame and a **PRIMARY** chip; the secondary is the largest
remaining stack (usually the axial). Click the **◱** button on any acquired
view to promote it to primary (the choice persists as you scroll and switch
layouts). A grid selector next to the
layout dropdown switches between **Auto (packed)** — cells sized by aspect
ratio to maximize image area for the current window — and fixed PACS-style
grids (1×1 up to 4×4), where every slot is the same size and each series is
letterboxed within its slot to preserve its own aspect ratio, hanging-protocol
style. Series that share
one stack geometry (e.g. sagittal T1 + T2) are joined into a single viewport
with contrast tabs, and every cell has a ⇋ button for a display-only
left–right mirror (orientation letters update accordingly). The acquired layout is fully
linked through patient space (ImagePositionPatient/Orientation): click any
point in any series and every other series jumps to the slice containing
that point, with an on-slice dot and **true localizer lines** — each line is
the geometric intersection of another stack's current plane with the slice
on screen, so angled acquisitions (e.g. disc-parallel axials) show up as
visibly tilted lines, exactly like scanner scout views. Scrolling one
stack slides the shared point so the lines track in the others, and the
point carries over when switching between layouts. Views are
color-linked everywhere: tags, borders, localizer lines and the slice-plane
outlines in the 3D volume all use the same plane colors
(axial red · coronal green · sagittal yellow).

## Quick start

No build, no install, no server required:

1. Clone or download this repo (keep `lib/` next to `index.html`).
2. Open `index.html` in a modern browser (Chrome/Edge/Firefox —
   WebGL2 required for the 3D view).
3. Drop a DICOM study folder onto the window, or use **Choose files / folder**.

Everything runs in the tab — no upload, no network, no data leaves the machine.

Some browsers restrict `webkitdirectory` folder picking over `file://`. If the
folder picker misbehaves, serve the file locally instead:

```bash
python3 -m http.server 8137 --bind 127.0.0.1
# then open http://127.0.0.1:8137/
```

You need your own DICOM data — none is bundled (see [Test data](#test-data)).

## Dependencies

Vendored in `lib/` so the app works with no network (WASM binaries are
base64-embedded in `.wasm.js` wrappers so `file://` works too):

- `lib/dicomParser.min.js` — [dicom-parser](https://github.com/cornerstonejs/dicomParser) (Cornerstone)
- `lib/three.min.js` — three.js r128
- `lib/jpeg-lossless.js` — [rii-mango lossless](https://github.com/rii-mango/JPEGLosslessDecoderJS) (JPEG Lossless P14 / SV1), wrapped in an IIFE — its minified module-level vars would otherwise leak as globals
- `lib/openjpeg-decode.js` + `lib/openjpeg-decode.wasm.js` — [@cornerstonejs/codec-openjpeg](https://github.com/cornerstonejs/codec-openjpeg) (JPEG 2000)
- `lib/charls-decode.js` + `lib/charls-decode.wasm.js` — [@cornerstonejs/codec-charls](https://github.com/cornerstonejs/codec-charls) (JPEG-LS)

Keep these files next to the HTML. (An earlier version loaded dicom-parser
from a cdnjs URL that does not exist — that was why nothing opened.)

## Usage

- Drop a study folder (or pick files/folder). All series are detected and
  grouped by SeriesInstanceUID + dimensions. A series that holds several
  angled slabs (e.g. disc-angled axials sharing one UID) stays **one** series:
  its slices are ordered along the average normal so the slabs concatenate
  anatomically, and the angle variation is surfaced in the UI (dropdown shows
  "∠4°–29° (4 angles)", plus the per-view angle bar and live per-slice angle).
  Switch series with the dropdown in the header; the largest series loads
  first.
- Supported transfer syntaxes: uncompressed (implicit/explicit VR little
  endian, explicit VR big endian), **RLE Lossless**, **JPEG Lossless**
  (Process 14 & SV1), **JPEG-LS** (lossless & near-lossless), **JPEG 2000**
  (lossless & lossy), and 8-bit **JPEG baseline** (via the browser's decoder).
  Unsupported syntaxes (e.g. 12-bit lossy JPEG) are reported clearly.
- Pixel formats: 8/16-bit monochrome (MONOCHROME1/2, signed/unsigned) and
  color (**RGB**, **YBR_FULL**, **YBR_FULL_422**, planar or interleaved).
  Color series display as-is; W/L, colormap and the 3D view use their
  luminance.
- **Multiframe** files (classic and enhanced MR/CT with per-frame functional
  groups) are expanded into slices with correct per-frame geometry.
- An **Info** button in the header opens a panel with patient / study /
  series / image details and slicing info — slice thickness, the spacing
  claimed by the file vs. the measured inter-slice step (gap/overlap noted),
  obliquity, and a live line tracking the current slice's index, position
  (mm) and angle. It ends with a one-line summary of every series in the
  study. `Esc` closes it.

### Controls

| Action | How |
|---|---|
| Move linked crosshair | click / drag on any slice (MPR layout) |
| Scroll slices | mouse wheel (trackpad-safe), slider, `↑`/`↓` (`PgUp`/`PgDn` = ±5) on hovered view — slider is horizontal when it traverses L/R, vertical otherwise |
| Window / level | shift-drag on any slice, or presets in the header; footer shows the active window with a colorbar |
| Probe | hover any slice — voxel position and rescaled value appear in the status bar |
| Colormap | Gray / Inferno selector in the header — applies to 2D views and 3D |
| Measure distance (mm) | `M` or Measure button, then drag; double-click a view to clear |
| Invert grayscale | `I` or Invert button |
| Save all four views as PNG | Snapshot button (mirrored views export mirrored) |
| Leave the Open… screen | `Esc`, ← Back, or click outside the box — returns to the loaded study |
| 3D view | drag to rotate, wheel to zoom — a corner gizmo shows the patient axes (L/R · A/P · S/I) |
| 3D render mode | MIP · Depth MIP (hue = depth, warm near / cool far) · Composite (gradient-shaded) |
| 3D slice outlines | Slices button — colored rectangles showing the current crosshair planes |
| 3D clip | cut away at the crosshair plane (SAG/COR/AX), camera side — follows the 2D crosshair |
| 3D density slider | opacity in Composite, contrast (gamma) in MIP modes |

## Test data

**No sample data ships with this repo.** The viewer was developed against
private patient scans, which are deliberately excluded from version control
(see `.gitignore`) and must never be published. Bring your own DICOM study, or
grab a public, de-identified dataset:

- [The Cancer Imaging Archive (TCIA)](https://www.cancerimagingarchive.net/) — large de-identified CT/MR/PET collections
- [dclunie's medical image samples](https://www.dclunie.com/images.html) — a broad set of transfer syntaxes and edge cases
- [Rubo Medical DICOM samples](https://www.rubomedical.com/dicom_files/) — small, easy first files
- [OsiriX DICOM image library](https://www.osirix-viewer.com/resources/dicom-image-library/) — anatomical sample studies

The viewer supports the transfer syntaxes and pixel formats listed under
[Usage](#usage); most of the above exercise them well.

## Disclaimer

This software is provided for **research and educational purposes only**. It is
**not a medical device**, has not been cleared or certified by any regulatory
body, and must **not** be used for clinical diagnosis, treatment decisions, or
any other medical purpose. It may contain errors and makes no guarantee of
accuracy. You are responsible for complying with all applicable laws and
regulations, including patient-privacy rules (e.g. HIPAA / GDPR), when handling
DICOM data. The software is provided "as is", without warranty of any kind —
see [LICENSE](LICENSE).

## Contributing

Issues and pull requests are welcome. When reporting a rendering or decode
problem, describe the modality, transfer syntax, and pixel format, and — if
possible — attach a **de-identified** minimal sample. Never attach data that
contains real patient identifiers.

## License

[MIT](LICENSE) © Laurent Van den Aweele. Vendored libraries under `lib/` keep
their own licenses — see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

# Third-party notices

Meridian bundles the following libraries under `lib/` so that the
app runs fully offline (including from `file://`). Each remains under its own
license; this project's MIT license (see `LICENSE`) does not supersede them.
The list below is provided in good faith — verify against each upstream before
redistribution.

| File(s) | Library | Upstream | License |
|---|---|---|---|
| `dicomParser.min.js` | dicom-parser (Cornerstone) | https://github.com/cornerstonejs/dicomParser | MIT |
| `three.min.js` | three.js (r128) | https://github.com/mrdoob/three.js | MIT |
| `jpeg-lossless.js` | JPEGLosslessDecoderJS (rii-mango) | https://github.com/rii-mango/JPEGLosslessDecoderJS | MIT |
| `openjpeg-decode.js`, `openjpeg-decode.wasm.js` | @cornerstonejs/codec-openjpeg (wraps OpenJPEG) | https://github.com/cornerstonejs/codec-openjpeg | MIT wrapper; OpenJPEG under BSD-2-Clause |
| `charls-decode.js`, `charls-decode.wasm.js` | @cornerstonejs/codec-charls (wraps CharLS) | https://github.com/cornerstonejs/codec-charls | MIT wrapper; CharLS under BSD-3-Clause |

Notes:

- The `jpeg-lossless.js` file is the upstream source wrapped in an IIFE so its
  minified module-level variables don't leak as globals.
- The WASM binaries are base64-embedded inside the `*.wasm.js` wrappers so the
  decoders load without a network fetch (required for `file://` use).

If you redistribute this project, keep this file and the vendored license
headers intact.

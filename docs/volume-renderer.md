# Advanced volume renderer

Meridian's Advanced Volume view is a patient-oriented WebGL2 raycaster. It is
a rendered research view, not source acquisition data and not a diagnostic
device. The `RENDERED` badge remains visible in both the tiled and maximized
workspaces.

## Pipeline contract

1. DICOM decoding and modality rescaling remain owned by the existing volume
   pipeline. MPR, probes, measurements, and ROI statistics always use `S.vol`.
2. The renderer uploads a normalized half-float `R16F` proxy. This preserves
   far more scalar fidelity than the previous 8-bit texture while retaining
   linear filtering where the device exposes it.
3. A 256-entry RGBA transfer texture maps calibrated scalar values to material
   color and extinction. CT presets use HU boundaries; other modalities use
   normalized ranges and are deliberately labelled as presentation presets.
4. Composite opacity is corrected for the ray step length. Switching between
   interactive and refined sample counts must not change the apparent density.
5. Gradients are calculated from raw scalar samples, independently of the
   display window and transfer cutoff.
6. Crosshair clipping and slice geometry use the active MPR basis. Oblique MPR
   planes therefore rotate in the volume instead of remaining axis-aligned.

## Quality and capacity

- Resting quality is derived from the uploaded volume diagonal and capped at
  900 samples. Pointer and transfer-function interaction temporarily use a
  smaller sample count, then refine after 140 ms of inactivity.
- The renderer queries `MAX_3D_TEXTURE_SIZE` and applies a conservative 64 MB
  texture budget on devices reporting at most 4 GB of memory, or 128 MB above
  that. Volumes exceeding either limit receive a uniformly
  downsampled rendering proxy. The status chip reports the proxy dimensions;
  source-data measurements are unaffected.
- Devices without linear half-float filtering use nearest filtering. Devices
  without WebGL2 keep the 2D MPR workflow and receive an explicit error state.

## Lifecycle ownership

`R3` owns the renderer, GPU textures, materials, resize observer, refinement
timer, and all canvas interaction listeners. Listener registration is tied to
an `AbortController`, so changing series cannot accumulate orbit handlers.

On `webglcontextlost`, the controller prevents the default terminal loss and
enters a visible recovery state without removing its restore listener. On
`webglcontextrestored`, it rebuilds the renderer and GPU resources from the
current source volume.

## Browser regression

Run:

```bash
npm run test:browser
```

The test requires Node.js 22 or newer, Python 3, and a `google-chrome`
executable. It uses the real `index.html`, vendored Three.js, and a headless
Chrome WebGL2 context. It verifies:

- a synthetic calibrated CT volume reaches the shader and produces a canvas;
- no WebGL error is left after texture upload and rendering;
- transfer, composite, filled-slice, crop, camera, maximize, and oblique paths;
- clean renderer reinitialization; and
- actual `WEBGL_lose_context` loss and restoration.

Passing this synthetic test does not replace review with representative,
de-identified CT, MR, compressed, anisotropic, and large-volume studies on the
desktop and Android device matrix described in the roadmap.

## Deliberate non-goals for this wave

- No WebGPU migration or Three.js major-version migration. Those change the
  offline dependency and shader contracts and require a separate comparison.
- No mesh export, segmentation, or automatic anatomy classification.
- No claim that surface or transfer presets identify pathology or tissue.
- No direct-manipulation crop handles inside the volume; the six bounded
  sliders are the current precise and touch-accessible crop contract.

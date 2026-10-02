# TOTIP — interactive animated artwork concept — 2026-09-23

Status: **CONCEPT / NOT YET IMPLEMENTED / NOT A HOME BASELINE**

Reference: artwork by Alessio Vitelli, currently available only as an Instagram screenshot. Before production, request the original clean high-resolution file and, if available, the layered source.

## Core interaction

- Identify seven distinct visual elements or systems in the artwork.
- Each user click activates one new element.
- Once activated, that element continues moving in a seamless loop; it does not perform a one-shot animation and stop.
- Every visual activation introduces one corresponding musical stem.
- Activations accumulate progressively.
- The final state is the complete artwork in continuous motion with all musical stems playing together.
- Motion must be smooth, coherent with the graphic composition, and free of visible cuts, abrupt starts, or generic pasted-on effects.
- Audio entries should be synchronized to the musical grid and faded in cleanly, so the visual action and stem entrance feel like one event.

## Source-material request

Ask the artist for, in order of preference:

1. the original layered source file (`.ai`, `.psd`, Procreate, Affinity, etc.);
2. an exported `.svg` with separate objects/layers;
3. otherwise, a clean high-resolution `.png` or lossless export without Instagram interface, compression, cropping, or perspective distortion.

A layered file is preferable but not mandatory. Because the artwork uses flat colors, hard edges, and geometric forms, selected elements can be manually masked and reconstructed from a high-resolution raster. Any background hidden behind a moving element must be redrawn or restored; it cannot be recovered automatically from the flattened image.

## Preliminary seven-part motion study

The exact selection must be approved before implementation. Promising systems visible in the artwork are:

1. upper left speaker grille — slow membrane pressure/pulse;
2. upper right speaker grille — complementary pulse in musical counterpoint;
3. central upper face / chevrons — small articulated vertical compression and release;
4. left night landscape — flowing zigzag path with restrained star shimmer;
5. right sun-and-water landscape — continuous reflection shimmer and slow solar drift;
6. central checkerboard band — seamless horizontal conveyor motion;
7. lower central body, suspended balls, and TOTIP blocks — gentle mechanical suspension responding to the final rhythmic layer.

These should be designed as coordinated loops, not seven unrelated effects.

## Technical direction

A zero-license-cost implementation is possible with separated transparent raster layers and/or SVG, HTML/CSS/Canvas, Web Audio API, and animation code. The prototype can be developed in the Website Lab and must remain reproducible in the final Webflow build, using custom code where needed. Audio assets follow the project architecture: masters in Google Drive, public audio delivery through Cloudflare R2.

## Selected animation areas — update 2026-10-02

The clean raster source is `BEBBY.jpg` (1448 × 2048 px JPEG). William marked five current animation areas on `BEBBY copia.jpg`:

1. upper central face with eyes and double V;
2. left night landscape panel;
3. right sun-and-water landscape panel;
4. central suspended blue form;
5. lower vertical striped band only.

This five-area selection supersedes the earlier preliminary seven-part proposal. Do not animate the speaker grilles, checkerboard band, or other unmarked symbols unless William later adds them explicitly. The lower selection is limited strictly to the vertical striped band: do not include the lateral curves or the rest of the lower architectural frame.

## Layer extraction checkpoint — 2026-10-02

A first non-animated decomposition package has been created from `BEBBY.jpg`:

- package: `BEBBY-home-animation-layers-v01.zip`;
- full canvas: 1448 × 2048 px;
- transparent layers: face, night landscape, sun/water landscape, descending ribbon only, and lower blue stripes only;
- verification sheet: `decomposition-check.png`;
- the connected horizontal blue form is explicitly excluded from the ribbon layer;
- curves and the rest of the lower frame are explicitly excluded from the stripe layer.

Status: **REJECTED EXTRACTION / DO NOT USE / NO HOME BASELINE MODIFIED**.

Next sequence: approve extraction → test one movement at a time → approve each loop → combine the five visual loops → connect one musical stem to each activation.


## Extraction correction — 2026-10-02

The raster polygon-cutout approach in `BEBBY-home-animation-layers-v01.zip` was rejected by William because its boundaries were arbitrary and did not follow the artwork. **Do not use v01 for animation or implementation.**

Correct method:

- vectorize the original one-colour artwork into SVG paths;
- use the marked circles only to identify conceptual animation groups, never as clipping boundaries;
- keep panel frames and static architecture fixed;
- separate only the real internal forms that will move (for example eyes/V, celestial elements/reflections, exact ribbon contour, exact stripe shapes);
- where the descending ribbon connects beneath the horizontal form, close its hidden edge behind the foreground form so no invented seam is visible.

New work must restart from this vector/path-based decomposition.


## First isolated motion study — 2026-10-02

First element selected by William: **left night landscape panel only**.

Requested behavior for the first test:

- replace the three unequal celestial marks with **three identical four-point stars**;
- the three stars move slowly on independent continuous closed paths;
- the river moves continuously at a visibly faster rate than the stars;
- the crescent moon, mountains, panel frame, and all surrounding architecture remain fixed;
- one click/tap starts the loop, which then continues without stopping;
- work on one conceptual element at a time; do not pre-extract the other marked areas.

Internal Sites candidate:

- [TOTIP — Night Landscape Motion Study](https://totip-night-landscape-motion.area-di-lavo-9208.chatgpt.site)
- project ID: `appgprj_6abfb769593c8191a743da9b2cd54980`
- status: **MOTION CANDIDATE / AWAITING WILLIAM REVIEW / NOT A HOME BASELINE**

Implementation note: this test does not reuse the rejected polygon cutouts. The river motion is confined to its original bed using a second impression of the clean source image; the artwork outside that internal region remains static. The three stars are one reusable identical SVG symbol with three separate slow trajectories.

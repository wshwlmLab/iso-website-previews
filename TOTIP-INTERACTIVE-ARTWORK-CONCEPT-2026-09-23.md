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

# Home 1 and Home 2 — common controls, 7 October 2026

Requested update: use Home 3's activation button and the current two-column stereo meter in both installations. The regular meter anchor remains x=50%, y=3.26vh. Home 3's footer meter is an installation-specific exception.

- Activation button: y=5.88vh; Cousine; same desktop/mobile dimensions, text, weight and border as Home 3; .65s fade out before the installation and meter enter.
- Meter: 2 columns × 16 one-pixel segments; official dimensions, mute diagonal, zero-state visibility and 6s entrance fade. The central hit area follows the meter through resize.
- Import the official shared meter response v1.2. ISOAudioMeter supplies already-smoothed stereo levels and setMuted(boolean), including the common .5s mute / 1s unmute envelope. An optional activate() is called in the user gesture.
- These archived graphical installation sources have no real audio adapter. With no source their updated official meter stays at zero. No random synthetic audio levels or unrelated soundtrack are introduced.
- Mute does not stop, restart or advance an installation.
- Keep the approved Home 1 larger plus dimensions from the 16 September candidate; the plus in both previews enters the current Soglia.
- Home 1's reveal sequence, living pixels, plastic and pink final state are unchanged. Home 2's original terrain shaders and organic loop are unchanged.

Baseline: main 8d9481cde91ad166aeb78ab2b7b66bd614519ddc. The original Frozen and canonical files remain historical checkpoints. This candidate does not promote to production.

Paths:
- /candidates/home-1/common-controls-2026-10-07/
- /candidates/home-2/common-controls-2026-10-07/

/* Terra Viva first listening test. Levels remain independent. */
window.ISOTerraConfig = Object.freeze({
  loopSeconds: 14,
  rockLevel: 10 ** (-6 / 20),
  rockFadeInSeconds: 5,
  musicLevel: 1,
  outputLevel: .9,
  rockMotionFloor: .35,
  rocks: {
    url: 'https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev/cartoline/terra-viva/v1/audio/natural-disaster-mono.mp3',
    sha256: 'f7f241ff1fb8e56913201d8168e055e079deba6c976dc6b28c6d124ab0f2c433',
    crossfadeSeconds: 1
  },
  music: {
    url: 'https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev/cartoline/terra-viva/v1/audio/endless-ascent-stereo.mp3',
    sha256: '73288a000d18344e3e0673f27af06061d071081fef17ee2c71fa08f9896e21d5',
    crossfadeSeconds: 1
  }
});

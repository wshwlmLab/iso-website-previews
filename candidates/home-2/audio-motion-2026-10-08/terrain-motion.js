/* Sound envelope derived from the velocity of the approved terrain shader. */
(() => {
  'use strict';
  const smoothstep = (a, b, value) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  function envelope(image, width, height, floor = .35) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    function depth(x, y) {
      // WebGL's UNPACK_FLIP_Y_WEBGL makes UV y=0 the bottom of the image.
      x = Math.max(0, Math.min(canvas.width - 1, x * canvas.width - .5));
      y = Math.max(0, Math.min(canvas.height - 1, (1 - y) * canvas.height - .5));
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const x1 = Math.min(x0 + 1, canvas.width - 1), y1 = Math.min(y0 + 1, canvas.height - 1);
      const read = (xx, yy) => pixels[(yy * canvas.width + xx) * 4] / 255;
      const tx = x - x0, ty = y - y0;
      return (read(x0, y0) * (1 - tx) + read(x1, y0) * tx) * (1 - ty)
        + (read(x0, y1) * (1 - tx) + read(x1, y1) * tx) * ty;
    }
    const samples = [], screenAspect = width / height, imageAspect = 1672 / 941;
    for (let row = 1; row < 8; row++) for (let col = 1; col < 12; col++) {
      const x = col / 12, y = row / 8;
      let u = x, v = y;
      if (screenAspect > imageAspect) v = (v - .5) * imageAspect / screenAspect + .5;
      else u = (u - .5) * screenAspect / imageAspect + .5;
      u = (u - .5) * .945 + .5; v = (v - .5) * .945 + .5;
      const terrain = depth(u, v), mass = .10 + .90 * smoothstep(.12, .72, terrain);
      let sx = (depth(u + .008, v) - depth(u - .008, v)) * 2.2 + .0001;
      let sy = (depth(u, v + .008) - depth(u, v - .008)) * 1.45 + .025 + .0001;
      const length = Math.hypot(sx, sy); sx /= length; sy /= length;
      const edge = smoothstep(0, .12, Math.min(x, 1 - x, y, 1 - y));
      samples.push({ terrain, mass, sx, sy, edge,
        phase: x * 4.65 + y * .72 + (terrain - .5) * 1.15,
        weight: Math.exp(-8 * ((x - .5) ** 2 + (y - .5) ** 2)) });
    }
    const count = 280, energy = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const loopPhase = i / count * Math.PI * 2;
      let sum = 0, weights = 0;
      for (const s of samples) {
        const phase = s.phase - loopPhase;
        const velocity = -(Math.cos(phase) + .44 * Math.cos(2 * phase + 1.1) + .24 * Math.cos(3 * phase - .6)) / 1.30;
        const detail = 3 * phase + s.terrain * 2.4;
        const vx = (s.sx * velocity * .0165 + 3 * Math.sin(detail) * .00055) * s.mass * s.edge;
        const vy = (s.sy * velocity * .0165 - 3 * Math.cos(detail) * .00055) * s.mass * s.edge;
        sum += (vx * vx + vy * vy) * s.weight; weights += s.weight;
      }
      energy[i] = Math.sqrt(sum / weights);
    }
    // Circular smoothing preserves the start/end join of the visual cycle.
    const smoothed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      for (let k = -4; k <= 4; k++) smoothed[i] += energy[(i + k + count) % count] / 9;
    }
    const low = Math.min(...smoothed), range = Math.max(...smoothed) - low;
    const values = new Float32Array(count + 1);
    for (let i = 0; i < count; i++) values[i] = range > 1e-8 ? floor + (1 - floor) * (smoothed[i] - low) / range : 1;
    values[count] = values[0];
    return values;
  }
  window.ISOTerraMotion = Object.freeze({ envelope });
})();

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const filename = process.argv[2] || path.join(__dirname, '../dist/iso-meter-response.js');
const window = {};
vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {window});
const profile = window.ISOMeterResponse;
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
assert.equal(profile.version, '1.2');
assert.equal(profile.reactivity, 1.2);
assert.ok(Object.isFrozen(profile));
near(profile.attackPerMs, .032 * 1.2);
near(profile.releasePerMs, .0075 * 1.2);
for (const [from, to, baseRate] of [[0, .9, .032], [.9, .1, .0075]]) {
  for (const dt of [0, 1000 / 120, 1000 / 60, 40]) {
    // A step now covers exactly the same response as 20% more elapsed time in v1.
    near(profile.advance(from, to, dt), from + (to - from) * (1 - Math.exp(-baseRate * dt * 1.2)));
  }
  const integrate = hz => {
    let value = from;
    for (let frame = 0; frame < hz; frame++) value = profile.advance(value, to, 1000 / hz);
    return value;
  };
  near(integrate(60), integrate(120));
}
assert.equal(profile.advance(0, 0, 16), 0, 'Silence does not invent movement');
assert.equal(profile.advance(.3, .8, -10), .3);
near(profile.advance(.3, .8, 10000), profile.advance(.3, .8, 40));
assert.ok(profile.advance(0, 1, 16) > 1 - Math.exp(-.032 * 16));
assert.ok(profile.advance(1, 0, 16) < Math.exp(-.0075 * 16));
console.log('PASS: shared v1.2 meter response is 20% faster on attack and release, frame-rate independent, smooth, bounded and silent at zero.');

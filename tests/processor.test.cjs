const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.existsSync('processor.js') ? fs.readFileSync('processor.js', 'utf8') : '';
const context = {};
vm.runInNewContext(source, context);
const processor = context.Processor;

test('five modules preserve existing destinations including GitHub', () => {
  assert.ok(processor, 'Processor must exist');
  assert.deepEqual(Array.from(processor.modules, m => m.id), ['stack', 'projects', 'github', 'experience', 'contact']);
  assert.equal(processor.modules.find(m => m.id === 'github').sections.includes('u3'), true);
});

const rect = (top, bottom) => ({ top, bottom });
const outside = () => ({ hero: rect(-1000, -1), u1: rect(-1000, -1), u2: rect(-1000, -1), u3: rect(-1000, -1), u4: rect(-1000, -1), u5: rect(-1000, -1) });

test('hero stays idle until a page section enters', () => {
  assert.ok(processor, 'Processor must exist');
  const bounds = { ...outside(), hero: rect(0, 1000) };
  const initial = processor.sample(bounds, 1000, 0, false);
  assert.equal(initial.expansion, 0);
  assert.equal(initial.active, -1);
  assert.equal(processor.sample(bounds, 1000, 300, false).active, -1);
});

test('each existing section activates its associated module', () => {
  assert.ok(processor, 'Processor must exist');
  for (const [id, module] of [['u1', 0], ['u2', 1], ['u3', 2], ['u4', 3], ['u5', 4]]) {
    const result = processor.sample({ ...outside(), [id]: rect(0, 1000) }, 1000, 2000, false);
    assert.equal(result.active, module, id);
    assert.equal(result.weights[module], 1, id);
  }
});

test('scroll state is reversible and bounded even after skipped sections', () => {
  assert.ok(processor, 'Processor must exist');
  const bounds = { ...outside(), u2: rect(350, 1350) };
  const forward = processor.sample(bounds, 1000, 1600, false);
  processor.sample({ ...outside(), u5: rect(-200, 800) }, 1000, 9000, false);
  assert.deepEqual(processor.sample(bounds, 1000, 1600, false), forward);
  for (let top = -1500; top < 1500; top += 17) {
    const s = processor.sample({ ...outside(), u1: rect(top, top + 1000) }, 1000, top, false);
    assert.ok(s.weights.every(v => Number.isFinite(v) && v >= 0 && v <= 1));
    assert.ok(s.expansion >= 0 && s.expansion <= 1);
  }
});

test('reduced motion keeps layers assembled while showing the current section', () => {
  assert.ok(processor, 'Processor must exist');
  const result = processor.sample({ ...outside(), u4: rect(0, 1000) }, 1000, 4000, true);
  assert.equal(result.expansion, 0);
  assert.equal(result.active, 3);
  assert.equal(result.weights[3], 1);
});

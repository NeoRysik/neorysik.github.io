const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class Element {
  constructor() {
    this.children = []; this.events = {}; this.attributes = {}; this.hidden = true;
    this.offsetWidth = 90; this.offsetHeight = 90; this.offsetLeft = 0; this.offsetTop = 0;
    this.clientWidth = 440; this.clientHeight = 600;
    const classes = new Set();
    this.classList = { add: (name) => classes.add(name), remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name), toggle: (name, force) => { force ? classes.add(name) : classes.delete(name); } };
    this.style = { setProperty() {} };
  }
  append(child) { this.children.push(child); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.events[name] = callback; }
  fire(name, args = {}) { this.events[name]?.(args); }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; this.fire('close'); }
  querySelector(selector) { return this.nodes?.[selector]; }
  querySelectorAll() { return this.children; }
}
const stage = new Element(), field = new Element(), dialog = new Element(), pause = new Element();
const close = new Element(), scene = new Element(), question = new Element(), caption = new Element();
const invitation = new Element(), body = new Element();
stage.nodes = { '.memory-bubbles': field, '.memory-pause': pause, '.memory-invitation': invitation };
dialog.nodes = { '.memory-close': close, '.memory-scene': scene, '#memory-question': question, '#memory-caption': caption };
const media = { matches: false, addEventListener(name, callback) { this.changed = callback; } };
const document = { hidden: false, body, querySelector: (s) => s === '#memory-stage' ? stage : dialog,
  createElement: () => new Element(), addEventListener(name, callback) { this[name] = callback; } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../memories.js'), 'utf8'),
  { document, window: { matchMedia: () => media, addEventListener() {} } });
assert.equal(field.children.length, 8);
assert.equal(invitation.hidden, false);
assert(stage.classList.contains('has-memories'));
for (const bubble of field.children) {
  assert.equal(bubble.attributes['aria-haspopup'], 'dialog');
  assert(bubble.attributes['aria-label'].startsWith('Open illustrated memory:'));
  assert.equal(bubble.children[0].alt, '');
  bubble.fire('click');
  assert.equal(dialog.open, true);
  assert.equal(body.classList.contains('memory-open'), true);
  assert.equal(stage.classList.contains('memories-paused'), true);
  assert(question.textContent.endsWith('?'));
  assert(scene.alt.length > 20);
  assert(fs.existsSync(path.join(__dirname, '..', scene.src)));
  assert(fs.existsSync(path.join(__dirname, '..', bubble.children[0].src)));
  close.fire('click');
  assert.equal(dialog.open, false);
  assert.equal(body.classList.contains('memory-open'), false);
  assert.equal(bubble.focused, true);
}
pause.fire('click');
assert.equal(stage.classList.contains('memories-paused'), true);
assert.equal(pause.attributes['aria-pressed'], 'true');
pause.fire('click');
assert.equal(stage.classList.contains('memories-paused'), false);
document.hidden = true; document.visibilitychange();
assert.equal(stage.classList.contains('memories-paused'), true);
document.hidden = false; document.visibilitychange();
assert.equal(stage.classList.contains('memories-paused'), false);
media.matches = true; media.changed();
assert.equal(pause.disabled, true);
assert.equal(stage.classList.contains('memories-paused'), true);
console.log('PASS: eight scenes, image assets, accessible labels, dialog open/close, focus return, pause/resume, background pause, and reduced motion.');

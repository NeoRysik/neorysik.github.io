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
  querySelector(selector) { return selector === 'img' ? this.children[0] : this.nodes?.[selector]; }
  getBoundingClientRect() { return this.rect || { left: 800, top: 150, width: 370, height: 550, right: 1170 }; }
  animate(frames, options) {
    this.animation = { frames, options, playState: 'running', pause() { this.playState = 'paused'; }, play() { this.playState = 'running'; }, cancel() { this.playState = 'idle'; } };
    return this.animation;
  }
  querySelectorAll() { return this.children; }
}
const stage = new Element(), field = new Element(), dialog = new Element(), pause = new Element();
const close = new Element(), scene = new Element(), question = new Element(), caption = new Element();
const invitation = new Element(), body = new Element(), cover = new Element();
stage.nodes = { ':scope > img': cover, '.memory-bubbles': field, '.memory-pause': pause, '.memory-invitation': invitation };
dialog.nodes = { '.memory-close': close, '.memory-scene': scene, '#memory-question': question, '#memory-caption': caption };
const media = { matches: false, addEventListener(name, callback) { this.changed = callback; } };
const document = { hidden: false, body, querySelector: (s) => s === '#memory-stage' ? stage : dialog,
  createElement: () => new Element(), addEventListener(name, callback) { this[name] = callback; } };
const window = { innerWidth: 1360, innerHeight: 900, matchMedia: () => media, addEventListener(name, cb) { this[name] = cb; } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../memories.js'), 'utf8'),
  { document, window });
assert.equal(field.children.length, 8);
assert.equal(invitation.hidden, false);
assert(stage.classList.contains('has-memories'));
const visible = () => field.children.filter(b => !b.hidden);
assert.equal(visible().length, 1);
for (const bubble of field.children) {
  assert.equal(visible()[0], bubble);
  assert.equal(bubble.attributes['aria-haspopup'], 'dialog');
  const animation = bubble.animation;
  bubble.fire('click');
  assert.equal(dialog.open, true);
  assert.equal(animation.playState, 'paused');
  assert(question.textContent.endsWith('?'));
  assert(fs.existsSync(path.join(__dirname, '..', scene.src)));
  close.fire('click');
  assert.equal(dialog.open, false);
  assert.equal(bubble.focused, true);
  bubble.fire('blur');
  assert.equal(animation.playState, 'running');
  animation.onfinish();
  assert.equal(visible().length, 1, 'Flights must never overlap');
}
let active = visible()[0];
pause.fire('click');
assert.equal(active.animation.playState, 'paused');
pause.fire('click');
assert.equal(active.animation.playState, 'running');
document.hidden = true; document.visibilitychange();
assert.equal(active.animation.playState, 'paused');
document.hidden = false; document.visibilitychange();
assert.equal(active.animation.playState, 'running');
// Scrolling away does not cancel a flight, but the next must wait for its cover.
cover.rect = { left: 800, top: -1200, width: 370, height: 550, right: 1170 };
window.scroll();
assert.equal(active.animation.playState, 'running');
active.animation.onfinish();
assert.equal(visible().length, 0);
cover.rect = null; window.scroll();
assert.equal(visible().length, 1);
// Reduced-motion changes cancel flights and keep every scene accessible.
active = visible()[0];
media.matches = true; media.changed();
assert.equal(active.animation.playState, 'idle');
assert.equal(pause.disabled, true);
assert.equal(visible().length, 8);
media.matches = false; media.changed();
assert.equal(visible().length, 1);
assert.equal(pause.disabled, false);
console.log('PASS: one flight at a time, all scene dialogs, pause/resume, offscreen-cover waiting, visibility and reduced-motion transitions.');

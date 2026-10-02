(() => {
  const stage = document.querySelector('#memory-stage');
  const field = stage?.querySelector('.memory-bubbles');
  const dialog = document.querySelector('.memory-dialog');
  if (!field || !dialog || typeof dialog.showModal !== 'function') return;

  const memories = [
    { id: 'shani', question: 'What makes a place home?', label: 'Shani', alt: 'A girl and an older woman sharing an evening at home.' },
    { id: 'dave', question: 'What does the land remember?', label: 'Dave', alt: 'A figure among autumn birches overlooking a lake and forest.' },
    { id: 'frankie', question: 'What do we inherit from the hands before ours?', label: 'Frankie’s childhood', alt: 'A boy and an older watchmaker at a warmly lit workbench.' },
    { id: 'yohi-abbah', question: 'What do we inherit when we learn to question?', label: 'Yoḥi and Abbah', alt: 'A child studying beside his father in a sunlit room.' },
    { id: 'yohi-frankie', question: 'Which moments stay with us for a lifetime?', label: 'Yoḥi and Frankie', alt: 'Two friends sitting on a rocky overlook beneath a wide evening sky.' },
    { id: 'leyna', question: 'What stories come with a name?', label: 'Leyna’s childhood', alt: 'Two girls approaching a warmly lit family gathering.' },
    { id: 'kamla', question: 'What do we learn to hold sacred?', label: 'Kamla’s childhood', alt: 'A grandmother and child beside a statue of Nataraja in golden light.' },
    { id: 'junto', question: 'What teaches a mind to listen?', label: 'Junto’s childhood', alt: 'A young monk sitting in a quiet, forest-framed temple.' }
  ];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pause = stage.querySelector('.memory-pause');
  const close = dialog.querySelector('.memory-close');
  const scene = dialog.querySelector('.memory-scene');
  const cover = stage.querySelector(':scope > img');
  const bubbles = [];
  let manuallyPaused = false;
  let activeBubble = null;
  const animations = new Set();
  let emergenceClock = null;
  let current = 0;
  let hovering = false;
  let focused = false;
  let waitingForCover = false;
  let generation = 0;

  function syncMotion() {
    const stopped = manuallyPaused || document.hidden || dialog.open || hovering || focused;
    animations.forEach(animation => {
      if (animation) stopped ? animation.pause() : animation.play();
    });
    pause.setAttribute('aria-pressed', String(manuallyPaused || reduceMotion.matches));
    pause.textContent = reduceMotion.matches ? 'Motion reduced' : manuallyPaused ? 'Resume bubbles' : 'Pause bubbles';
    pause.disabled = reduceMotion.matches;
  }

  function openMemory(memory, bubble) {
    activeBubble = bubble;
    bubble.classList.add('is-popping');
    dialog.querySelector('#memory-question').textContent = memory.question;
    dialog.querySelector('#memory-caption').textContent = `${memory.label} · An illustrated memory from the novel`;
    scene.alt = memory.alt;
    scene.src = `assets/memories/${memory.id}.webp`;
    dialog.showModal();
    document.body.classList.add('memory-open');
    syncMotion();
    close.focus({ preventScroll: true });
  }

  memories.forEach((memory, index) => {
    const bubble = document.createElement('button');
    bubble.type = 'button';
    bubble.className = 'memory-bubble';
    bubble.hidden = true;
    bubble.setAttribute('aria-label', `Open illustrated memory: ${memory.label}`);
    bubble.setAttribute('aria-haspopup', 'dialog');
    const image = document.createElement('img');
    image.src = `assets/memories/${memory.id}-bubble.webp`;
    image.alt = '';
    image.width = 260;
    image.height = 260;
    image.decoding = 'async';
    image.draggable = false;
    bubble.append(image);
    bubble.addEventListener('click', () => openMemory(memory, bubble));
    bubble.addEventListener('pointerenter', () => { hovering = true; syncMotion(); });
    bubble.addEventListener('pointerleave', () => { hovering = false; syncMotion(); });
    bubble.addEventListener('focus', () => { focused = true; syncMotion(); });
    bubble.addEventListener('blur', () => { focused = false; syncMotion(); });
    field.append(bubble);
    bubbles.push(bubble);
  });

  // Coordinates of the small illustrated bubbles printed on the book cover.
  const origins = [[.88,.33], [.14,.23], [.93,.20], [.19,.31], [.84,.14], [.11,.38], [.91,.40], [.22,.17]];
  function launch() {
    if (reduceMotion.matches || emergenceClock) return;
    const rect = cover.getBoundingClientRect();
    const origin = origins[current];
    const x = rect.left + rect.width * origin[0];
    const y = rect.top + rect.height * origin[1];
    // Let a travelling bubble continue while scrolling; launch the next only
    // when its source on the actual cover is visible again.
    if (y < 0 || y > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
      waitingForCover = true;
      return;
    }
    waitingForCover = false;
    const bubble = bubbles[current];
    const size = window.innerWidth < 760 ? 100 : 136;
    bubble.style.setProperty('--size', `${size}px`);
    bubble.hidden = false;
    const w = window.innerWidth, h = window.innerHeight;
    const leftward = current % 3 !== 2;
    const endX = leftward ? -size * 1.6 : w + size * 1.6;
    const endY = h * [.18, .72, .12, .84][current % 4];
    const at = (cx, cy, scale) => `translate(${cx - size / 2}px, ${cy - size / 2}px) scale(${scale})`;
    const duration = 24000;
    const token = generation;
    const flight = bubble.animate([
      { offset: 0, transform: at(x, y, .16), opacity: .08 },
      { offset: .08, transform: at(x - 4, y - 7, .28), opacity: .20 },
      { offset: .20, transform: at(x + (leftward ? -35 : 20), y - 32, .55), opacity: .42 },
      { offset: 10 / 24, transform: at(w * (leftward ? .56 : .78), h * .37, 1), opacity: .94 },
      { offset: .72, transform: at(w * (leftward ? .25 : .94), h * (current % 2 ? .60 : .23), 1), opacity: .94 },
      { offset: 1, transform: at(endX, endY, 1.08), opacity: .85 }
    ], { duration, delay: 0, easing: 'linear', fill: 'both' });
    const reflection = bubble.querySelector('img').animate([
      { offset: 0, opacity: .02, filter: 'saturate(.35) blur(3px)' },
      { offset: .12, opacity: .15, filter: 'saturate(.45) blur(2px)' },
      { offset: 10 / 24, opacity: .9, filter: 'saturate(.8) blur(0px)' },
      { offset: 1, opacity: .9, filter: 'saturate(.9) blur(0px)' }
    ], { duration, delay: 0, easing: 'ease-in-out', fill: 'both' });
    flight.onfinish = () => {
      if (token !== generation) return;
      bubble.hidden = true;
      flight.cancel(); reflection.cancel();
      animations.delete(flight); animations.delete(reflection);
    };
    animations.add(flight);
    animations.add(reflection);
    current = (current + 1) % memories.length;
    // Use an animation clock so the ten-second cadence pauses with the scenes.
    emergenceClock = field.animate([], { duration: 10000 });
    animations.add(emergenceClock);
    emergenceClock.onfinish = () => {
      if (token !== generation) return;
      animations.delete(emergenceClock);
      emergenceClock.cancel();
      emergenceClock = null;
      launch();
    };
    syncMotion();
  }

  function configureMotion() {
    generation++;
    animations.forEach(animation => animation.cancel());
    animations.clear();
    emergenceClock = null;
    hovering = focused = false;
    field.classList.toggle('memory-bubbles-static', reduceMotion.matches);
    if (reduceMotion.matches) {
      stage.append(field);
      bubbles.forEach(b => { b.hidden = false; });
    } else {
      document.body.append(field);
      bubbles.forEach(b => { b.hidden = true; });
      launch();
    }
    syncMotion();
  }
  stage.classList.add('has-memories');
  stage.querySelector('.memory-invitation').hidden = false;
  pause.addEventListener('click', () => { manuallyPaused = !manuallyPaused; syncMotion(); });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('memory-open');
    activeBubble?.classList.remove('is-popping');
    activeBubble?.focus({ preventScroll: true });
    syncMotion();
  });
  document.addEventListener('visibilitychange', syncMotion);
  reduceMotion.addEventListener('change', configureMotion);
  window.addEventListener('scroll', () => { if (waitingForCover) launch(); }, { passive: true });
  window.addEventListener('resize', () => { if (waitingForCover) launch(); });
  cover.addEventListener('load', () => { if (waitingForCover) launch(); });
  configureMotion();
})();

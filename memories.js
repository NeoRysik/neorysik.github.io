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
  let manuallyPaused = false;
  let inView = true;
  let activeBubble = null;

  function syncMotion() {
    stage.classList.toggle('memories-paused', manuallyPaused || reduceMotion.matches || document.hidden || !inView || dialog.open);
    pause.setAttribute('aria-pressed', String(manuallyPaused || reduceMotion.matches));
    pause.textContent = reduceMotion.matches ? 'Motion reduced' : manuallyPaused ? 'Resume bubbles' : 'Pause bubbles';
    pause.disabled = reduceMotion.matches;
  }

  function openMemory(memory, bubble) {
    activeBubble = bubble;
    bubble.classList.remove('is-popping');
    void bubble.offsetWidth;
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
    bubble.className = `memory-bubble memory-bubble-${index + 1}`;
    bubble.setAttribute('aria-label', `Open illustrated memory: ${memory.label}`);
    bubble.setAttribute('aria-haspopup', 'dialog');
    bubble.style.setProperty('--delay', `${-index * 2.7}s`);
    bubble.style.setProperty('--duration', `${22 + index % 3 * 4}s`);
    const image = document.createElement('img');
    image.src = `assets/memories/${memory.id}-bubble.webp`;
    image.alt = '';
    image.width = 260;
    image.height = 260;
    image.decoding = 'async';
    image.draggable = false;
    bubble.append(image);
    bubble.addEventListener('click', () => openMemory(memory, bubble));
    bubble.addEventListener('animationend', (event) => {
      if (event.animationName === 'memory-pop') bubble.classList.remove('is-popping');
    });
    field.append(bubble);
  });
  stage.classList.add('has-memories');
  stage.querySelector('.memory-invitation').hidden = false;
  function placeOrigins() {
    const originX = field.clientWidth * .5;
    const originY = field.clientHeight * .64;
    field.querySelectorAll('.memory-bubble').forEach((bubble) => {
      bubble.style.setProperty('--birth-x', `${originX - bubble.offsetLeft - bubble.offsetWidth / 2}px`);
      bubble.style.setProperty('--birth-y', `${originY - bubble.offsetTop - bubble.offsetHeight / 2}px`);
    });
  }
  placeOrigins();
  if ('ResizeObserver' in window) new ResizeObserver(placeOrigins).observe(field);
  else window.addEventListener('resize', placeOrigins);
  pause.addEventListener('click', () => { manuallyPaused = !manuallyPaused; syncMotion(); });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('memory-open');
    activeBubble?.classList.remove('is-popping');
    syncMotion();
    activeBubble?.focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', syncMotion);
  reduceMotion.addEventListener('change', syncMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncMotion(); }, { threshold: 0.05 }).observe(stage);
  }
  syncMotion();
})();

const process = document.querySelector('.tc-process');

if (process) {
  const processTabs = process.querySelector('.tc-process-tabs');
  const panelsWrapper = process.querySelector('.tc-process-panels');
  const controls = process.querySelector('.tc-process-tools');
  const rotation = process.querySelector('.tc-rotation');
  const steps = Array.from(processTabs.querySelectorAll('[role="tab"]'));
  const panels = steps.map(step => document.getElementById(step.getAttribute('aria-controls')));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 8000;
  let selected = 0;
  let playing = !motion.matches;
  let inView = !('IntersectionObserver' in window);
  let hovering = false;
  let focused = false;
  let timer;

  function loadImage(index) {
    const image = panels[index].querySelector('img');
    if (image) image.loading = 'eager';
  }

  function showStep(next) {
    selected = next;
    steps.forEach((step, index) => {
      const active = index === selected;
      step.setAttribute('aria-selected', String(active));
      step.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
      panels[index].tabIndex = active ? 0 : -1;
      panels[index].setAttribute('aria-hidden', String(!active));
    });
    loadImage(selected);
  }

  function schedule() {
    window.clearTimeout(timer);
    const running = playing && inView && !hovering && !focused && !document.hidden;
    process.toggleAttribute('data-rotating', running);
    if (!running) return;

    const next = (selected + 1) % steps.length;
    loadImage(next);
    timer = window.setTimeout(() => {
      showStep(next);
      schedule();
    }, duration);
  }

  function setPlaying(value) {
    playing = value;
    rotation.setAttribute('aria-pressed', String(playing));
    rotation.title = playing ? 'Приостановить автолистание' : 'Включить автолистание';
    schedule();
  }

  function selectManually(index) {
    setPlaying(false);
    showStep(index);
  }

  processTabs.addEventListener('click', event => {
    const step = event.target.closest('[role="tab"]');
    if (step) selectManually(steps.indexOf(step));
  });

  processTabs.addEventListener('keydown', event => {
    const index = steps.indexOf(event.target);
    if (index === -1) return;

    let next;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % steps.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index + steps.length - 1) % steps.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = steps.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectManually(next);
    steps[next].focus();
  });

  rotation.addEventListener('click', () => setPlaying(!playing));
  panelsWrapper.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovering = true;
    schedule();
  });
  panelsWrapper.addEventListener('pointerleave', () => {
    hovering = false;
    schedule();
  });
  process.addEventListener('focusin', event => {
    focused = event.target !== rotation;
    schedule();
  });
  process.addEventListener('focusout', event => {
    focused = process.contains(event.relatedTarget) && event.relatedTarget !== rotation;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', event => {
    if (event.matches) setPlaying(false);
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    }, { threshold: 0.3 }).observe(panelsWrapper);
  }

  process.style.setProperty('--tc-step-duration', `${duration}ms`);
  process.setAttribute('data-ready', '');
  showStep(0);
  processTabs.hidden = false;
  controls.hidden = false;
  setPlaying(playing);
}

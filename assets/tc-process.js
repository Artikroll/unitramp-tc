const processTabs = document.querySelector('.tc-process-tabs');

if (processTabs) {
  const steps = Array.from(processTabs.querySelectorAll('[role="tab"]'));
  const panels = steps.map(step => document.getElementById(step.getAttribute('aria-controls')));

  function showStep(selected) {
    steps.forEach((step, index) => {
      const active = index === selected;
      step.setAttribute('aria-selected', String(active));
      step.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
      const image = panels[index].querySelector('img');
      if (active && image) image.loading = 'eager';
    });
  }

  processTabs.addEventListener('click', event => {
    const step = event.target.closest('[role="tab"]');
    if (step) showStep(steps.indexOf(step));
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
    showStep(next);
    steps[next].focus();
  });

  showStep(0);
  processTabs.hidden = false;
}

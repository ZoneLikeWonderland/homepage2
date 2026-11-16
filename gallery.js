(() => {
  if (window.parent !== window) {
    document.body.classList.add('is-embedded');
    const close = () => parent.postMessage({type:'close-study'}, location.origin);
    document.querySelector('.study-back').addEventListener('click', close);
    addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
  }
  const frames = [...document.querySelectorAll('.gallery-frame')];
  const controls = [...document.querySelectorAll('[data-frame]')];
  const count = document.querySelector('.gallery-count');
  if (!frames.length) return;
  let queued = false;
  function update() {
    queued = false;
    const center = innerHeight / 2;
    let active = 0, distance = Infinity;
    frames.forEach((frame, i) => {
      const r = frame.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - center);
      if (d < distance) { distance = d; active = i; }
    });
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
    controls.forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  controls.forEach(button => button.addEventListener('click', () => {
    frames[Number(button.dataset.frame)].scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }));
  update();
})();

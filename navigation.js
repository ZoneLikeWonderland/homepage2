document.querySelectorAll('[data-scroll-target]').forEach(button => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.scrollTarget);
    if (!target) return;
    target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  });
});

(() => {
  const view = document.querySelector('.study-view');
  if (!view) return;
  const panel = view.querySelector('.study-panel');
  const root = panel.attachShadow({mode:'open'});
  root.append(document.getElementById('study-styles').content.cloneNode(true));
  const scroll = document.createElement('div');
  scroll.className = 'study-scroll is-embedded';
  root.append(scroll);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const warmImages = new Map();
  let opener, savedScroll = 0, cleanup = () => {}, outsidePointer = null, closeTimer;
  const templateFor = button => document.getElementById('study-' + button.dataset.studySrc.split('/')[1]);
  function warm(template) {
    const src = template?.content.querySelector('.figure-full')?.getAttribute('src');
    if (!src || warmImages.has(src) || navigator.connection?.saveData) return;
    const image = new Image(); image.decoding = 'async'; image.src = src;
    warmImages.set(src, image);
    if (warmImages.size > 3) warmImages.delete(warmImages.keys().next().value);
  }
  function close() {
    if (!view.open || view.classList.contains('is-closing')) return;
    if (reduce.matches) { view.close(); return; }
    view.classList.add('is-closing');
    closeTimer = setTimeout(() => view.close(), 170);
  }
  function mount(template) {
    cleanup();
    scroll.replaceChildren(template.content.cloneNode(true));
    scroll.scrollTop = 0;
    const abort = new AbortController();
    const frames = [...scroll.querySelectorAll('.gallery-frame')];
    const controls = [...scroll.querySelectorAll('[data-frame]')];
    const count = scroll.querySelector('.gallery-count');
    const info = scroll.querySelector('.study');
    let queued = 0;
    function update() {
      queued = 0;
      scroll.classList.toggle('has-tall-info', innerWidth > 800 && info.scrollHeight > scroll.clientHeight + 2);
      const center = scroll.getBoundingClientRect().top + scroll.clientHeight / 2;
      let active = 0, distance = Infinity;
      frames.forEach((frame, i) => {
        const r = frame.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - center);
        if (d < distance) { distance = d; active = i; }
      });
      count.textContent = `${String(active + 1).padStart(2,'0')} / ${String(frames.length).padStart(2,'0')}`;
      controls.forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
    }
    const schedule = () => { if (!queued) queued = requestAnimationFrame(update); };
    scroll.addEventListener('scroll', schedule, {passive:true,signal:abort.signal});
    const observer = new ResizeObserver(schedule); observer.observe(scroll);
    controls.forEach(button => button.addEventListener('click', () => {
      const target = frames[Number(button.dataset.frame)];
      const rect = target.getBoundingClientRect();
      const top = scroll.scrollTop + rect.top - scroll.getBoundingClientRect().top + rect.height/2 - scroll.clientHeight/2;
      scroll.scrollTo({top, behavior:reduce.matches?'instant':'smooth'});
    }));
    scroll.querySelector('.study-back').addEventListener('click', close);
    scroll.querySelectorAll('.figure-full').forEach(image => {
      const ready = () => image.decode().then(() => {
        if (image.isConnected) image.parentElement.classList.add('is-ready');
      }).catch(() => { if (image.isConnected) image.parentElement.classList.add('has-error'); });
      if (image.complete && image.naturalWidth) ready();
      else image.addEventListener('load', ready, {once:true,signal:abort.signal});
      image.addEventListener('error', () => image.parentElement.classList.add('has-error'), {once:true,signal:abort.signal});
    });
    cleanup = () => { abort.abort(); observer.disconnect(); cancelAnimationFrame(queued); };
    schedule();
  }
  document.querySelectorAll('[data-study-src]').forEach(button => {
    let warmTimer;
    button.addEventListener('pointerenter', () => { warmTimer = setTimeout(() => warm(templateFor(button)), 140); });
    button.addEventListener('pointerleave', () => clearTimeout(warmTimer));
    button.addEventListener('focus', () => warm(templateFor(button)));
    button.addEventListener('click', () => {
      const template = templateFor(button);
      if (!template || view.open) return;
      opener = button; savedScroll = scrollY;
      view.setAttribute('aria-label', template.dataset.title);
      mount(template);
      document.body.style.setProperty('--study-scroll-top', `-${savedScroll}px`);
      document.body.style.setProperty('--study-scroll-gap', `${innerWidth - document.documentElement.clientWidth}px`);
      document.body.classList.add('study-open');
      view.classList.remove('is-closing');
      view.showModal();
      scroll.scrollTop = 0;
      view.querySelector('.study-close').focus({preventScroll:true});
    });
  });
  const outside = event => {
    const r = view.getBoundingClientRect();
    return event.target === view && (event.clientY < r.top || event.clientY > r.bottom || event.clientX < r.left || event.clientX > r.right);
  };
  view.addEventListener('pointerdown', event => {
    outsidePointer = event.isPrimary && event.button === 0 && outside(event) ? event.pointerId : null;
  });
  view.addEventListener('pointerup', event => {
    if (outsidePointer === event.pointerId && event.button === 0 && outside(event)) close();
    outsidePointer = null;
  });
  view.addEventListener('pointercancel', () => { outsidePointer = null; });
  view.querySelector('.study-close').addEventListener('click', close);
  view.addEventListener('cancel', event => { event.preventDefault(); close(); });
  view.addEventListener('close', () => {
    clearTimeout(closeTimer); cleanup(); outsidePointer = null;
    view.classList.remove('is-closing');
    document.body.classList.remove('study-open');
    document.body.style.removeProperty('--study-scroll-top');
    document.body.style.removeProperty('--study-scroll-gap');
    scrollTo({top:savedScroll,behavior:'instant'});
    opener?.focus({preventScroll:true});
    scroll.replaceChildren();
  });
})();

(() => {
  const corner = document.querySelector('.visitor-corner');
  if (!corner) return;
  // Local previews never contact the counter or manufacture visits.
  if (!['zhanglongwen.com', 'www.zhanglongwen.com'].includes(location.hostname)) return;
  const host = corner.querySelector('.visitor-live');
  const image = new Image();
  image.alt = 'Visitor countries — Flag Counter';
  image.width = 400; image.height = 205; image.decoding = 'async';
  image.addEventListener('load', () => {
    // Some services return a 1px image for invalid counters; keep the local map.
    if (image.naturalWidth < 80 || image.naturalHeight < 40) return;
    host.append(image);
    corner.classList.add('has-live');
    corner.querySelector('.visitor-state').textContent = 'Visitor countries';
  }, {once:true});
  // A failed/blocked request leaves the local map and does not add an error banner.
  const load = () => { image.src = corner.dataset.visitorImage; };
  if ('requestIdleCallback' in window) requestIdleCallback(load, {timeout:1500});
  else setTimeout(load, 250);
})();

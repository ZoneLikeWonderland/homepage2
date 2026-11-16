(() => {
  const corner = document.querySelector('.visitor-corner');
  if (!corner) return;
  const state = corner.querySelector('.visitor-state');
  const host = corner.querySelector('.visitor-live');
  // Local previews never contact the analytics service or manufacture visits.
  if (!['zhanglongwen.com', 'www.zhanglongwen.com'].includes(location.hostname)) return;
  state.textContent = 'Loading map';
  let ready = false, preparing = false;
  function checkReady() {
    for (const link of host.querySelectorAll('a')) {
      if (link.hostname === 'mapmyvisitors.com' && link.protocol !== 'https:') link.protocol = 'https:';
      if (link.target !== '_blank') link.target = '_blank';
      if (link.rel !== 'noopener') link.rel = 'noopener';
    }
    if (!ready && !preparing && host.querySelector('svg')) {
      const background = getComputedStyle(host.querySelector('.mapmyvisitors-map')).backgroundImage;
      const url = background.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
      if (!url) return;
      preparing = true;
      const image = new Image(); image.src = url;
      image.decode().then(() => {
        ready = true;
        corner.classList.add('has-live');
        state.textContent = 'MapMyVisitors';
      }).catch(() => { state.textContent = 'Map unavailable'; });
    }
  }
  new MutationObserver(checkReady).observe(host, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['href','target','rel']
  });
  const load = () => {
    const script = document.createElement('script');
    script.id = 'mapmyvisitors'; script.async = true;
    script.src = 'https://mapmyvisitors.com/map.js?d=2hwvZrB9dKZwTYfOPTwFFCQtLJDAkZw85ep7P6EVQTY&w=196&t=n&cl=c4cac0&co=f9f9f6&ct=777770&cmo=a16d3d&cmn=a16d3d';
    script.onerror = () => { state.textContent = 'Map unavailable'; };
    host.append(script);
    setTimeout(() => { if (!ready) state.textContent = 'Map unavailable'; }, 15000);
  };
  if ('requestIdleCallback' in window) requestIdleCallback(load, {timeout:1500});
  else setTimeout(load, 250);
})();

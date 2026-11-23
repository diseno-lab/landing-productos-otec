/* Demo GGC v0.1 — ajuste exacto de la lámina al escenario (sin desplazamiento interno).
   En pantallas de escritorio/tableta (>760 px) si la lámina es más alta que el escenario
   se reduce proporcionalmente con `zoom` (mínimo 62 %). En móvil la página se desplaza de forma natural. */
(() => {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const mobile = matchMedia('(max-width:760px)');
  let raf = 0, busy = false, observed = null;
  const ro = new ResizeObserver(() => { if (!busy) request(); });

  function fit() {
    const scene = stage.querySelector('.scene');
    if (!scene) return;
    if (observed !== scene) { if (observed) ro.unobserve(observed); ro.observe(scene); observed = scene; }
    busy = true;
    if (mobile.matches) { scene.style.zoom = ''; stage.style.overflowY = ''; busy = false; return; }
    scene.style.zoom = '';
    const avail = stage.clientHeight;
    let need = stage.scrollHeight;
    if (need > avail + 1) {
      let z = avail / need;
      for (let i = 0; i < 4 && need > avail + 1; i++) {
        scene.style.zoom = Math.max(0.62, z).toFixed(4);
        need = stage.scrollHeight;
        z = z * avail / need;
      }
    }
    stage.scrollTop = 0;
    requestAnimationFrame(() => { busy = false; });
  }
  const request = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };

  // Alto real del pie para posicionar los subtítulos sobre los controles fijos en móvil
  const footer = document.querySelector('footer');
  if (footer) new ResizeObserver(() => document.documentElement.style.setProperty('--ggc-footer-h', footer.offsetHeight + 'px')).observe(footer);

  new MutationObserver(request).observe(stage, { childList: true });
  new ResizeObserver(request).observe(stage);
  addEventListener('resize', request);
  mobile.addEventListener?.('change', request);
  document.fonts?.ready.then(request);
  request();
})();

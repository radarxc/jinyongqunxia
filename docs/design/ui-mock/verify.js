// Optional browser assertions, evaluated by capture.m; never loaded by scene.html.
JSON.stringify((() => {
  const failures = [], screens = [], geometry = {}, controls = [];
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  for (const screen of document.querySelectorAll('.screen')) {
    location.hash = screen.id;
    const shown = [...document.querySelectorAll('.screen')].filter(visible);
    if (shown.length !== 1 || shown[0] !== screen) failures.push(screen.id + ':screen count');
    if (document.documentElement.scrollWidth > innerWidth) failures.push(screen.id + ':horizontal overflow');
    for (const el of screen.querySelectorAll('.folio-body')) {
      if (el.scrollWidth > el.clientWidth + 1) failures.push(screen.id + ':folio overflow');
    }
    const folio = screen.querySelector('.folio');
    if (folio && folio.getBoundingClientRect().bottom > document.querySelector('.toolbar').getBoundingClientRect().top) failures.push(screen.id + ':toolbar overlap');
    for (const el of [...document.querySelectorAll('.icon-button')].filter(visible)) {
      const r = el.getBoundingClientRect(), name = el.getAttribute('aria-label'), tip = el.querySelector('.tip');
      if (r.width < 44 || r.height < 44) failures.push(screen.id + ':small target ' + name);
      if (!name || !tip) failures.push(screen.id + ':missing name');
      if ([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) failures.push(screen.id + ':resident button text ' + name);
      if (getComputedStyle(tip).visibility !== 'hidden') failures.push(screen.id + ':resident tooltip ' + name);
      const control = el.querySelector('input') || el;
      control.focus();
      if (el.closest('.folio-body')) el.scrollIntoView({block:'nearest'});
      if (document.activeElement !== control) failures.push(screen.id + ':cannot focus ' + name);
      if (document.hasFocus()) {
        if (getComputedStyle(tip).visibility !== 'visible') failures.push(screen.id + ':focus tooltip missing ' + name);
        if (getComputedStyle(el).boxShadow === 'none') failures.push(screen.id + ':focus mark missing ' + name);
      }
      const t = tip.getBoundingClientRect();
      if (t.left < 0 || t.top < 0 || t.right > innerWidth || t.bottom > innerHeight) failures.push(screen.id + ':tooltip clipped ' + name);
      control.blur();
      controls.push({screen:screen.id, name, width:r.width, height:r.height});
    }
    screens.push(screen.id);
  }
  location.hash = 'battle';
  const field = document.querySelector('.battlefield').getBoundingClientRect();
  const cells = [...document.querySelectorAll('.hex-tile')];
  const full = cells.filter(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= field.top && r.bottom <= field.bottom; });
  const sample = cells[0].getBoundingClientRect();
  geometry.hex = {width:sample.width, height:sample.height, total:cells.length, fullyVisible:full.length};
  geometry.units = [...document.querySelectorAll('.battle-unit image')].map(el => {
    const r = el.getBoundingClientRect(); return {width:r.width, height:r.height};
  });
  if (cells.length !== 153 || full.length <= 10) failures.push('insufficient hexes');
  const expected = innerWidth < 700 ? 36 : 48;
  if (Math.abs(sample.height - expected) > .1) failures.push('hex size mismatch');
  if (geometry.units.some(x => Math.abs(x.height / sample.height - .75) > .01)) failures.push('unit ratio mismatch');
  const css = [...document.styleSheets].flatMap(s => [...s.cssRules]).map(r => r.cssText).join('');
  if (!css.includes('.icon-button:focus-visible') || !css.includes('.icon-button:has(input:focus-visible)')) failures.push('focus CSS absent');
  const broken = [...document.images].filter(x => !x.complete || !x.naturalWidth).length;
  if (broken) failures.push('broken images:' + broken);
  document.querySelectorAll('.folio-body').forEach(el => el.scrollTop = 0);
  return {focusStyleCheck:document.hasFocus()?'native focus checked':'not exercised: host window inactive; activeElement and CSS rules checked only',viewport:[innerWidth,innerHeight],screens,failures,geometry,controls,hasSelector:CSS.supports('selector(:has(*))'),fonts:'system fallback',images:document.images.length,svgImages:document.querySelectorAll('svg image').length};
})())

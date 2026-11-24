(() => {
  const root = document.documentElement;
  const glow = document.querySelector('.pointer-glow');
  const glowAllowed = matchMedia('screen and (any-pointer:fine) and (prefers-reduced-motion:no-preference)');
  let glowFrame = 0;
  let pointerX, pointerY;
  let lastX, lastY;
  let nextTrace = 0;
  const tracePool = [];

  function markTrace(x, y) {
    let point = tracePool[nextTrace];
    if (!point) {
      const element = document.createElement('span');
      element.className = 'pointer-trace';
      glow.parentElement.append(element);
      point = {element};
      tracePool.push(point);
    }
    nextTrace = (nextTrace + 1) % 20;
    point.animation?.cancel();
    point.element.style.translate = 'calc(' + x + 'px - 50%) calc(' + y + 'px - 50%)';
    point.animation = point.element.animate(
      [{opacity:.72, scale:1}, {opacity:0, scale:.35}],
      {duration:340, easing:'ease-out'}
    );
  }

  function hideGlow() {
    cancelAnimationFrame(glowFrame);
    glowFrame = 0;
    glow.classList.remove('active');
    lastX = lastY = undefined;
  }

  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !glowAllowed.matches) {
      hideGlow();
      return;
    }
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (glowFrame) return;
    glowFrame = requestAnimationFrame(() => {
      glowFrame = 0;
      glow.style.transform = 'translate3d(' + pointerX + 'px,' + pointerY + 'px,0) translate(-50%,-50%)';
      glow.classList.add('active');
      const distance = Math.hypot(pointerX - lastX, pointerY - lastY);
      if (distance >= 9) {
        const steps = Math.min(7, Math.floor(distance / 9));
        for (let step = steps; step > 0; step--) {
          const offset = 9 * step / distance;
          markTrace(pointerX + (lastX - pointerX) * offset, pointerY + (lastY - pointerY) * offset);
        }
      } else if (lastX !== undefined) {
        return;
      }
      lastX = pointerX;
      lastY = pointerY;
    });
  }, {passive:true});
  root.addEventListener('pointerleave', hideGlow);
  addEventListener('blur', hideGlow);
  glowAllowed.addEventListener('change', hideGlow);

  for (const filter of document.querySelectorAll('[data-filter]')) {
    filter.hidden = false;
    const cards = document.getElementById(filter.dataset.filter).querySelectorAll('[data-group]');
    const buttons = filter.querySelectorAll('button');
    for (const button of buttons) {
      button.addEventListener('click', () => {
        const key = button.dataset.key;
        for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
        for (const card of cards) card.hidden = key !== 'all' && key !== card.dataset.group;
      });
    }
  }

  for (const project of document.querySelectorAll('.project')) {
    project.addEventListener('keydown', event => {
      if (event.key === 'Escape' && project.open) {
        project.open = false;
        project.querySelector('summary').focus();
      }
    });
  }

  const header = document.querySelector('.site-header');
  const links = Array.from(header.querySelectorAll('nav a[href]'));
  const sections = links.map(link => document.querySelector(link.hash));
  const bar = document.querySelector('.reading');
  let frame = 0;
  function update() {
    frame = 0;
    header.classList.toggle('scrolled', scrollY > 12);
    const remaining = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (remaining > 0 ? Math.max(0, Math.min(1, scrollY / remaining)) : 0) + ')';
    const marker = innerHeight * .45;
    const current = sections.findLastIndex(section => section.getBoundingClientRect().top <= marker);
    const active = remaining > 0 && scrollY >= remaining - 2 ? sections.length - 1 : Math.max(0, current);
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function queue() {
    if (!document.hidden && !frame) frame = requestAnimationFrame(update);
  }
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', queue);
  document.addEventListener('toggle', queue, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else queue();
  });
  queue();

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.dataset.arrived = '';
      observer.unobserve(entry.target);
    }
  }, {threshold:.08});
  for (const section of document.querySelectorAll('.section')) observer.observe(section);
})();

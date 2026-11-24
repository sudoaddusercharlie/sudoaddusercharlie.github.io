(() => {
  const canvas = document.querySelector('.code-rain');
  const context = canvas.getContext('2d');
  if (!context) return;

  const motion = matchMedia('screen and (prefers-reduced-motion:no-preference)');
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const symbols = '01ABCDEF{}[]<>/+=:;'.split('');
  const step = 22;
  let columns = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastDraw = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.font = '13px "JetBrains Mono", monospace';
    context.fillStyle = accent;
    columns = Array.from({length:Math.ceil(width / step)}, () => ({
      y: Math.random() * (height + 300) - 150,
      speed: 30 + Math.random() * 76,
      glyphs: Array.from({length:8 + Math.floor(Math.random() * 11)}, () => (
        symbols[Math.floor(Math.random() * symbols.length)]
      ))
    }));
  }

  function draw(now) {
    frame = requestAnimationFrame(draw);
    const elapsed = now - lastDraw;
    if (elapsed < 32) return;
    lastDraw = now;
    context.clearRect(0, 0, width, height);
    columns.forEach((column, index) => {
      column.y += column.speed * Math.min(elapsed, 66) / 1000;
      const head = Math.floor(column.y / step);
      if (column.y > height + column.glyphs.length * step) column.y = -Math.random() * height * .45;
      column.glyphs.forEach((glyph, offset) => {
        const y = (head - offset) * step;
        if (y < 0 || y > height + step) return;
        context.globalAlpha = .26 * (1 - offset / column.glyphs.length) ** 1.7;
        context.fillText(glyph, index * step + 4, y);
      });
    });
  }

  function sync() {
    cancelAnimationFrame(frame);
    canvas.hidden = !motion.matches;
    if (canvas.hidden || document.hidden) return;
    resize();
    lastDraw = performance.now();
    frame = requestAnimationFrame(draw);
  }

  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('resize', () => { if (!canvas.hidden) resize(); });
  sync();
})();

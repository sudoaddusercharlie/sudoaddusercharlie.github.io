(() => {
  const toggle = document.querySelector('#lang');
  const original = new WeakMap();
  const valid = value => ['es', 'en'].includes(value);
  let saved;
  try { saved = localStorage.getItem('portfolio-language'); } catch {}
  const requested = new URL(location.href).searchParams.get('lang');

  function translate(root, lang) {
    for (const node of root.querySelectorAll('[data-en], [data-en-label]')) {
      const attribute = node.hasAttribute('data-en-label') ? 'aria-label' : null;
      if (!original.has(node)) original.set(node, attribute ? node.getAttribute(attribute) : node.textContent);
      const value = lang === 'en' ? (attribute ? node.dataset.enLabel : node.dataset.en) : original.get(node);
      if (attribute) node.setAttribute(attribute, value);
      else node.textContent = value;
    }
  }

  function apply(lang) {
    document.documentElement.lang = lang;
    document.title = 'Carlos Martin Buesa · ' + (lang === 'en' ? 'Systems and networking' : 'Sistemas y redes');
    translate(document, lang);
    toggle.textContent = lang === 'en' ? 'ES' : 'EN';
    toggle.setAttribute('aria-label', lang === 'en' ? 'Leer en español' : 'Read in English');
  }

  toggle.addEventListener('click', () => {
    const lang = document.documentElement.lang === 'en' ? 'es' : 'en';
    try { localStorage.setItem('portfolio-language', lang); } catch {}
    const url = new URL(location.href);
    if (lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    history.replaceState(null, '', url);
    apply(lang);
  });
  apply(valid(requested) ? requested : valid(saved) ? saved : 'es');
  toggle.hidden = false;
})();

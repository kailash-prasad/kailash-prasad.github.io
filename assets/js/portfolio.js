(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const close = () => { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('open'); };
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    nav.classList.toggle('open', expanded);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { close(); toggle?.focus(); } });
  const filters = document.querySelectorAll('[data-filter]');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const filter = button.dataset.filter;
    let count = 0;
    document.querySelectorAll('[data-publication]').forEach(item => {
      item.hidden = filter !== 'all' && item.dataset.publication !== filter;
      if (!item.hidden) count++;
    });
    const status = document.querySelector('#publication-count');
    if (status) status.textContent = `${count} ${count === 1 ? 'publication' : 'publications'} shown`;
  }));
})();

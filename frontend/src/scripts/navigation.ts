/** Menu mobilne i zachowanie nagłówka podczas przewijania. */
export function initNavigation(): void {
  const nav = document.querySelector<HTMLElement>('[data-site-nav]');
  const toggle = nav?.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  if (!nav || !toggle) return;

  const mobile = window.matchMedia('(max-width: 900px)');

  const close = () => {
    nav.classList.remove('nav--open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Otwórz menu');
  };

  toggle.addEventListener('click', () => {
    const isOpening = !nav.classList.contains('nav--open');
    nav.classList.toggle('nav--open', isOpening);
    nav.classList.remove('nav--hidden');
    toggle.setAttribute('aria-expanded', String(isOpening));
    toggle.setAttribute('aria-label', isOpening ? 'Zamknij menu' : 'Otwórz menu');
  });

  nav.querySelectorAll<HTMLAnchorElement>('.nav-links a').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('nav--open')) {
      close();
      toggle.focus();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!nav.contains(event.target as Node)) close();
  });

  mobile.addEventListener('change', close);

  let previousScroll = Math.max(0, window.scrollY);
  let scheduled = false;

  const onScroll = () => {
    const currentScroll = Math.max(0, window.scrollY);
    const delta = currentScroll - previousScroll;
    const menuOpen = nav.classList.contains('nav--open');

    if (currentScroll <= nav.offsetHeight + 8 || menuOpen || delta < -0.5) {
      nav.classList.remove('nav--hidden');
    } else if (delta > 0.5) {
      nav.classList.add('nav--hidden');
    }

    previousScroll = currentScroll;
    scheduled = false;
  };

  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
}

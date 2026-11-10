export function initPressFeedback(): void {
  const selector = '[data-pressable]';
  let pressed: HTMLElement | null = null;

  const highlight = (element: HTMLElement | null) => {
    if (pressed === element) return;
    pressed?.classList.remove('is-pressed');
    pressed = element;
    pressed?.classList.add('is-pressed');
  };

  const target = (event: Event): HTMLElement | null =>
    event.target instanceof Element
      ? event.target.closest<HTMLElement>(selector)
      : null;

  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    highlight(target(event));
  });

  document.addEventListener('pointerup', () => highlight(null));
  document.addEventListener('pointercancel', () => highlight(null));

  document.addEventListener('touchstart', (event) => highlight(target(event)), { passive: true });
  document.addEventListener('touchend', () => highlight(null), { passive: true });
  document.addEventListener('touchcancel', () => highlight(null), { passive: true });
  window.addEventListener('blur', () => highlight(null));
}

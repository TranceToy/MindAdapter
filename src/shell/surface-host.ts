export type SurfaceHost = {
  show: (screen: HTMLElement) => void;
};

export function createSurfaceHost(root: HTMLElement): SurfaceHost {
  let shown: HTMLElement | null = null;

  function show(screen: HTMLElement): void {
    const leaving = shown;
    shown = screen;
    root.append(screen);
    requestAnimationFrame(() => screen.classList.add('surface--shown'));
    if (leaving) fadeOut(leaving);
  }

  return { show };
}

function fadeOut(screen: HTMLElement): void {
  screen.addEventListener('transitionend', () => screen.remove(), { once: true });
  screen.classList.remove('surface--shown');
}

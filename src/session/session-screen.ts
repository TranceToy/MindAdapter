export function renderStage(parts: HTMLElement[]): HTMLElement {
  const stage = document.createElement('section');
  stage.className = 'stage';
  stage.append(...parts);
  return stage;
}

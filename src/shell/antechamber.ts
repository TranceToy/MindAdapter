export function hero(text: string): HTMLElement {
  const heading = document.createElement('h1');
  heading.className = 'hero';
  heading.textContent = text;
  return heading;
}

export function dimHero(text: string): HTMLElement {
  const heading = hero(text);
  heading.classList.add('hero--dim');
  return heading;
}

export function prose(text: string): HTMLElement {
  const paragraph = document.createElement('p');
  paragraph.className = 'prose';
  paragraph.textContent = text;
  return paragraph;
}

export function secondary(text: string): HTMLElement {
  const line = document.createElement('div');
  line.className = 'secondary';
  line.textContent = text;
  return line;
}

export function surface(parts: HTMLElement[]): HTMLElement {
  const content = document.createElement('div');
  content.className = 'surface__content';
  content.append(...parts);
  const screen = document.createElement('section');
  screen.className = 'surface';
  screen.append(content);
  return screen;
}

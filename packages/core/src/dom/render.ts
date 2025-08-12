// dom/render.ts - Your render implementation

export function render(content: string | HTMLElement, container: HTMLElement) {
  container.innerHTML = '';

  if (typeof content === 'string') {
    container.innerHTML = content;
  } else {
    container.appendChild(content);
  }
}

export function hydrate(element: any, container: Element) {
  // Basic hydration - would be more sophisticated in production
  return render(element, container as HTMLElement);
}

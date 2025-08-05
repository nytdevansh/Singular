export function render(content: string | HTMLElement, container: HTMLElement) {
  container.innerHTML = '';

  if (typeof content === 'string') {
    container.innerHTML = content;
  } else {
    container.appendChild(content);
  }
}
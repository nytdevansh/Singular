// animate/flip.ts
export interface FlipOptions {
  duration?: number;
  easing?: string;
}

export function measureElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };
}

export function animateLayout(element: HTMLElement, options: FlipOptions = {}) {
  const first = measureElement(element);
  
  requestAnimationFrame(() => {
    const last = measureElement(element);
    const deltaX = first.x - last.x;
    const deltaY = first.y - last.y;
    
    if (deltaX || deltaY) {
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      element.style.transition = 'none';
      
      requestAnimationFrame(() => {
        element.style.transition = `transform ${options.duration || 300}ms ${options.easing || 'ease'}`;
        element.style.transform = 'translate(0, 0)';
      });
    }
  });
}

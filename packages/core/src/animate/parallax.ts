interface ParallaxOptions {
  speed?: number;
  axis?: 'x' | 'y' | 'both';
  perspective?: number;
  centerOnLoad?: boolean;
  smoothness?: number;
}

export function createParallax(element: HTMLElement, options: ParallaxOptions = {}) {
  const {
    speed = 0.5,
    axis = 'y',
    perspective = 1,
    centerOnLoad = false,
    smoothness = 0.1
  } = options;

  let animationId: number | null = null;
  let currentOffset = { x: 0, y: 0 };
  let targetOffset = { x: 0, y: 0 };

  const updateTransform = () => {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const rect = element.getBoundingClientRect();
    const centerY = window.innerHeight / 2;
    const centerX = window.innerWidth / 2;

    // Calculate target positions
    if (axis === 'y' || axis === 'both') {
      const offsetY = (rect.top + rect.height / 2 - centerY) * speed * perspective;
      targetOffset.y = centerOnLoad ? offsetY : scrollY * speed;
    }
    
    if (axis === 'x' || axis === 'both') {
      const offsetX = (rect.left + rect.width / 2 - centerX) * speed * perspective;
      targetOffset.x = centerOnLoad ? offsetX : scrollX * speed;
    }

    // Smooth interpolation
    currentOffset.x += (targetOffset.x - currentOffset.x) * smoothness;
    currentOffset.y += (targetOffset.y - currentOffset.y) * smoothness;

    // Apply transform
    const transformX = axis === 'x' || axis === 'both' ? currentOffset.x : 0;
    const transformY = axis === 'y' || axis === 'both' ? currentOffset.y : 0;
    
    element.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;

    animationId = requestAnimationFrame(updateTransform);
  };

  // Start animation
  updateTransform();

  return {
    destroy: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      element.style.transform = '';
    },
    updateOptions: (newOptions: Partial<ParallaxOptions>) => {
      Object.assign(options, newOptions);
    }
  };
}

// Scroll-triggered parallax (more performant for multiple elements)
export function createScrollParallax(elements: HTMLElement[], globalSpeed = 0.5) {
  const elementsData = elements.map(el => ({
    element: el,
    speed: parseFloat(el.dataset.parallaxSpeed || String(globalSpeed)),
    axis: (el.dataset.parallaxAxis as 'x' | 'y' | 'both') || 'y'
  }));

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    elementsData.forEach(({ element, speed, axis }) => {
      const transformX = axis === 'x' || axis === 'both' ? scrollX * speed : 0;
      const transformY = axis === 'y' || axis === 'both' ? scrollY * speed : 0;
      
      element.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  return {
    destroy: () => {
      window.removeEventListener('scroll', onScroll);
      elementsData.forEach(({ element }) => {
        element.style.transform = '';
      });
    },
    addElement: (element: HTMLElement, speed?: number) => {
      elementsData.push({
        element,
        speed: speed || globalSpeed,
        axis: (element.dataset.parallaxAxis as 'x' | 'y' | 'both') || 'y'
      });
    }
  };
}

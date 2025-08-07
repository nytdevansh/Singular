type EasingFunction = (t: number) => number;

const easings: Record<string, EasingFunction> = {
  linear: t => t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  easeInCubic: t => t * t * t,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
  easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};

interface AnimateOptions {
  [property: string]: [string | number, string | number] | any;
  duration: number;
  easing?: keyof typeof easings | undefined;
  delay?: number;
  onComplete?: () => void;
}

export function animate(
  element: HTMLElement,
  { duration, easing = 'linear', delay = 0, onComplete, ...props }: AnimateOptions
): () => void {
  const ease = easings[easing];
  const initialStyles: Record<string, any> = {};
  const finalStyles: Record<string, any> = {};

  for (const prop in props) {
    const [from, to] = props[prop];
    if (getUnit(from) !== getUnit(to)) {
      console.warn(`Unit mismatch for "${prop}": "${from}" → "${to}"`);
    }

    initialStyles[prop] = parseFloat(from);
    finalStyles[prop] = parseFloat(to);
  }

  let stopped = false;

  function frame(now: number, start = performance.now()) {
    if (stopped) return;
    const t = Math.min((now - start) / duration, 1);
    const eased = ease(t);

    for (const prop in props) {
      const from = initialStyles[prop];
      const to = finalStyles[prop];
      const value = from + (to - from) * eased;

      const unit = getUnit(props[prop][0]);
      element.style[prop as any] = isNaN(value) ? String(value) : value + unit;
    }

    if (t < 1) requestAnimationFrame(n => frame(n, start));
    else onComplete?.();
  }

  setTimeout(() => requestAnimationFrame(frame), delay);

  return () => { stopped = true; };
}

function getUnit(value: string | number) {
  return typeof value === 'string' ? value.replace(/[0-9.-]/g, '') : '';
}

// Animation on scrolling
interface ScrollAnimationOptions extends AnimateOptions {
  once?: boolean; // only trigger once
  threshold?: number; // 0–1 for how much of element is visible
  rootMargin?: string; // margin around root for early triggering
}

export function animateOnScroll(
  element: HTMLElement,
  options: ScrollAnimationOptions
) {
  const { once = true, threshold = 0.5, rootMargin = '0px' } = options;

  const observer = new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting) {
      animate(element, options);
      if (once) obs.unobserve(element);
    }
  }, { threshold, rootMargin });

  observer.observe(element);

  return {
    destroy: () => observer.disconnect()
  };
}

// Animation on hover
interface HoverAnimationOptions extends AnimateOptions {
  reverseOnLeave?: boolean;
}

export function animateOnHover(
  element: HTMLElement,
  options: HoverAnimationOptions
) {
  const { reverseOnLeave = true, duration, easing = 'linear', ...props } = options;

  // Use Partial while building reverse object
  const reverse: Partial<AnimateOptions> = {};

  for (const key in props) {
    if (Array.isArray(props[key])) {
      const [from, to] = props[key];
      reverse[key] = [to, from]; // swap for reverse animation
    }
  }

  // Reuse original duration and easing
  reverse.duration = duration;
  reverse.easing = easing;

  const handleMouseEnter = () => {
    animate(element, { duration, easing, ...props });
  };

  const handleMouseLeave = () => {
    if (reverseOnLeave) {
      animate(element, reverse as AnimateOptions);
    }
  };

  element.addEventListener("mouseenter", handleMouseEnter);
  if (reverseOnLeave) {
    element.addEventListener("mouseleave", handleMouseLeave);
  }

  return {
    destroy: () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    }
  };
}

// Animation on click
export function animateOnClick(
  element: HTMLElement,
  options: AnimateOptions
) {
  const handleClick = () => {
    animate(element, options);
  };

  element.addEventListener('click', handleClick);

  return {
    destroy: () => element.removeEventListener('click', handleClick)
  };
}

// Loop animation
interface LoopAnimationOptions extends AnimateOptions {
  iterations?: number; // number of loops, Infinity for endless
  direction?: 'normal' | 'reverse' | 'alternate';
  interval?: number; // delay between loops
}

export function animateLoop(
  element: HTMLElement,
  options: LoopAnimationOptions
) {
  const { iterations = Infinity, direction = 'normal', interval = 0, ...animateOptions } = options;
  let currentIteration = 0;
  let isReversed = false;
  let isActive = true;

  const loop = () => {
    if (!isActive || currentIteration >= iterations) return;

    const currentOptions = { ...animateOptions };
    
    // Handle direction
    if (direction === 'reverse' || (direction === 'alternate' && isReversed)) {
      // Reverse the animation properties
      for (const key in currentOptions) {
        if (Array.isArray(currentOptions[key])) {
          const [from, to] = currentOptions[key];
          currentOptions[key] = [to, from];
        }
      }
    }

    currentOptions.onComplete = () => {
      currentIteration++;
      
      if (direction === 'alternate') {
        isReversed = !isReversed;
      }
      
      if (currentIteration < iterations && isActive) {
        setTimeout(loop, interval);
      }
    };

    animate(element, currentOptions);
  };

  loop();

  return {
    stop: () => { isActive = false; },
    restart: () => {
      isActive = true;
      currentIteration = 0;
      isReversed = false;
      loop();
    }
  };
}

// Animation sequence/chain
export function animateSequence(
  element: HTMLElement,
  sequence: AnimateOptions[]
) {
  let currentIndex = 0;
  let isActive = true;

  const runNext = () => {
    if (!isActive || currentIndex >= sequence.length) return;

    const currentAnimation = { ...sequence[currentIndex] };
    const originalComplete = currentAnimation.onComplete;

    currentAnimation.onComplete = () => {
      originalComplete?.();
      currentIndex++;
      runNext();
    };

    animate(element, currentAnimation);
  };

  runNext();

  return {
    stop: () => { isActive = false; },
    restart: () => {
      isActive = true;
      currentIndex = 0;
      runNext();
    }
  };
}

// Parallel animations (multiple elements or multiple properties)
export function animateParallel(
  animations: Array<{
    element: HTMLElement;
    options: AnimateOptions;
  }>
) {
  const stopFunctions: Array<() => void> = [];
  let completedCount = 0;
  const totalAnimations = animations.length;
  
  const allComplete = () => {
    completedCount++;
    if (completedCount === totalAnimations) {
      // All animations completed
    }
  };

  animations.forEach(({ element, options }) => {
    const originalComplete = options.onComplete;
    options.onComplete = () => {
      originalComplete?.();
      allComplete();
    };

    const stopFn = animate(element, options);
    stopFunctions.push(stopFn);
  });

  return {
    stop: () => stopFunctions.forEach(stop => stop())
  };
}

// Stagger animations (same animation on multiple elements with delays)
export function animateStagger(
  elements: HTMLElement[],
  options: AnimateOptions,
  staggerDelay: number = 100
) {
  const animations = elements.map((element, index) => ({
    element,
    options: {
      ...options,
      delay: (options.delay || 0) + (index * staggerDelay)
    }
  }));

  return animateParallel(animations);
}

// Timeline animation (complex sequencing)
export class AnimationTimeline {
  private animations: Array<{
    element: HTMLElement;
    options: AnimateOptions;
    startTime: number;
  }> = [];
  
  private isPlaying = false;
  //private startTime = 0;

  add(element: HTMLElement, options: AnimateOptions, startTime: number = 0) {
    this.animations.push({ element, options, startTime });
    return this;
  }

  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    //this.startTime = performance.now();

    this.animations.forEach(({ element, options, startTime }) => {
      const adjustedOptions = {
        ...options,
        delay: (options.delay || 0) + startTime
      };

      animate(element, adjustedOptions);
    });

    return this;
  }

  pause() {
    this.isPlaying = false;
    return this;
  }

  restart() {
    this.isPlaying = false;
    setTimeout(() => this.play(), 10);
    return this;
  }
}

export function createTimeline() {
  return new AnimationTimeline();
}

// Utility functions
export function fadeIn(element: HTMLElement, duration: number = 300) {
  return animate(element, {
    opacity: ['0', '1'],
    duration,
    easing: 'easeOutCubic'
  });
}

export function fadeOut(element: HTMLElement, duration: number = 300) {
  return animate(element, {
    opacity: ['1', '0'],
    duration,
    easing: 'easeOutCubic'
  });
}

export function slideIn(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'down', duration: number = 400) {
  const transforms = {
    up: ['translateY(20px)', 'translateY(0)'],
    down: ['translateY(-20px)', 'translateY(0)'],
    left: ['translateX(20px)', 'translateX(0)'],
    right: ['translateX(-20px)', 'translateX(0)']
  };

  return animate(element, {
    opacity: ['0', '1'],
    transform: transforms[direction],
    duration,
    easing: 'easeOutCubic'
  });
}

export function bounce(element: HTMLElement, intensity: number = 10, duration: number = 600) {
  return animateSequence(element, [
    {
      transform: [`translateY(0)`, `translateY(-${intensity}px)`],
      duration: duration / 4,
      easing: 'easeOutQuart'
    },
    {
      transform: [`translateY(-${intensity}px)`, 'translateY(0)'],
      duration: duration / 4,
      easing: 'easeInQuart'
    },
    {
      transform: ['translateY(0)', `translateY(-${intensity/2}px)`],
      duration: duration / 4,
      easing: 'easeOutQuart'
    },
    {
      transform: [`translateY(-${intensity/2}px)`, 'translateY(0)'],
      duration: duration / 4,
      easing: 'easeInQuart'
    }
  ]);
}

// Export all for easy importing
export default {
  animate,
  animateOnScroll,
  animateOnHover,
  animateOnClick,
  animateLoop,
  animateSequence,
  animateParallel,
  animateStagger,
  createTimeline,
  fadeIn,
  fadeOut,
  slideIn,
  bounce
};

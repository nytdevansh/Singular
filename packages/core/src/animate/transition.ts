
// animate/transitions.ts - Fixed with explicit timeline reference

import { animate } from './core.js';

export interface TransitionOptions {
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface Timeline {
  add: (element: HTMLElement, animation: any, delay?: number) => Timeline;
  play: () => void;
}

export function createTimeline(): Timeline {
  const animations: Array<{ element: HTMLElement; animation: any; delay: number }> = [];

  const timeline = {
    add: (element: HTMLElement, animation: any, delay: number = 0) => {
      animations.push({ element, animation, delay });
      return timeline;  // Fixed: explicit reference instead of 'this'
    },
    play: () => {
      animations.forEach(({ element, animation, delay }) => {
        setTimeout(() => animate(element, animation), delay);
      });
    }
  };

  return timeline;
}

export function transition(element: HTMLElement, options: TransitionOptions) {
  return animate(element, {
    opacity: ['0', '1'],
    transform: ['scale(0.9)', 'scale(1)'],
    duration: options.duration || 300,
    easing: options.easing || 'easeOutCubic',
    delay: options.delay || 0
  });
}

export function when(condition: boolean, options: { enter?: any; exit?: any }) {
  return condition ? options.enter : options.exit;
}


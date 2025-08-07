type EasingFunction = (t: number) => number;
declare const easings: Record<string, EasingFunction>;
interface AnimateOptions {
    [property: string]: [string | number, string | number] | any;
    duration: number;
    easing?: keyof typeof easings | undefined;
    delay?: number;
    onComplete?: () => void;
}
export declare function animate(element: HTMLElement, { duration, easing, delay, onComplete, ...props }: AnimateOptions): () => void;
interface ScrollAnimationOptions extends AnimateOptions {
    once?: boolean;
    threshold?: number;
    rootMargin?: string;
}
export declare function animateOnScroll(element: HTMLElement, options: ScrollAnimationOptions): {
    destroy: () => void;
};
interface HoverAnimationOptions extends AnimateOptions {
    reverseOnLeave?: boolean;
}
export declare function animateOnHover(element: HTMLElement, options: HoverAnimationOptions): {
    destroy: () => void;
};
export declare function animateOnClick(element: HTMLElement, options: AnimateOptions): {
    destroy: () => void;
};
interface LoopAnimationOptions extends AnimateOptions {
    iterations?: number;
    direction?: 'normal' | 'reverse' | 'alternate';
    interval?: number;
}
export declare function animateLoop(element: HTMLElement, options: LoopAnimationOptions): {
    stop: () => void;
    restart: () => void;
};
export declare function animateSequence(element: HTMLElement, sequence: AnimateOptions[]): {
    stop: () => void;
    restart: () => void;
};
export declare function animateParallel(animations: Array<{
    element: HTMLElement;
    options: AnimateOptions;
}>): {
    stop: () => void;
};
export declare function animateStagger(elements: HTMLElement[], options: AnimateOptions, staggerDelay?: number): {
    stop: () => void;
};
export declare class AnimationTimeline {
    private animations;
    private isPlaying;
    add(element: HTMLElement, options: AnimateOptions, startTime?: number): this;
    play(): this | undefined;
    pause(): this;
    restart(): this;
}
export declare function createTimeline(): AnimationTimeline;
export declare function fadeIn(element: HTMLElement, duration?: number): () => void;
export declare function fadeOut(element: HTMLElement, duration?: number): () => void;
export declare function slideIn(element: HTMLElement, direction?: 'up' | 'down' | 'left' | 'right', duration?: number): () => void;
export declare function bounce(element: HTMLElement, intensity?: number, duration?: number): {
    stop: () => void;
    restart: () => void;
};
declare const _default: {
    animate: typeof animate;
    animateOnScroll: typeof animateOnScroll;
    animateOnHover: typeof animateOnHover;
    animateOnClick: typeof animateOnClick;
    animateLoop: typeof animateLoop;
    animateSequence: typeof animateSequence;
    animateParallel: typeof animateParallel;
    animateStagger: typeof animateStagger;
    createTimeline: typeof createTimeline;
    fadeIn: typeof fadeIn;
    fadeOut: typeof fadeOut;
    slideIn: typeof slideIn;
    bounce: typeof bounce;
};
export default _default;
//# sourceMappingURL=animate.d.ts.map
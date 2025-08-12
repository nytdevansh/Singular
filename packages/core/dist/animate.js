const easings = {
    linear: t => t,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeOutQuart: t => 1 - Math.pow(1 - t, 4),
    easeInCubic: t => t * t * t,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
    easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};
// Enhanced transform parsing utilities
function parseTransform(value) {
    const transforms = {};
    const regex = /(\w+)\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
        transforms[match[1]] = match[2];
    }
    return transforms;
}
function combineTransforms(from, to, progress) {
    const fromTransforms = parseTransform(from);
    const toTransforms = parseTransform(to);
    const allKeys = new Set([...Object.keys(fromTransforms), ...Object.keys(toTransforms)]);
    const result = [];
    allKeys.forEach(key => {
        const fromValue = parseFloat(fromTransforms[key] || '0');
        const toValue = parseFloat(toTransforms[key] || '0');
        const currentValue = fromValue + (toValue - fromValue) * progress;
        // Preserve units
        const unit = toTransforms[key]?.replace(/[0-9.-]/g, '') ||
            fromTransforms[key]?.replace(/[0-9.-]/g, '') || '';
        result.push(`${key}(${currentValue}${unit})`);
    });
    return result.join(' ');
}
function getUnit(value) {
    return typeof value === 'string' ? value.replace(/[0-9.-]/g, '') : '';
}
// Core animation function
export function animate(element, { duration, easing = 'linear', delay = 0, onComplete, ...props }) {
    const ease = easings[easing];
    const initialStyles = {};
    const finalStyles = {};
    for (const prop in props) {
        const [from, to] = props[prop];
        if (getUnit(from) !== getUnit(to)) {
            console.warn(`Unit mismatch for "${prop}": "${from}" → "${to}"`);
        }
        if (prop === 'transform') {
            initialStyles[prop] = from;
            finalStyles[prop] = to;
        }
        else {
            initialStyles[prop] = parseFloat(from);
            finalStyles[prop] = parseFloat(to);
        }
    }
    let stopped = false;
    function frame(now, start = performance.now()) {
        if (stopped)
            return;
        const t = Math.min((now - start) / duration, 1);
        const eased = ease(t);
        for (const prop in props) {
            if (prop === 'transform') {
                const value = combineTransforms(initialStyles[prop], finalStyles[prop], eased);
                element.style[prop] = value;
            }
            else {
                const from = initialStyles[prop];
                const to = finalStyles[prop];
                const value = from + (to - from) * eased;
                const unit = getUnit(props[prop][0]);
                element.style[prop] = isNaN(value) ? String(value) : value + unit;
            }
        }
        if (t < 1)
            requestAnimationFrame(n => frame(n, start));
        else
            onComplete?.();
    }
    setTimeout(() => requestAnimationFrame(frame), delay);
    return () => { stopped = true; };
}
export function animateOnScroll(element, options) {
    const { once = true, threshold = 0.5, rootMargin = '0px' } = options;
    const observer = new IntersectionObserver(([entry], obs) => {
        if (entry.isIntersecting) {
            animate(element, options);
            if (once)
                obs.unobserve(element);
        }
    }, { threshold, rootMargin });
    observer.observe(element);
    return {
        destroy: () => observer.disconnect()
    };
}
export function animateOnHover(element, options) {
    const { reverseOnLeave = true, duration, easing = 'linear', ...props } = options;
    const reverse = {};
    for (const key in props) {
        if (Array.isArray(props[key])) {
            const [from, to] = props[key];
            reverse[key] = [to, from];
        }
    }
    reverse.duration = duration;
    reverse.easing = easing;
    const handleMouseEnter = () => {
        animate(element, { duration, easing, ...props });
    };
    const handleMouseLeave = () => {
        if (reverseOnLeave) {
            animate(element, reverse);
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
export function animateOnClick(element, options) {
    const handleClick = () => {
        animate(element, options);
    };
    element.addEventListener('click', handleClick);
    return {
        destroy: () => element.removeEventListener('click', handleClick)
    };
}
export function animateLoop(element, options) {
    const { iterations = Infinity, direction = 'normal', interval = 0, ...animateOptions } = options;
    let currentIteration = 0;
    let isReversed = false;
    let isActive = true;
    const loop = () => {
        if (!isActive || currentIteration >= iterations)
            return;
        const currentOptions = { ...animateOptions };
        if (direction === 'reverse' || (direction === 'alternate' && isReversed)) {
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
export function animateSequence(element, sequence) {
    let currentIndex = 0;
    let isActive = true;
    const runNext = () => {
        if (!isActive || currentIndex >= sequence.length)
            return;
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
// Parallel animations
export function animateParallel(animations) {
    const stopFunctions = [];
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
// Stagger animations
export function animateStagger(elements, options, staggerDelay = 100) {
    const animations = elements.map((element, index) => ({
        element,
        options: {
            ...options,
            delay: (options.delay || 0) + (index * staggerDelay)
        }
    }));
    return animateParallel(animations);
}
// Timeline animation
export class AnimationTimeline {
    constructor() {
        this.animations = [];
        this.isPlaying = false;
    }
    add(element, options, startTime = 0) {
        this.animations.push({ element, options, startTime });
        return this;
    }
    play() {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
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
export function animateMove(element, options) {
    const { x, y, relative = true, ...rest } = options;
    const props = {};
    if (relative) {
        if (x && y) {
            props.transform = [
                `translateX(${x[0]}) translateY(${y[0]})`,
                `translateX(${x[1]}) translateY(${y[1]})`
            ];
        }
        else if (x) {
            props.transform = [`translateX(${x[0]})`, `translateX(${x[1]})`];
        }
        else if (y) {
            props.transform = [`translateY(${y[0]})`, `translateY(${y[1]})`];
        }
    }
    else {
        if (x)
            props.left = x;
        if (y)
            props.top = y;
    }
    return animate(element, {
        ...rest,
        ...props,
        duration: options.duration,
        easing: options.easing ?? 'easeOutCubic',
    });
}
export function animateResize(element, options) {
    const { width, height, scale, scaleX, scaleY, preserveAspectRatio = false, ...rest } = options;
    const props = {};
    if (width)
        props.width = width;
    if (height)
        props.height = height;
    if (scale) {
        props.transform = [`scale(${scale[0]})`, `scale(${scale[1]})`];
    }
    else if (scaleX || scaleY) {
        const currentScaleX = scaleX || [1, 1];
        const currentScaleY = scaleY || [1, 1];
        props.transform = [
            `scaleX(${currentScaleX[0]}) scaleY(${currentScaleY[0]})`,
            `scaleX(${currentScaleX[1]}) scaleY(${currentScaleY[1]})`
        ];
    }
    if (preserveAspectRatio && width && height) {
        const startWidth = parseFloat(String(width[0]));
        const endWidth = parseFloat(String(width[1]));
        const ratio = parseFloat(String(height[0])) / startWidth;
        props.height = [height[0], `${endWidth * ratio}px`];
    }
    return animate(element, {
        ...rest,
        ...props,
        duration: options.duration,
        easing: options.easing ?? 'easeInOutQuad',
    });
}
export function stickToViewport(element, options) {
    const { top, left, right, bottom, offset = 0, zIndex = 1000, onStick, onUnstick, smoothTransition = true, transitionDuration = 200 } = options;
    let isStuck = false;
    let animationId = null;
    const originalStyles = {
        position: element.style.position || 'static',
        top: element.style.top || 'auto',
        left: element.style.left || 'auto',
        right: element.style.right || 'auto',
        bottom: element.style.bottom || 'auto',
        zIndex: element.style.zIndex || 'auto',
        transition: element.style.transition || 'none'
    };
    const initialRect = element.getBoundingClientRect();
    function applyStickStyles() {
        const styles = {
            position: 'fixed',
            zIndex: String(zIndex)
        };
        if (top !== undefined)
            styles.top = `${top}px`;
        if (left !== undefined)
            styles.left = `${left}px`;
        if (right !== undefined)
            styles.right = `${right}px`;
        if (bottom !== undefined)
            styles.bottom = `${bottom}px`;
        if (smoothTransition) {
            styles.transition = `all ${transitionDuration}ms ease-out`;
        }
        Object.assign(element.style, styles);
    }
    function removeStickStyles() {
        if (smoothTransition) {
            element.style.transition = `all ${transitionDuration}ms ease-out`;
            Object.assign(element.style, {
                position: 'absolute',
                top: `${initialRect.top + window.scrollY}px`,
                left: `${initialRect.left}px`
            });
            setTimeout(() => {
                Object.assign(element.style, originalStyles);
            }, transitionDuration);
        }
        else {
            Object.assign(element.style, originalStyles);
        }
    }
    function handleScroll() {
        const scrollY = window.scrollY;
        const shouldStick = scrollY > offset;
        if (shouldStick && !isStuck) {
            applyStickStyles();
            isStuck = true;
            onStick?.();
        }
        else if (!shouldStick && isStuck) {
            removeStickStyles();
            isStuck = false;
            onUnstick?.();
        }
    }
    function throttledScroll() {
        if (animationId)
            return;
        animationId = requestAnimationFrame(() => {
            handleScroll();
            animationId = null;
        });
    }
    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();
    return {
        destroy: () => {
            window.removeEventListener('scroll', throttledScroll);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (isStuck) {
                Object.assign(element.style, originalStyles);
            }
        },
        unstick: () => {
            if (isStuck) {
                removeStickStyles();
                isStuck = false;
                onUnstick?.();
            }
        },
        stick: () => {
            if (!isStuck) {
                applyStickStyles();
                isStuck = true;
                onStick?.();
            }
        }
    };
}
// Utility functions
export function fadeIn(element, duration = 300) {
    return animate(element, {
        opacity: ['0', '1'],
        duration,
        easing: 'easeOutCubic'
    });
}
export function fadeOut(element, duration = 300) {
    return animate(element, {
        opacity: ['1', '0'],
        duration,
        easing: 'easeOutCubic'
    });
}
export function slideIn(element, direction = 'down', duration = 400) {
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
export function bounce(element, intensity = 10, duration = 600) {
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
            transform: ['translateY(0)', `translateY(-${intensity / 2}px)`],
            duration: duration / 4,
            easing: 'easeOutQuart'
        },
        {
            transform: [`translateY(-${intensity / 2}px)`, 'translateY(0)'],
            duration: duration / 4,
            easing: 'easeInQuart'
        }
    ]);
}
// Enhanced utility functions
export function slideFromEdge(element, edge, 
//distance: number = 100,
duration = 500) {
    const transforms = {
        top: ['translateY(-100%)', 'translateY(0)'],
        bottom: ['translateY(100%)', 'translateY(0)'],
        left: ['translateX(-100%)', 'translateX(0)'],
        right: ['translateX(100%)', 'translateX(0)']
    };
    return animate(element, {
        transform: transforms[edge],
        opacity: ['0', '1'],
        duration,
        easing: 'easeOutCubic'
    });
}
export function morphSize(element, fromSize, toSize, duration = 400) {
    return animateResize(element, {
        width: [`${fromSize.width}px`, `${toSize.width}px`],
        height: [`${fromSize.height}px`, `${toSize.height}px`],
        duration,
        easing: 'easeInOutCubic'
    });
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
    animateMove,
    animateResize,
    stickToViewport,
    fadeIn,
    fadeOut,
    slideIn,
    bounce,
    slideFromEdge,
    morphSize
};
//# sourceMappingURL=animate.js.map
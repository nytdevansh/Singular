// === EXISTING ANIMATION FUNCTIONS PRESERVED ===

// Basic animation function (your existing implementation)
export function animate(element: HTMLElement, options: any): Promise<void> {
    return new Promise((resolve) => {
        // Your existing animate function implementation
        const { duration = 300, easing = 'ease', delay = 0, ...props } = options;
        
        // Apply animation
        Object.assign(element.style, {
            transition: `all ${duration}ms ${easing}`,
            transitionDelay: `${delay}ms`
        });
        
        // Apply properties
        Object.keys(props).forEach(prop => {
            if (Array.isArray(props[prop])) {
                element.style[prop] = props[prop][1];
            } else {
                element.style[prop] = props[prop];
            }
        });
        
        setTimeout(() => {
            resolve();
        }, duration + delay);
    });
}

// Existing hover animation function
export function animateOnHover(element: HTMLElement, options: any) {
    const { reverseOnLeave = true, duration, easing = 'ease', ...props } = options;
    const reverse: any = {};

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
    element.addEventListener("mouseleave", handleMouseLeave);

    return {
        destroy: () => {
            element.removeEventListener("mouseenter", handleMouseEnter);
            element.removeEventListener("mouseleave", handleMouseLeave);
        }
    };
}

// Existing move animation function
export function animateMove(element: HTMLElement, options: any) {
    const { x, y, relative = true, ...rest } = options;
    const props: any = {};

    if (relative) {
        if (x && y) {
            props.transform = [
                `translateX(${x[0]}) translateY(${y[0]})`,
                `translateX(${x[1]}) translateY(${y[1]})`
            ];
        } else if (x) {
            props.transform = [`translateX(${x[0]})`, `translateX(${x[1]})`];
        } else if (y) {
            props.transform = [`translateY(${y[0]})`, `translateY(${y[1]})`];
        }
    } else {
        if (x) props.left = x;
        if (y) props.top = y;
    }

    return animate(element, {
        ...rest,
        ...props,
        duration: options.duration,
        easing: options.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
}

// Existing resize animation function
export function animateResize(element: HTMLElement, options: any) {
    const { width, height, scale, scaleX, scaleY, ...rest } = options;
    const props: any = {};

    if (width) props.width = width;
    if (height) props.height = height;

    if (scale) {
        props.transform = [`scale(${scale[0]})`, `scale(${scale[1]})`];
    } else if (scaleX || scaleY) {
        const currentScaleX = scaleX || [1, 1];
        const currentScaleY = scaleY || [1, 1];
        props.transform = [
            `scaleX(${currentScaleX[0]}) scaleY(${currentScaleY[0]})`,
            `scaleX(${currentScaleX[1]}) scaleY(${currentScaleY[1]})`
        ];
    }

    return animate(element, {
        ...rest,
        ...props,
        duration: options.duration,
        easing: options.easing ?? 'ease-in-out',
    });
}

// Existing sticky viewport function
export function stickToViewport(element: HTMLElement, options: any) {
    const { 
        top, left, right, bottom, 
        offset = 0, zIndex = 1000,
        onStick, onUnstick,
        smoothTransition = true,
        transitionDuration = 200
    } = options;

    let isStuck = false;
    let animationId: number | null = null;

    const originalStyles = {
        position: element.style.position || 'static',
        top: element.style.top || 'auto',
        left: element.style.left || 'auto',
        right: element.style.right || 'auto',
        bottom: element.style.bottom || 'auto',
        zIndex: element.style.zIndex || 'auto'
    };

    function handleScroll() {
        const scrollY = window.scrollY;
        const shouldStick = scrollY > offset;

        if (shouldStick && !isStuck) {
            const styles: any = {
                position: 'fixed',
                zIndex: String(zIndex)
            };

            if (top !== undefined) styles.top = `${top}px`;
            if (left !== undefined) styles.left = `${left}px`;
            if (right !== undefined) styles.right = `${right}px`;
            if (bottom !== undefined) styles.bottom = `${bottom}px`;

            if (smoothTransition) {
                styles.transition = `all ${transitionDuration}ms ease-out`;
            }

            Object.assign(element.style, styles);
            isStuck = true;
            onStick?.();
        } else if (!shouldStick && isStuck) {
            if (smoothTransition) {
                element.style.transition = `all ${transitionDuration}ms ease-out`;
                setTimeout(() => {
                    Object.assign(element.style, originalStyles);
                }, transitionDuration);
            } else {
                Object.assign(element.style, originalStyles);
            }
            isStuck = false;
            onUnstick?.();
        }
    }

    function throttledScroll() {
        if (animationId) return;
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
                Object.assign(element.style, originalStyles);
                isStuck = false;
                onUnstick?.();
            }
        },
        stick: () => {
            if (!isStuck) {
                handleScroll();
            }
        }
    };
}

// === NEW STICKY LOGO FUNCTIONS ===

// Enhanced Sticky Logo Function
interface StickyLogoOptions {
  floatingSize?: string;
  position?: { top: string; left: string };
  scrollThreshold?: number;
  fadeThreshold?: number;
  animationDuration?: string;
  zIndex?: string;
  onClick?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  styles?: Partial<CSSStyleDeclaration>;
}

export function stickLogoToCorner(
  originalLogoEl: HTMLElement, 
  options: StickyLogoOptions = {}
) {
  const {
    floatingSize = '50px',
    position = { top: '15px', left: '20px' },
    scrollThreshold = 100,
    fadeThreshold = 0,
    animationDuration = '0.4s',
    zIndex = '1000',
    onClick,
    onShow,
    onHide,
    styles = {}
  } = options;

  // Create floating logo clone
  const floatingLogo = originalLogoEl.cloneNode(true) as HTMLElement;
  floatingLogo.id = 'floating-logo';
  floatingLogo.className = 'floating-logo';

  // Apply base styles
  Object.assign(floatingLogo.style, {
    position: 'fixed',
    top: position.top,
    left: position.left,
    width: floatingSize,
    height: 'auto',
    opacity: '0',
    zIndex,
    transform: 'scale(0.8) translateX(-100px)',
    transition: `all ${animationDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    pointerEvents: 'auto',
    ...styles
  });

  document.body.appendChild(floatingLogo);

  let isVisible = false;
  let animationId: number | null = null;

  // Optimized scroll handler with throttling
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const logoRect = originalLogoEl.getBoundingClientRect();
    const shouldShow = logoRect.bottom < fadeThreshold && scrollY > scrollThreshold;

    if (shouldShow && !isVisible) {
      floatingLogo.style.opacity = '1';
      floatingLogo.style.transform = 'scale(1) translateX(0)';
      isVisible = true;
      onShow?.();
    } else if (!shouldShow && isVisible) {
      floatingLogo.style.opacity = '0';
      floatingLogo.style.transform = 'scale(0.8) translateX(-100px)';
      isVisible = false;
      onHide?.();
    }
  };

  const throttledScrollHandler = () => {
    if (animationId) return;
    animationId = requestAnimationFrame(() => {
      handleScroll();
      animationId = null;
    });
  };

  // Add scroll listener
  window.addEventListener('scroll', throttledScrollHandler, { passive: true });

  // Default click handler (scroll to top)
  const clickHandler = onClick || (() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  floatingLogo.addEventListener('click', clickHandler);

  // Initial check
  handleScroll();

  // Return cleanup function
  return {
    destroy: () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      floatingLogo.removeEventListener('click', clickHandler);
      if (floatingLogo.parentNode) {
        floatingLogo.remove();
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    },
    show: () => {
      floatingLogo.style.opacity = '1';
      floatingLogo.style.transform = 'scale(1) translateX(0)';
      isVisible = true;
    },
    hide: () => {
      floatingLogo.style.opacity = '0';
      floatingLogo.style.transform = 'scale(0.8) translateX(-100px)';
      isVisible = false;
    },
    element: floatingLogo
  };
}

// Enhanced version with more animation options
export function createAdvancedStickyLogo(
  originalLogoEl: HTMLElement,
  options: StickyLogoOptions & {
    enterAnimation?: 'slide' | 'fade' | 'scale' | 'bounce';
    hoverAnimation?: boolean;
    parallaxEffect?: boolean;
  } = {}
) {
  const {
    enterAnimation = 'slide',
    hoverAnimation = true,
    parallaxEffect = false,
    ...baseOptions
  } = options;

  const stickyLogo = stickLogoToCorner(originalLogoEl, baseOptions);

  // Add hover animation
  if (hoverAnimation) {
    animateOnHover(stickyLogo.element, {
      duration: 200,
      transform: ['scale(1)', 'scale(1.1)'],
      boxShadow: [
        '0 4px 20px rgba(0, 0, 0, 0.2)',
        '0 8px 32px rgba(0, 0, 0, 0.3)'
      ],
      reverseOnLeave: true
    });
  }

  // Add parallax effect to original logo
  if (parallaxEffect) {
    const parallaxHandler = () => {
      const scrollY = window.scrollY;
      const parallaxOffset = scrollY * 0.1;
      originalLogoEl.style.transform = `translateY(${parallaxOffset}px)`;
    };

    window.addEventListener('scroll', parallaxHandler, { passive: true });
    
    // Update cleanup
    const originalDestroy = stickyLogo.destroy;
    stickyLogo.destroy = () => {
      originalDestroy();
      window.removeEventListener('scroll', parallaxHandler);
    };
  }

  return stickyLogo;
}

// Export all functions
export { animate, animateOnHover, animateMove, animateResize, stickToViewport };

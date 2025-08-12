// === CORE UTILITY FUNCTIONS - SINGLE RESPONSIBILITY EACH ===

/**
 * Clone an element and prepare it for floating
 */
export function cloneElement(el: HTMLElement, id?: string): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;
  
  // Clear any existing IDs to avoid conflicts
  clone.id = id || `floating-${Date.now()}`;
  clone.className = `${clone.className} floating-clone`;
  
  // Base floating styles
  Object.assign(clone.style, {
    position: 'fixed',
    zIndex: '9999',
    pointerEvents: 'auto',
    userSelect: 'none',
    WebkitUserDrag: 'none'
  });
  
  return clone;
}

/**
 * Position an element at a fixed corner/position
 */
export function setFixedPosition(
  el: HTMLElement, 
  pos: { top?: string; left?: string; right?: string; bottom?: string }
) {
  Object.assign(el.style, {
    top: pos.top || 'auto',
    left: pos.left || 'auto',
    right: pos.right || 'auto',
    bottom: pos.bottom || 'auto'
  });
}

/**
 * Apply shrinking effect with smooth transitions
 */
export function applyShrinkEffect(
  el: HTMLElement, 
  size: string, 
  options: { 
    transition?: string;
    borderRadius?: string;
    padding?: string;
  } = {}
) {
  Object.assign(el.style, {
    width: size,
    height: 'auto',
    transition: options.transition || 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: options.borderRadius || '8px',
    padding: options.padding || '4px',
    transform: 'scale(0.9)',
    opacity: '0'
  });
}

/**
 * Track scroll and show/hide element based on original element visibility
 */
export function showOnScrollOut(
  target: HTMLElement, 
  floating: HTMLElement, 
  options: {
    threshold?: number;
    fadeThreshold?: number;
    onShow?: () => void;
    onHide?: () => void;
  } = {}
) {
  const { threshold = 100, fadeThreshold = 0, onShow, onHide } = options;
  let isVisible = false;
  let rafId: number | null = null;

  const onScroll = () => {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      const scrollY = window.scrollY;
      const shouldShow = rect.bottom < fadeThreshold && scrollY > threshold;

      if (shouldShow && !isVisible) {
        floating.style.opacity = '1';
        floating.style.transform = 'scale(1) translateX(0)';
        isVisible = true;
        onShow?.();
      } else if (!shouldShow && isVisible) {
        floating.style.opacity = '0';
        floating.style.transform = 'scale(0.9) translateX(-20px)';
        isVisible = false;
        onHide?.();
      }
      
      rafId = null;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial check

  return () => {
    window.removeEventListener('scroll', onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/**
 * Add hover scaling effect
 */
export function addHoverEffect(
  el: HTMLElement, 
  options: {
    scale?: number;
    duration?: string;
    easing?: string;
    additionalStyles?: Record<string, [string, string]>;
  } = {}
) {
  const { 
    scale = 1.08, 
    duration = '200ms', 
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    additionalStyles = {}
  } = options;

  const originalTransition = el.style.transition;
  
  const handleMouseEnter = () => {
    el.style.transition = `all ${duration} ${easing}`;
    el.style.transform = el.style.transform.replace(/scale\([\d.]+\)/, '') + ` scale(${scale})`;
    
    // Apply additional hover styles
    Object.entries(additionalStyles).forEach(([prop, [, hoverValue]]) => {
      el.style[prop as any] = hoverValue;
    });
  };

  const handleMouseLeave = () => {
    el.style.transform = el.style.transform.replace(/ ?scale\([\d.]+\)/, '');
    
    // Restore original additional styles
    Object.entries(additionalStyles).forEach(([prop, [originalValue]]) => {
      el.style[prop as any] = originalValue;
    });
  };

  el.addEventListener('mouseenter', handleMouseEnter);
  el.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    el.removeEventListener('mouseenter', handleMouseEnter);
    el.removeEventListener('mouseleave', handleMouseLeave);
    el.style.transition = originalTransition;
  };
}

/**
 * Add subtle parallax movement
 */
export function addParallaxEffect(
  el: HTMLElement, 
  factor: number = 0.05,
  options: { maxOffset?: number } = {}
) {
  const { maxOffset = 50 } = options;
  let rafId: number | null = null;

  const onScroll = () => {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const offset = Math.min(scrollY * factor, maxOffset);
      
      // Preserve existing transforms and add parallax
      const currentTransform = el.style.transform.replace(/translateY\([^)]+\)/, '').trim();
      el.style.transform = `${currentTransform} translateY(${offset}px)`.trim();
      
      rafId = null;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/**
 * Enable click-to-scroll-to-top with animation feedback
 */
export function enableClickToTop(
  el: HTMLElement,
  options: {
    clickAnimation?: boolean;
    animationScale?: number;
    animationDuration?: number;
  } = {}
) {
  const { clickAnimation = true, animationScale = 1.2, animationDuration = 200 } = options;

  const handleClick = () => {
    // Click animation feedback
    if (clickAnimation) {
      const originalTransform = el.style.transform;
      el.style.transition = `transform ${animationDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      el.style.transform = originalTransform.replace(/scale\([^)]+\)/, '') + ` scale(${animationScale})`;
      
      setTimeout(() => {
        el.style.transform = originalTransform;
        setTimeout(() => {
          el.style.transition = '';
        }, animationDuration);
      }, animationDuration);
    }

    // Smooth scroll to top
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  el.addEventListener('click', handleClick);
  el.style.cursor = 'pointer';

  return () => {
    el.removeEventListener('click', handleClick);
  };
}

/**
 * Apply theme-aware styling
 */
export function applyThemedStyles(
  el: HTMLElement,
  theme: 'light' | 'dark' = 'dark'
) {
  const isDark = theme === 'dark';
  
  Object.assign(el.style, {
    background: isDark 
      ? 'rgba(27, 27, 27, 0.9)' 
      : 'rgba(255, 255, 255, 0.95)',
    border: `2px solid ${isDark 
      ? 'rgba(196, 255, 77, 0.2)' 
      : 'rgba(26, 26, 26, 0.2)'}`,
    boxShadow: isDark
      ? '0 4px 20px rgba(196, 255, 77, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)'
      : '0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)'
  });
}

/**
 * Add enhanced visual effects
 */
export function addVisualEffects(
  el: HTMLElement,
  effects: {
    glow?: boolean;
    pulse?: boolean;
    shadow?: boolean;
  } = {}
) {
  const { glow = false, pulse = false, shadow = true } = effects;

  if (glow) {
    el.style.filter = (el.style.filter || '') + ' drop-shadow(0 0 8px rgba(196, 255, 77, 0.4))';
  }

  if (pulse) {
    el.style.animation = (el.style.animation || '') + ' pulse 2s infinite';
  }

  if (shadow) {
    el.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
  }
}

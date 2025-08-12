import { 
  cloneElement, 
  setFixedPosition, 
  applyShrinkEffect, 
  showOnScrollOut, 
  addHoverEffect, 
  addParallaxEffect, 
  enableClickToTop,
  applyThemedStyles,
  addVisualEffects
} from './stickyUtils';

// Configuration interface
export interface StickyLogoOptions {
  // Positioning
  size?: string;
  position?: { top?: string; left?: string; right?: string; bottom?: string };
  
  // Behavior
  threshold?: number;
  fadeThreshold?: number;
  
  // Effects
  hoverEffect?: boolean;
  hoverScale?: number;
  parallax?: boolean;
  parallaxFactor?: number;
  clickToTop?: boolean;
  clickAnimation?: boolean;
  
  // Styling
  theme?: 'light' | 'dark';
  visualEffects?: {
    glow?: boolean;
    pulse?: boolean;
    shadow?: boolean;
  };
  customStyles?: Partial<CSSStyleDeclaration>;
  
  // Callbacks
  onShow?: () => void;
  onHide?: () => void;
  onCreate?: (element: HTMLElement) => void;
}

/**
 * 🧩 MAIN COMPOSER - Combines all utilities into a sticky logo
 */
export function setupStickyLogo(
  originalEl: HTMLElement, 
  options: StickyLogoOptions = {}
): {
  element: HTMLElement;
  show: () => void;
  hide: () => void;
  updateTheme: (theme: 'light' | 'dark') => void;
  destroy: () => void;
} {
  // Default options
  const config = {
    size: '50px',
    position: { top: '15px', left: '20px' },
    threshold: 100,
    fadeThreshold: 0,
    hoverEffect: true,
    hoverScale: 1.08,
    parallax: false,
    parallaxFactor: 0.03,
    clickToTop: true,
    clickAnimation: true,
    theme: 'dark' as const,
    visualEffects: {
      glow: false,
      pulse: false,
      shadow: true
    },
    ...options
  };

  // 🔧 Step 1: Clone and prepare the element
  const floating = cloneElement(originalEl, 'floating-logo-composed');

  // 🎨 Step 2: Apply basic styling and positioning
  applyShrinkEffect(floating, config.size, {
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '8px',
    padding: '4px'
  });
  
  setFixedPosition(floating, config.position);
  applyThemedStyles(floating, config.theme);
  
  if (config.visualEffects) {
    addVisualEffects(floating, config.visualEffects);
  }
  
  // Apply custom styles
  if (config.customStyles) {
    Object.assign(floating.style, config.customStyles);
  }

  // 📍 Step 3: Add to DOM
  document.body.appendChild(floating);

  // 🧹 Cleanup functions collector
  const cleanupFunctions: Array<() => void> = [];

  // 📜 Step 4: Setup scroll-based show/hide behavior
  const scrollCleanup = showOnScrollOut(originalEl, floating, {
    threshold: config.threshold,
    fadeThreshold: config.fadeThreshold,
    onShow: () => {
      console.log('🎯 Sticky logo shown');
      config.onShow?.();
    },
    onHide: () => {
      console.log('👋 Sticky logo hidden');
      config.onHide?.();
    }
  });
  cleanupFunctions.push(scrollCleanup);

  // 🎭 Step 5: Add hover effect
  if (config.hoverEffect) {
    const hoverCleanup = addHoverEffect(floating, {
      scale: config.hoverScale,
      duration: '250ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      additionalStyles: {
        filter: [
          'drop-shadow(0 0 8px rgba(196, 255, 77, 0.3))',
          'drop-shadow(0 0 15px rgba(196, 255, 77, 0.5))'
        ],
        borderColor: [
          config.theme === 'dark' ? 'rgba(196, 255, 77, 0.2)' : 'rgba(26, 26, 26, 0.2)',
          config.theme === 'dark' ? 'rgba(196, 255, 77, 0.5)' : 'rgba(26, 26, 26, 0.4)'
        ]
      }
    });
    cleanupFunctions.push(hoverCleanup);
  }

  // 🏔️ Step 6: Add parallax effect to original element
  if (config.parallax) {
    const parallaxCleanup = addParallaxEffect(originalEl, config.parallaxFactor, {
      maxOffset: 30
    });
    cleanupFunctions.push(parallaxCleanup);
  }

  // 👆 Step 7: Enable click-to-top
  if (config.clickToTop) {
    const clickCleanup = enableClickToTop(floating, {
      clickAnimation: config.clickAnimation,
      animationScale: 1.2,
      animationDuration: 200
    });
    cleanupFunctions.push(clickCleanup);
  }

  // 🎉 Step 8: Call onCreate callback
  config.onCreate?.(floating);

  // 🔌 Return control interface
  return {
    element: floating,
    
    show: () => {
      floating.style.opacity = '1';
      floating.style.transform = floating.style.transform.replace(/scale\([^)]+\)/, '') + ' scale(1)';
    },
    
    hide: () => {
      floating.style.opacity = '0';
      floating.style.transform = floating.style.transform.replace(/scale\([^)]+\)/, '') + ' scale(0.9)';
    },
    
    updateTheme: (newTheme: 'light' | 'dark') => {
      applyThemedStyles(floating, newTheme);
      config.theme = newTheme;
    },
    
    destroy: () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      if (floating.parentNode) {
        floating.remove();
      }
      console.log('🧹 Sticky logo destroyed');
    }
  };
}

/**
 * 🎛️ ADVANCED COMPOSER - Multiple sticky elements with different behaviors
 */
export function setupMultipleStickyElements(
  elements: Array<{
    element: HTMLElement;
    options: StickyLogoOptions;
  }>
) {
  const instances = elements.map(({ element, options }) => 
    setupStickyLogo(element, options)
  );

  return {
    instances,
    updateAllThemes: (theme: 'light' | 'dark') => {
      instances.forEach(instance => instance.updateTheme(theme));
    },
    destroyAll: () => {
      instances.forEach(instance => instance.destroy());
    }
  };
}

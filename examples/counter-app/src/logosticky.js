import { createAdvancedStickyLogo } from '../../../packages/core/src/animate';
export class StickyLogoManager {
    constructor() {
        this.cleanupFunctions = [];
        this.activeStickyLogos = new Map();
    }
    initializeStickyLogo(logoSelector, options = {}) {
        const logoEl = document.querySelector(logoSelector);
        if (!logoEl) {
            console.warn(`Logo element not found: ${logoSelector}`);
            return null;
        }
        // Destroy existing sticky logo for this selector
        if (this.activeStickyLogos.has(logoSelector)) {
            this.activeStickyLogos.get(logoSelector).destroy();
        }
        const stickyLogo = createAdvancedStickyLogo(logoEl, {
            floatingSize: '45px',
            position: { top: '15px', left: '20px' },
            scrollThreshold: 100,
            hoverAnimation: true,
            parallaxEffect: true,
            styles: {
                borderRadius: '8px',
                border: '2px solid rgba(196, 255, 77, 0.2)',
                background: 'rgba(27, 27, 27, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '4px'
            },
            onShow: () => console.log('Sticky logo shown'),
            onHide: () => console.log('Sticky logo hidden'),
            ...options
        });
        this.activeStickyLogos.set(logoSelector, stickyLogo);
        this.cleanupFunctions.push(stickyLogo.destroy);
        return stickyLogo;
    }
    getStickyLogo(logoSelector) {
        return this.activeStickyLogos.get(logoSelector);
    }
    destroyStickyLogo(logoSelector) {
        const stickyLogo = this.activeStickyLogos.get(logoSelector);
        if (stickyLogo) {
            stickyLogo.destroy();
            this.activeStickyLogos.delete(logoSelector);
        }
    }
    destroyAll() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        this.activeStickyLogos.clear();
    }
    updateTheme(theme) {
        this.activeStickyLogos.forEach(stickyLogo => {
            const isDark = theme === 'dark';
            const element = stickyLogo.element;
            if (element) {
                element.style.background = isDark
                    ? 'rgba(27, 27, 27, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)';
                element.style.borderColor = isDark
                    ? 'rgba(196, 255, 77, 0.2)'
                    : 'rgba(26, 26, 26, 0.2)';
                element.style.boxShadow = isDark
                    ? '0 4px 20px rgba(196, 255, 77, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.2)';
            }
        });
    }
}
export const stickyLogoManager = new StickyLogoManager();
//# sourceMappingURL=logosticky.js.map
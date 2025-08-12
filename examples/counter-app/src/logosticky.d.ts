export declare class StickyLogoManager {
    private cleanupFunctions;
    private activeStickyLogos;
    initializeStickyLogo(logoSelector: string, options?: any): any;
    getStickyLogo(logoSelector: string): any;
    destroyStickyLogo(logoSelector: string): void;
    destroyAll(): void;
    updateTheme(theme: 'light' | 'dark'): void;
}
export declare const stickyLogoManager: StickyLogoManager;
//# sourceMappingURL=logosticky.d.ts.map
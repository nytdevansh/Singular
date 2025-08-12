export declare function greet(name: string): string;
export { createElement, Fragment } from './createElement';
export { render } from './render';
export { animate, animateOnScroll, animateOnHover, animateOnClick, animateLoop, animateSequence, animateParallel, animateStagger, createTimeline, animateMove, animateResize, stickToViewport, fadeIn, fadeOut, slideIn, bounce, slideFromEdge, morphSize } from './animate';
export { useState, effect, computed, batch } from './reactivity';
export { component, memo, createContext, createPortal, Show, For, type ComponentFn } from './component';
export { Router, Link, router, navigation, type Route, type RouteGuard, type RouteMatch } from './router';
export { createStore, derived, writable, readable, createActions, persist, appStore, appActions, applyMiddleware, logger, connectDevTools, type Store } from './store';
export declare const VERSION = "1.0.0-alpha";
export declare const dev: {
    enableReactiveDebugging(): void;
    startPerformanceMonitoring(): void;
    inspectComponents(): void;
};
export declare const Singular: {
    version: string;
    plugins: any[];
    use(plugin: any): void;
    config: {
        devMode: boolean;
        strict: boolean;
        warnOnUnhandledEffects: boolean;
    };
};
//# sourceMappingURL=index.d.ts.map
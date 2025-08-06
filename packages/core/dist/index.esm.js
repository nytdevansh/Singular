// Core Reactivity System for Singular
// Inspired by SolidJS and Svelte's reactive primitives
// Global tracking context
let currentEffect = null;
const effectStack = [];
// Dependency tracking
class ReactiveNode {
    constructor() {
        this.subscribers = new Set();
        this.dependencies = new Set();
    }
    subscribe(effect) {
        this.subscribers.add(effect);
    }
    unsubscribe(effect) {
        this.subscribers.delete(effect);
    }
    notify() {
        this.subscribers.forEach(effect => {
            if (!effectStack.includes(effect)) {
                runEffect(effect);
            }
        });
    }
    track() {
        if (currentEffect) {
            this.subscribe(currentEffect);
        }
    }
    cleanup() {
        this.dependencies.forEach(dep => dep.unsubscribe(currentEffect));
        this.dependencies.clear();
    }
}
function runEffect(effect) {
    if (effectStack.includes(effect))
        return; // Prevent infinite loops
    const prevEffect = currentEffect;
    currentEffect = effect;
    effectStack.push(effect);
    try {
        effect();
    }
    finally {
        effectStack.pop();
        currentEffect = prevEffect;
    }
}
// Create a reactive signal
function useState(initialValue) {
    const node = new ReactiveNode();
    let value = initialValue;
    const getter = () => {
        node.track();
        return value;
    };
    const setter = (newValue) => {
        if (value !== newValue) {
            value = newValue;
            node.notify();
        }
        return value;
    };
    return [getter, setter];
}
// Create a computed value
function computed(fn) {
    const node = new ReactiveNode();
    let value;
    let isStale = true;
    const computedFn = () => {
        if (isStale) {
            const prevEffect = currentEffect;
            currentEffect = () => {
                isStale = true;
                node.notify();
            };
            try {
                value = fn();
                isStale = false;
            }
            finally {
                currentEffect = prevEffect;
            }
        }
        node.track();
        return value;
    };
    return computedFn;
}
// Create an effect that runs when dependencies change
function effect(fn) {
    const cleanup = () => {
        // Cleanup logic if needed
    };
    runEffect(fn);
    return cleanup;
}
// Batch multiple updates
function batch(fn) {
    const prevStack = [...effectStack];
    effectStack.length = 0;
    try {
        fn();
    }
    finally {
        const effects = [...new Set(effectStack)];
        effectStack.length = 0;
        effectStack.push(...prevStack);
        effects.forEach(runEffect);
    }
}

function createElement(type, props, ...children) {
    const el = document.createElement(type);
    // Handle props
    if (props) {
        for (const [key, value] of Object.entries(props)) {
            if (key.startsWith('on') && typeof value === 'function') {
                // Event listeners
                const eventName = key.slice(2).toLowerCase();
                el.addEventListener(eventName, value);
            }
            else if (key === 'ref' && typeof value === 'function') {
                // Ref callback
                value(el);
            }
            else if (key === 'style' && typeof value === 'object') {
                // Style object
                Object.assign(el.style, value);
            }
            else if (key === 'className' || key === 'class') {
                // Class handling
                if (typeof value === 'function') {
                    // Reactive class
                    effect(() => {
                        el.className = String(value());
                    });
                }
                else {
                    el.className = String(value);
                }
            }
            else {
                // Regular attributes
                if (typeof value === 'function') {
                    // Reactive attribute
                    effect(() => {
                        const attrValue = value();
                        if (attrValue != null) {
                            el.setAttribute(key, String(attrValue));
                        }
                        else {
                            el.removeAttribute(key);
                        }
                    });
                }
                else if (value != null) {
                    el.setAttribute(key, String(value));
                }
            }
        }
    }
    // Handle children
    children.flat(10).forEach(child => insertChild(el, child));
    return el;
}
function appendChildren(parent, children) {
    for (const child of children) {
        if (child == null || child === false) {
            // Skip null, undefined, false
            continue;
        }
        if (typeof child === 'function') {
            // Reactive child
            let currentNode = null;
            effect(() => {
                const newValue = child();
                const newNode = createChildNode(newValue);
                if (currentNode) {
                    parent.replaceChild(newNode, currentNode);
                }
                else {
                    parent.appendChild(newNode);
                }
                currentNode = newNode;
            });
        }
        else {
            // Static child
            parent.appendChild(createChildNode(child));
        }
    }
}
function createChildNode(child) {
    if (child instanceof HTMLElement) {
        return child;
    }
    if (Array.isArray(child)) {
        // Fragment-like behavior
        const fragment = document.createDocumentFragment();
        child.forEach(c => fragment.appendChild(createChildNode(c)));
        // Return a placeholder text node since we can't return DocumentFragment
        const placeholder = document.createTextNode('');
        fragment.appendChild(placeholder);
        return placeholder;
    }
    return document.createTextNode(String(child));
}
// Fragment component for multiple children without wrapper
function Fragment(props) {
    const fragment = document.createDocumentFragment();
    appendChildren(fragment, props.children);
    return fragment;
}
function insertChild(parent, child) {
    if (typeof child === 'function') {
        const _text = document.createTextNode(String(child()));
        parent.appendChild(_text);
        effect(() => {
            _text.textContent = String(child());
        });
    }
    else if (typeof child === "string" || typeof child === "number") {
        parent.appendChild(document.createTextNode(String(child)));
    }
    else if (Array.isArray(child)) {
        child.forEach(nested => {
            insertChild(parent, nested);
        });
    }
    else if (child instanceof Node) {
        parent.appendChild(child);
    }
    else if (child != null) {
        parent.appendChild(document.createTextNode(String(child)));
    }
}

function render(content, container) {
    container.innerHTML = '';
    if (typeof content === 'string') {
        container.innerHTML = content;
    }
    else {
        container.appendChild(content);
    }
}

const contextMap = new Map();
function createContext(defaultValue) {
    const context = {
        defaultValue,
        Provider: ({ value, children }) => {
            // Set context value
            const contextValue = typeof value === 'function' ? value : () => value;
            contextMap.set(context, contextValue);
            // Create container
            const container = createElement('div', { 'data-context': 'provider' });
            // Render children
            children.forEach(child => {
                if (typeof child === 'function') {
                    container.appendChild(child());
                }
                else if (child instanceof HTMLElement) {
                    container.appendChild(child);
                }
                else {
                    container.appendChild(createElement('span', {}, String(child)));
                }
            });
            return container;
        },
        Consumer: () => {
            const contextValue = contextMap.get(context);
            return contextValue || (() => defaultValue);
        }
    };
    return context;
}
// Component wrapper with props validation and memoization
function component(fn) {
    return (props) => {
        return fn(props);
    };
}
// Memoization wrapper
function memo(fn, areEqual) {
    let lastProps;
    let lastResult;
    return (props) => {
        const shouldUpdate = areEqual
            ? !areEqual(lastProps, props)
            : JSON.stringify(lastProps) !== JSON.stringify(props);
        if (!lastResult || shouldUpdate) {
            lastProps = props;
            lastResult = fn(props);
        }
        return lastResult;
    };
}
// Portal for rendering outside the normal tree
function createPortal(children, container) {
    const portal = createElement('div', { 'data-portal': 'true' });
    // Clear target container and append children
    container.innerHTML = '';
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'function') {
                container.appendChild(child());
            }
            else if (child instanceof HTMLElement) {
                container.appendChild(child);
            }
            else {
                container.appendChild(document.createTextNode(String(child)));
            }
        });
    }
    return portal; // Return placeholder in normal tree
}
// Show component for conditional rendering
function Show(props) {
    const container = createElement('div', { 'data-show': 'container' });
    let currentElement = null;
    // Make when reactive if it's not already
    const condition = typeof props.when === 'function'
        ? props.when
        : (() => props.when);
    effect(() => {
        const shouldShow = Boolean(condition());
        // Remove current element
        if (currentElement) {
            container.removeChild(currentElement);
            currentElement = null;
        }
        // Add new element based on condition
        if (shouldShow) {
            const childResult = props.children();
            if (childResult instanceof HTMLElement) {
                currentElement = childResult;
            }
            else {
                currentElement = createElement('span', {}, String(childResult));
            }
        }
        else if (props.fallback) {
            const fallbackResult = props.fallback();
            if (fallbackResult instanceof HTMLElement) {
                currentElement = fallbackResult;
            }
            else {
                currentElement = createElement('span', {}, String(fallbackResult));
            }
        }
        if (currentElement) {
            container.appendChild(currentElement);
        }
    });
    return container;
}
// For component for list rendering with keyed reconciliation
function For(props) {
    const container = createElement('div', { 'data-for': 'container' });
    const renderedItems = new Map();
    // Make each reactive if it's not already
    const items = typeof props.each === 'function'
        ? props.each
        : (() => props.each);
    effect(() => {
        const currentItems = items();
        const newRenderedItems = new Map();
        // Clear container
        container.innerHTML = '';
        currentItems.forEach((item, index) => {
            // Generate key
            const key = props.key
                ? props.key(item, index)
                : index;
            // Check if we can reuse existing element
            let element = renderedItems.get(key);
            if (!element) {
                // Create new element
                const indexSignal = computed(() => {
                    const currentItems = items();
                    return currentItems.indexOf(item);
                });
                const childResult = props.children(item, indexSignal);
                if (childResult instanceof HTMLElement) {
                    element = childResult;
                }
                else {
                    element = createElement('div', { 'data-for-item': String(key) }, String(childResult));
                }
            }
            newRenderedItems.set(key, element);
            container.appendChild(element);
        });
        // Update rendered items map
        renderedItems.clear();
        newRenderedItems.forEach((element, key) => {
            renderedItems.set(key, element);
        });
    });
    return container;
}

class SingularRouter {
    constructor() {
        this.routes = [];
        this.guards = [];
        // Initialize reactive state
        const [currentRoute, setCurrentRoute] = useState(null);
        this.currentRoute = currentRoute;
        this.setCurrentRoute = setCurrentRoute;
        // Listen to browser navigation
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname + window.location.search + window.location.hash);
        });
        // Initialize with current URL
        this.navigate(window.location.pathname + window.location.search + window.location.hash);
    }
    // Add routes
    addRoutes(routes) {
        this.routes.push(...routes);
    }
    // Add global guard
    addGuard(guard) {
        this.guards.push(guard);
    }
    // Navigate to a route
    async navigate(path, replace = false) {
        const match = this.matchRoute(path);
        if (!match) {
            console.warn(`No route found for path: ${path}`);
            return false;
        }
        // Run guards
        const canNavigate = await this.runGuards(match, this.currentRoute());
        if (!canNavigate) {
            return false;
        }
        // Update browser history
        if (replace) {
            window.history.replaceState(null, '', path);
        }
        else {
            window.history.pushState(null, '', path);
        }
        // Update current route
        this.setCurrentRoute(match);
        return true;
    }
    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }
    // Match path to route
    matchRoute(path) {
        const url = new URL(path, window.location.origin);
        const pathname = url.pathname;
        const query = Object.fromEntries(url.searchParams);
        const hash = url.hash;
        for (const route of this.routes) {
            const match = this.matchPath(pathname, route.path);
            if (match) {
                return {
                    path: pathname,
                    params: match,
                    query,
                    hash
                };
            }
        }
        return null;
    }
    // Match path pattern with params
    matchPath(path, pattern) {
        const pathSegments = path.split('/').filter(Boolean);
        const patternSegments = pattern.split('/').filter(Boolean);
        if (pathSegments.length !== patternSegments.length) {
            return null;
        }
        const params = {};
        for (let i = 0; i < patternSegments.length; i++) {
            const patternSegment = patternSegments[i];
            const pathSegment = pathSegments[i];
            if (patternSegment.startsWith(':')) {
                // Dynamic parameter
                const paramName = patternSegment.slice(1);
                params[paramName] = pathSegment;
            }
            else if (patternSegment !== pathSegment) {
                // Static segment doesn't match
                return null;
            }
        }
        return params;
    }
    // Run route guards
    async runGuards(to, from) {
        // Run global guards
        for (const guard of this.guards) {
            const canProceed = await guard(to, from);
            if (!canProceed)
                return false;
        }
        // Find matching route and run its guards
        const route = this.routes.find(r => this.matchPath(to.path, r.path));
        if (route?.guards) {
            for (const guard of route.guards) {
                const canProceed = await guard(to, from);
                if (!canProceed)
                    return false;
            }
        }
        return true;
    }
}
// Global router instance
const router = new SingularRouter();
// Router component
function Router(props) {
    router.addRoutes(props.routes);
    const container = document.createElement('div');
    container.setAttribute('data-router', 'true');
    effect(() => {
        const currentRoute = router.getCurrentRoute()();
        // Clear container
        container.innerHTML = '';
        if (currentRoute) {
            const route = props.routes.find(r => router['matchPath'](currentRoute.path, r.path));
            if (route) {
                const component = route.component({
                    route: currentRoute,
                    params: currentRoute.params,
                    query: currentRoute.query
                });
                container.appendChild(component);
            }
            else if (props.fallback) {
                container.appendChild(props.fallback({}));
            }
        }
        else if (props.fallback) {
            container.appendChild(props.fallback({}));
        }
    });
    return container;
}
// Link component for navigation
function Link(props) {
    const link = document.createElement('a');
    link.href = props.to;
    if (props.className) {
        link.className = props.className;
    }
    // Append children
    props.children.forEach(child => {
        if (typeof child === 'string') {
            link.appendChild(document.createTextNode(child));
        }
        else if (child instanceof Node) {
            link.appendChild(child);
        }
    });
    // Handle click
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (props.onClick) {
            props.onClick(e);
        }
        router.navigate(props.to, props.replace);
    });
    return link;
}
// Navigation helpers
const navigation = {
    push: (path) => router.navigate(path, false),
    replace: (path) => router.navigate(path, true),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    getCurrentRoute: () => router.getCurrentRoute()
};

// Create a global store
function createStore(initialValue) {
    const [state, setState] = useState(initialValue);
    const subscribers = new Set();
    const initialState = initialValue;
    // Subscribe to state changes and notify subscribers
    effect(() => {
        const currentValue = state();
        subscribers.forEach(fn => fn(currentValue));
    });
    const store = (() => state());
    store.set = (value) => {
        setState(value);
    };
    store.update = (updater) => {
        setState(updater(state()));
    };
    store.subscribe = (fn) => {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
    };
    store.reset = () => {
        setState(initialState);
    };
    return store;
}
// Create a computed store derived from other stores
// Create a computed store derived from other stores
function derived(stores, fn) {
    return computed(() => {
        const values = stores.map(store => typeof store === 'function' ? store() : store);
        return fn(...values);
    });
}
// Writable store (Svelte-inspired)
function writable(initialValue) {
    return createStore(initialValue);
}
// Readonly store
function readable(value) {
    const [state] = useState(value);
    return state;
}
// Action creator for complex state updates
function createActions(store, actions) {
    const actionHandlers = actions(store.set, store.update, store);
    return { ...actionHandlers, store };
}
// Persistence helpers
function persist(store, key, storage = localStorage) {
    // Try to load from storage
    try {
        const saved = storage.getItem(key);
        if (saved !== null) {
            store.set(JSON.parse(saved));
        }
    }
    catch (e) {
        console.warn(`Failed to load persisted state for key "${key}":`, e);
    }
    // Subscribe to changes and save to storage
    store.subscribe((value) => {
        try {
            storage.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.warn(`Failed to persist state for key "${key}":`, e);
        }
    });
    return store;
}
const initialAppState = {
    user: null,
    theme: 'light',
    loading: false,
    error: null,
    notifications: []
};
const appStore = createStore(initialAppState);
// App store actions
const appActions = createActions(appStore, (set, update) => ({
    setUser(user) {
        update(state => ({ ...state, user }));
    },
    setTheme(theme) {
        update(state => ({ ...state, theme }));
        document.documentElement.setAttribute('data-theme', theme);
    },
    setLoading(loading) {
        update(state => ({ ...state, loading }));
    },
    setError(error) {
        update(state => ({ ...state, error }));
    },
    addNotification(message, type = 'info') {
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            message,
            type
        };
        update(state => ({
            ...state,
            notifications: [...state.notifications, notification]
        }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
    },
    removeNotification(id) {
        update(state => ({
            ...state,
            notifications: state.notifications.filter(n => n.id !== id)
        }));
    },
    reset() {
        set(initialAppState);
    }
}));
function applyMiddleware(store, ...middlewares) {
    const originalSet = store.set;
    store.set = (value) => {
        const action = { type: 'SET', payload: value };
        const chain = middlewares.reduceRight((next, middleware) => middleware(next, action), originalSet);
        chain(value);
    };
    return store;
}
// Logger middleware
const logger = () => (next, action) => (value) => {
    console.group(`Store Action: ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('New Value:', value);
    console.groupEnd();
    next(value);
};
// Dev tools integration (basic)
function connectDevTools(store, name = 'SingularStore') {
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
        const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name });
        store.subscribe((state) => {
            devTools.send({ type: 'STATE_CHANGE' }, state);
        });
        devTools.subscribe((message) => {
            if (message.type === 'DISPATCH' && message.state) {
                try {
                    const state = JSON.parse(message.state);
                    store.set(state);
                }
                catch (e) {
                    console.warn('Failed to parse state from devtools:', e);
                }
            }
        });
    }
    return store;
}

// Core Singular Framework Export
function greet(name) {
    return `Hello, ${name} from Singular Core!`;
}
// Version info
const VERSION = '1.0.0-alpha';
// Development utilities
const dev = {
    // Enable reactive debugging
    enableReactiveDebugging() {
        if (typeof window !== 'undefined') {
            window.__SINGULAR_DEBUG__ = true;
        }
    },
    // Performance monitoring
    startPerformanceMonitoring() {
        console.log('🚀 Singular Performance Monitoring Enabled');
    },
    // Component tree inspector (basic)
    inspectComponents() {
        console.log('📊 Singular Component Inspector - Feature coming soon!');
    }
};
// Framework metadata
const Singular = {
    version: VERSION,
    // Plugin system (placeholder for future)
    plugins: [],
    use(plugin) {
        this.plugins.push(plugin);
        if (typeof plugin.install === 'function') {
            plugin.install();
        }
    },
    // Configuration
    config: {
        devMode: typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production',
        strict: true,
        warnOnUnhandledEffects: true
    }
};

export { For, Fragment, Link, Router, Show, Singular, VERSION, appActions, appStore, applyMiddleware, batch, component, computed, connectDevTools, createActions, createContext, createElement, createPortal, createStore, derived, dev, effect, greet, logger, memo, navigation, persist, readable, render, router, useState, writable };
//# sourceMappingURL=index.esm.js.map

import { createElement } from './createElement';
import { useState, effect, computed } from './reactivity';
const contextMap = new Map();
export function createContext(defaultValue) {
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
export function component(fn) {
    return (props) => {
        return fn(props);
    };
}
// Memoization wrapper
export function memo(fn, areEqual) {
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
export function createPortal(children, container) {
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
export function Show(props) {
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
export function For(props) {
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
// Switch component for multiple conditions
export function Switch(props) {
    const container = createElement('div', { 'data-switch': 'container' });
    effect(() => {
        container.innerHTML = '';
        // Find first matching condition
        const matchingCase = props.children.find(caseProps => {
            const condition = typeof caseProps.when === 'function'
                ? caseProps.when()
                : caseProps.when;
            return Boolean(condition);
        });
        let element;
        if (matchingCase) {
            const result = matchingCase.children();
            element = result instanceof HTMLElement
                ? result
                : createElement('span', {}, String(result));
        }
        else if (props.fallback) {
            const result = props.fallback();
            element = result instanceof HTMLElement
                ? result
                : createElement('span', {}, String(result));
        }
        else {
            element = createElement('span', {});
        }
        container.appendChild(element);
    });
    return container;
}
// ErrorBoundary for error handling
export function ErrorBoundary(props) {
    const container = createElement('div', { 'data-error-boundary': 'true' });
    try {
        props.children.forEach(child => {
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
    catch (error) {
        if (props.onError) {
            props.onError(error);
        }
        const fallbackResult = props.fallback(error);
        const fallbackElement = fallbackResult instanceof HTMLElement
            ? fallbackResult
            : createElement('div', { className: 'error-fallback' }, String(fallbackResult));
        container.appendChild(fallbackElement);
    }
    return container;
}
// Suspense-like component for async operations
export function Suspense(props) {
    const [isLoading, setIsLoading] = useState(false);
    const container = createElement('div', { 'data-suspense': 'true' });
    effect(() => {
        if (isLoading()) {
            container.innerHTML = '';
            const fallbackResult = props.fallback();
            const fallbackElement = fallbackResult instanceof HTMLElement
                ? fallbackResult
                : createElement('div', { className: 'suspense-fallback' }, String(fallbackResult));
            container.appendChild(fallbackElement);
        }
        else {
            container.innerHTML = '';
            props.children.forEach(child => {
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
    });
    // Expose loading state control (could be enhanced with promises)
    container.setLoading = setIsLoading;
    return container;
}
//# sourceMappingURL=component.js.map
import { effect } from './reactivity';
export function createElement(type, props, ...children) {
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
    appendChildren(el, children.flat(10));
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
export function Fragment(props) {
    const fragment = document.createDocumentFragment();
    appendChildren(fragment, props.children);
    return fragment;
}
//# sourceMappingURL=component.js.map
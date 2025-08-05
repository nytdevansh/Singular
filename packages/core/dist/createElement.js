export function createElement(type, props, ...children) {
    const el = document.createElement(type);
    if (props) {
        for (const [key, value] of Object.entries(props)) {
            if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            }
            else {
                el.setAttribute(key, value);
            }
        }
    }
    for (const child of children.flat()) {
        el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return el;
}
//# sourceMappingURL=createElement.js.map
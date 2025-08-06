export function render(content, container) {
    container.innerHTML = '';
    if (typeof content === 'string') {
        container.innerHTML = content;
    }
    else {
        container.appendChild(content);
    }
}
//# sourceMappingURL=render.js.map
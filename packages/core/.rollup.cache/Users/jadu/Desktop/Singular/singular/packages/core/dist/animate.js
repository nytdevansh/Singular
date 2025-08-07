const easings = {
    linear: t => t,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    // add more if needed
};
export function animate(element, { duration, easing = 'linear', ...props }) {
    const start = performance.now();
    const ease = easings[easing];
    const initialStyles = {};
    const finalStyles = {};
    for (const prop in props) {
        const [from, to] = props[prop];
        initialStyles[prop] = parseFloat(from);
        finalStyles[prop] = parseFloat(to);
    }
    function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = ease(t);
        for (const prop in props) {
            const from = initialStyles[prop];
            const to = finalStyles[prop];
            const value = from + (to - from) * eased;
            element.style[prop] = typeof props[prop][0] === 'string'
                ? value + getUnit(props[prop][0])
                : value.toString();
        }
        if (t < 1)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
function getUnit(value) {
    return typeof value === 'string' ? value.replace(/[0-9.]/g, '') : '';
}
//# sourceMappingURL=animate.js.map
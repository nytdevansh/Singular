interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children?: any[];
}

export function render(vnode: VNode | string | number | null, container: HTMLElement): void {
  if (!vnode) return;
  
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    container.appendChild(document.createTextNode(String(vnode)));
    return;
  }

  const el = document.createElement(vnode.type as string);
  
  if (vnode.props) {
    Object.keys(vnode.props).forEach(key => {
      const value = vnode.props[key];
      
      if (key === 'ref' && typeof value === 'function') {
        value(el);
      } else if (key.startsWith('on') && typeof value === 'function') {
        // Fix event listener type
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      } else if (key === 'className') {
        // Fix className type
        el.setAttribute('class', String(value));
      } else if (key !== 'children') {
        // Fix attribute type
        el.setAttribute(key, String(value));
      }
    });
  }

  // Fix children type
  (vnode.children || []).forEach((child: any) => render(child, el));
  container.appendChild(el);
}

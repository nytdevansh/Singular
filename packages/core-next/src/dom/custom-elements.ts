export function registerCustomElement(selector: string, elementClass: CustomElementConstructor): void {
  if (!customElements.get(selector)) {
    customElements.define(selector, elementClass);
  }
}
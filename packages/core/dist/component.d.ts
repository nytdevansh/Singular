type Props = Record<string, any> | null;
type Child = string | number | boolean | HTMLElement | (() => any) | Child[];
export declare function createElement(type: string, props: Props, ...children: Child[]): HTMLElement;
export declare function Fragment(props: {
    children: Child[];
}): DocumentFragment;
export {};
//# sourceMappingURL=component.d.ts.map
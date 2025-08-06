export type ComponentFn<T = {}> = (props: T) => HTMLElement;
interface Context<T> {
    defaultValue: T;
    Provider: ComponentFn<{
        value: T | (() => T);
        children: any[];
    }>;
    Consumer: () => () => T;
}
export declare function createContext<T>(defaultValue: T): Context<T>;
export declare function component<T>(fn: ComponentFn<T>): ComponentFn<T>;
export declare function memo<T>(fn: ComponentFn<T>, areEqual?: (prevProps: T, nextProps: T) => boolean): ComponentFn<T>;
export declare function createPortal(children: any, container: HTMLElement): HTMLElement;
export declare function Show<T>(props: {
    when: T | (() => T);
    children: () => any;
    fallback?: () => any;
}): HTMLElement;
export declare function For<T>(props: {
    each: T[] | (() => T[]);
    children: (item: T, index: () => number) => any;
    key?: (item: T, index: number) => string | number;
}): HTMLElement;
export declare function Switch(props: {
    children: Array<{
        when: any | (() => any);
        children: () => any;
    }>;
    fallback?: () => any;
}): HTMLElement;
export declare function ErrorBoundary(props: {
    children: any[];
    fallback: (error: Error) => any;
    onError?: (error: Error) => void;
}): HTMLElement;
export declare function Suspense(props: {
    children: any[];
    fallback: () => any;
}): HTMLElement;
export {};
//# sourceMappingURL=component.d.ts.map
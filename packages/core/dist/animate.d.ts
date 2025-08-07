type EasingFunction = (t: number) => number;
declare const easings: Record<string, EasingFunction>;
interface AnimateOptions {
    [property: string]: [string | number, string | number] | any;
    duration: number;
    easing?: keyof typeof easings;
}
export declare function animate(element: HTMLElement, { duration, easing, ...props }: AnimateOptions): void;
export {};
//# sourceMappingURL=animate.d.ts.map
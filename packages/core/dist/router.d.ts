import { ComponentFn } from './component';
export interface Route {
    path: string;
    component: ComponentFn<any>;
    children?: Route[];
    guards?: RouteGuard[];
}
export type RouteGuard = (to: RouteMatch, from: RouteMatch | null) => boolean | Promise<boolean>;
export interface RouteMatch {
    path: string;
    params: Record<string, string>;
    query: Record<string, string>;
    hash: string;
}
declare class SingularRouter {
    private routes;
    private currentRoute;
    private setCurrentRoute;
    private guards;
    constructor();
    addRoutes(routes: Route[]): void;
    addGuard(guard: RouteGuard): void;
    navigate(path: string, replace?: boolean): Promise<boolean>;
    getCurrentRoute(): () => RouteMatch | null;
    private matchRoute;
    private matchPath;
    private runGuards;
}
export declare const router: SingularRouter;
export declare function Router(props: {
    routes: Route[];
    fallback?: ComponentFn<{}>;
}): HTMLElement;
export declare function Link(props: {
    to: string;
    replace?: boolean;
    children: any[];
    className?: string;
    onClick?: (e: MouseEvent) => void;
}): HTMLElement;
export declare const navigation: {
    push: (path: string) => Promise<boolean>;
    replace: (path: string) => Promise<boolean>;
    back: () => void;
    forward: () => void;
    getCurrentRoute: () => () => RouteMatch | null;
};
export {};
//# sourceMappingURL=router.d.ts.map
// dev/inspector-stubs.ts
export interface InspectorHooks {
  onComponentMount?: (component: any) => void;
  onComponentUpdate?: (component: any) => void;
  onSignalUpdate?: (signal: any, value: any) => void;
}

let inspectorHooks: InspectorHooks = {};

export function connectInspector(hooks: InspectorHooks) {
  inspectorHooks = hooks;
}

export function notifyComponentMount(component: any) {
  inspectorHooks.onComponentMount?.(component);
}

export function notifyComponentUpdate(component: any) {
  inspectorHooks.onComponentUpdate?.(component);
}

export function notifySignalUpdate(signal: any, value: any) {
  inspectorHooks.onSignalUpdate?.(signal, value);
}

// dev/warnings.ts
export interface DevConfig {
  enableWarnings: boolean;
  warnOnSyncEffect: boolean;
  warnOnStaleRead: boolean;
}

let devConfig: DevConfig = {
  enableWarnings: true,
  warnOnSyncEffect: true,
  warnOnStaleRead: true
};

export function enableWarnings(config: Partial<DevConfig>) {
  Object.assign(devConfig, config);
}

export function warnOnSyncEffect(message: string) {
  if (devConfig.enableWarnings && devConfig.warnOnSyncEffect) {
    console.warn('[Singular] Sync Effect Warning:', message);
  }
}

export function warnOnStaleRead(message: string) {
  if (devConfig.enableWarnings && devConfig.warnOnStaleRead) {
    console.warn('[Singular] Stale Read Warning:', message);
  }
}

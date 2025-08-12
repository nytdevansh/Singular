// router/navigation.ts
export interface NavigationOptions {
  replace?: boolean;
  state?: any;
}

export const navigation = {
  push(path: string, options: NavigationOptions = {}) {
    if (options.replace) {
      window.history.replaceState(options.state, '', path);
    } else {
      window.history.pushState(options.state, '', path);
    }
  },

  replace(path: string, state?: any) {
    this.push(path, { replace: true, state });
  },

  back() {
    window.history.back();
  },

  forward() {
    window.history.forward();
  }
};

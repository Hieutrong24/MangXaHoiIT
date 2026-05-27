const KEY = 'admin_token';

export const tokenStorage = {
  get() {
    return window.localStorage.getItem(KEY);
  },
  set(token) {
    if (token) window.localStorage.setItem(KEY, token);
  },
  clear() {
    window.localStorage.removeItem(KEY);
  },
};

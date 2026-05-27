export const THEME_KEY = "ui.theme.mode";
export const PROFILE_LAYOUT_KEY = "ui.profile.layout";
export const ICON_DENSITY_KEY = "ui.icon.density";
export const UI_PREFERENCES_EVENT = "ui-preferences:changed";

export function readUiPreference(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function writeUiPreference(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore localStorage write failures in private mode or restricted contexts.
  }
}

export function applyThemePreference(mode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  const nextMode = mode === "light" ? "light" : "dark";

  root.classList.toggle("dark", nextMode === "dark");
  root.setAttribute("data-theme", nextMode);
  body?.setAttribute("data-theme", nextMode);
}

export function applyProfileLayoutPreference(layout) {
  if (typeof document === "undefined") return;
  const nextLayout = layout === "stacked" ? "stacked" : "horizontal";
  document.documentElement.setAttribute("data-profile-layout", nextLayout);
}

export function applyIconDensityPreference(density) {
  if (typeof document === "undefined") return;
  const nextDensity = density === "default" ? "default" : "compact";
  document.documentElement.setAttribute("data-icon-density", nextDensity);
}

export function dispatchUiPreferencesChanged(detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(UI_PREFERENCES_EVENT, { detail }));
}

export function applyUiPreferences() {
  const theme = readUiPreference(THEME_KEY, "dark");
  const profileLayout = readUiPreference(PROFILE_LAYOUT_KEY, "horizontal");
  const iconDensity = readUiPreference(ICON_DENSITY_KEY, "compact");

  applyThemePreference(theme);
  applyProfileLayoutPreference(profileLayout);
  applyIconDensityPreference(iconDensity);

  return { theme, profileLayout, iconDensity };
}

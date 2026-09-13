"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return (window.localStorage.getItem(STORAGE_KEY) as Theme | null) ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function subscribeToSystemTheme(onChange: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSystemThemeServerSnapshot(): ResolvedTheme {
  return "dark";
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

/**
 * Home-grown theme system (replaces next-themes): this Next.js version warns
 * whenever a component renders a raw `<script>` tag, which next-themes'
 * internal flash-prevention script triggers. `ThemeScript` below follows the
 * documented workaround (a `text/plain` inert type on the client), and
 * `resolvedTheme` is derived during render — via `useSyncExternalStore` for
 * the "system" case — rather than synced with setState inside an effect.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);
  const systemTheme = React.useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    getSystemThemeServerSnapshot,
  );
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  // Keeps the `dark` class on <html> in sync with resolvedTheme, and
  // re-applies it after React's Strict Mode dev remount clears attributes
  // the inline head script set outside of JSX's control.
  React.useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private browsing, etc.) — theme just won't persist.
    }
  }, []);

  const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/** Sets the `dark` class before first paint. Belongs in the root layout's `<head>`. */
export function ThemeScript() {
  const html = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}")||"${DEFAULT_THEME}";var d=t==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches:t==="dark";document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

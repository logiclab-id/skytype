import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import type { ThemeMode } from "@/types/bundle";

const STORAGE_KEY = "skytype-theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light" || saved === "warm") {
    return saved;
  }
  return "dark";
}

function applyThemeToDocument(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback(
    (nextTheme: ThemeMode, origin?: { x: number; y: number }) => {
      if (nextTheme === theme) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> };
      };

      if (!doc.startViewTransition || reducedMotion) {
        setThemeState(nextTheme);
        return;
      }

      const x = window.innerWidth;
      const y = origin?.y ?? 0;
      const endRadius = Math.hypot(
        window.innerWidth,
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        flushSync(() => {
          applyThemeToDocument(nextTheme);
          setThemeState(nextTheme);
        });
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 680,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    [theme]
  );

  return { theme, setTheme };
}

import { useTheme } from "@/hooks/use-theme";
import type { ThemeMode } from "@/types/bundle";

const THEMES: ReadonlyArray<{ id: ThemeMode; label: string; swatch: string }> = [
  { id: "dark", label: "Dark", swatch: "#141414" },
  { id: "light", label: "Light", swatch: "#ffffff" },
  { id: "warm", label: "Warm", swatch: "#f5efe4" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.22rem 0.35rem",
        borderRadius: "999px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      {THEMES.map((item) => {
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={`${item.label} theme`}
            aria-pressed={active}
            onClick={() => setTheme(item.id)}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              background: item.swatch,
              border: active ? "2px solid var(--accent)" : "1px solid var(--border-strong)",
              cursor: "pointer",
              padding: 0,
              transform: active ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.12s ease, border-color 0.12s ease",
            }}
          />
        );
      })}
    </div>
  );
}

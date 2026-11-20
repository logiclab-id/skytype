import { MarkerSwoosh, SketchUnderline } from "@/components/doodles";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { Tab } from "@/types/bundle";

interface AppHeaderProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  rightAction?: React.ReactNode;
  linkToHome?: boolean;
}

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: "write", label: "Write" },
  { id: "preview", label: "Preview" },
  { id: "docs", label: "Docs" },
];

export function AppHeader({
  activeTab,
  onTabChange,
  rightAction,
  linkToHome = false,
}: AppHeaderProps) {
  const brandStyle: React.CSSProperties = {
    position: "relative",
    fontFamily: "var(--font-hand)",
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1,
    color: "var(--ink)",
    transform: "rotate(-1.5deg)",
    display: "inline-block",
    textDecoration: "none",
  };

  return (
    <header
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "880px",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: "0.8rem",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {linkToHome ? (
        <a href="/" style={brandStyle}>
          Skytype
          <MarkerSwoosh color="var(--marker-warm)" />
        </a>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={brandStyle}>
            Skytype
            <MarkerSwoosh color="var(--marker-warm)" />
          </span>
        </div>
      )}

      {activeTab && onTabChange && (
        <nav style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: isActive ? "var(--ink)" : "var(--ink-muted)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  position: "relative",
                  padding: "0.2rem 0.1rem",
                }}
              >
                {tab.label}
                {isActive && <SketchUnderline className="tab-underline" />}
              </button>
            );
          })}
        </nav>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        {rightAction}
        <ThemeSwitcher />
      </div>
    </header>
  );
}

export function MarkerSwoosh({ color = "var(--marker-warm)" }: { color?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 20"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: "-4px",
        right: "-4px",
        bottom: "1px",
        height: "10px",
        width: "calc(100% + 8px)",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <path
        d="M4 13 Q 48 6, 94 11 T 136 10"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SketchUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M3 8.5C28 3.5 62 3 117 7.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SketchLoopArrow() {
  return (
    <svg width="42" height="26" viewBox="0 0 54 34" fill="none" aria-hidden="true">
      <path
        d="M 4 8 C 18 2, 24 18, 17 20 C 11 22, 13 10, 26 12 C 36 14, 42 22, 46 28"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M 39 26 L 47 29 L 48 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SubtleHandwrittenAccents() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Subtle handwritten note on wide screens (top-right) */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "3%",
          transform: "rotate(5deg)",
          color: "var(--ink-muted)",
          opacity: 0.45,
          fontFamily: "var(--font-hand)",
          fontSize: "1.2rem",
          textAlign: "center",
        }}
      >
        zero history · E2E
        <svg width="86" height="10" viewBox="0 0 86 10" fill="none" style={{ display: "block", margin: "0 auto" }}>
          <path d="M3 6 Q 43 2, 83 6" stroke="var(--marker-accent)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/* Crisp 1.8px stroke icons */
export function IconLock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconSun({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconMoon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function IconBulletList() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="5" cy="7" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="17" r="1" fill="currentColor" />
      <path d="M9.5 7h10M9.5 12h10M9.5 17h10" />
    </svg>
  );
}

export function IconNumberList() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h1.5v4M4 10h2.5M4 15.5c.6-1 2.2-1 2.2.3 0 1-2.2 2-2.2 3h2.4" />
      <path d="M10 7h10M10 12h10M10 17h10" />
    </svg>
  );
}

export function IconQuote() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 8H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2.5v2.5A2.5 2.5 0 0 1 6 20M19.5 8H16a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2.5v2.5A2.5 2.5 0 0 1 16 20" />
    </svg>
  );
}

export function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13.5a4.5 4.5 0 0 0 6.4 0l2.6-2.6a4.5 4.5 0 0 0-6.4-6.4L11 6" />
      <path d="M14 10.5a4.5 4.5 0 0 0-6.4 0L5 13.1a4.5 4.5 0 0 0 6.4 6.4L13 18" />
    </svg>
  );
}

export function IconUndo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

export function IconRedo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
    </svg>
  );
}

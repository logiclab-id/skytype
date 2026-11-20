export function TypelyLogoMark({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        transform: "rotate(-5deg)",
        userSelect: "none",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 17 C8.5 14.5 10.5 12.5 13 12.8 L34 11.8 C36.8 11.6 38.5 13.5 38.2 16.2 L37.2 31.5 C37 34.2 35.2 35.8 32.5 35.8 L12.5 36.2 C9.8 36.2 8.4 34.4 8.6 31.8 Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 15.5 Q 23.5 26.5, 37.5 14.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M20.5 23.2 C20.5 19.8, 26.5 19.8, 26.5 23.2"
          stroke="var(--accent)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <rect
          x="18.8"
          y="23"
          width="9.4"
          height="7.2"
          rx="2"
          stroke="var(--accent)"
          strokeWidth="1.7"
        />
        <circle cx="23.5" cy="26.5" r="1.1" fill="var(--accent)" />
        <path
          d="M41 8 L42.2 11.2 L45.5 12.2 L42.2 13.4 L41 16.5 L39.8 13.4 L36.5 12.2 L39.8 11.2 Z"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M5 10 Q 3 7, 7 5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
      <div
        style={{
          fontFamily: "var(--font-hand)",
          fontSize: "1.22rem",
          lineHeight: 1,
          marginTop: "-4px",
          color: "var(--ink-muted)",
        }}
      >
        sealed in browser
      </div>
      <svg width="102" height="9" viewBox="0 0 102 9" fill="none" style={{ marginTop: "1px" }}>
        <path
          d="M3 6 Q 52 2, 99 6"
          stroke="var(--marker-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

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

export function CornerHandwrittenNotes() {
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

      <div
        style={{
          position: "absolute",
          bottom: "1.35rem",
          right: "1.75rem",
          transform: "rotate(3deg)",
          color: "var(--ink-muted)",
          opacity: 0.62,
          textAlign: "right",
        }}
      >
        <svg width="74" height="34" viewBox="0 0 82 38" fill="none" style={{ marginLeft: "auto", display: "block", marginBottom: "2px" }}>
          <path
            d="M14 6 L16 12 L22 14 L16 16 L14 22 L12 16 L6 14 L12 12 Z"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="36" cy="21" r="7.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="36" cy="21" r="2.2" stroke="var(--accent)" strokeWidth="1.4" />
          <path d="M44 21 H74 M64 21 V28 M71 21 V26" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: "var(--font-hand)", fontSize: "1.22rem", lineHeight: 1.1 }}>
          zero history · client only
        </div>
        <svg width="128" height="10" viewBox="0 0 128 10" fill="none" style={{ marginLeft: "auto", display: "block" }}>
          <path d="M4 7 Q 64 2, 124 6" stroke="var(--marker-warm)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          top: "1.1rem",
          left: "1.5rem",
          opacity: 0.72,
          color: "var(--ink-muted)",
        }}
      >
        <TypelyLogoMark size={44} />
      </div>
    </div>
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

      <div
        style={{
          position: "absolute",
          top: "13%",
          left: "2.5%",
          transform: "rotate(-6deg)",
          color: "var(--ink-muted)",
          opacity: 0.65,
        }}
      >
        <svg width="42" height="40" viewBox="0 0 48 46" fill="none" style={{ marginBottom: "2px" }}>
          <path d="M12 10 Q10 5, 14 2" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M21 9 Q19 4, 23 1" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M8 16 H32 V34 C32 39, 8 39, 8 34 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M32 19 C39 19, 39 30, 32 30" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: "var(--font-hand)", fontSize: "1.35rem", lineHeight: 1.05 }}>
          paste anything →
        </div>
        <svg width="78" height="10" viewBox="0 0 78 10" fill="none">
          <path d="M2 6 Q 38 2, 74 7" stroke="var(--marker-accent)" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "2.8%",
          transform: "rotate(-5deg)",
          color: "var(--ink-muted)",
          opacity: 0.62,
        }}
      >
        <svg width="110" height="52" viewBox="0 0 115 58" fill="none">
          <path
            d="M4 44 C 24 42, 34 26, 48 28 C 60 30, 52 42, 44 38 C 36 34, 54 18, 76 16"
            stroke="var(--accent)"
            strokeWidth="1.7"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          <path
            d="M78 14 L106 6 L90 28 L86 19 Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ fontFamily: "var(--font-hand)", fontSize: "1.3rem", marginTop: "-6px" }}>
          {"{ code + notes }"}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "14%",
          right: "2.8%",
          transform: "rotate(6deg)",
          color: "var(--ink-muted)",
          opacity: 0.65,
          textAlign: "center",
        }}
      >
        <svg width="92" height="56" viewBox="0 0 96 60" fill="none">
          <path
            d="M28 42 L24 22 L38 31 L48 15 L58 31 L72 22 L68 42 Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M14 18 L16 24 L22 26 L16 28 L14 34 L12 28 L6 26 L12 24 Z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="82" cy="18" r="2.3" fill="var(--accent)" />
        </svg>
          <div style={{ fontFamily: "var(--font-hand)", fontSize: "1.35rem", marginTop: "-10px" }}>
            no history!
          </div>
        </div>
      </div>
    );
  }

export function HandwrittenToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.35rem",
        left: "50%",
        transform: "translateX(-50%) rotate(-1deg)",
        zIndex: 60,
        padding: "0.35rem 1.05rem",
        borderRadius: "255px 14px 225px 14px / 14px 225px 14px 255px",
        background: "var(--surface)",
        border: "1.5px solid var(--border-strong)",
        color: "var(--ink)",
        fontFamily: "var(--font-hand)",
        fontSize: "1.22rem",
        fontWeight: 700,
        boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        pointerEvents: "none",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

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


const BUTTON_GUIDE = [
  {
    name: "B  I  S  <>",
    desc: "Format text as Bold, Italic, Strikethrough, or Inline / Block Code.",
  },
  {
    name: "H1  H2  H3",
    desc: "Turn the current line into a Markdown heading (from large title to subheading).",
  },
  {
    name: "Bullet & 1. List",
    desc: "Convert selected lines into a clean list. Automatically continues when pressing Enter.",
  },
  {
    name: "Quote · Link · —",
    desc: "Insert a blockquote (>), hyperlink [text](url), or horizontal divider (---).",
  },
  {
    name: "↶  ↷  (Undo / Redo)",
    desc: "Undo or redo your text changes up to the last 50 steps.",
  },
  {
    name: "Format ▾",
    desc: "Pick a language (JSON, YAML, PHP, TS, Python, etc.) to insert a ```lang code block.",
  },
  {
    name: "Beautify",
    desc: "Automatically tidy up JSON, YAML, HTML, code blocks, and lists across the editor.",
  },
  {
    name: "Clear & Share",
    desc: "Clear resets the editor. Share encrypts your note + Title/Desc in your browser into a Magic Link.",
  },
] as const;

export function DocsView() {
  return (
    <div
      style={{
        padding: "1.6rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        fontSize: "0.88rem",
        lineHeight: 1.6,
      }}
    >

      <div>
        <h2
          style={{
            display: "inline-block",
            fontFamily: "var(--font-hand)",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--ink)",
            lineHeight: 1.05,
          }}
        >
          How Skytype Works
        </h2>
        <p style={{ color: "var(--ink-muted)", marginTop: "0.35rem", fontSize: "0.84rem" }}>
          Zero history E2E encrypted bundler for code snippets, API responses, and notes in one place.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "10px",
          background: "#101010",
          padding: "0.85rem",
        }}
      >
        <svg
          viewBox="0 0 760 320"
          fill="none"
          style={{ width: "100%", height: "auto", display: "block" }}
          aria-label="Annotated handwritten guide of Skytype UI"
        >

          <rect x="135" y="42" width="490" height="210" rx="8" fill="#181818" stroke="#2c2c2c" strokeWidth="1.5" />

          <rect x="135" y="42" width="490" height="32" rx="8" fill="#141414" />
          <line x1="135" y1="74" x2="625" y2="74" stroke="#262626" strokeWidth="1" />

          <text x="152" y="62" fill="#8a8a8a" fontSize="11" fontFamily="monospace">B  I  S  &lt;&gt;  |  H1  H2  |  •  1.  ❞</text>
          <text x="548" y="62" fill="#8a8a8a" fontSize="11" fontFamily="sans-serif">↶  ↷  Preview</text>

          <text x="152" y="96" fill="#6b7280" fontSize="11" fontFamily="monospace">1  # API Response</text>
          <text x="152" y="114" fill="#5c6370" fontSize="11" fontFamily="monospace">2  ```<tspan fill="#82aaff">json</tspan></text>
          <text x="152" y="132" fill="#ededed" fontSize="11" fontFamily="monospace">3  {"{"}</text>
          <text x="152" y="150" fill="#82aaff" fontSize="11" fontFamily="monospace">4    "status"<tspan fill="#ededed">: </tspan><tspan fill="#9ec58a">"ok"</tspan><tspan fill="#ededed">,</tspan></text>
          <text x="152" y="168" fill="#82aaff" fontSize="11" fontFamily="monospace">5    "id"<tspan fill="#ededed">: </tspan><tspan fill="#d9b27c">101</tspan></text>
          <text x="152" y="186" fill="#ededed" fontSize="11" fontFamily="monospace">6  {"}"}</text>
          <text x="152" y="204" fill="#5c6370" fontSize="11" fontFamily="monospace">7  ```</text>

          <line x1="135" y1="218" x2="625" y2="218" stroke="#262626" strokeWidth="1" />
          <rect x="148" y="225" width="66" height="20" rx="5" fill="#181818" stroke="#303030" />
          <text x="157" y="239" fill="#8a8a8a" fontSize="10" fontFamily="sans-serif">Format ▾</text>

          <rect x="496" y="225" width="54" height="20" rx="5" fill="#181818" stroke="#303030" />
          <text x="505" y="239" fill="#8a8a8a" fontSize="10" fontFamily="sans-serif">Beautify</text>
          <rect x="556" y="225" width="44" height="20" rx="5" fill="#181818" stroke="#303030" />
          <text x="566" y="239" fill="#8a8a8a" fontSize="10" fontFamily="sans-serif">Clear</text>

          <rect x="338" y="268" width="84" height="28" rx="7" fill="#0284c7" />
          <text x="364" y="286" fill="#ffffff" fontSize="11" fontWeight="600" fontFamily="sans-serif">Share</text>

          <text x="12" y="26" fill="#d9b27c" fontSize="18" fontFamily="Caveat, cursive" transform="rotate(-4 12 26)">
            1. Markdown &amp; list tools
          </text>
          <path d="M 118 28 Q 160 22, 185 45" stroke="#d9b27c" strokeWidth="1.6" strokeDasharray="4 3" strokeLinecap="round" />
          <path d="M 178 44 L 186 46 L 184 38" stroke="#d9b27c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

          <text x="642" y="128" fill="#9ec58a" fontSize="18" fontFamily="Caveat, cursive" transform="rotate(3 642 128)">
            paste JSON/list
          </text>
          <text x="646" y="148" fill="#9ec58a" fontSize="16" fontFamily="Caveat, cursive" transform="rotate(3 646 148)">
            auto-tidy!
          </text>
          <path d="M 636 135 Q 608 135, 588 145" stroke="#9ec58a" strokeWidth="1.6" strokeDasharray="4 3" strokeLinecap="round" />
          <path d="M 594 139 L 587 146 L 596 148" stroke="#9ec58a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

          <text x="10" y="232" fill="#82aaff" fontSize="18" fontFamily="Caveat, cursive" transform="rotate(-4 10 232)">
            2. Pick language
          </text>
          <text x="20" y="250" fill="#82aaff" fontSize="15" fontFamily="Caveat, cursive" transform="rotate(-4 20 250)">
            (PHP, JSON, TS...)
          </text>
          <path d="M 112 238 Q 130 242, 144 236" stroke="#82aaff" strokeWidth="1.6" strokeDasharray="4 3" strokeLinecap="round" />

          <text x="638" y="246" fill="#b49be8" fontSize="18" fontFamily="Caveat, cursive" transform="rotate(3 638 246)">
            tidy up code!
          </text>
          <path d="M 632 242 Q 580 264, 526 248" stroke="#b49be8" strokeWidth="1.6" strokeDasharray="4 3" strokeLinecap="round" />

          <text x="148" y="287" fill="#38bdf8" fontSize="18" fontFamily="Caveat, cursive" transform="rotate(-2 148 287)">
            3. E2E encrypt + magic link!
          </text>
          <path d="M 308 282 Q 320 280, 331 282" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div>
        <h3 style={{ fontFamily: "var(--font-hand)", fontSize: "1.45rem", color: "var(--ink)", marginBottom: "0.4rem" }}>
          How to Use
        </h3>
        <ol style={{ paddingLeft: "1.2rem", color: "var(--ink-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <li>
            <strong style={{ color: "var(--ink)" }}>Write or Paste:</strong> Type notes or paste API responses, code snippets, or lists from other tools (lists auto-format on paste).
          </li>
          <li>
            <strong style={{ color: "var(--ink)" }}>Format &amp; Preview:</strong> Insert a language block via <code style={{ color: "var(--accent)" }}>Format ▾</code>, clean everything up with <strong style={{ color: "var(--ink)" }}>Beautify</strong>, and check the result in <strong style={{ color: "var(--ink)" }}>Preview</strong>.
          </li>
          <li>
            <strong style={{ color: "var(--ink)" }}>Share Magic Link:</strong> Click <strong style={{ color: "var(--ink)" }}>Share</strong>, fill in <strong style={{ color: "var(--ink)" }}>Title</strong> &amp; <strong style={{ color: "var(--ink)" }}>Description</strong>, and share the link. The decryption key lives only in the URL <code style={{ color: "var(--accent)" }}>#fragment</code>.
          </li>
        </ol>
      </div>

      <div>
        <h3 style={{ fontFamily: "var(--font-hand)", fontSize: "1.45rem", color: "var(--ink)", marginBottom: "0.55rem" }}>
          Button Guide
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "0.6rem",
          }}
        >
          {BUTTON_GUIDE.map((item) => (
            <div
              key={item.name}
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--surface-sub)",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 600, color: "var(--accent)" }}>
                {item.name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "0.2rem" }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          paddingTop: "0.85rem",
          borderTop: "1px solid var(--border)",
          fontSize: "0.78rem",
          color: "var(--ink-muted)",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.35rem",
          alignItems: "center",
        }}
      >
        <span>Built in collaboration by</span>
        <a
          href="https://logiclab.id"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          logiclab.id
        </a>
        <span>&amp;</span>
        <a
          href="https://rizantohannan.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          rizantohannan.com
        </a>
      </div>
    </div>
  );
}


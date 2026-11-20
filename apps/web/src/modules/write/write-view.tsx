import { WriteFooter } from "@/modules/write/write-footer";
import { WriteToolbar } from "@/modules/write/write-toolbar";
import type { useWrite } from "@/modules/write/use-write";

type WriteState = ReturnType<typeof useWrite>;

interface WriteViewProps {
  write: WriteState;
  onPreview: () => void;
}

export function WriteView({ write, onPreview }: WriteViewProps) {
  return (
    <>
      <WriteToolbar
        canUndo={write.canUndo}
        canRedo={write.canRedo}
        onWrapSelection={write.wrapSelection}
        onPrefixLine={write.prefixLine}
        onApplyList={write.applyList}
        onCodeClick={write.handleCodeButton}
        onUndo={write.handleUndo}
        onRedo={write.handleRedo}
        onPreview={onPreview}
      />

      {write.formatError && (
        <div
          style={{
            padding: "0.45rem 1rem",
            background: "var(--danger-bg)",
            borderBottom: "1px solid var(--danger)",
            color: "var(--danger)",
            fontSize: "0.82rem",
          }}
        >
          Format error: {write.formatError}
        </div>
      )}

      <div className="editor-pane">
        <div
          ref={write.gutterRef}
          aria-hidden="true"
          className="editor-gutter"
        >
          {Array.from({ length: write.lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <pre
            ref={write.backdropRef}
            aria-hidden="true"
            className="editor-content"
            style={{
              position: "relative",
              minHeight: "360px",
              margin: 0,
              pointerEvents: "none",
              color: "var(--ink)",
            }}
          >
            {write.highlightedLines}
          </pre>

          <textarea
            ref={write.textareaRef}
            value={write.content}
            onChange={(e) => write.commitContent(e.target.value)}
            onPaste={write.handlePaste}
            onKeyDown={write.handleKeyDown}
            onScroll={write.syncScroll}
            className={`editor-content${write.editorScrolling ? " is-scrolling" : ""}`}
            placeholder="Start writing markdown, code blocks, or notes here..."
            spellCheck={false}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              color: write.content ? "transparent" : "var(--ink)",
              caretColor: "var(--ink)",
            }}
          />
        </div>
      </div>

      <WriteFooter
        onInsertBlock={write.insertFencedBlock}
        onBeautify={write.handleBeautify}
        onClear={write.handleClear}
      />
    </>
  );
}

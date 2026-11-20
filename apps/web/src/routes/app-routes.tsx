import { useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import {
  CornerHandwrittenNotes,
  HandwrittenToast,
  IconLock,
  MarkerSwoosh,
  SketchLoopArrow,
} from "@/components/doodles";
import { DocsView } from "@/modules/docs/docs-view";
import { PreviewView } from "@/modules/preview/preview-view";
import { ShareDialog } from "@/modules/share/share-dialog";
import { SharedViewer } from "@/modules/viewer/shared-viewer";
import { MAX_CHARS, useWrite } from "@/modules/write/use-write";
import { WriteView } from "@/modules/write/write-view";
import { useWorkspaceStore } from "@/stores/workspace-store";

function WorkspaceRoute() {
  const {
    activeTab,
    setActiveTab,
    shareModalOpen,
    setShareModalOpen,
    magicLink,
    setMagicLink,
    toast,
    showToast,
  } = useWorkspaceStore();

  const write = useWrite({
    onShowToast: showToast,
    onClear: () => setMagicLink(null),
  });

  useEffect(() => {
    const titles: Record<typeof activeTab, string> = {
      write: "Skytype",
      preview: "Skytype | Preview",
      docs: "Skytype | Docs",
    };
    document.title = titles[activeTab];
  }, [activeTab]);

  const handleOpenShareModal = () => {
    if (!write.content.trim()) return;
    setMagicLink(null);
    setShareModalOpen(true);
  };

  return (
    <div className={activeTab === "write" ? "app-shell app-shell--write" : "app-shell"}>
      <CornerHandwrittenNotes />

      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "840px",
          width: "100%",
          margin: "1.1rem auto 0",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1 className="sr-only">Skytype</h1>
        {activeTab === "write" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "0.4rem",
              padding: "0 0.2rem",
              fontSize: "0.78rem",
              fontFamily: "var(--font-mono)",
              color: "var(--ink-muted)",
            }}
          >
            {write.content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </div>
        )}

        <section className="clean-card" style={{ display: "flex", flexDirection: "column" }}>
          <div key={activeTab} className="tab-panel-animate" style={{ display: "flex", flexDirection: "column" }}>
            {activeTab === "write" && (
              <WriteView write={write} onPreview={() => setActiveTab("preview")} />
            )}
            {activeTab === "preview" && (
              <PreviewView content={write.content} onShowToast={showToast} />
            )}
            {activeTab === "docs" && <DocsView />}
          </div>
        </section>

        {activeTab !== "docs" && (
          <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <div className="share-loop-hint" style={{ position: "absolute", right: "108%", top: "-6px", display: "flex", alignItems: "center", gap: "0.15rem", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem", transform: "rotate(-5deg)" }}>
                  locked in browser!
                </span>
                <SketchLoopArrow />
              </div>

              <button
                type="button"
                onClick={handleOpenShareModal}
                disabled={write.content.trim().length === 0}
                className="clean-share-btn"
                style={{ opacity: write.content.trim().length === 0 ? 0.55 : 1 }}
              >
                <IconLock size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <ShareDialog
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        content={write.content}
        magicLink={magicLink}
        onMagicLinkCreated={setMagicLink}
        onDone={() => {
          write.handleClear();
          setActiveTab("write");
          window.scrollTo({ top: 0 });
        }}
        onShowToast={showToast}
      />

      {toast && <HandwrittenToast message={toast} />}
    </div>
  );
}

function NotFoundRoute() {
  useEffect(() => {
    document.title = "404 | Skytype";
  }, []);

  return (
    <div className="app-shell">
      <CornerHandwrittenNotes />
      <AppHeader
        linkToHome
        rightAction={
          <a href="/" className="clean-btn" style={{ textDecoration: "none" }}>
            New Bundle
          </a>
        }
      />
      <main style={{ maxWidth: "840px", width: "100%", margin: "1.4rem auto 0" }}>
        <div
          className="clean-card"
          style={{
            padding: "2.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-block",
              fontFamily: "var(--font-hand)",
              fontSize: "3.5rem",
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--ink)",
              transform: "rotate(-2deg)",
            }}
          >
            404
            <MarkerSwoosh color="var(--marker-warm)" />
          </span>
          <h1 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)", marginTop: "0.25rem" }}>
            Page not found
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--ink-muted)", maxWidth: "420px", lineHeight: 1.55 }}>
            This link does not exist or has expired.
          </p>
          <a href="/" className="clean-btn" style={{ marginTop: "0.5rem", textDecoration: "none" }}>
            Write a new note
          </a>
        </div>
      </main>
    </div>
  );
}

export function AppRoutes() {
  const { pathname } = window.location;
  const sharedRouteMatch = pathname.match(/^\/s\/([^/]+)$/);
  if (sharedRouteMatch) {
    return <SharedViewer bundleId={sharedRouteMatch[1]} />;
  }

  if (pathname !== "/" && pathname !== "") {
    return <NotFoundRoute />;
  }

  return <WorkspaceRoute />;
}

import { useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import {
  CornerHandwrittenNotes,
  HandwrittenToast,
  IconLock,
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
    <div
      style={{
        minHeight: "100vh",
        height: activeTab === "write" ? "100vh" : undefined,
        overflow: activeTab === "write" ? "hidden" : undefined,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: activeTab === "write" ? "1rem 1.5rem 1.15rem" : "1rem 1.5rem 2rem",
      }}
    >
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
          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <div style={{ position: "absolute", right: "108%", top: "-6px", display: "flex", alignItems: "center", gap: "0.15rem", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
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
        onShowToast={showToast}
      />

      {toast && <HandwrittenToast message={toast} />}
    </div>
  );
}

export function AppRoutes() {
  const sharedRouteMatch = window.location.pathname.match(/^\/s\/([^/]+)$/);
  if (sharedRouteMatch) {
    return <SharedViewer bundleId={sharedRouteMatch[1]} />;
  }

  return <WorkspaceRoute />;
}

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BundleContent } from "@/components/bundle-content";
import { CornerHandwrittenNotes, HandwrittenToast, MarkerSwoosh } from "@/components/doodles";
import { BundleApiError, fetchEncryptedBundle } from "@/core/bundle-api";
import { decryptBundle } from "@/core/crypto";
import { parseMixedSections } from "@/core/formatters";
import { useToast } from "@/hooks/use-toast";
import type { SharedBundleData } from "@/types/bundle";

interface SharedViewerProps {
  bundleId: string;
}

export function SharedViewer({ bundleId }: SharedViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code?: number; message: string } | null>(null);
  const [data, setData] = useState<SharedBundleData | null>(null);
  const [readerInfo, setReaderInfo] = useState<{ used: number; max: number } | null>(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const prevContent = robotsMeta?.getAttribute("content") ?? null;
    robotsMeta?.setAttribute("content", "noindex, nofollow");
    return () => {
      if (robotsMeta && prevContent !== null) {
        robotsMeta.setAttribute("content", prevContent);
      }
    };
  }, []);

  useEffect(() => {
    const keyFragment = window.location.hash.replace(/^#/, "");
    if (!keyFragment) {
      setError({ code: 404, message: "This link is invalid, expired, or missing its decryption key." });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEncryptedBundle(bundleId)
      .then(async ({ ciphertext, iv, readersUsed, maxReaders }) => {
        const plain = await decryptBundle(ciphertext, iv, keyFragment);
        const parsed = JSON.parse(plain) as Partial<SharedBundleData>;
        if (cancelled) return;

        const title = parsed.title ?? "";
        const description = parsed.description ?? "";
        if (title) document.title = `${title} | Skytype`;
        if (typeof readersUsed === "number" && typeof maxReaders === "number") {
          setReaderInfo({ used: readersUsed, max: maxReaders });
        }
        setData({
          title,
          description,
          content: parsed.content ?? "",
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (err instanceof BundleApiError) {
            setError({ code: err.status, message: err.message });
          } else {
            setError({
              code: 404,
              message: "This link is invalid, expired, or has been corrupted.",
            });
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bundleId]);

  const sections = useMemo(
    () => (data ? parseMixedSections(data.content) : []),
    [data]
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-canvas)]">
        <img
          src="/loading.gif"
          alt="Loading"
          className="h-40 w-40 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <CornerHandwrittenNotes />

      <AppHeader
        linkToHome
        rightAction={
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <a href="/" className="clean-btn" style={{ textDecoration: "none" }}>
              New Bundle
            </a>
          </div>
        }
      />

      <main style={{ maxWidth: "840px", width: "100%", margin: "1.4rem auto 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && (
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
              {error.code ?? "Oops"}
              <MarkerSwoosh color="var(--marker-warm)" />
            </span>

            <h1 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)", marginTop: "0.25rem" }}>
              {error.code === 404
                ? "Bundle expired or not found"
                : error.code === 410
                  ? "Viewer limit reached"
                  : "Unable to open bundle"}
            </h1>

            <p style={{ fontSize: "0.88rem", color: "var(--ink-muted)", maxWidth: "420px", lineHeight: 1.55 }}>
              {error.message}
            </p>

            <a
              href="/"
              className="clean-btn"
              style={{ marginTop: "0.5rem", textDecoration: "none" }}
            >
              Write a new note
            </a>
          </div>
        )}

        {data && (
          <>
            {readerInfo && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "-0.55rem",
                  padding: "0 0.2rem",
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-muted)",
                }}
                title="Unique viewers who have accessed this bundle"
              >
                {readerInfo.used} / {readerInfo.max} viewer
              </div>
            )}

            {(data.title || data.description) && (
              <div className="clean-card" style={{ padding: "1.15rem 1.4rem" }}>
                {data.title && (
                  <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)" }}>
                    {data.title}
                  </h1>
                )}
                {data.description && (
                  <p style={{ marginTop: "0.3rem", fontSize: "0.9rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
                    {data.description}
                  </p>
                )}
              </div>
            )}

            <section
              className="clean-card preview-pad"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.86rem",
                lineHeight: "1.6",
                color: "var(--ink)",
                overflowWrap: "anywhere",
              }}
            >
              <BundleContent
                sections={sections}
                onCopyBlock={(lang) => showToast(`Copied ${lang.toUpperCase()} block`)}
              />
            </section>
          </>
        )}
      </main>

      {toast && <HandwrittenToast message={toast} />}
    </div>
  );
}

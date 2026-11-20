import { IconLock, MarkerSwoosh } from "@/components/doodles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEncryptedBundle } from "@/core/bundle-api";
import { encryptBundle } from "@/core/crypto";
import type { BundlePayload } from "@/types/bundle";
import { useState } from "react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  magicLink: string | null;
  onMagicLinkCreated: (link: string | null) => void;
  onDone: () => void;
  onShowToast: (msg: string) => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  content,
  magicLink,
  onMagicLinkCreated,
  onDone,
  onShowToast,
}: ShareDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxReaders, setMaxReaders] = useState("3");
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDone = () => {
    setTitle("");
    setDescription("");
    setMaxReaders("3");
    setError(null);
    onOpenChange(false);
    onDone();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;
    setSharing(true);
    setError(null);

    try {
      const payload: BundlePayload = {
        version: 1,
        title: title.trim(),
        description: description.trim(),
        content,
      };
      const parsedMaxReaders = Math.min(
        100,
        Math.max(1, Number.parseInt(maxReaders, 10) || 3),
      );
      const encrypted = await encryptBundle(JSON.stringify(payload));
      const data = await createEncryptedBundle({
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        maxReaders: parsedMaxReaders,
      });
      onMagicLinkCreated(
        `${window.location.origin}/s/${data.id}#${encrypted.keyFragment}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create magic link",
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {!magicLink ? (
          <>
            <DialogHeader>
              <DialogTitle>
                <span
                  style={{
                    position: "relative",
                    isolation: "isolate",
                    display: "inline-block",
                    fontFamily: "var(--font-hand)",
                    fontSize: "1.85rem",
                    fontWeight: 700,
                    lineHeight: 1.05,
                  }}
                >
                  Share your note
                  <MarkerSwoosh color="var(--marker-accent)" />
                </span>
              </DialogTitle>
              <DialogDescription>
                Encrypted in your browser before it leaves this page.
                <br />
                Zero history readable up to your unique reader limit.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-col gap-3.5"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="share-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  maxLength={120}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-desc">Description</Label>
                <Textarea
                  id="share-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  maxLength={280}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-max-readers">Max readers</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="share-max-readers"
                    type="number"
                    min={1}
                    max={100}
                    value={maxReaders}
                    onChange={(e) => setMaxReaders(e.target.value)}
                    className="h-8 w-16 px-2.5 text-xs"
                  />
                  {[1, 3, 5, 10].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMaxReaders(String(preset))}
                      className="clean-btn"
                      style={{
                        height: "32px",
                        padding: "0 0.55rem",
                        fontSize: "0.75rem",
                        borderColor:
                          maxReaders === String(preset)
                            ? "var(--accent)"
                            : undefined,
                        color:
                          maxReaders === String(preset)
                            ? "var(--ink)"
                            : undefined,
                      }}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-xs text-[var(--danger)]">
                  {error} (pastikan backend <code>apps/api</code> berjalan &amp;
                  sudah di-restart)
                </div>
              )}

              <div className="mt-1 flex justify-end">
                <Button type="submit" disabled={sharing || !title.trim()}>
                  <IconLock size={14} />
                  <span>Share</span>
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                <span
                  style={{
                    position: "relative",
                    isolation: "isolate",
                    display: "inline-block",
                    fontFamily: "var(--font-hand)",
                    fontSize: "1.85rem",
                    fontWeight: 700,
                    lineHeight: 1.05,
                  }}
                >
                  Magic link ready!
                  <MarkerSwoosh color="var(--marker-warm)" />
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Copy your encrypted magic link.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-sub)] px-3.5 py-3">
              <div className="break-all font-mono text-xs leading-relaxed text-[var(--ink)] select-all">
                {magicLink}
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span
                style={{
                  fontFamily: "var(--font-hand)",
                  fontSize: "1.05rem",
                  color: "var(--ink-muted)",
                  transform: "rotate(-2deg)",
                }}
              >
                key stays in #
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDone}
                >
                  Done
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(magicLink);
                    onShowToast("Magic link copied");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

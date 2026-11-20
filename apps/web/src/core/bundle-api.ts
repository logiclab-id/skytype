import type { EncryptedBundleDto } from "@/types/bundle";

const READER_ID_KEY = "skytype-reader-id";
let fallbackReaderId: string | null = null;

function getReaderToken(): string {
  try {
    const existing = window.localStorage.getItem(READER_ID_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(READER_ID_KEY, created);
    return created;
  } catch {
    if (!fallbackReaderId) fallbackReaderId = crypto.randomUUID();
    return fallbackReaderId;
  }
}

export async function createEncryptedBundle(
  payload: EncryptedBundleDto
): Promise<{ id: string }> {
  const res = await fetch("/api/bundles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API error (${res.status})`);
  }

  return res.json() as Promise<{ id: string }>;
}

export class BundleApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function fetchEncryptedBundle(
  bundleId: string
): Promise<EncryptedBundleDto> {
  const res = await fetch(`/api/bundles/${encodeURIComponent(bundleId)}`, {
    headers: {
      "X-Reader-Token": getReaderToken(),
    },
  });

  if (!res.ok) {
    if (res.status === 410) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new BundleApiError(
        410,
        body?.error ?? "Access limit reached: this bundle has already been read by 3 different users."
      );
    }
    throw new BundleApiError(
      res.status,
      res.status === 404 ? "This bundle has expired or does not exist." : `HTTP ${res.status}`
    );
  }

  return res.json() as Promise<EncryptedBundleDto>;
}

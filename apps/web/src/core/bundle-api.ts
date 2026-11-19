import type { EncryptedBundleDto } from "@/types/bundle";

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

export async function fetchEncryptedBundle(
  bundleId: string
): Promise<EncryptedBundleDto> {
  const res = await fetch(`/api/bundles/${encodeURIComponent(bundleId)}`);

  if (!res.ok) {
    throw new Error(
      res.status === 404 ? "Bundle not found." : `HTTP ${res.status}`
    );
  }

  return res.json() as Promise<EncryptedBundleDto>;
}

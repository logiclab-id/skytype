/**
 * Client-side AES-GCM encryption/decryption using Web Crypto API.
 * Plaintext and keys never leave the browser.
 */

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  keyFragment: string;
}

export async function encryptBundle(plaintext: string): Promise<EncryptedPayload> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));

  return {
    ciphertext: toBase64Url(new Uint8Array(cipherBuffer)),
    iv: toBase64Url(iv),
    keyFragment: toBase64Url(rawKey),
  };
}

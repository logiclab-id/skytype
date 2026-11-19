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

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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

export async function decryptBundle(
  ciphertext: string,
  iv: string,
  keyFragment: string
): Promise<string> {
  const rawKey = fromBase64Url(keyFragment);
  const ivBytes = fromBase64Url(iv);
  const cipherBytes = fromBase64Url(ciphertext);

  const key = await crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes as BufferSource },
    key,
    cipherBytes as BufferSource
  );

  return new TextDecoder().decode(plainBuffer);
}

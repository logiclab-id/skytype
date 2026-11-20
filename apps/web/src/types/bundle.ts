export type Tab = "write" | "preview" | "docs";

export type ThemeMode = "dark" | "light" | "warm";

export interface BundlePayload {
  version: 1;
  title: string;
  description: string;
  content: string;
}

export interface SharedBundleData {
  title: string;
  description: string;
  content: string;
}

export interface EncryptedBundleDto {
  ciphertext: string;
  iv: string;
}

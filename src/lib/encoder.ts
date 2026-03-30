import pako from "pako";

export type TechStack = Record<string, number>;

export type Profile = {
  name?: string;
  githubId?: string;
};

export type SharePayload = {
  stack: TechStack;
  profile?: Profile;
};

export function encode(stack: TechStack): string {
  const json = JSON.stringify(stack);
  const compressed = pako.deflate(json);
  const binary = String.fromCharCode(...compressed);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decode(hash: string): TechStack {
  const base64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = pako.inflate(bytes, { to: "string" });
  return JSON.parse(json);
}

export function encodePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const compressed = pako.deflate(json);
  const binary = String.fromCharCode(...compressed);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePayload(hash: string): SharePayload {
  const base64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = pako.inflate(bytes, { to: "string" });
  const parsed = JSON.parse(json);

  // Backward compat: old hashes encode a plain TechStack (Record<string, number>)
  if (parsed && typeof parsed === "object" && !("stack" in parsed)) {
    return { stack: parsed as TechStack };
  }

  return parsed as SharePayload;
}

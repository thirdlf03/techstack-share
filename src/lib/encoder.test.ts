import { describe, it, expect } from "vitest";
import { encode, decode, encodePayload, decodePayload, type SharePayload } from "./encoder";

describe("encoder", () => {
  it("should encode and decode an empty stack", () => {
    const stack = {};
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should encode and decode a single technology", () => {
    const stack = { aws: 3 };
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should encode and decode multiple technologies", () => {
    const stack = { aws: 3, react: 5, go: 4, docker: 2, python: 1 };
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should produce URL-safe strings", () => {
    const stack = { aws: 3, react: 5, go: 4 };
    const encoded = encode(stack);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("should handle all rating values 1-5", () => {
    const stack = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should produce a compact string for 50 technologies", () => {
    const stack: Record<string, number> = {};
    for (let i = 0; i < 50; i++) {
      stack[`tech${i}`] = (i % 5) + 1;
    }
    const encoded = encode(stack);
    expect(encoded.length).toBeLessThan(300);
    expect(decode(encoded)).toEqual(stack);
  });
});

describe("payload encoder", () => {
  it("should encode and decode payload with profile", () => {
    const payload: SharePayload = {
      stack: { react: 5, ts: 4 },
      profile: { name: "Alice", githubId: "alice" },
    };
    const hash = encodePayload(payload);
    expect(decodePayload(hash)).toEqual(payload);
  });

  it("should encode and decode payload without profile", () => {
    const payload: SharePayload = { stack: { go: 3 } };
    const hash = encodePayload(payload);
    expect(decodePayload(hash)).toEqual(payload);
  });

  it("should decode legacy hash (plain TechStack) as payload", () => {
    const legacyHash = encode({ react: 5 });
    const payload = decodePayload(legacyHash);
    expect(payload.stack).toEqual({ react: 5 });
    expect(payload.profile).toBeUndefined();
  });

  it("should encode payload with name only (no githubId)", () => {
    const payload: SharePayload = {
      stack: { rust: 4 },
      profile: { name: "Bob" },
    };
    const hash = encodePayload(payload);
    expect(decodePayload(hash)).toEqual(payload);
  });

  it("should produce compact binary encoding for large stacks", () => {
    const payload: SharePayload = {
      stack: {
        python: 4,
        go: 3,
        rust: 2,
        cpp: 1,
        elixir: 1,
        swift: 1,
        ts: 3,
        php: 1,
        js: 2,
        react: 3,
        nextjs: 2,
        tailwind: 3,
        vite: 3,
        storybook: 3,
        fastapi: 4,
        bun: 2,
        hono: 3,
        phoenix: 2,
        laravel: 2,
        grpc: 3,
        aws: 3,
        cloudflare: 4,
        gcp: 2,
        vercel: 1,
        pulumi: 2,
        postgresql: 2,
        mysql: 2,
        redis: 1,
        dynamodb: 2,
        kafka: 2,
        supabase: 2,
        terraform: 3,
        githubactions: 4,
        prometheus: 2,
        grafana: 2,
        kubernetes: 2,
        docker: 3,
        argocd: 2,
        helm: 1,
        opentelemetry: 2,
        reactnative: 2,
        flutter: 1,
        expo: 2,
        tauri: 2,
        electron: 1,
        git: 3,
        linux: 2,
        neovim: 3,
        ubuntu: 2,
        wasm: 2,
        webrtc: 3,
        llvm: 1,
        bash: 1,
      },
      profile: { name: "さどるふ", githubId: "thirdlf03" },
    };
    const hash = encodePayload(payload);
    // Old format was 492 chars; new binary should be ~88 chars
    expect(hash.length).toBeLessThan(120);
    expect(hash).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodePayload(hash)).toEqual(payload);
  });

  it("should decode old pako-format hashes (backward compat)", () => {
    // This hash was produced by the old JSON+deflate encoder
    const oldHash =
      "eJxFUjGS2zAM_AtrF7lcKv0gz6AoUMKJIhgQlK25ceFrr84j8oC8yB8JDfgmlVbgAtxd8N1V8WF1w7srhyyU3fDj5GZyw-vJcavihu8nF0pxw8vJQcILssJ6xiiKpCq5LMZ5q9rC4IPoQYaLPIviMZ0xT1rfUUBBFeJjJFr1L_quqKDqGFvWvq6LnpcQZLxoMXn2OyTFM5egBH82NSFRm2KngBkKRXk7cHi0dJ2lpbahVgtVmRnqLxu2HV-IYcKq7OnIfqNp1PLq4-oV1Vb86CuYO2D2kXhTBTPK0sYeAlKuKqIwbSALtPrU7KPPNmdtI3AGATuaKKzAZohnCpOlAGlTMVQgCyTo0_j4n3b2grtJiamJgG0KLoWe6Tc2w703CD-W_aJC9aaEuVmyGWhHc9H6CqRp9ezrZgBGFos7pd0k9RCWDq7qMmKCx4vqkfWvu99-329_7h-f99tf9xXMz-7JyYI8pfjt1V2v_wBoHc6b";
    const payload = decodePayload(oldHash);
    expect(Object.keys(payload.stack).length).toBe(53);
    expect(payload.stack.python).toBe(4);
    expect(payload.profile?.name).toBe("さどるふ");
    expect(payload.profile?.githubId).toBe("thirdlf03");
  });

  it("should handle decode() with new binary format", () => {
    const payload: SharePayload = {
      stack: { react: 5, docker: 3, python: 4 },
      profile: { name: "Test" },
    };
    const hash = encodePayload(payload);
    // decode() returns only stack
    expect(decode(hash)).toEqual(payload.stack);
  });
});

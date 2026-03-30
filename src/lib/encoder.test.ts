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
});

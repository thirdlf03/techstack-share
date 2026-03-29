import { describe, it, expect } from "vitest";
import { encode, decode } from "./encoder";

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

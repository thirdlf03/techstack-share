import pako from "pako";
import { technologies } from "@/data/technologies";

export type TechStack = Record<string, number>;

export type Profile = {
  name?: string;
  githubId?: string;
};

export type SharePayload = {
  stack: TechStack;
  profile?: Profile;
};

/* ---------- tech-index lookup ---------- */

const techIdToIndex = new Map<string, number>();
const indexToTechId: string[] = [];
for (let i = 0; i < technologies.length; i++) {
  techIdToIndex.set(technologies[i].id, i);
  indexToTechId.push(technologies[i].id);
}

const TECH_COUNT = technologies.length;
const BITMAP_BYTES = Math.ceil(TECH_COUNT / 8);

/* ---------- bit helpers ---------- */

function writeBits(data: Uint8Array, offset: number, value: number, bits: number): void {
  for (let i = 0; i < bits; i++) {
    if (value & (1 << (bits - 1 - i))) {
      const byteIdx = Math.floor((offset + i) / 8);
      const bitIdx = 7 - ((offset + i) % 8);
      data[byteIdx] |= 1 << bitIdx;
    }
  }
}

function readBits(data: Uint8Array, offset: number, bits: number): number {
  let value = 0;
  for (let i = 0; i < bits; i++) {
    const byteIdx = Math.floor((offset + i) / 8);
    const bitIdx = 7 - ((offset + i) % 8);
    if (data[byteIdx] & (1 << bitIdx)) {
      value |= 1 << (bits - 1 - i);
    }
  }
  return value;
}

/* ---------- base64url helpers ---------- */

function bytesToBase64url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(hash: string): Uint8Array {
  const base64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/* ---------- binary format v1 ---------- */
/*
 * Byte 0: 0x01 (version)
 * Byte 1: flags  [bit7: hasName, bit6: hasGithubId]
 * Bytes 2..(2+BITMAP_BYTES-1): 162-bit bitmap (selected techs)
 * Next ceil(N*3/8) bytes: 3-bit ratings packed (MSB first, in bitmap order)
 * [if hasName]  1-byte length + UTF-8 name
 * [if hasGithubId] 1-byte length + ASCII githubId
 */

const BINARY_V1 = 0x01;

function encodeBinary(payload: SharePayload): Uint8Array {
  const { stack, profile } = payload;

  // Build bitmap + collect ratings in index order
  const bitmap = new Uint8Array(BITMAP_BYTES);
  const ratings: number[] = [];
  for (let i = 0; i < TECH_COUNT; i++) {
    const rating = stack[indexToTechId[i]];
    if (rating != null && rating >= 1 && rating <= 5) {
      bitmap[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
      ratings.push(rating);
    }
  }

  // Pack 3-bit ratings
  const ratingBitCount = ratings.length * 3;
  const ratingBytes = Math.ceil(ratingBitCount / 8);
  const ratingData = new Uint8Array(ratingBytes);
  let bitOffset = 0;
  for (const r of ratings) {
    writeBits(ratingData, bitOffset, r, 3);
    bitOffset += 3;
  }

  // Profile
  const hasName = Boolean(profile?.name);
  const hasGithubId = Boolean(profile?.githubId);
  const flags = (hasName ? 0x80 : 0) | (hasGithubId ? 0x40 : 0);
  const nameBytes = hasName ? new TextEncoder().encode(profile!.name!) : new Uint8Array(0);
  const githubIdBytes = hasGithubId
    ? new TextEncoder().encode(profile!.githubId!)
    : new Uint8Array(0);

  // Assemble
  const total =
    2 +
    BITMAP_BYTES +
    ratingBytes +
    (hasName ? 1 + nameBytes.length : 0) +
    (hasGithubId ? 1 + githubIdBytes.length : 0);

  const buf = new Uint8Array(total);
  let off = 0;
  buf[off++] = BINARY_V1;
  buf[off++] = flags;
  buf.set(bitmap, off);
  off += BITMAP_BYTES;
  buf.set(ratingData, off);
  off += ratingBytes;
  if (hasName) {
    buf[off++] = nameBytes.length;
    buf.set(nameBytes, off);
    off += nameBytes.length;
  }
  if (hasGithubId) {
    buf[off++] = githubIdBytes.length;
    buf.set(githubIdBytes, off);
    off += githubIdBytes.length;
  }
  return buf;
}

function decodeBinary(bytes: Uint8Array): SharePayload {
  let off = 1; // skip version byte
  const flags = bytes[off++];
  const hasName = Boolean(flags & 0x80);
  const hasGithubId = Boolean(flags & 0x40);

  // Read bitmap
  const bitmap = bytes.slice(off, off + BITMAP_BYTES);
  off += BITMAP_BYTES;

  // Count selected techs
  const selectedIndices: number[] = [];
  for (let i = 0; i < TECH_COUNT; i++) {
    if (bitmap[Math.floor(i / 8)] & (1 << (7 - (i % 8)))) {
      selectedIndices.push(i);
    }
  }

  // Read 3-bit ratings
  const ratingBitCount = selectedIndices.length * 3;
  const ratingByteCount = Math.ceil(ratingBitCount / 8);
  const ratingData = bytes.slice(off, off + ratingByteCount);
  off += ratingByteCount;

  const stack: TechStack = {};
  let bitOff = 0;
  for (const idx of selectedIndices) {
    const rating = readBits(ratingData, bitOff, 3);
    bitOff += 3;
    if (rating >= 1 && rating <= 5) {
      stack[indexToTechId[idx]] = rating;
    }
  }

  // Read profile
  const profile: Profile = {};
  if (hasName) {
    const len = bytes[off++];
    profile.name = new TextDecoder().decode(bytes.slice(off, off + len));
    off += len;
  }
  if (hasGithubId) {
    const len = bytes[off++];
    profile.githubId = new TextDecoder().decode(bytes.slice(off, off + len));
    off += len;
  }

  return {
    stack,
    ...(hasName || hasGithubId ? { profile } : {}),
  };
}

function isBinaryV1(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === BINARY_V1;
}

/* ---------- legacy JSON+deflate (kept for backward compat) ---------- */

/** @deprecated Use encodePayload instead. Kept for backward-compat decoding. */
export function encode(stack: TechStack): string {
  const json = JSON.stringify(stack);
  const compressed = pako.deflate(json);
  return bytesToBase64url(compressed);
}

function decodeLegacyBytes(bytes: Uint8Array): TechStack {
  const json = pako.inflate(bytes, { to: "string" });
  return JSON.parse(json);
}

export function decode(hash: string): TechStack {
  const bytes = base64urlToBytes(hash);
  if (isBinaryV1(bytes)) {
    return decodeBinary(bytes).stack;
  }
  return decodeLegacyBytes(bytes);
}

/* ---------- current payload API ---------- */

export function encodePayload(payload: SharePayload): string {
  return bytesToBase64url(encodeBinary(payload));
}

export function decodePayload(hash: string): SharePayload {
  const bytes = base64urlToBytes(hash);
  if (isBinaryV1(bytes)) {
    return decodeBinary(bytes);
  }

  // Legacy: JSON + deflate
  const json = pako.inflate(bytes, { to: "string" });
  const parsed = JSON.parse(json);
  if (parsed && typeof parsed === "object" && !("stack" in parsed)) {
    return { stack: parsed as TechStack };
  }
  return parsed as SharePayload;
}

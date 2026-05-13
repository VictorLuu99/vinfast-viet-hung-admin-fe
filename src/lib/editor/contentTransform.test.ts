import { describe, it, expect } from "vitest";
import {
  serializeBlocks,
  deserializeBlocks,
  isLegacyHtml,
} from "./contentTransform";

describe("serializeBlocks", () => {
  it("returns null for empty array", () => {
    expect(serializeBlocks([])).toBeNull();
  });

  it("returns null for null input", () => {
    expect(serializeBlocks(null as any)).toBeNull();
  });

  it("returns JSON string for non-empty blocks", () => {
    const blocks = [{ id: "1", type: "paragraph", props: {}, content: [], children: [] }] as any;
    const result = serializeBlocks(blocks);
    expect(typeof result).toBe("string");
    expect(JSON.parse(result!)).toHaveLength(1);
  });
});

describe("deserializeBlocks", () => {
  it("returns null for null input", () => {
    expect(deserializeBlocks(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(deserializeBlocks("")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(deserializeBlocks("not json")).toBeNull();
  });

  it("returns null for JSON that is not an array", () => {
    expect(deserializeBlocks('{"foo":"bar"}')).toBeNull();
  });

  it("parses valid array JSON", () => {
    const result = deserializeBlocks('[{"id":"1","type":"paragraph"}]');
    expect(result).toHaveLength(1);
    expect(result![0].type).toBe("paragraph");
  });
});

describe("isLegacyHtml", () => {
  it("returns true when blocks is null/empty and html exists", () => {
    expect(isLegacyHtml({ blocks: null, html: "<p>x</p>" })).toBe(true);
    expect(isLegacyHtml({ blocks: [], html: "<p>x</p>" })).toBe(true);
  });

  it("returns false when blocks exist", () => {
    expect(isLegacyHtml({ blocks: [{ id: "1" } as any], html: "<p>x</p>" })).toBe(false);
  });

  it("returns false when html is empty", () => {
    expect(isLegacyHtml({ blocks: null, html: "" })).toBe(false);
    expect(isLegacyHtml({ blocks: null, html: null })).toBe(false);
  });
});

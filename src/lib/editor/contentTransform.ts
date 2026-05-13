import type { Block, PartialBlock } from "@blocknote/core";

/**
 * Serialize blocks array to JSON string for DB storage.
 * Returns null for empty/null input so DB stores NULL.
 */
export function serializeBlocks(blocks: Block[] | null | undefined): string | null {
  if (!blocks || blocks.length === 0) return null;
  return JSON.stringify(blocks);
}

/**
 * Deserialize JSON string from DB back to blocks array.
 * Returns null on any failure (malformed JSON, non-array, etc.) so caller can fall back to HTML.
 */
export function deserializeBlocks(json: string | null | undefined): PartialBlock[] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    return parsed as PartialBlock[];
  } catch {
    return null;
  }
}

/**
 * True when we have HTML but no blocks — i.e. legacy content from Quill that needs parsing.
 */
export function isLegacyHtml(input: {
  blocks: PartialBlock[] | null;
  html: string | null;
}): boolean {
  const hasBlocks = Array.isArray(input.blocks) && input.blocks.length > 0;
  const hasHtml = typeof input.html === "string" && input.html.trim().length > 0;
  return !hasBlocks && hasHtml;
}

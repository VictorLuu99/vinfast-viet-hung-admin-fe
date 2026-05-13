import type { Block, PartialBlock } from "@blocknote/core";

export type EditorBlock = Block;
export type EditorPartialBlock = PartialBlock;

export interface EditorContentPayload {
  blocks: EditorBlock[];
  html: string;
}

export interface SerializedEditorContent {
  /** JSON-stringified blocks array */
  content_blocks: string | null;
  /** HTML output from blocksToFullHTML */
  content: string;
}

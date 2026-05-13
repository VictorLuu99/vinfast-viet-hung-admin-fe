"use client";

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { CalloutBlock } from "./CalloutBlock";
import { ToggleBlock } from "./ToggleBlock";

export const vinfastEditorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    callout: CalloutBlock(),
    toggle: ToggleBlock(),
  },
});

export type VinfastEditor = typeof vinfastEditorSchema.BlockNoteEditor;

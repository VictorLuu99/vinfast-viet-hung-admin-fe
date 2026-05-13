"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import type { Block, PartialBlock } from "@blocknote/core";

import { vinfastEditorSchema } from "./blocks/schema";
import { vietnameseDict } from "./i18n/vietnameseDict";
import { uploadToR2 } from "./upload/uploadToR2";
import { deserializeBlocks } from "@/lib/editor/contentTransform";
import styles from "./NotionEditor.module.css";

const BlockNoteView = dynamic(
  () => import("@blocknote/mantine").then((m) => m.BlockNoteView),
  {
    ssr: false,
    loading: () => <div className={styles.skeleton}>Đang tải trình soạn thảo...</div>,
  }
);

export interface NotionEditorProps {
  initialBlocks?: PartialBlock[] | string | null;
  initialHtml?: string | null;
  onChange: (payload: { blocks: Block[]; html: string }) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minHeight?: string;
}

export function NotionEditor(props: NotionEditorProps) {
  const {
    initialBlocks,
    initialHtml,
    onChange,
    label,
    required,
    disabled,
    minHeight = "300px",
  } = props;

  const parsedInitial = useMemo<PartialBlock[] | null>(() => {
    if (Array.isArray(initialBlocks)) {
      return initialBlocks.length > 0 ? initialBlocks : null;
    }
    if (typeof initialBlocks === "string") {
      return deserializeBlocks(initialBlocks);
    }
    return null;
  }, [initialBlocks]);

  const editor = useCreateBlockNote({
    schema: vinfastEditorSchema,
    uploadFile: uploadToR2,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: vietnameseDict as any,
    initialContent: parsedInitial && parsedInitial.length > 0 ? parsedInitial : undefined,
  });

  const didMigrateRef = useRef(false);
  useEffect(() => {
    if (didMigrateRef.current) return;
    if (parsedInitial && parsedInitial.length > 0) return;
    if (!initialHtml || !initialHtml.trim()) return;

    didMigrateRef.current = true;
    (async () => {
      try {
        const blocks = await editor.tryParseHTMLToBlocks(initialHtml);
        if (blocks.length > 0) {
          editor.replaceBlocks(editor.document, blocks);
        }
      } catch (err) {
        console.warn("[NotionEditor] HTML parse failed, starting empty:", err);
      }
    })();
  }, [editor, initialHtml, parsedInitial]);

  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleChange = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(async () => {
      const blocks = editor.document as unknown as Block[];
      const html = await editor.blocksToFullHTML(editor.document);
      onChange({ blocks, html });
    }, 300);
    setDebounceTimer(t);
  };

  useEffect(() => () => { if (debounceTimer) clearTimeout(debounceTimer); }, [debounceTimer]);

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ""}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div style={{ minHeight }}>
        <BlockNoteView
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          editor={editor as any}
          editable={!disabled}
          onChange={handleChange}
          theme="light"
        />
      </div>
    </div>
  );
}

export default NotionEditor;

"use client";

import { useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";

export const ToggleBlock = createReactBlockSpec(
  {
    type: "toggle",
    propSchema: {
      summary: { default: "Nhấn để mở rộng" },
      open: { default: false },
    },
    content: "inline",
  },
  {
    render: function ToggleBlockRender({ block, editor, contentRef }) {
      const [open, setOpen] = useState(block.props.open as boolean);

      return (
        <div
          className="bn-toggle"
          data-open={open}
          style={{
            margin: "8px 0",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            className="bn-toggle-header"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 14px",
              background: "#F9FAFB",
              cursor: "pointer",
              gap: 8,
            }}
            onClick={() => {
              const next = !open;
              setOpen(next);
              editor.updateBlock(block, { props: { ...block.props, open: next } });
            }}
          >
            <span style={{ fontSize: "0.75rem" }}>{open ? "▼" : "▶"}</span>
            <input
              className="bn-toggle-summary"
              value={block.props.summary as string}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                editor.updateBlock(block, {
                  props: { ...block.props, summary: e.target.value },
                });
              }}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            />
          </div>
          {open && (
            <div
              ref={contentRef}
              className="bn-toggle-body"
              style={{ padding: "10px 14px" }}
            />
          )}
        </div>
      );
    },
    toExternalHTML: ({ block, contentRef }) => (
      <details className="bn-toggle" open={block.props.open as boolean}>
        <summary>{block.props.summary as string}</summary>
        <div ref={contentRef} className="bn-toggle-body" />
      </details>
    ),
  }
);

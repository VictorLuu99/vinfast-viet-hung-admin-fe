"use client";

import { createReactBlockSpec } from "@blocknote/react";

export const CALLOUT_TYPES = ["info", "warning", "success", "tip"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

export const CALLOUT_STYLES: Record<
  CalloutType,
  { icon: string; bg: string; border: string }
> = {
  info: { icon: "ℹ️", bg: "#EFF6FF", border: "#3B82F6" },
  warning: { icon: "⚠️", bg: "#FFFBEB", border: "#F59E0B" },
  success: { icon: "✅", bg: "#F0FDF4", border: "#10B981" },
  tip: { icon: "💡", bg: "#FAF5FF", border: "#A855F7" },
};

export const CalloutBlock = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      calloutType: {
        default: "info",
        values: [...CALLOUT_TYPES],
      },
    },
    content: "inline",
  },
  {
    render: ({ block, contentRef }) => {
      const t = block.props.calloutType as CalloutType;
      const style = CALLOUT_STYLES[t];
      return (
        <div
          className={`bn-callout bn-callout-${t}`}
          data-callout-type={t}
          style={{
            display: "flex",
            gap: 12,
            padding: "16px 20px",
            margin: "8px 0",
            borderRadius: 8,
            background: style.bg,
            borderLeft: `4px solid ${style.border}`,
          }}
        >
          <span className="bn-callout-icon" style={{ fontSize: "1.25rem", lineHeight: 1.5 }}>
            {style.icon}
          </span>
          <div ref={contentRef} className="bn-callout-content" style={{ flex: 1 }} />
        </div>
      );
    },
    toExternalHTML: ({ block, contentRef }) => {
      const t = block.props.calloutType as CalloutType;
      const style = CALLOUT_STYLES[t];
      return (
        <div className={`bn-callout bn-callout-${t}`} data-callout-type={t}>
          <span className="bn-callout-icon">{style.icon}</span>
          <div ref={contentRef} className="bn-callout-content" />
        </div>
      );
    },
  }
);

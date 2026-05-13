"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackHtml?: string;
  onFallbackChange?: (html: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[NotionEditor] crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ border: "1px solid #FCA5A5", background: "#FEF2F2", borderRadius: 8, padding: 16 }}>
          <p style={{ fontWeight: 600, color: "#991B1B", margin: 0 }}>Lỗi trình soạn thảo</p>
          <p style={{ fontSize: "0.875rem", color: "#B91C1C", marginTop: 6 }}>
            Vui lòng tải lại trang. Bạn có thể chỉnh HTML thô tạm thời bên dưới để cứu nội dung.
          </p>
          <textarea
            style={{ width: "100%", height: 160, marginTop: 12, padding: 8, border: "1px solid #FCA5A5", borderRadius: 4, fontFamily: "monospace", fontSize: "0.75rem" }}
            defaultValue={this.props.fallbackHtml || ""}
            onChange={(e) => this.props.onFallbackChange?.(e.target.value)}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default EditorErrorBoundary;

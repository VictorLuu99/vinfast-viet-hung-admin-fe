"use client";

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_MIME = new Set<string>([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
]);

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (typeof window !== "undefined" && (window as any).__API_URL__) ||
    "http://localhost:8787"
  );
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin-token");
}

/**
 * Upload a file to R2 via /api/upload/editor and return its public URL.
 * Throws on validation or network failure — BlockNote will surface the error inline.
 */
export async function uploadToR2(file: File): Promise<string> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(
      `File vượt quá giới hạn 100 MB (kích thước hiện tại: ${(file.size / 1024 / 1024).toFixed(1)} MB)`
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(`Định dạng không được hỗ trợ: ${file.type || "không xác định"}`);
  }

  const token = getToken();
  if (!token) throw new Error("Bạn cần đăng nhập lại để tải tệp lên");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/api/upload/editor`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Tải lên thất bại (HTTP ${response.status})`;
    throw new Error(message);
  }

  const url = payload?.data?.url || payload?.url || payload?.data?.location;
  if (!url || typeof url !== "string") {
    throw new Error("API không trả URL hợp lệ sau khi tải lên");
  }
  return url;
}

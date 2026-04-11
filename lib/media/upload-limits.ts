/** Aligné sur le bucket Supabase (50 Mo) avec marge. */
export const MAX_FILE_UPLOAD_BYTES = 48 * 1024 * 1024;

/** Images : marge pour rester confortable sous la limite bucket après JPEG. */
export const MAX_IMAGE_UPLOAD_BYTES = 12 * 1024 * 1024;

export function formatLimitBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${Math.round(n / (1024 * 1024))} Mo`;
}

export function validateUploadFileSize(
  file: File,
  kind: "image" | "file",
): string | null {
  const max =
    kind === "image" ? MAX_IMAGE_UPLOAD_BYTES : MAX_FILE_UPLOAD_BYTES;
  if (file.size > max) {
    const label = kind === "image" ? "une image" : "un fichier";
    return `Fichier trop volumineux pour ${label} (max ${formatLimitBytes(max)}).`;
  }
  return null;
}

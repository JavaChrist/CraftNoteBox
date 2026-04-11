/**
 * Réduit les photos lourdes ou trop grandes avant upload (JPEG, qualité fixe).
 * Laisse inchangés SVG, GIF (animation) et fichiers déjà petits / petits formats.
 */
export async function resizeImageFileForUpload(
  file: File,
  options?: {
    maxEdgePx?: number;
    jpegQuality?: number;
    resizeIfLargerThanBytes?: number;
  },
): Promise<File> {
  const maxEdge = options?.maxEdgePx ?? 1920;
  const quality = options?.jpegQuality ?? 0.88;
  const sizeThreshold = options?.resizeIfLargerThanBytes ?? 1.5 * 1024 * 1024;

  if (!file.type.startsWith("image/")) return file;
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    file.type === "image/avif"
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);

    const finishOriginal = () => {
      URL.revokeObjectURL(objUrl);
      resolve(file);
    };

    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) {
        resolve(file);
        return;
      }

      const longest = Math.max(w, h);
      const scale = longest > maxEdge ? maxEdge / longest : 1;
      const needResize = scale < 1 || file.size > sizeThreshold;

      if (!needResize) {
        resolve(file);
        return;
      }

      const nw = Math.max(1, Math.round(w * scale));
      const nh = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement("canvas");
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, nw, nh);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const base =
            file.name.replace(/\.[^.]+$/i, "").trim() || "image";
          resolve(
            new File([blob], `${base}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            }),
          );
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = finishOriginal;
    img.src = objUrl;
  });
}

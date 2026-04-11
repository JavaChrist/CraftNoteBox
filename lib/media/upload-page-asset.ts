import { validateUploadFileSize } from "@/lib/media/upload-limits";

export type UploadPageAssetResult =
  | { ok: true; publicUrl: string }
  | { ok: false; message: string };

/**
 * Envoi via `/api/media/upload` (session + service_role côté serveur) vers le bucket `page-media`.
 * Évite les erreurs 400 du client direct (RLS Storage / JWT).
 */
export async function uploadPageAsset(
  pageId: string,
  file: File,
  kind: "image" | "file" = "file",
): Promise<UploadPageAssetResult> {
  const sizeErr = validateUploadFileSize(file, kind);
  if (sizeErr) {
    return { ok: false, message: sizeErr };
  }

  const form = new FormData();
  form.set("file", file);
  form.set("pageId", pageId);
  form.set("kind", kind);

  let res: Response;
  try {
    res = await fetch("/api/media/upload", {
      method: "POST",
      body: form,
    });
  } catch {
    return {
      ok: false,
      message: "Réseau indisponible — réessaie dans un instant.",
    };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  const errMsg =
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string" ?
      (data as { error: string }).error
    : null;

  if (!res.ok) {
    return {
      ok: false,
      message:
        errMsg ||
        (res.status === 401 ?
          "Tu dois être connecté pour importer un fichier."
        : `Import impossible (erreur ${res.status}).`),
    };
  }

  const publicUrl =
    data &&
    typeof data === "object" &&
    "publicUrl" in data &&
    typeof (data as { publicUrl: unknown }).publicUrl === "string" ?
      (data as { publicUrl: string }).publicUrl
    : null;

  if (!publicUrl) {
    return { ok: false, message: "Réponse serveur invalide après l’import." };
  }

  return { ok: true, publicUrl };
}

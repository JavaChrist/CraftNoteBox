import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { validateUploadFileSize } from "@/lib/media/upload-limits";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

/**
 * Upload vers le bucket `page-media` côté serveur (évite les 400 client dus à RLS / JWT Storage).
 * Chemin : `{uid}/{pageId}/{uuid}.{ext}` — l’uid est forcé depuis la session, jamais depuis le client.
 */
export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide (multipart attendu)" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const pageId = String(form.get("pageId") ?? "").trim();
  const kind = form.get("kind") === "image" ? "image" : "file";

  if (!(file instanceof File) || !pageId) {
    return NextResponse.json(
      { error: "Fichier ou pageId manquant" },
      { status: 400 },
    );
  }

  const sizeErr = validateUploadFileSize(file, kind);
  if (sizeErr) {
    return NextResponse.json({ error: sizeErr }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY manquante côté serveur — requis pour l’import de fichiers.",
      },
      { status: 503 },
    );
  }

  const rawName = file.name.trim() || "fichier";
  const ext =
    rawName.includes(".") ?
      rawName.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin"
    : "bin";
  const objectName = `${randomUUID()}.${ext}`.slice(0, 220);
  const objectPath = `${user.uid}/${pageId}/${objectName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("page-media").upload(objectPath, buffer, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("[api/media/upload]", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Échec du stockage. Vérifie que le bucket « page-media » existe (migration SQL).",
      },
      { status: 502 },
    );
  }

  const { data } = supabase.storage.from("page-media").getPublicUrl(objectPath);
  return NextResponse.json({ publicUrl: data.publicUrl });
}

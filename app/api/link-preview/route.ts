import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { isUrlSafeForServerFetch } from "@/lib/link-preview/is-url-safe";
import { parseLinkPreviewMeta } from "@/lib/link-preview/parse-html-meta";

export const runtime = "nodejs";

const MAX_BYTES = 512_000;
const TIMEOUT_MS = 10_000;

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const urlParam = req.nextUrl.searchParams.get("url")?.trim() ?? "";
  if (!urlParam) {
    return NextResponse.json({ error: "Paramètre url manquant" }, { status: 400 });
  }

  if (!isUrlSafeForServerFetch(urlParam)) {
    return NextResponse.json(
      { error: "URL non autorisée pour l’aperçu" },
      { status: 400 },
    );
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(urlParam, {
      signal: ac.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "CraftNoteBoxLinkPreview/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Échec HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return NextResponse.json(
        {
          meta: parseLinkPreviewMeta("", urlParam),
          warning: "Contenu non HTML — métadonnées partielles",
        },
        { status: 200 },
      );
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "Corps de réponse illisible" },
        { status: 502 },
      );
    }

    const dec = new TextDecoder();
    let buf = "";
    let total = 0;
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      buf += dec.decode(value, { stream: true });
      if (buf.includes("</head>") || buf.length > MAX_BYTES) break;
    }
    reader.releaseLock();

    const meta = parseLinkPreviewMeta(buf, res.url || urlParam);
    return NextResponse.json({ meta });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur réseau";
    return NextResponse.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}

import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { buildSystemPrompt, buildUserPayload } from "@/lib/ai/prompts";
import { isAiAction, type AiAction } from "@/lib/ai/types";

/** Alias public pour le résumé de page (`summarize` reste l’action interne). */
function normalizeAiAction(raw: unknown): AiAction | null {
  if (typeof raw !== "string") return null;
  const a = raw.trim();
  if (a === "summary") return "summarize";
  if (isAiAction(a)) return a;
  return null;
}

export const maxDuration = 60;

const MAX_INPUT_CHARS = 80_000;

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

function extractAssistantText(data: ChatCompletionResponse): string {
  const raw = data.choices?.[0]?.message?.content;
  if (typeof raw !== "string") return "";
  return raw.trim();
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Clé OpenAI manquante. Définis OPENAI_API_KEY dans .env.local (serveur uniquement).",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const b = body as {
    action?: unknown;
    content?: unknown;
    pageTitle?: unknown;
  };

  const action = normalizeAiAction(b.action);
  const content = b.content;
  const pageTitle =
    typeof b.pageTitle === "string" ? b.pageTitle.trim() || null : null;

  if (!action) {
    return NextResponse.json(
      { error: "action invalide ou manquante" },
      { status: 400 },
    );
  }

  if (typeof content !== "string") {
    return NextResponse.json({ error: "content doit être une chaîne" }, { status: 400 });
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return NextResponse.json(
      { error: "Aucun texte à traiter (page vide ou sélection vide)." },
      { status: 400 },
    );
  }

  if (trimmed.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Texte trop long (max ${MAX_INPUT_CHARS} caractères).` },
      { status: 400 },
    );
  }

  const model =
    process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const system = buildSystemPrompt(action);
  const userMessage = buildUserPayload(trimmed, { pageTitle });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 4096,
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    const msg =
      data.error?.message ||
      `Erreur OpenAI (${res.status})`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const result = extractAssistantText(data);
  if (!result) {
    return NextResponse.json(
      { error: "Réponse vide du modèle." },
      { status: 502 },
    );
  }

  return NextResponse.json({ result });
}

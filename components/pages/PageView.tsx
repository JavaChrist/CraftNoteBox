import { ShieldAlert, FileQuestion } from "lucide-react";
import Editor from "@/components/editor/Editor";
import PageTitleField from "@/components/pages/PageTitleField";
import Sidebar from "@/components/layout/Sidebar";
import { SimpleMessageScreen } from "@/components/feedback/simple-message";
import { listBlocks, upsertBlocks } from "@/lib/actions/blocks";
import { getPage, updatePage } from "@/lib/actions/pages";
import type { BlockType, Page } from "@/lib/db/types";

type Props = {
  pageId: string;
};

export default async function PageView({ pageId }: Props) {
  let page = null;
  try {
    page = await getPage(pageId);
  } catch (err) {
    console.error("Erreur getPage", err);
    return (
      <SimpleMessageScreen
        icon={ShieldAlert}
        title="Accès impossible"
        description="Tu n’es pas connecté ou tu n’as pas le droit d’ouvrir cette page. Reconnecte-toi ou reviens à la liste des pages."
        tone="destructive"
        action={{ href: "/pages", label: "Retour aux pages" }}
      />
    );
  }

  if (!page) {
    return (
      <SimpleMessageScreen
        icon={FileQuestion}
        title="Page introuvable"
        description="Cette page n’existe pas ou a été supprimée. Choisis une autre page dans la barre latérale ou crée-en une nouvelle."
        tone="muted"
        action={{ href: "/pages", label: "Retour aux pages" }}
      />
    );
  }

  const blocks = await listBlocks(pageId);

  async function handleSave(
    payload: Array<{
      id?: string;
      type: BlockType;
      content: unknown;
      orderIndex: number;
    }>,
  ) {
    "use server";
    await upsertBlocks(pageId, payload);
  }

  async function handleSaveTitle(title: string) {
    "use server";
    await updatePage({ id: pageId, title });
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Page
            </p>
            <PageTitleField
              key={page.id}
              initialTitle={page.title}
              saveTitle={handleSaveTitle}
            />
          </div>

          <Editor
            key={page.id}
            page={page as Page}
            initialBlocks={blocks}
            onSave={handleSave}
          />
        </div>
      </main>
    </div>
  );
}


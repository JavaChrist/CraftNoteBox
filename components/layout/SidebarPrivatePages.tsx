"use client";

import { FileText, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SidebarPageList from "@/components/layout/SidebarPageList";
import SidebarSection from "@/components/layout/SidebarSection";
import SidebarSectionMenu from "@/components/layout/SidebarSectionMenu";
import type { Page } from "@/lib/db/types";

const HIDDEN_KEY = "cnb-sidebar-private-hidden";

type Props = {
  pages: Page[];
  createPageAction: () => Promise<void>;
};

export default function SidebarPrivatePages({
  pages,
  createPageAction,
}: Props) {
  const [sectionHidden, setSectionHidden] = useState(false);

  useEffect(() => {
    try {
      setSectionHidden(localStorage.getItem(HIDDEN_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const hideSection = useCallback(() => {
    setSectionHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const showSection = useCallback(() => {
    setSectionHidden(false);
    try {
      localStorage.removeItem(HIDDEN_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <SidebarSection
      title="Pages privées"
      sectionId="sidebar-pages-privees"
      persistStorageKey="cnb-sidebar-private-expanded"
      hidden={sectionHidden}
      onShow={showSection}
      actions={
        sectionHidden ? undefined : (
          <>
            <form action={createPageAction}>
              <button
                type="submit"
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                title="Nouvelle page"
                aria-label="Créer une nouvelle page privée"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </form>
            <SidebarSectionMenu
              onHideSection={hideSection}
              sectionLabel="Pages privées"
            />
          </>
        )
      }
    >
      {pages.length === 0 ? (
        <div className="mx-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center">
          <FileText
            className="mx-auto h-6 w-6 text-muted-foreground"
            aria-hidden
          />
          <p className="mt-2 text-xs font-medium text-foreground">
            Aucune page
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Utilise le bouton <span className="font-medium">+</span> ci-dessus
            pour créer une page.
          </p>
        </div>
      ) : (
        <SidebarPageList pages={pages} />
      )}
    </SidebarSection>
  );
}

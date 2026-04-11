"use client";

import { FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SidebarCreatePageButton from "@/components/layout/SidebarCreatePageButton";
import SidebarPageList from "@/components/layout/SidebarPageList";
import SidebarSection from "@/components/layout/SidebarSection";
import SidebarSectionMenu from "@/components/layout/SidebarSectionMenu";
import type { Page } from "@/lib/db/types";

const HIDDEN_KEY = "cnb-sidebar-pro-hidden";

type Props = {
  pages: Page[];
};

export default function SidebarProPages({ pages }: Props) {
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
      title="Pages PRO"
      sectionId="sidebar-pages-pro"
      persistStorageKey="cnb-sidebar-pro-expanded"
      hidden={sectionHidden}
      onShow={showSection}
      actions={
        sectionHidden ? undefined : (
          <>
            <SidebarCreatePageButton scope="pro" variant="pro" />
            <SidebarSectionMenu
              onHideSection={hideSection}
              sectionLabel="Pages PRO"
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
            Aucune page PRO
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

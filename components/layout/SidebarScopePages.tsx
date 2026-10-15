"use client";

import { FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SidebarCreatePageButton from "@/components/layout/SidebarCreatePageButton";
import SidebarPageList from "@/components/layout/SidebarPageList";
import SidebarSection from "@/components/layout/SidebarSection";
import SidebarSectionMenu from "@/components/layout/SidebarSectionMenu";
import type { Page, PageScope } from "@/lib/db/types";
import { PAGE_SCOPE_META } from "@/lib/pages/scopes";

type Props = {
  scope: PageScope;
  pages: Page[];
};

export default function SidebarScopePages({ scope, pages }: Props) {
  const meta = PAGE_SCOPE_META[scope];
  const [sectionHidden, setSectionHidden] = useState(false);

  useEffect(() => {
    try {
      setSectionHidden(localStorage.getItem(meta.hiddenKey) === "1");
    } catch {
      /* ignore */
    }
  }, [meta.hiddenKey]);

  const hideSection = useCallback(() => {
    setSectionHidden(true);
    try {
      localStorage.setItem(meta.hiddenKey, "1");
    } catch {
      /* ignore */
    }
  }, [meta.hiddenKey]);

  const showSection = useCallback(() => {
    setSectionHidden(false);
    try {
      localStorage.removeItem(meta.hiddenKey);
    } catch {
      /* ignore */
    }
  }, [meta.hiddenKey]);

  return (
    <SidebarSection
      title={meta.title}
      sectionId={meta.sectionId}
      persistStorageKey={meta.expandedKey}
      hidden={sectionHidden}
      onShow={showSection}
      actions={
        sectionHidden ? undefined : (
          <>
            <SidebarCreatePageButton scope={scope} />
            <SidebarSectionMenu
              onHideSection={hideSection}
              sectionLabel={meta.title}
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
            {meta.emptyTitle}
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

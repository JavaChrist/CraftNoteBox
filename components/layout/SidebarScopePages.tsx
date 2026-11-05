"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import SidebarCreatePageButton from "@/components/layout/SidebarCreatePageButton";
import SidebarModal from "@/components/layout/SidebarModal";
import SidebarPageList from "@/components/layout/SidebarPageList";
import SidebarSection from "@/components/layout/SidebarSection";
import SidebarSectionMenu from "@/components/layout/SidebarSectionMenu";
import { deleteSection, renameSection } from "@/lib/actions/sections";
import type { Page, PageSection } from "@/lib/db/types";
import {
  sectionDomId,
  sectionEmptyTitle,
  sectionExpandedKey,
  sectionHiddenKey,
} from "@/lib/pages/scopes";

type Props = {
  section: PageSection;
  pages: Page[];
};

export default function SidebarScopePages({ section, pages }: Props) {
  const router = useRouter();
  const [sectionHidden, setSectionHidden] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hiddenKey = sectionHiddenKey(section.slug);
  const canManage = section.persisted && !section.builtin;

  useEffect(() => {
    try {
      setSectionHidden(localStorage.getItem(hiddenKey) === "1");
    } catch {
      /* ignore */
    }
  }, [hiddenKey]);

  useEffect(() => {
    setTitle(section.title);
  }, [section.title]);

  const hideSection = useCallback(() => {
    setSectionHidden(true);
    try {
      localStorage.setItem(hiddenKey, "1");
    } catch {
      /* ignore */
    }
  }, [hiddenKey]);

  const showSection = useCallback(() => {
    setSectionHidden(false);
    try {
      localStorage.removeItem(hiddenKey);
    } catch {
      /* ignore */
    }
  }, [hiddenKey]);

  const submitRename = () => {
    setError(null);
    startTransition(async () => {
      try {
        await renameSection({ id: section.id, title });
        setRenameOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Renommage impossible");
      }
    });
  };

  const submitDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteSection(section.id);
        setDeleteOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Suppression impossible");
      }
    });
  };

  return (
    <>
      <SidebarSection
        title={section.title}
        sectionId={sectionDomId(section.slug)}
        persistStorageKey={sectionExpandedKey(section.slug)}
        hidden={sectionHidden}
        onShow={showSection}
        actions={
          sectionHidden ? undefined : (
            <>
              <SidebarCreatePageButton
                scope={section.slug}
                sectionTitle={section.title}
              />
              <SidebarSectionMenu
                onHideSection={hideSection}
                sectionLabel={section.title}
                onRename={
                  canManage
                    ? () => {
                        setTitle(section.title);
                        setError(null);
                        setRenameOpen(true);
                      }
                    : undefined
                }
                onDelete={
                  canManage
                    ? () => {
                        setError(null);
                        setDeleteOpen(true);
                      }
                    : undefined
                }
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
              {sectionEmptyTitle(section.slug)}
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
      {renameOpen ? (
        <SidebarModal
          title="Renommer la rubrique"
          onClose={() => {
            if (!pending) setRenameOpen(false);
          }}
        >
          <label htmlFor={`rename-section-${section.id}`} className="sr-only">
            Nom de la rubrique
          </label>
          <input
            id={`rename-section-${section.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitRename();
              }
            }}
            maxLength={40}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            autoFocus
            disabled={pending}
            autoComplete="off"
          />
          {error ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => setRenameOpen(false)}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submitRename}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </SidebarModal>
      ) : null}
      {deleteOpen ? (
        <SidebarModal
          title="Supprimer la rubrique ?"
          onClose={() => {
            if (!pending) setDeleteOpen(false);
          }}
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Les pages de « {section.title} », y compris celles de la corbeille,
            seront déplacées dans Pages privées.
          </p>
          {error ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => setDeleteOpen(false)}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submitDelete}
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
            >
              {pending ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </SidebarModal>
      ) : null}
    </>
  );
}

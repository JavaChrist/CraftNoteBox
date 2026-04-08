"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  ChevronRight,
  File,
  ListPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { createPage, deletePage, updatePage } from "@/lib/actions/pages";
import {
  buildPageTree,
  type PageTreeNode,
} from "@/lib/pages/build-page-tree";
import type { Page } from "@/lib/db/types";

type Props = {
  pages: Page[];
};

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-modal-title"
        className="w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="sidebar-modal-title" className="text-sm font-semibold">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function isExpanded(
  expanded: Record<string, boolean>,
  id: string,
): boolean {
  return expanded[id] !== false;
}

export default function SidebarPageList({ pages }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const tree = useMemo(() => buildPageTree(pages), [pages]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const activePageId =
    pathname != null ? /^\/pages\/([^/]+)$/.exec(pathname)?.[1] ?? null : null;

  const [renamePage, setRenamePage] = useState<Page | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  const [deletePageState, setDeletePageState] = useState<Page | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const closeRename = () => {
    setRenamePage(null);
    setRenameError(null);
  };

  const closeDelete = () => {
    setDeletePageState(null);
    setDeleteError(null);
  };

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const open = prev[id] !== false;
      return { ...prev, [id]: !open };
    });
  }, []);

  const handleRenameSubmit = () => {
    if (!renamePage) return;
    setRenameError(null);
    startTransition(async () => {
      try {
        await updatePage({
          id: renamePage.id,
          title: renameTitle.trim() || "Sans titre",
        });
        closeRename();
        setActionError(null);
        router.refresh();
      } catch (err) {
        setRenameError(err instanceof Error ? err.message : "Échec du renommage");
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletePageState) return;
    setDeleteError(null);
    const id = deletePageState.id;
    startTransition(async () => {
      try {
        await deletePage(id);
        closeDelete();
        if (pathname === `/pages/${id}`) {
          router.push("/pages");
        }
        setActionError(null);
        router.refresh();
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : "Échec de la suppression");
      }
    });
  };

  const createSubPage = (parentId: string) => {
    setActionError(null);
    startTransition(async () => {
      try {
        await createPage({ parentId, title: "Nouvelle page" });
        setExpanded((prev) => ({ ...prev, [parentId]: true }));
        setActionError(null);
        router.refresh();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Impossible de créer la sous-page",
        );
      }
    });
  };

  const renderNode = (node: PageTreeNode, depth: number): ReactNode => {
    const hasChildren = node.children.length > 0;
    const open = !hasChildren || isExpanded(expanded, node.id);
    const isActive = activePageId === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-0.5 rounded-md"
          style={{ paddingLeft: depth > 0 ? Math.min(depth, 8) * 10 : 0 }}
        >
          <div className="flex h-8 w-7 shrink-0 items-center justify-center">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-expanded={open}
                aria-label={open ? "Replier" : "Déplier"}
                title={open ? "Replier" : "Déplier"}
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
                  aria-hidden
                />
              </button>
            ) : (
              <span className="block w-7" aria-hidden />
            )}
          </div>

          <Link
            href={`/pages/${node.id}`}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
              isActive
                ? "bg-secondary font-medium text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            }`}
          >
            <File className="h-3.5 w-3.5 shrink-0 opacity-80" />
            <span className="truncate">{node.title || "Sans titre"}</span>
          </Link>

          <div className="flex shrink-0 items-center rounded-md border border-transparent hover:border-border">
            <button
              type="button"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                createSubPage(node.id);
              }}
              className="rounded p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-40"
              title="Sous-page"
              aria-label={`Créer une sous-page sous « ${node.title || "Sans titre"} »`}
            >
              <ListPlus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                setRenameError(null);
                setRenameTitle(node.title || "");
                setRenamePage(node);
              }}
              className="rounded p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-40"
              title="Renommer"
              aria-label={`Renommer « ${node.title || "Sans titre"} »`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                setDeleteError(null);
                setDeletePageState(node);
              }}
              className="rounded p-1.5 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive disabled:opacity-40"
              title="Supprimer"
              aria-label={`Supprimer « ${node.title || "Sans titre"} »`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {hasChildren && open ? (
          <div className="ml-[0.875rem] border-l border-border/80 pl-1.5 pt-0.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {actionError ? (
        <p className="mb-2 px-3 text-xs text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}
      <nav className="space-y-0.5 px-1 py-2" aria-label="Pages">
        {tree.map((node) => renderNode(node, 0))}
      </nav>

      {renamePage ? (
        <ModalShell title="Renommer la page" onClose={closeRename}>
          <label htmlFor="sidebar-rename-title" className="sr-only">
            Nouveau titre
          </label>
          <input
            id="sidebar-rename-title"
            type="text"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRenameSubmit();
              }
            }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            autoFocus
            disabled={pending}
            autoComplete="off"
          />
          {renameError ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {renameError}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={closeRename}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleRenameSubmit}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </ModalShell>
      ) : null}

      {deletePageState ? (
        <ModalShell title="Supprimer la page ?" onClose={closeDelete}>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              « {deletePageState.title || "Sans titre"} »
            </span>{" "}
            et son contenu seront supprimés définitivement.
          </p>
          {deleteError ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={closeDelete}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleDeleteConfirm}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}

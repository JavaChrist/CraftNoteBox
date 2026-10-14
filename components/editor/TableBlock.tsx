"use client";

import { Plus, Trash2 } from "lucide-react";
import { Transforms, type Path } from "slate";
import { useSlate, type RenderElementProps } from "slate-react";
import { alignTable } from "@/lib/editor/rich-blocks";
import {
  blockFieldClass,
  useBlockPath,
  VoidBlockFrame,
  VoidSlateChildren,
} from "./VoidBlockFrame";

function TableBody({
  element,
  children,
}: Pick<RenderElementProps, "element" | "children">) {
  const editor = useSlate();
  const path = useBlockPath(element);
  const aligned = alignTable(element.headers ?? [], element.rows ?? []);

  const commit = (headers: string[], rows: string[][]) => {
    if (!path) return;
    const next = alignTable(headers, rows);
    Transforms.setNodes(editor, next as object, { at: path });
  };

  if (!path) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        Tableau
        <VoidSlateChildren>{children}</VoidSlateChildren>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div
        contentEditable={false}
        className="flex items-center justify-end gap-1 border-b border-border bg-muted/30 px-2 py-1"
      >
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium hover:bg-muted"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            commit(
              [...aligned.headers, `Colonne ${aligned.headers.length + 1}`],
              aligned.rows.map((row) => [...row, ""]),
            )
          }
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Colonne
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium hover:bg-muted"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            commit(aligned.headers, [...aligned.rows, aligned.headers.map(() => "")])
          }
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Ligne
        </button>
      </div>
      <div contentEditable={false} className="overflow-x-auto p-2">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr>
              {aligned.headers.map((header, columnIndex) => (
                <th key={`h-${columnIndex}`} className="border border-border p-1 text-left">
                  <div className="flex items-center gap-1">
                    <input
                      aria-label={`En-tête colonne ${columnIndex + 1}`}
                      className={blockFieldClass}
                      value={header}
                      onChange={(event) => {
                        const headers = aligned.headers.slice();
                        headers[columnIndex] = event.target.value;
                        commit(headers, aligned.rows);
                      }}
                    />
                    {aligned.headers.length > 1 ? (
                      <button
                        type="button"
                        title="Supprimer la colonne"
                        aria-label={`Supprimer la colonne ${columnIndex + 1}`}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() =>
                          commit(
                            aligned.headers.filter((_, index) => index !== columnIndex),
                            aligned.rows.map((row) =>
                              row.filter((_, index) => index !== columnIndex),
                            ),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
              <th className="w-8 border border-border" />
            </tr>
          </thead>
          <tbody>
            {aligned.rows.map((row, rowIndex) => (
              <tr key={`r-${rowIndex}`}>
                {row.map((cell, columnIndex) => (
                  <td key={`c-${rowIndex}-${columnIndex}`} className="border border-border p-1">
                    <input
                      aria-label={`Ligne ${rowIndex + 1}, colonne ${columnIndex + 1}`}
                      className={blockFieldClass}
                      value={cell}
                      onChange={(event) => {
                        const rows = aligned.rows.map((item) => item.slice());
                        rows[rowIndex][columnIndex] = event.target.value;
                        commit(aligned.headers, rows);
                      }}
                    />
                  </td>
                ))}
                <td className="border border-border p-1 text-center">
                  {aligned.rows.length > 1 ? (
                    <button
                      type="button"
                      title="Supprimer la ligne"
                      aria-label={`Supprimer la ligne ${rowIndex + 1}`}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() =>
                        commit(
                          aligned.headers,
                          aligned.rows.filter((_, index) => index !== rowIndex),
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

export default function TableBlock({
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & {
  gutter?: React.ReactNode;
  rootDropPath?: Path;
}) {
  return (
    <VoidBlockFrame
      attributes={attributes}
      gutter={gutter}
      rootDropPath={rootDropPath}
    >
      <TableBody element={element}>{children}</TableBody>
    </VoidBlockFrame>
  );
}

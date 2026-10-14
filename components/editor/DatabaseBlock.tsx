"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Transforms, type Path } from "slate";
import { useSlate, type RenderElementProps } from "slate-react";
import type { DbColumn, DbColumnKind, DbRow, DbView } from "@/types/block";
import {
  DB_VIEW_LABELS,
  DB_VIEWS,
  newBlockId,
  sanitizeDatabase,
} from "@/lib/editor/rich-blocks";
import {
  blockFieldClass,
  blockSelectClass,
  useBlockPath,
  VoidBlockFrame,
  VoidSlateChildren,
} from "./VoidBlockFrame";

const COLUMN_KIND_LABELS: Record<DbColumnKind, string> = {
  text: "Texte",
  number: "Nombre",
  date: "Date",
  select: "Liste",
};

function titleOf(row: DbRow, columns: DbColumn[]): string {
  const column = columns.find((item) => item.kind === "text") ?? columns[0];
  return column ? row.cells[column.id] || "Sans titre" : "Sans titre";
}

function dateOf(row: DbRow, columns: DbColumn[]): string {
  const column = columns.find((item) => item.kind === "date");
  return column ? row.cells[column.id] || "" : "";
}

function statusOf(row: DbRow, columns: DbColumn[]): { id: string; value: string; options: string[] } | null {
  const column = columns.find((item) => item.kind === "select");
  if (!column) return null;
  return {
    id: column.id,
    value: row.cells[column.id] || "",
    options: column.options ?? [],
  };
}

function amountOf(row: DbRow, columns: DbColumn[]): number {
  const column = columns.find((item) => item.kind === "number");
  if (!column) return 0;
  const value = Number(row.cells[column.id]);
  return Number.isFinite(value) ? value : 0;
}

function CellInput({
  column,
  value,
  onChange,
}: {
  column: DbColumn;
  value: string;
  onChange: (value: string) => void;
}) {
  if (column.kind === "select") {
    return (
      <select
        aria-label={column.name}
        className={blockSelectClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">—</option>
        {(column.options ?? []).filter(Boolean).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      aria-label={column.name}
      type={column.kind === "number" ? "number" : column.kind === "date" ? "date" : "text"}
      className={blockFieldClass}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function DatabaseBody({
  element,
  children,
}: Pick<RenderElementProps, "element" | "children">) {
  const editor = useSlate();
  const path = useBlockPath(element);
  const data = sanitizeDatabase({
    view: element.view,
    dbColumns: element.dbColumns,
    dbRows: element.dbRows,
  });
  const [cursorMonth, setCursorMonth] = useState(() => {
    const firstDate = data.dbRows.map((row) => dateOf(row, data.dbColumns)).find(Boolean);
    const parsed = firstDate ? new Date(`${firstDate}T00:00:00`) : new Date();
    return { year: parsed.getFullYear(), month: parsed.getMonth() };
  });

  const commit = (view: DbView, dbColumns: DbColumn[], dbRows: DbRow[]) => {
    if (!path) return;
    Transforms.setNodes(editor, { view, dbColumns, dbRows } as object, { at: path });
  };

  const setCell = (rowId: string, columnId: string, value: string) => {
    commit(
      data.view,
      data.dbColumns,
      data.dbRows.map((row) =>
        row.id === rowId
          ? { ...row, cells: { ...row.cells, [columnId]: value } }
          : row,
      ),
    );
  };

  const addRow = () => {
    const cells: Record<string, string> = {};
    for (const column of data.dbColumns) cells[column.id] = "";
    commit(data.view, data.dbColumns, [
      ...data.dbRows,
      { id: newBlockId("row"), cells },
    ]);
  };

  const removeRow = (rowId: string) => {
    if (data.dbRows.length <= 1) return;
    commit(
      data.view,
      data.dbColumns,
      data.dbRows.filter((row) => row.id !== rowId),
    );
  };

  const statusColumn = data.dbColumns.find((column) => column.kind === "select");
  const statusOptions = (statusColumn?.options ?? []).filter(Boolean);
  const groups = useMemo(() => {
    const options = statusOptions;
    const buckets = new Map<string, DbRow[]>();
    for (const option of options) buckets.set(option, []);
    buckets.set("", []);
    for (const row of data.dbRows) {
      const value = statusColumn ? row.cells[statusColumn.id] || "" : "";
      const key = buckets.has(value) ? value : "";
      buckets.get(key)?.push(row);
    }
    return buckets;
  }, [data.dbRows, statusColumn, statusOptions]);

  const monthLabel = new Date(cursorMonth.year, cursorMonth.month, 1).toLocaleDateString(
    "fr-FR",
    { month: "long", year: "numeric" },
  );
  const firstWeekday = (new Date(cursorMonth.year, cursorMonth.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(cursorMonth.year, cursorMonth.month + 1, 0).getDate();
  const monthKey = `${cursorMonth.year}-${String(cursorMonth.month + 1).padStart(2, "0")}`;

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div
        contentEditable={false}
        className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-2 py-1"
      >
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Vue
          <select
            aria-label="Vue de la base"
            className={`${blockSelectClass} w-auto`}
            value={data.view}
            onChange={(event) =>
              commit(event.target.value as DbView, data.dbColumns, data.dbRows)
            }
          >
            {DB_VIEWS.map((view) => (
              <option key={view} value={view}>
                {DB_VIEW_LABELS[view]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium hover:bg-muted"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addRow}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Ligne
        </button>
      </div>

      <div contentEditable={false} className="space-y-3 p-3">
        {data.view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr>
                  {data.dbColumns.map((column) => (
                    <th key={column.id} className="border border-border px-2 py-1 text-left font-medium">
                      {column.name}
                    </th>
                  ))}
                  <th className="w-8 border border-border" />
                </tr>
              </thead>
              <tbody>
                {data.dbRows.map((row) => (
                  <tr key={row.id}>
                    {data.dbColumns.map((column) => (
                      <td key={column.id} className="border border-border p-1">
                        <CellInput
                          column={column}
                          value={row.cells[column.id] ?? ""}
                          onChange={(value) => setCell(row.id, column.id, value)}
                        />
                      </td>
                    ))}
                    <td className="border border-border p-1 text-center">
                      <button
                        type="button"
                        aria-label="Supprimer la ligne"
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {data.view === "kanban" ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[...statusOptions, ""].map((option) => (
              <div key={option || "empty"} className="w-56 shrink-0 rounded-md bg-muted/30 p-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {option || "Sans statut"}
                </p>
                <div className="space-y-2">
                  {(groups.get(option) ?? []).map((row) => (
                    <article key={row.id} className="rounded-md border border-border bg-card p-2">
                      <p className="text-sm font-medium">{titleOf(row, data.dbColumns)}</p>
                      <p className="text-xs text-muted-foreground">
                        {dateOf(row, data.dbColumns) || "Sans date"}
                        {amountOf(row, data.dbColumns) ? ` · ${amountOf(row, data.dbColumns)}` : ""}
                      </p>
                      {statusColumn ? (
                        <div className="mt-2">
                          <CellInput
                            column={statusColumn}
                            value={row.cells[statusColumn.id] ?? ""}
                            onChange={(value) => setCell(row.id, statusColumn.id, value)}
                          />
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {data.view === "gallery" || data.view === "list" || data.view === "feed" || data.view === "timeline" ? (
          <div className={data.view === "gallery" ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}>
            {(data.view === "feed" || data.view === "timeline"
              ? [...data.dbRows].sort((a, b) =>
                  data.view === "feed"
                    ? dateOf(b, data.dbColumns).localeCompare(dateOf(a, data.dbColumns))
                    : dateOf(a, data.dbColumns).localeCompare(dateOf(b, data.dbColumns)),
                )
              : data.dbRows
            ).map((row) => (
              <article key={row.id} className="rounded-md border border-border bg-muted/15 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{titleOf(row, data.dbColumns)}</p>
                    <p className="text-xs text-muted-foreground">
                      {[statusOf(row, data.dbColumns)?.value, dateOf(row, data.dbColumns)]
                        .filter(Boolean)
                        .join(" · ") || "Sans détail"}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {amountOf(row, data.dbColumns) || ""}
                  </span>
                </div>
                {data.view !== "list" ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {data.dbColumns.map((column) => (
                      <label key={column.id} className="text-xs text-muted-foreground">
                        {column.name}
                        <CellInput
                          column={column}
                          value={row.cells[column.id] ?? ""}
                          onChange={(value) => setCell(row.id, column.id, value)}
                        />
                      </label>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {data.view === "dashboard" ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Lignes</p>
                <p className="text-2xl font-semibold tabular-nums">{data.dbRows.length}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total des montants</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {data.dbRows.reduce((sum, row) => sum + amountOf(row, data.dbColumns), 0)}
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Statuts</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {statusOptions.length}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {(statusOptions.length > 0 ? statusOptions : ["Sans statut"]).map((option) => {
                const count = (groups.get(option) ?? []).length;
                const width = data.dbRows.length
                  ? Math.round((count / data.dbRows.length) * 100)
                  : 0;
                return (
                  <div key={option}>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{option || "Sans statut"}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {data.view === "calendar" ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                className="rounded px-2 py-1 text-sm hover:bg-muted"
                onClick={() =>
                  setCursorMonth((current) => {
                    const date = new Date(current.year, current.month - 1, 1);
                    return { year: date.getFullYear(), month: date.getMonth() };
                  })
                }
              >
                Mois précédent
              </button>
              <p className="text-sm font-medium capitalize">{monthLabel}</p>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm hover:bg-muted"
                onClick={() =>
                  setCursorMonth((current) => {
                    const date = new Date(current.year, current.month + 1, 1);
                    return { year: date.getFullYear(), month: date.getMonth() };
                  })
                }
              >
                Mois suivant
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
              {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                <div key={`${label}-${index}`}>{label}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: firstWeekday }, (_, index) => (
                <div key={`pad-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const key = `${monthKey}-${String(day).padStart(2, "0")}`;
                const items = data.dbRows.filter((row) => dateOf(row, data.dbColumns) === key);
                return (
                  <div key={key} className="min-h-16 rounded-md border border-border p-1 text-left">
                    <p className="text-[11px] text-muted-foreground">{day}</p>
                    {items.map((row) => (
                      <p key={row.id} className="truncate text-[11px] font-medium">
                        {titleOf(row, data.dbColumns)}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <details className="rounded-md border border-border">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
            Colonnes
          </summary>
          <div className="space-y-2 border-t border-border p-3">
            {data.dbColumns.map((column) => (
              <div key={column.id} className="grid gap-2 sm:grid-cols-[1fr_9rem_1fr_auto]">
                <input
                  aria-label={`Nom de ${column.name}`}
                  className={blockFieldClass}
                  value={column.name}
                  onChange={(event) =>
                    commit(
                      data.view,
                      data.dbColumns.map((item) =>
                        item.id === column.id ? { ...item, name: event.target.value } : item,
                      ),
                      data.dbRows,
                    )
                  }
                />
                <select
                  aria-label={`Type de ${column.name}`}
                  className={blockSelectClass}
                  value={column.kind}
                  onChange={(event) => {
                    const kind = event.target.value as DbColumnKind;
                    commit(
                      data.view,
                      data.dbColumns.map((item) =>
                        item.id === column.id
                          ? {
                              ...item,
                              kind,
                              ...(kind === "select"
                                ? { options: item.options?.length ? item.options : ["Option"] }
                                : { options: undefined }),
                            }
                          : item,
                      ),
                      data.dbRows,
                    );
                  }}
                >
                  {(Object.keys(COLUMN_KIND_LABELS) as DbColumnKind[]).map((kind) => (
                    <option key={kind} value={kind}>
                      {COLUMN_KIND_LABELS[kind]}
                    </option>
                  ))}
                </select>
                {column.kind === "select" ? (
                  <input
                    aria-label={`Options de ${column.name}`}
                    className={blockFieldClass}
                    value={(column.options ?? []).join(", ")}
                    onChange={(event) => {
                      const options = event.target.value
                        .split(",")
                        .map((item) => item.trim());
                      commit(
                        data.view,
                        data.dbColumns.map((item) =>
                          item.id === column.id ? { ...item, options } : item,
                        ),
                        data.dbRows,
                      );
                    }}
                  />
                ) : (
                  <span />
                )}
                {data.dbColumns.length > 1 ? (
                  <button
                    type="button"
                    aria-label={`Supprimer ${column.name}`}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      commit(
                        data.view,
                        data.dbColumns.filter((item) => item.id !== column.id),
                        data.dbRows.map((row) => {
                          const cells = { ...row.cells };
                          delete cells[column.id];
                          return { ...row, cells };
                        }),
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const column: DbColumn = {
                  id: newBlockId("col"),
                  name: `Colonne ${data.dbColumns.length + 1}`,
                  kind: "text",
                };
                commit(
                  data.view,
                  [...data.dbColumns, column],
                  data.dbRows.map((row) => ({
                    ...row,
                    cells: { ...row.cells, [column.id]: "" },
                  })),
                );
              }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Ajouter une colonne
            </button>
          </div>
        </details>
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

export default function DatabaseBlock({
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
      <DatabaseBody element={element}>{children}</DatabaseBody>
    </VoidBlockFrame>
  );
}

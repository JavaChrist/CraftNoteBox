"use client";

import { Plus, Trash2 } from "lucide-react";
import { Transforms, type Path } from "slate";
import { useSlate, type RenderElementProps } from "slate-react";
import type { ChartKind, ChartPoint } from "@/types/block";
import {
  CHART_KIND_LABELS,
  CHART_KINDS,
  sanitizeChart,
} from "@/lib/editor/rich-blocks";
import {
  blockFieldClass,
  blockSelectClass,
  useBlockPath,
  VoidBlockFrame,
  VoidSlateChildren,
} from "./VoidBlockFrame";

const COLORS = ["#3b6ea5", "#2f9e74", "#d4a017", "#c4544a", "#7c6bb0", "#3d8ea8"];

function ChartFigure({
  kind,
  points,
}: {
  kind: ChartKind;
  points: ChartPoint[];
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  if (kind === "bar") {
    return (
      <div className="flex h-40 items-end gap-2">
        {points.map((point, index) => (
          <div key={`${point.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${Math.max(4, (point.value / max) * 100)}%`,
                  background: COLORS[index % COLORS.length],
                }}
              />
            </div>
            <span className="w-full truncate text-center text-[11px] text-muted-foreground">
              {point.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "line") {
    const width = 320;
    const height = 140;
    const step = points.length > 1 ? width / (points.length - 1) : width;
    const coords = points.map((point, index) => {
      const x = index * step;
      const y = height - (point.value / max) * (height - 12) - 6;
      return `${x},${y}`;
    });
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img">
        <polyline
          fill="none"
          stroke="#3b6ea5"
          strokeWidth="3"
          points={coords.join(" ")}
        />
        {points.map((point, index) => {
          const [x, y] = coords[index].split(",");
          return (
            <circle key={`${point.label}-${index}`} cx={x} cy={y} r="4" fill="#3b6ea5" />
          );
        })}
      </svg>
    );
  }

  const total = points.reduce((sum, point) => sum + Math.max(0, point.value), 0) || 1;
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 120 120" className="h-36 w-36" role="img">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="14" />
        {points.map((point, index) => {
          const fraction = Math.max(0, point.value) / total;
          const dash = fraction * circ;
          const circle = (
            <circle
              key={`${point.label}-${index}`}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1 text-sm">
        {points.map((point, index) => (
          <li key={`${point.label}-${index}`} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate">{point.label}</span>
            <span className="tabular-nums text-muted-foreground">{point.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartBody({
  element,
  children,
}: Pick<RenderElementProps, "element" | "children">) {
  const editor = useSlate();
  const path = useBlockPath(element);
  const chart = sanitizeChart({
    chartKind: element.chartKind,
    chartPoints: element.chartPoints,
  });

  const commit = (chartKind: ChartKind, chartPoints: ChartPoint[]) => {
    if (!path) return;
    Transforms.setNodes(editor, { chartKind, chartPoints } as object, { at: path });
  };

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div
        contentEditable={false}
        className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-2 py-1"
      >
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Type
          <select
            aria-label="Type de graphique"
            className={`${blockSelectClass} w-auto`}
            value={chart.chartKind}
            onChange={(event) =>
              commit(event.target.value as ChartKind, chart.chartPoints)
            }
          >
            {CHART_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {CHART_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium hover:bg-muted"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            commit(chart.chartKind, [
              ...chart.chartPoints,
              { label: `Série ${chart.chartPoints.length + 1}`, value: 1 },
            ])
          }
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Valeur
        </button>
      </div>
      <div contentEditable={false} className="space-y-3 p-3">
        <ChartFigure kind={chart.chartKind} points={chart.chartPoints} />
        <div className="space-y-2">
          {chart.chartPoints.map((point, index) => (
            <div key={`${point.label}-${index}`} className="flex items-center gap-2">
              <input
                aria-label={`Libellé ${index + 1}`}
                className={blockFieldClass}
                value={point.label}
                onChange={(event) => {
                  const chartPoints = chart.chartPoints.slice();
                  chartPoints[index] = { ...point, label: event.target.value };
                  commit(chart.chartKind, chartPoints);
                }}
              />
              <input
                aria-label={`Valeur ${index + 1}`}
                type="number"
                className={`${blockFieldClass} max-w-28`}
                value={point.value}
                onChange={(event) => {
                  const chartPoints = chart.chartPoints.slice();
                  chartPoints[index] = {
                    ...point,
                    value: Number(event.target.value) || 0,
                  };
                  commit(chart.chartKind, chartPoints);
                }}
              />
              {chart.chartPoints.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Supprimer ${point.label}`}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                    commit(
                      chart.chartKind,
                      chart.chartPoints.filter((_, item) => item !== index),
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

export default function ChartBlock({
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
      <ChartBody element={element}>{children}</ChartBody>
    </VoidBlockFrame>
  );
}

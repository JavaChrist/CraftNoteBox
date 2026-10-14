"use client";

import { Transforms } from "slate";
import { useSlate, type RenderElementProps } from "slate-react";
import type { CalloutTone } from "@/types/block";
import {
  CALLOUT_TONE_LABELS,
  CALLOUT_TONES,
  normalizeCalloutTone,
} from "@/lib/editor/rich-blocks";
import { findElementPathInEditor } from "@/lib/editor/find-element-path";
import { blockSelectClass } from "./VoidBlockFrame";

const ICONS = ["💡", "ℹ️", "✅", "⚠️", "❗", "📝", "🔥", "📌"];

const TONE_CLASS: Record<CalloutTone, string> = {
  note: "border-border bg-muted/50",
  info: "border-primary/35 bg-primary/10",
  success: "border-emerald-600/35 bg-emerald-500/10",
  warning: "border-amber-600/40 bg-amber-500/10",
  danger: "border-destructive/40 bg-destructive/10",
};

export function CalloutBody({
  element,
  children,
}: {
  element: RenderElementProps["element"];
  children: React.ReactNode;
}) {
  const editor = useSlate();
  const path = findElementPathInEditor(editor, element);
  const tone = normalizeCalloutTone(element.tone);
  const icon = element.icon?.trim() || "💡";

  const patch = (partial: Record<string, unknown>) => {
    if (!path) return;
    Transforms.setNodes(editor, partial as object, { at: path });
  };

  return (
    <div
      className={`min-w-0 flex-1 rounded-md border px-3 py-2 ${TONE_CLASS[tone]}`}
    >
      <div
        contentEditable={false}
        className="mb-1 flex flex-wrap items-center gap-1"
      >
        {ICONS.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`Icône ${item}`}
            className={`rounded px-1 text-base leading-none hover:bg-background/70 ${
              item === icon ? "bg-background shadow-sm" : ""
            }`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => patch({ icon: item })}
          >
            {item}
          </button>
        ))}
        <label className="sr-only" htmlFor={`callout-tone-${path?.join("-") ?? "x"}`}>
          Ton de l’encadré
        </label>
        <select
          id={`callout-tone-${path?.join("-") ?? "x"}`}
          className={`${blockSelectClass} ml-auto w-auto`}
          value={tone}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) => patch({ tone: event.target.value })}
        >
          {CALLOUT_TONES.map((item) => (
            <option key={item} value={item}>
              {CALLOUT_TONE_LABELS[item]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-w-0 gap-2">
        <span contentEditable={false} className="pt-0.5 text-lg leading-7" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 flex-1 leading-7">{children}</div>
      </div>
    </div>
  );
}

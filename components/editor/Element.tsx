"use client";

import { useSlateStatic, type RenderElementProps } from "slate-react";
import CodeBlock from "./CodeBlock";
import TodoBlock from "./TodoBlock";
import ToggleBlock from "./ToggleBlock";
import { findElementPathInEditor } from "@/lib/editor/find-element-path";
import { numberedListIndex, parentIsToggle } from "@/lib/editor/helpers";

function NumberedListBlock({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const editor = useSlateStatic();
  const path = findElementPathInEditor(editor, element);
  const n = path ? numberedListIndex(editor, path) : 1;

  return (
    <div {...attributes} className="flex gap-2 py-0.5">
      <span
        contentEditable={false}
        className="w-7 shrink-0 select-none pt-0.5 text-right text-sm tabular-nums text-muted-foreground"
      >
        {n}.
      </span>
      <div className="min-w-0 flex-1 leading-7">{children}</div>
    </div>
  );
}

function ParagraphBlock({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const editor = useSlateStatic();
  const path = findElementPathInEditor(editor, element);
  const inToggle = path ? parentIsToggle(editor, path) : false;
  const childIdx = path?.[path.length - 1] ?? 0;

  if (inToggle && path) {
    const isFirst = childIdx === 0;
    return (
      <p
        {...attributes}
        className={
          isFirst
            ? "leading-7 font-semibold text-foreground"
            : "ml-1 border-l-2 border-border pl-3 leading-7 text-muted-foreground"
        }
      >
        {children}
      </p>
    );
  }

  return (
    <p {...attributes} className="leading-7">
      {children}
    </p>
  );
}

function headingClass(
  level: 1 | 2 | 3,
  inToggle: boolean,
): string {
  if (inToggle) {
    if (level === 1) return "text-xl font-semibold leading-8";
    if (level === 2) return "text-lg font-semibold leading-7";
    return "text-base font-semibold leading-7";
  }
  if (level === 1) return "text-3xl font-semibold leading-10 tracking-tight";
  if (level === 2) return "text-2xl font-semibold leading-9 tracking-tight";
  return "text-xl font-semibold leading-8 tracking-tight";
}

function HeadingBlock({
  attributes,
  children,
  element,
  level,
}: RenderElementProps & { level: 1 | 2 | 3 }) {
  const editor = useSlateStatic();
  const path = findElementPathInEditor(editor, element);
  const inToggle = path ? parentIsToggle(editor, path) : false;
  const Tag = `h${level}` as const;
  const cls = headingClass(level, inToggle);

  return (
    <Tag {...attributes} className={cls}>
      {children}
    </Tag>
  );
}

export default function Element(props: RenderElementProps) {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "heading1":
      return <HeadingBlock {...props} level={1} />;
    case "heading2":
      return <HeadingBlock {...props} level={2} />;
    case "heading3":
      return <HeadingBlock {...props} level={3} />;
    case "bulleted_list":
      return (
        <div {...attributes} className="flex gap-2 py-0.5">
          <span
            contentEditable={false}
            className="w-5 shrink-0 select-none text-center text-muted-foreground"
          >
            •
          </span>
          <div className="min-w-0 flex-1 leading-7">{children}</div>
        </div>
      );
    case "numbered_list":
      return <NumberedListBlock {...props} />;
    case "todo":
      return <TodoBlock {...props} />;
    case "quote":
      return (
        <blockquote
          {...attributes}
          className="my-1 border-l-4 border-muted-foreground/35 py-0.5 pl-4 italic leading-7 text-muted-foreground"
        >
          {children}
        </blockquote>
      );
    case "divider":
      return (
        <div {...attributes} className="my-4 py-1" contentEditable={false}>
          <hr className="border-0 border-t border-border" />
          {children}
        </div>
      );
    case "toggle":
      return <ToggleBlock {...props} />;
    case "code":
      return <CodeBlock {...props} />;
    case "paragraph":
      return <ParagraphBlock {...props} />;
    default:
      return (
        <p {...attributes} className="leading-7">
          {children}
        </p>
      );
  }
}

"use client";

import type { Path } from "slate";
import { useSlateStatic, type RenderElementProps } from "slate-react";
import BlockGutter from "./BlockGutter";
import CodeBlock from "./CodeBlock";
import { BookmarkBlock, FileBlock, ImageBlock } from "./MediaBlocks";
import RootBlockRow from "./RootBlockRow";
import { TodoBlockBody } from "./TodoBlock";
import ToggleBlock from "./ToggleBlock";
import { findElementPathInEditor } from "@/lib/editor/find-element-path";
import { numberedListIndex, parentIsToggle } from "@/lib/editor/helpers";

function NumberedListBlock({
  children,
  n,
}: {
  children: React.ReactNode;
  n: number;
}) {
  return (
    <div className="flex flex-1 gap-2 py-0.5">
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
  gutter,
  rootPath,
}: RenderElementProps & { gutter: React.ReactNode; rootPath: Path | null }) {
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

  if (rootPath && rootPath.length === 1) {
    return (
      <RootBlockRow
        path={rootPath}
        attributes={attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <p className="min-w-0 flex-1 leading-7">{children}</p>
      </RootBlockRow>
    );
  }

  return (
    <div
      {...attributes}
      className="group flex items-start gap-0.5 py-0.5 md:gap-1"
    >
      {gutter}
      <p className="min-w-0 flex-1 leading-7">{children}</p>
    </div>
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
  gutter,
  rootPath,
}: RenderElementProps & {
  level: 1 | 2 | 3;
  gutter: React.ReactNode;
  rootPath: Path | null;
}) {
  const editor = useSlateStatic();
  const path = findElementPathInEditor(editor, element);
  const inToggle = path ? parentIsToggle(editor, path) : false;
  const Tag = `h${level}` as const;
  const cls = headingClass(level, inToggle);

  if (inToggle) {
    return (
      <Tag {...attributes} className={cls}>
        {children}
      </Tag>
    );
  }

  if (rootPath && rootPath.length === 1) {
    return (
      <RootBlockRow
        path={rootPath}
        attributes={attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <Tag className={`min-w-0 flex-1 ${cls}`}>{children}</Tag>
      </RootBlockRow>
    );
  }

  return (
    <div
      {...attributes}
      className="group flex items-start gap-0.5 py-0.5 md:gap-1"
    >
      {gutter}
      <Tag className={`min-w-0 flex-1 ${cls}`}>{children}</Tag>
    </div>
  );
}

export default function Element(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const editor = useSlateStatic();
  const path = findElementPathInEditor(editor, element);
  const rootBlock = path?.length === 1;
  const gutter =
    rootBlock && path ?
      <BlockGutter blockPath={path} element={element} />
    : null;
  const rootPath = rootBlock && path ? path : null;

  switch (element.type) {
    case "heading1":
      return (
        <HeadingBlock {...props} level={1} gutter={gutter} rootPath={rootPath} />
      );
    case "heading2":
      return (
        <HeadingBlock {...props} level={2} gutter={gutter} rootPath={rootPath} />
      );
    case "heading3":
      return (
        <HeadingBlock {...props} level={3} gutter={gutter} rootPath={rootPath} />
      );
    case "bulleted_list": {
      const inner = (
        <>
          {gutter}
          <div className="flex min-w-0 flex-1 gap-2 py-0.5">
            <span
              contentEditable={false}
              className="w-5 shrink-0 select-none text-center text-muted-foreground"
            >
              •
            </span>
            <div className="min-w-0 flex-1 leading-7">{children}</div>
          </div>
        </>
      );
      return rootPath ? (
        <RootBlockRow
          path={rootPath}
          attributes={attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </RootBlockRow>
      ) : (
        <div
          {...attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </div>
      );
    }
    case "numbered_list": {
      const n = path ? numberedListIndex(editor, path) : 1;
      const inner = (
        <>
          {gutter}
          <NumberedListBlock n={n}>{children}</NumberedListBlock>
        </>
      );
      return rootPath ? (
        <RootBlockRow
          path={rootPath}
          attributes={attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </RootBlockRow>
      ) : (
        <div
          {...attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </div>
      );
    }
    case "todo": {
      const inner = (
        <>
          {gutter}
          <div className="flex min-w-0 flex-1 items-start gap-2 py-0.5">
            <TodoBlockBody element={element}>{children}</TodoBlockBody>
          </div>
        </>
      );
      return rootPath ? (
        <RootBlockRow
          path={rootPath}
          attributes={attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </RootBlockRow>
      ) : (
        <div
          {...attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </div>
      );
    }
    case "quote": {
      const inner = (
        <>
          {gutter}
          <blockquote className="min-w-0 flex-1 border-l-4 border-muted-foreground/35 py-0.5 pl-4 italic leading-7 text-muted-foreground">
            {children}
          </blockquote>
        </>
      );
      return rootPath ? (
        <RootBlockRow
          path={rootPath}
          attributes={attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </RootBlockRow>
      ) : (
        <div
          {...attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </div>
      );
    }
    case "divider": {
      const inner = (
        <>
          {gutter}
          <div className="min-w-0 flex-1 py-1" contentEditable={false}>
            <hr className="border-0 border-t border-border" />
            {children}
          </div>
        </>
      );
      return rootPath ? (
        <RootBlockRow
          path={rootPath}
          attributes={attributes}
          className="group flex items-center gap-0.5 py-1 md:gap-1"
        >
          {inner}
        </RootBlockRow>
      ) : (
        <div
          {...attributes}
          className="group flex items-center gap-0.5 py-1 md:gap-1"
        >
          {inner}
        </div>
      );
    }
    case "toggle":
      return (
        <ToggleBlock {...props} gutter={gutter} rootDropPath={rootPath ?? undefined} />
      );
    case "code":
      return (
        <CodeBlock {...props} gutter={gutter} rootDropPath={rootPath ?? undefined} />
      );
    case "image":
      return (
        <ImageBlock {...props} gutter={gutter} rootDropPath={rootPath ?? undefined} />
      );
    case "file":
      return (
        <FileBlock {...props} gutter={gutter} rootDropPath={rootPath ?? undefined} />
      );
    case "bookmark":
      return (
        <BookmarkBlock
          {...props}
          gutter={gutter}
          rootDropPath={rootPath ?? undefined}
        />
      );
    case "paragraph":
      return (
        <ParagraphBlock {...props} gutter={gutter} rootPath={rootPath} />
      );
    default: {
      const inner = (
        <>
          {gutter}
          <p className="min-w-0 flex-1 leading-7">{children}</p>
        </>
      );
      return rootPath ? (
        <RootBlockRow
          path={rootPath}
          attributes={attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </RootBlockRow>
      ) : (
        <div
          {...attributes}
          className="group flex items-start gap-0.5 py-0.5 md:gap-1"
        >
          {inner}
        </div>
      );
    }
  }
}

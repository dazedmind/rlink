"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Type,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
} from "lucide-react";
import {
  applyWrap,
  applyLinePrefix,
  insertAtCursor,
} from "./markdown-utils";

type ApplyFormatFn = (
  fn: (
    v: string,
    s: number,
    e: number
  ) => { newValue: string; newStart: number; newEnd: number }
) => void;

type MarkdownToolbarProps = {
  applyFormat: ApplyFormatFn;
};

export default function MarkdownToolbar({ applyFormat }: MarkdownToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg border border-border bg-accent">
      <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s) => applyLinePrefix(v, s, "# "))}
          title="Heading 1"
          className="h-8 w-8"
        >
          <Type size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s) => applyLinePrefix(v, s, "## "))}
          title="Heading 2"
          className="h-8 w-8 text-xs font-bold"
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s) => applyLinePrefix(v, s, "### "))}
          title="Heading 3"
          className="h-8 w-8 text-xs font-bold"
        >
          H3
        </Button>
      </div>
      <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s, e) => applyWrap(v, s, e, "**"))}
          title="Bold"
          className="h-8 w-8"
        >
          <Bold size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s, e) => applyWrap(v, s, e, "*"))}
          title="Italic"
          className="h-8 w-8"
        >
          <Italic size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s, e) => applyWrap(v, s, e, "~~"))}
          title="Strikethrough"
          className="h-8 w-8"
        >
          <Strikethrough size={14} />
        </Button>
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s) => applyLinePrefix(v, s, "- "))}
          title="Bullet list"
          className="h-8 w-8"
        >
          <List size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s) => applyLinePrefix(v, s, "1. "))}
          title="Numbered list"
          className="h-8 w-8"
        >
          <ListOrdered size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => applyFormat((v, s) => applyLinePrefix(v, s, "> "))}
          title="Blockquote"
          className="h-8 w-8"
        >
          <Quote size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            applyFormat((v, s) => insertAtCursor(v, s, "\n\n---\n\n"))
          }
          title="Horizontal rule"
          className="h-8 w-8"
        >
          <Minus size={14} />
        </Button>
      </div>
    </div>
  );
}

import { marked } from "marked";

/**
 * Renders markdown to HTML for preview display.
 * Uses marked for proper CommonMark/GFM parsing.
 */
export function renderMarkdown(md: string): string {
  if (!md || !md.trim()) return "";
  return marked.parse(md.trim(), {
    gfm: true,
    breaks: true,
  }) as string;
}

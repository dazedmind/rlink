export function getLineStart(value: string, pos: number): number {
  const lastNewline = value.lastIndexOf("\n", pos - 1);
  return lastNewline === -1 ? 0 : lastNewline + 1;
}

export function applyWrap(
  value: string,
  start: number,
  end: number,
  before: string,
  after?: string
): { newValue: string; newStart: number; newEnd: number } {
  const a = after ?? before;
  const selected = value.slice(start, end);
  const newValue =
    value.slice(0, start) + before + selected + a + value.slice(end);
  return {
    newValue,
    newStart: start + before.length,
    newEnd: end + before.length,
  };
}

export function applyLinePrefix(
  value: string,
  start: number,
  prefix: string
): { newValue: string; newStart: number; newEnd: number } {
  const lineStart = getLineStart(value, start);
  const newValue =
    value.slice(0, lineStart) + prefix + value.slice(lineStart);
  const newStart = lineStart + prefix.length;
  const newEnd = newStart;
  return { newValue, newStart, newEnd };
}

export function insertAtCursor(
  value: string,
  pos: number,
  text: string
): { newValue: string; newStart: number; newEnd: number } {
  const newValue = value.slice(0, pos) + text + value.slice(pos);
  const newStart = pos + text.length;
  const newEnd = newStart;
  return { newValue, newStart, newEnd };
}

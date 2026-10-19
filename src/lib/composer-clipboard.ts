import type { ComposerPart, ComposerValue } from "./composer-document";

export const COMPOSER_CLIPBOARD_TYPE = "application/x-coss-composer";

function parseComposerPart(part: unknown): ComposerPart | null {
  if (!part || typeof part !== "object") return null;
  const candidate = part as Record<string, unknown>;

  if (candidate.type === "text") {
    return typeof candidate.text === "string" ? { type: "text", text: candidate.text } : null;
  }

  if (candidate.type !== "mention" && candidate.type !== "action") return null;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.label !== "string" ||
    typeof candidate.trigger !== "string"
  )
    return null;

  return {
    type: candidate.type,
    id: candidate.id,
    label: candidate.label,
    trigger: candidate.trigger,
    ...(typeof candidate.kind === "string" ? { kind: candidate.kind } : {}),
    ...(typeof candidate.data === "string" ? { data: candidate.data } : {}),
    ...(typeof candidate.text === "string" ? { text: candidate.text } : {}),
  };
}

export function parseComposerClipboard(raw: string): ComposerValue | null {
  if (!raw || raw.length > 100_000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length > 1_000) return null;
    const parts: (ComposerPart | null)[] = value.map((part) => parseComposerPart(part));
    if (parts.some((part) => part === null)) return null;
    return parts.filter((part): part is ComposerPart => part !== null);
  } catch {
    return null;
  }
}

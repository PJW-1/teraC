export const MAX_QUANTITY = 1_000_000;

export type ParsedQuantity = { ok: true; value: number | null } | { ok: false };

/** Direct input: empty is "not entered"; otherwise 0 to 1,000,000 with at most 2 decimals (design 6.3 rule 4). */
export function parseQuantityInput(text: string): ParsedQuantity {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') return { ok: true, value: null };
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return { ok: false };
  const value = Number(trimmed);
  if (value > MAX_QUANTITY) return { ok: false };
  return { ok: true, value };
}

export function formatQuantity(value: number | null): string {
  return value === null ? '' : String(Math.round(value * 100) / 100);
}

/** +, - 버튼: 미입력이면 0에서 시작하고, 0 아래로는 내려가지 않는다. */
export function stepQuantity(current: number | null, step: number, direction: 1 | -1): number {
  return Math.min(MAX_QUANTITY, Math.max(0, Math.round(((current ?? 0) + step * direction) * 100) / 100));
}

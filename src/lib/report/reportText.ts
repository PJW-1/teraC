// Report text kept from the old app (design 2.1): grouped by category, CRLF
// line breaks for messengers and Windows Notepad, and a BOM in the saved file.

import { safeTimeZone } from '../timeZone';

export type ReportLine = {
  categoryName: string;
  itemName: string;
  unit: string;
  quantity: number | null;
};

export type ReportInput = {
  storeName: string;
  /** When the count was finished. */
  at: string | Date;
  timeZone?: string;
  /** Lines in display order; only counted lines are printed. */
  lines: ReportLine[];
  /** Category names in display order; otherwise the order of first appearance. */
  categoryOrder?: string[];
};

export const REPORT_BOM = '﻿';

export function reportText({ storeName, at, timeZone, lines, categoryOrder }: ReportInput): string {
  const counted = lines.filter(line => line.quantity !== null);
  if (counted.length === 0) return '조사된 재고가 없습니다.';

  const groups = new Map<string, ReportLine[]>();
  for (const line of counted) {
    const group = groups.get(line.categoryName);
    if (group) group.push(line);
    else groups.set(line.categoryName, [line]);
  }
  const rank = (name: string) => {
    const index = categoryOrder?.indexOf(name) ?? -1;
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  // Array.prototype.sort is stable, so unknown categories keep their order.
  const names = [...groups.keys()].sort((a, b) => rank(a) - rank(b));

  const date = new Date(at).toLocaleDateString('ko-KR', { timeZone: safeTimeZone(timeZone) });
  const blocks = names.map(name =>
    groups.get(name)!.map(line => `${line.itemName}: ${line.quantity} ${line.unit || '개'}`).join('\r\n'),
  );
  return `[${storeName} 재고조사 - ${date}]\r\n\r\n${blocks.join('\r\n\r\n')}`;
}

export function reportFileName(storeName: string, at: string | Date, timeZone?: string) {
  // en-CA formats dates as YYYY-MM-DD.
  const day = new Date(at).toLocaleDateString('en-CA', { timeZone: safeTimeZone(timeZone) });
  return `${storeName}_재고조사_${day}.txt`;
}

/** Saves the report as a .txt file (must run inside the tap handler on iOS). */
export function downloadReport(text: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([REPORT_BOM + text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Copies text; returns false when the browser refuses (call it inside the tap handler). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

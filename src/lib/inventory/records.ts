// inventory_history 기록을 다루는 순수 함수들(요약, 이전 값 비교, 재고 현황)
import { DEFAULT_UNIT, type CatalogItem } from './catalog';
import type { Counts } from './storage';

export type RecordItem = { id: string; name: string; category: string; unit: string; count: number | null };

export type HistoryRecord = {
  id: string;
  /** 저장한 기기의 ko-KR 시각 문자열(기존 앱이 넣던 값) */
  timestamp: string;
  /** DB 가 기록한 저장 시각(ISO) */
  createdAt: string;
  items: RecordItem[];
};

type Row = { id?: unknown; timestamp?: unknown; created_at?: unknown; items?: unknown };
type RowItem = { id?: unknown; name?: unknown; category?: unknown; unit?: unknown; count?: unknown };

export function toHistoryRecord(row: Row): HistoryRecord {
  const items = Array.isArray(row.items) ? (row.items as RowItem[]) : [];
  return {
    id: String(row.id),
    timestamp: typeof row.timestamp === 'string' ? row.timestamp : '',
    createdAt: typeof row.created_at === 'string' ? row.created_at : new Date(0).toISOString(),
    items: items.map(item => ({
      id: String(item.id),
      name: typeof item.name === 'string' ? item.name : '',
      category: typeof item.category === 'string' ? item.category : '',
      unit: typeof item.unit === 'string' && item.unit ? item.unit : DEFAULT_UNIT,
      count: typeof item.count === 'number' ? item.count : null,
    })),
  };
}

export function summarizeRecord(record: HistoryRecord) {
  const entered = record.items.filter(item => item.count !== null);
  return {
    entered: entered.length,
    zeros: entered.filter(item => item.count === 0).length,
    total: record.items.length,
    enteredNames: entered.map(item => item.name),
  };
}

export type LastCount = { count: number; at: string };

/** 더 앞선 기록들(최신순)에서 품목마다 마지막으로 입력한 값 */
export function previousCounts(older: readonly HistoryRecord[]): Map<string, LastCount> {
  const result = new Map<string, LastCount>();
  for (const record of older) {
    for (const item of record.items) {
      if (item.count !== null && !result.has(item.id)) result.set(item.id, { count: item.count, at: record.createdAt });
    }
  }
  return result;
}

/**
 * up: 늘어남, down: 줄어듦, zero: 0이 됨, same: 그대로,
 * none: 비교할 이전 값 없음, unchecked: 이번 기록에서 입력하지 않음
 */
export type Change = 'up' | 'down' | 'zero' | 'same' | 'none' | 'unchecked';
export type ComparedItem = { item: RecordItem; previous: number | null; delta: number | null; change: Change };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function compareItems(items: readonly RecordItem[], previous: ReadonlyMap<string, number>): ComparedItem[] {
  return items.map(item => {
    const before = previous.get(item.id) ?? null;
    const now = item.count;
    if (now === null) return { item, previous: before, delta: null, change: 'unchecked' };
    if (before === null) return { item, previous: null, delta: null, change: 'none' };
    const delta = round2(now - before);
    const change: Change = delta === 0 ? 'same' : now === 0 ? 'zero' : delta > 0 ? 'up' : 'down';
    return { item, previous: before, delta, change };
  });
}

export const isChanged = (row: ComparedItem) => row.change === 'up' || row.change === 'down' || row.change === 'zero';

/**
 * 기록을 불러올 때 쓸 수량. 품목 목록은 지금 목록을 그대로 두고 수량만 가져온다
 * (기록 전체로 바꾸면 지운 품목이 되살아난다). id 로 찾고, 없으면 이름으로 찾는다.
 */
export function countsFromRecord(current: readonly CatalogItem[], record: HistoryRecord): Counts {
  const counts: Counts = {};
  for (const item of current) {
    const saved = record.items.find(r => r.id === item.id) ?? record.items.find(r => r.name === item.name);
    counts[item.id] = saved ? saved.count : null;
  }
  return counts;
}

/** "오래됨" 표시 기준(일) */
export const STALE_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type StockStatus = 'unchecked' | 'zero' | 'counted';
export type StockRow = { item: CatalogItem; last: LastCount | null; status: StockStatus; isStale: boolean };

/** 지금 품목마다 최근 기록(최신순)에서 마지막으로 입력한 수량. 한 번도 입력하지 않았으면 미확인이다. */
export function buildStock(items: readonly CatalogItem[], records: readonly HistoryRecord[], now: Date): StockRow[] {
  const last = previousCounts(records);
  return items.map(item => {
    const value = last.get(item.id) ?? null;
    const status: StockStatus = !value ? 'unchecked' : value.count === 0 ? 'zero' : 'counted';
    const isStale = value ? now.getTime() - new Date(value.at).getTime() > STALE_AFTER_DAYS * DAY_MS : false;
    return { item, last: value, status, isStale };
  });
}

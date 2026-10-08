import { describe, expect, it } from 'vitest';
import type { CatalogItem } from './catalog';
import {
  buildStock,
  compareItems,
  countsFromRecord,
  isChanged,
  previousCounts,
  summarizeRecord,
  toHistoryRecord,
  type HistoryRecord,
} from './records';

const item = (id: string, name: string, category = '파우더', unit = '개', display_order = 0): CatalogItem => ({
  id,
  name,
  category,
  unit,
  display_order,
});

const record = (id: string, createdAt: string, counts: Array<[string, string, number | null]>): HistoryRecord => ({
  id,
  timestamp: createdAt,
  createdAt,
  items: counts.map(([itemId, name, count]) => ({ id: itemId, name, category: '파우더', unit: '개', count })),
});

describe('toHistoryRecord', () => {
  it('normalizes a DB row: string ids, missing unit, missing count', () => {
    const r = toHistoryRecord({
      id: 7,
      timestamp: '2026. 10. 3. 오후 9:00:00',
      created_at: '2026-10-03T12:00:00+00:00',
      items: [
        { id: 1, name: '말차', category: '파우더', count: 2 },
        { id: '2', name: '그린티', category: '파우더', unit: '봉지' },
      ],
    });
    expect(r).toEqual({
      id: '7',
      timestamp: '2026. 10. 3. 오후 9:00:00',
      createdAt: '2026-10-03T12:00:00+00:00',
      items: [
        { id: '1', name: '말차', category: '파우더', unit: '개', count: 2 },
        { id: '2', name: '그린티', category: '파우더', unit: '봉지', count: null },
      ],
    });
  });

  it('keeps a row whose items are not an array readable', () => {
    expect(toHistoryRecord({ id: 'a', timestamp: 't', created_at: '2026-10-03T12:00:00Z', items: null }).items).toEqual([]);
  });
});

describe('summarizeRecord', () => {
  it('counts entered items and zeros, and lists the entered names in order', () => {
    const r = record('1', '2026-10-03T12:00:00Z', [
      ['1', '말차', 2],
      ['2', '그린티', null],
      ['3', '바닐라', 0],
    ]);
    expect(summarizeRecord(r)).toEqual({ entered: 2, zeros: 1, total: 3, enteredNames: ['말차', '바닐라'] });
  });
});

describe('previousCounts', () => {
  it('takes the newest entered value per item from older records (newest first)', () => {
    const older = [
      record('3', '2026-10-02T12:00:00Z', [
        ['1', '말차', null],
        ['2', '그린티', 4],
      ]),
      record('2', '2026-10-01T12:00:00Z', [
        ['1', '말차', 3],
        ['2', '그린티', 9],
      ]),
    ];
    const prev = previousCounts(older);
    expect(prev.get('1')).toEqual({ count: 3, at: '2026-10-01T12:00:00Z' });
    expect(prev.get('2')).toEqual({ count: 4, at: '2026-10-02T12:00:00Z' });
    expect(prev.has('9')).toBe(false);
  });
});

describe('compareItems', () => {
  it('tags up, down, zero, same, none and unchecked', () => {
    const r = record('9', '2026-10-03T12:00:00Z', [
      ['1', '올라감', 5],
      ['2', '내려감', 1.5],
      ['3', '0이 됨', 0],
      ['4', '그대로', 2],
      ['5', '처음', 1],
      ['6', '미입력', null],
    ]);
    const prev = new Map([
      ['1', 2],
      ['2', 3],
      ['3', 4],
      ['4', 2],
      ['6', 1],
    ]);
    const rows = compareItems(r.items, prev);
    expect(rows.map(row => [row.item.name, row.change, row.delta])).toEqual([
      ['올라감', 'up', 3],
      ['내려감', 'down', -1.5],
      ['0이 됨', 'zero', -4],
      ['그대로', 'same', 0],
      ['처음', 'none', null],
      ['미입력', 'unchecked', null],
    ]);
    expect(rows.filter(isChanged).map(row => row.item.name)).toEqual(['올라감', '내려감', '0이 됨']);
  });
});

describe('countsFromRecord', () => {
  it('keeps the current item list and takes counts by id, then by name, else not entered', () => {
    const current = [item('1', '말차'), item('new', '그린티'), item('3', '바닐라')];
    const r = record('1', '2026-10-03T12:00:00Z', [
      ['1', '말차', 2],
      ['old-2', '그린티', 0],
      ['gone', '사라진 품목', 5],
    ]);
    expect(countsFromRecord(current, r)).toEqual({ '1': 2, new: 0, '3': null });
  });
});

describe('buildStock', () => {
  const now = new Date('2026-10-09T12:00:00Z');

  it('uses the newest entered value per item and flags values older than 7 days', () => {
    const items = [item('1', '말차'), item('2', '그린티'), item('3', '바닐라')];
    const records = [
      record('2', '2026-10-08T12:00:00Z', [
        ['1', '말차', 0],
        ['2', '그린티', null],
      ]),
      record('1', '2026-09-30T12:00:00Z', [
        ['1', '말차', 5],
        ['2', '그린티', 3],
      ]),
    ];
    const rows = buildStock(items, records, now);
    expect(rows.map(row => [row.item.name, row.status, row.last?.count ?? null, row.isStale])).toEqual([
      ['말차', 'zero', 0, false],
      ['그린티', 'counted', 3, true],
      ['바닐라', 'unchecked', null, false],
    ]);
  });
});

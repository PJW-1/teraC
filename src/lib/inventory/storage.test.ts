import { beforeEach, describe, expect, it } from 'vitest';
import { readStoredCatalog, readStoredCounts, writeStoredInventory } from './storage';

// 기존 앱이 쓰던 키와 모양: inventory_items = [{ id, name, category, count, unit, display_order }]
const KEY = 'inventory_items';

beforeEach(() => localStorage.clear());

describe('stored counts', () => {
  it('reads counts written by the old app', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([
        { id: '1', name: '말차', category: '파우더', count: 2.5, unit: '개', display_order: 0 },
        { id: '2', name: '그린티', category: '파우더', count: null, unit: '개', display_order: 1 },
        { id: '3', name: '바닐라', category: '파우더', count: 0 },
      ]),
    );
    expect(readStoredCounts()).toEqual({ '1': 2.5, '2': null, '3': 0 });
  });

  it('returns nothing for a missing or broken value', () => {
    expect(readStoredCounts()).toEqual({});
    localStorage.setItem(KEY, '{broken');
    expect(readStoredCounts()).toEqual({});
    expect(readStoredCatalog()).toBeNull();
  });

  it('writes the old shape back, so the old app still reads it', () => {
    writeStoredInventory(
      [
        { id: '1', name: '말차', category: '파우더', unit: '개', display_order: 0 },
        { id: '2', name: '그린티', category: '파우더', unit: '봉지', display_order: 1 },
      ],
      { '1': 3, gone: 9 },
    );
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([
      { id: '1', name: '말차', category: '파우더', unit: '개', display_order: 0, count: 3 },
      { id: '2', name: '그린티', category: '파우더', unit: '봉지', display_order: 1, count: null },
    ]);
    expect(readStoredCatalog()).toEqual([
      { id: '1', name: '말차', category: '파우더', unit: '개', display_order: 0 },
      { id: '2', name: '그린티', category: '파우더', unit: '봉지', display_order: 1 },
    ]);
  });
});

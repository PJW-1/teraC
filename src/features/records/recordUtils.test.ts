import { describe, expect, it } from 'vitest';
import type { HistoryRecord } from '../../lib/inventory/records';
import { formatDateTime, formatTime, groupByDay } from './recordUtils';

const rec = (id: string, createdAt: string): HistoryRecord => ({ id, timestamp: '', createdAt, items: [] });

describe('formatDateTime', () => {
  it('한국 시간 기준 긴 형식으로 보여 준다', () => {
    expect(formatDateTime('2026-10-08T07:05:00Z')).toMatch(/^10월 8일 \(목\) (오후|PM) 4:05$/);
  });
});

describe('formatTime', () => {
  it('시각만 보여 준다', () => {
    expect(formatTime('2026-10-08T07:05:00Z')).toMatch(/^(오후|PM) 4:05$/);
  });
});

describe('groupByDay', () => {
  it('한국 날짜 기준으로 묶고 처음 나온 순서를 지킨다', () => {
    const groups = groupByDay([
      rec('a', '2026-10-08T15:30:00Z'), // 한국 10/9 00:30
      rec('b', '2026-10-08T14:00:00Z'), // 한국 10/8 23:00
      rec('c', '2026-10-08T01:00:00Z'),
      rec('d', '2026-10-07T03:00:00Z'),
    ]);
    expect(groups.map(g => g.label)).toEqual(['10월 9일 (금)', '10월 8일 (목)', '10월 7일 (수)']);
    expect(groups[1].records.map(r => r.id)).toEqual(['b', 'c']);
  });

  it('연도가 다르면 같은 월일이라도 따로 묶는다', () => {
    const groups = groupByDay([rec('a', '2026-10-08T01:00:00Z'), rec('b', '2025-10-08T01:00:00Z')]);
    expect(groups).toHaveLength(2);
  });
});

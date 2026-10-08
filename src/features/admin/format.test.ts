import { describe, expect, it } from 'vitest';
import { formatDateTime, formatRelative } from './format';

describe('formatDateTime', () => {
  it('shows month/day and 24-hour time in Korea time by default', () => {
    expect(formatDateTime('2026-10-05T07:00:00Z')).toBe('10/5 16:00');
    expect(formatDateTime('2026-01-08T22:05:00Z')).toBe('1/9 07:05');
  });

  it('uses the store time zone when given one', () => {
    expect(formatDateTime('2026-10-05T07:00:00Z', 'Asia/Seoul')).toBe('10/5 16:00');
    expect(formatDateTime('2026-10-05T02:30:00Z', 'America/New_York')).toBe('10/4 22:30');
    expect(formatDateTime('2026-10-04T15:00:00Z', 'Asia/Seoul')).toBe('10/5 00:00');
  });

  it('falls back to local time for a time zone Intl rejects', () => {
    expect(formatDateTime(new Date(2026, 9, 5, 16, 0).toISOString(), 'Seoul')).toBe('10/5 16:00');
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-10-08T12:00:00Z');
  it('describes how long ago a time was', () => {
    expect(formatRelative('2026-10-08T11:59:30Z', now)).toBe('방금 전');
    expect(formatRelative('2026-10-08T11:15:00Z', now)).toBe('45분 전');
    expect(formatRelative('2026-10-08T10:00:00Z', now)).toBe('2시간 전');
    expect(formatRelative('2026-10-05T12:00:00Z', now)).toBe('3일 전');
  });

  it('treats a time slightly ahead of the device clock as just now', () => {
    expect(formatRelative('2026-10-08T12:01:00Z', now)).toBe('방금 전');
  });
});

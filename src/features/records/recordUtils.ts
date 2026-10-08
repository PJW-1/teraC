import type { HistoryRecord } from '../../lib/inventory/records';
import { TIME_ZONE } from '../../lib/store';
import { safeTimeZone } from '../../lib/timeZone';

/** "10월 8일 (수) 오후 4:05" */
export function formatDateTime(iso: string, timeZone: string = TIME_ZONE) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: safeTimeZone(timeZone),
  });
}

export function formatTime(iso: string, timeZone: string = TIME_ZONE) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: safeTimeZone(timeZone) });
}

function dayLabel(iso: string, timeZone: string | undefined) {
  const parts = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short', timeZone }).formatToParts(
    new Date(iso),
  );
  const get = (type: string) => parts.find(p => p.type === type)?.value;
  return `${get('month')}월 ${get('day')}일 (${get('weekday')})`;
}

/** 기록을 날짜(한국 달력 기준)별로 묶는다. 처음 나온 순서를 지킨다. */
export function groupByDay(records: readonly HistoryRecord[], timeZone: string = TIME_ZONE) {
  const zone = safeTimeZone(timeZone);
  // 라벨만으로는 몇 해마다 겹치므로 연도가 든 날짜를 키로 쓴다.
  const dateFormat = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: zone });
  const groups = new Map<string, { key: string; label: string; records: HistoryRecord[] }>();
  for (const record of records) {
    const key = dateFormat.format(new Date(record.createdAt));
    const group = groups.get(key);
    if (group) group.records.push(record);
    else groups.set(key, { key, label: dayLabel(record.createdAt, zone), records: [record] });
  }
  return [...groups.values()];
}

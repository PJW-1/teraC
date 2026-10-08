import { TIME_ZONE } from '../../lib/store';
import { safeTimeZone } from '../../lib/timeZone';

/** "10/5 16:00", 매장 시간대(한국) 기준 */
export function formatDateTime(iso: string, timeZone: string = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: safeTimeZone(timeZone),
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find(p => p.type === type)?.value;
  return `${get('month')}/${get('day')} ${get('hour')}:${get('minute')}`;
}

/** "45분 전", "2시간 전", "3일 전". */
export function formatRelative(iso: string, now: Date) {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

/** "1.5팩"; quantities come from numeric(10,2), so plain number formatting is enough. */
export const formatQuantity = (quantity: number, unit: string) => `${quantity}${unit}`;

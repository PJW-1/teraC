// inventory_history 읽기와 저장. Supabase 설정이 없으면(로컬 개발, 테스트) 이 기기 localStorage 를 쓴다.
import { isSupabaseConfigured, supabase } from '../../supabase';
import { toHistoryRecord, type HistoryRecord, type RecordItem } from './records';

const LOCAL_KEY = 'inventory_history';
const LOCAL_LIMIT = 50;
const COLUMNS = 'id, timestamp, created_at, items';

export const historyKeys = {
  all: ['history'] as const,
  list: () => ['history', 'list'] as const,
  recent: (limit: number) => ['history', 'recent', limit] as const,
  record: (id: string) => ['history', 'record', id] as const,
  before: (id: string) => ['history', 'before', id] as const,
};

function readLocal(): HistoryRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row, index) => toHistoryRecord({ ...row, id: row?.id ?? `local-${index}` }));
  } catch {
    return [];
  }
}

function writeLocal(records: HistoryRecord[]) {
  const rows = records.slice(0, LOCAL_LIMIT).map(r => ({ id: r.id, timestamp: r.timestamp, created_at: r.createdAt, items: r.items }));
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

/** 최신순으로 page 번째 묶음 */
export async function fetchRecords(page: number, pageSize: number): Promise<HistoryRecord[]> {
  if (!isSupabaseConfigured || !supabase) return readLocal().slice(page * pageSize, (page + 1) * pageSize);
  const { data, error } = await supabase
    .from('inventory_history')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return (data ?? []).map(toHistoryRecord);
}

export async function fetchRecord(id: string): Promise<HistoryRecord | null> {
  if (!isSupabaseConfigured || !supabase) return readLocal().find(r => r.id === id) ?? null;
  const { data, error } = await supabase.from('inventory_history').select(COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toHistoryRecord(data) : null;
}

/** 이 기록보다 앞선 기록들(최신순). 이전 값 비교에 쓴다. */
export async function fetchRecordsBefore(record: HistoryRecord, limit = 10): Promise<HistoryRecord[]> {
  if (!isSupabaseConfigured || !supabase) {
    const all = readLocal();
    const index = all.findIndex(r => r.id === record.id);
    return index === -1 ? [] : all.slice(index + 1, index + 1 + limit);
  }
  const { data, error } = await supabase
    .from('inventory_history')
    .select(COLUMNS)
    .lt('created_at', record.createdAt)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(toHistoryRecord);
}

/** 조사 결과를 기록으로 남긴다. 기존 앱과 같은 모양({ timestamp, items })으로 넣는다. */
export async function saveRecord(items: RecordItem[], at = new Date()): Promise<HistoryRecord> {
  const timestamp = at.toLocaleString('ko-KR');
  if (!isSupabaseConfigured || !supabase) {
    const record: HistoryRecord = { id: String(at.getTime()), timestamp, createdAt: at.toISOString(), items };
    writeLocal([record, ...readLocal()]);
    return record;
  }
  const { data, error } = await supabase.from('inventory_history').insert([{ timestamp, items }]).select(COLUMNS).single();
  if (error) throw error;
  return toHistoryRecord(data);
}

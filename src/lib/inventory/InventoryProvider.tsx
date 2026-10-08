import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../supabase';
import { stepQuantity } from '../quantity';
import { COUNT_STEP, DEFAULT_UNIT, INITIAL_DATA, type CatalogItem } from './catalog';
import { InventoryContext, type InventorySource, type InventoryValue } from './inventoryContext';
import { countsFromRecord } from './records';
import { readStoredCatalog, readStoredCounts, writeStoredInventory, type Counts } from './storage';

type DbItem = { id: unknown; name: string; category: string; unit?: string | null; display_order?: number | null };

const toCatalogItem = (row: DbItem, index: number): CatalogItem => ({
  id: String(row.id),
  name: row.name,
  category: row.category,
  unit: row.unit || DEFAULT_UNIT,
  display_order: row.display_order ?? index,
});

const byOrder = (a: CatalogItem, b: CatalogItem) => a.display_order - b.display_order;
const toRow = ({ id, name, category, unit, display_order }: CatalogItem) => ({ id, name, category, unit, display_order });

const NETWORK_HINT = '인터넷 연결을 확인하고 다시 시도해 주세요.';

/** 품목 목록과 단위는 DB 만 기준으로 삼고, 수량만 기기별 localStorage 값을 쓴다. */
async function loadCatalog(): Promise<{ items: CatalogItem[]; source: InventorySource }> {
  if (!isSupabaseConfigured || !supabase) return { items: readStoredCatalog() ?? INITIAL_DATA, source: 'local' };
  try {
    const { data, error } = await supabase.from('inventory_items').select('*').order('display_order', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) return { items: data.map(toCatalogItem).sort(byOrder), source: 'server' };
    // DB 가 비어 있으면 처음 품목 목록을 넣는다
    const { data: seeded, error: seedError } = await supabase.from('inventory_items').insert(INITIAL_DATA.map(toRow)).select();
    if (seedError || !seeded) throw seedError ?? new Error('품목 초기화 실패');
    return { items: seeded.map(toCatalogItem).sort(byOrder), source: 'server' };
  } catch (error) {
    console.error('품목 목록을 불러오지 못해 이 기기에 받아 둔 목록을 씁니다:', error);
    return { items: readStoredCatalog() ?? INITIAL_DATA, source: 'offline' };
  }
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [counts, setCounts] = useState<Counts>(readStoredCounts);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [source, setSource] = useState<InventorySource>(isSupabaseConfigured ? 'server' : 'local');
  const [loadKey, setLoadKey] = useState(0);
  // 마지막 순서 저장 요청 번호. 늦게 실패한 옛 요청이 새 순서를 되돌리지 않게 한다
  const orderSeq = useRef(0);
  // 품목별 마지막 수정 요청 번호
  const itemSeq = useRef(new Map<string, number>());

  useEffect(() => {
    let cancelled = false;
    void loadCatalog().then(result => {
      if (cancelled) return;
      setItems(result.items);
      setSource(result.source);
      setStatus('ready');
    });
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  // 다른 기기에서 바꾼 품목 목록을 바로 반영한다
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    const channel = client
      .channel('public:inventory_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, payload => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as DbItem;
          setItems(prev => (prev.some(i => i.id === String(row.id)) ? prev : [...prev, toCatalogItem(row, prev.length)].sort(byOrder)));
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as DbItem;
          setItems(prev =>
            prev
              .map(i =>
                i.id === String(row.id)
                  ? { ...i, name: row.name, category: row.category, unit: row.unit || i.unit, display_order: row.display_order ?? i.display_order }
                  : i,
              )
              .sort(byOrder),
          );
        } else if (payload.eventType === 'DELETE') {
          const id = String((payload.old as { id?: unknown }).id);
          setItems(prev => prev.filter(i => i.id !== id));
        }
      })
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  // 목록을 받기 전에는 쓰지 않는다(빈 목록으로 덮으면 입력해 둔 수량이 사라진다)
  useEffect(() => {
    if (status === 'ready' && items.length > 0) writeStoredInventory(items, counts);
  }, [items, counts, status]);

  const value = useMemo<InventoryValue>(() => {
    const db = isSupabaseConfigured ? supabase : null;

    return {
      status,
      source,
      items,
      counts,
      setCount: (id, quantity) => setCounts(prev => ({ ...prev, [id]: quantity })),
      stepCount: (id, direction) => setCounts(prev => ({ ...prev, [id]: stepQuantity(prev[id] ?? null, COUNT_STEP, direction) })),
      resetCounts: () => setCounts({}),
      loadCounts: record => setCounts(countsFromRecord(items, record)),
      reload: () => {
        setStatus('loading');
        setLoadKey(k => k + 1);
      },

      addItem: async ({ name, category, unit }) => {
        const item: CatalogItem = {
          id: Date.now().toString(),
          name,
          category,
          unit,
          display_order: items.reduce((max, i) => Math.max(max, i.display_order), -1) + 1,
        };
        setItems(prev => [...prev, item]);
        if (!db) return true;
        const { error } = await db.from('inventory_items').insert([toRow(item)]);
        if (!error) return true;
        // DB 에 없는 품목은 다음에 앱을 열 때 사라지므로 화면에서도 뺀다
        console.error('품목 추가 실패:', error);
        setItems(prev => prev.filter(i => i.id !== item.id));
        toast.error(`'${name}' 품목을 저장하지 못했습니다. ${NETWORK_HINT}`);
        return false;
      },

      updateItem: async (id, patch) => {
        const before = items.find(i => i.id === id);
        if (!before) return false;
        const seq = (itemSeq.current.get(id) ?? 0) + 1;
        itemSeq.current.set(id, seq);
        setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));
        if (!db) return true;
        const { error } = await db.from('inventory_items').update(patch).eq('id', id);
        if (!error) return true;
        console.error('품목 수정 실패:', error);
        // 그 사이 이 기기나 다른 기기에서 다시 바꿨다면 그 변경을 지우지 않는다
        if (itemSeq.current.get(id) === seq) {
          const keys = Object.keys(patch) as Array<keyof typeof patch>;
          setItems(prev =>
            prev.map(i => {
              if (i.id !== id) return i;
              const reverted = { ...i };
              for (const key of keys) if (i[key] === patch[key]) reverted[key] = before[key];
              return reverted;
            }),
          );
        }
        toast.error(`품목을 저장하지 못했습니다. ${NETWORK_HINT}`);
        return false;
      },

      deleteItem: async id => {
        const removed = items.find(i => i.id === id);
        if (!removed) return false;
        setItems(prev => prev.filter(i => i.id !== id));
        if (!db) return true;
        const { error } = await db.from('inventory_items').delete().eq('id', id);
        if (!error) return true;
        console.error('품목 삭제 실패:', error);
        setItems(prev => (prev.some(i => i.id === id) ? prev : [...prev, removed].sort(byOrder)));
        toast.error(`'${removed.name}' 품목을 삭제하지 못했습니다. ${NETWORK_HINT}`);
        return false;
      },

      moveItem: async (category, itemId, toIndex) => {
        const inCategory = items.filter(i => i.category === category);
        const from = inCategory.findIndex(i => i.id === itemId);
        if (from === -1 || from === toIndex) return true;
        const [moved] = inCategory.splice(from, 1);
        inCategory.splice(toIndex, 0, moved);
        const updated = [...items.filter(i => i.category !== category), ...inCategory].map((item, index) => ({
          ...item,
          display_order: index,
        }));
        const prevOrder = new Map(items.map(i => [i.id, i.display_order]));
        const seq = ++orderSeq.current;
        setItems(updated);
        if (!db) return true;
        const { error } = await db.from('inventory_items').upsert(updated.map(toRow), { onConflict: 'id' });
        if (!error) return true;
        // 순서는 모든 기기가 DB 값을 따르므로, 저장하지 못했으면 DB 순서를 다시 읽어 맞춘다.
        // 읽지 못하면 옮기기 전 순서로 되돌리고, 그 뒤에 다시 옮겼다면 건드리지 않는다
        console.error('순서 저장 실패:', error);
        if (seq === orderSeq.current) {
          const { data: rows } = await db.from('inventory_items').select('id, display_order');
          const order = rows ? new Map(rows.map(row => [String(row.id), row.display_order as number | null])) : prevOrder;
          if (seq === orderSeq.current) {
            setItems(prev =>
              prev
                .map(i => {
                  const o = order.get(i.id);
                  return o === undefined || o === null ? i : { ...i, display_order: o };
                })
                .sort(byOrder),
            );
          }
        }
        toast.error(`바꾼 순서를 저장하지 못했습니다. ${NETWORK_HINT}`);
        return false;
      },
    };
  }, [status, source, items, counts]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

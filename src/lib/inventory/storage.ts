import { DEFAULT_UNIT, type CatalogItem } from './catalog';

/** 품목 id 별 수량. null 은 미입력이다. */
export type Counts = Record<string, number | null>;

// 기존 앱과 같은 키와 모양을 쓴다. 새 버전과 옛 버전을 오가도 기기에 입력한 수량이 남는다.
const ITEMS_KEY = 'inventory_items';

type StoredItem = Partial<CatalogItem> & { id?: unknown; count?: unknown };

function readStoredArray(): StoredItem[] | null {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredItem[]) : null;
  } catch {
    return null;
  }
}

/** 이 기기에 입력해 둔 수량 */
export function readStoredCounts(): Counts {
  const counts: Counts = {};
  for (const item of readStoredArray() ?? []) {
    if (item.id === undefined || item.id === null) continue;
    counts[String(item.id)] = typeof item.count === 'number' ? item.count : null;
  }
  return counts;
}

/** 서버에 닿지 못할 때 쓰는, 이 기기에 마지막으로 받아 둔 품목 목록 */
export function readStoredCatalog(): CatalogItem[] | null {
  const stored = readStoredArray();
  if (!stored || stored.length === 0) return null;
  return stored
    .filter(item => item.id !== undefined && item.id !== null && typeof item.name === 'string')
    .map((item, index) => ({
      id: String(item.id),
      name: item.name as string,
      category: typeof item.category === 'string' ? item.category : '',
      unit: typeof item.unit === 'string' && item.unit ? item.unit : DEFAULT_UNIT,
      display_order: typeof item.display_order === 'number' ? item.display_order : index,
    }));
}

/** 품목 목록과 수량을 기존 모양([{ ...품목, count }])으로 저장한다. 목록에 없는 품목의 수량은 버린다. */
export function writeStoredInventory(items: readonly CatalogItem[], counts: Counts) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items.map(item => ({ ...item, count: counts[item.id] ?? null }))));
  } catch {
    // 저장 공간이 없거나 막힌 브라우저에서는 이 기기 보관만 건너뛴다
  }
}

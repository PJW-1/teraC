import { createContext, useContext } from 'react';
import type { CatalogItem } from './catalog';
import type { HistoryRecord } from './records';
import type { Counts } from './storage';

/**
 * server: DB 품목 목록, local: Supabase 설정 없음(로컬 개발, 테스트),
 * offline: DB 를 읽지 못해 이 기기에 받아 둔 목록을 보여 주는 중
 */
export type InventorySource = 'server' | 'local' | 'offline';

export type ItemInput = { name: string; category: string; unit: string };

export type InventoryValue = {
  status: 'loading' | 'ready';
  source: InventorySource;
  /** display_order 순서 */
  items: CatalogItem[];
  /** 이 기기에 입력한 수량 */
  counts: Counts;
  setCount: (id: string, value: number | null) => void;
  stepCount: (id: string, direction: 1 | -1) => void;
  resetCounts: () => void;
  /** 기록의 수량으로 덮어쓴다(품목 목록은 그대로) */
  loadCounts: (record: HistoryRecord) => void;
  /** 성공하면 true. 실패하면 화면을 되돌리고 오류 토스트를 띄운 뒤 false */
  addItem: (input: ItemInput) => Promise<boolean>;
  updateItem: (id: string, patch: Partial<Pick<CatalogItem, 'name' | 'unit'>>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  /** 같은 카테고리 안에서 품목을 toIndex 자리로 옮긴다 */
  moveItem: (category: string, itemId: string, toIndex: number) => Promise<boolean>;
  reload: () => void;
};

export const InventoryContext = createContext<InventoryValue | null>(null);

export function useInventory(): InventoryValue {
  const value = useContext(InventoryContext);
  if (!value) throw new Error('useInventory 는 InventoryProvider 안에서만 쓸 수 있습니다.');
  return value;
}

import { CATEGORY_ORDER } from '../inventory/catalog';
import { STORE_NAME, TIME_ZONE } from '../store';
import { reportFileName, reportText } from './reportText';

type Line = { name: string; category: string; unit: string; count: number | null };

/** 기존 앱과 같은 보고서([테라커피 재고조사 - 날짜], 카테고리 순서, CRLF)와 파일 이름 */
export function inventoryReport(items: readonly Line[], at: string | Date) {
  return {
    text: reportText({
      storeName: STORE_NAME,
      at,
      timeZone: TIME_ZONE,
      categoryOrder: CATEGORY_ORDER,
      lines: items.map(item => ({ categoryName: item.category, itemName: item.name, unit: item.unit, quantity: item.count })),
    }),
    fileName: reportFileName(STORE_NAME, at, TIME_ZONE),
  };
}

// 카테고리 표시 순서와 처음 품목 목록(DB 가 비었을 때 넣는 값)
export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  display_order: number;
};

/** DB 에 카테고리 테이블이 없어서 이 순서로 보여 준다. 목록에 없는 카테고리는 뒤에 붙는다. */
export const CATEGORY_ORDER = ['파우더', '청/잼/당류', '티백', '아이스크림', '토핑/부재료', '베이커리', '소모품', '원두'];

export const UNITS = ['개', '봉지', '줄', '팩', '통', '박스'];
export const DEFAULT_UNIT = '개';

/** +, - 버튼 한 번에 바뀌는 수량 */
export const COUNT_STEP = 0.5;

const SEED: Array<Omit<CatalogItem, 'display_order'>> = [
  { id: '1', name: '디카페인 원두', category: '원두', unit: '개' },
  { id: '2', name: '싱글 원두', category: '원두', unit: '개' },
  { id: '3', name: '블랜드 원두', category: '원두', unit: '개' },
  { id: '4', name: '청송사과', category: '파우더', unit: '개' },
  { id: '5', name: '그린티', category: '파우더', unit: '개' },
  { id: '6', name: '말차', category: '파우더', unit: '개' },
  { id: '7', name: '미숫가루', category: '파우더', unit: '개' },
  { id: '8', name: '쌍화차', category: '파우더', unit: '개' },
  { id: '9', name: '민트초코', category: '파우더', unit: '개' },
  { id: '10', name: '고구마', category: '파우더', unit: '개' },
  { id: '11', name: '더블초코자바칩', category: '파우더', unit: '개' },
  { id: '12', name: '초코퍼지', category: '파우더', unit: '개' },
  { id: '13', name: '프루맥스', category: '파우더', unit: '개' },
  { id: '14', name: '레몬에이드', category: '파우더', unit: '개' },
  { id: '15', name: '시그니처', category: '파우더', unit: '개' },
  { id: '16', name: '바닐라', category: '파우더', unit: '개' },
  { id: '17', name: '헤이즐넛', category: '파우더', unit: '개' },
  { id: '18', name: '토피넛', category: '파우더', unit: '개' },
  { id: '19', name: '핑크에너지', category: '파우더', unit: '개' },
  { id: '20', name: '포도', category: '파우더', unit: '개' },
  { id: '21', name: '블루오로라', category: '파우더', unit: '개' },
  { id: '22', name: '체리에이드', category: '파우더', unit: '개' },
  { id: '23', name: '밀크', category: '파우더', unit: '개' },
  { id: '24', name: '밀크쉐이크', category: '파우더', unit: '개' },
  { id: '25', name: '홍차', category: '파우더', unit: '개' },
  { id: '26', name: '복숭아 아이스티', category: '파우더', unit: '개' },
  { id: '27', name: '커피믹스', category: '파우더', unit: '개' },
  { id: '28', name: '딸기잼', category: '청/잼/당류', unit: '개' },
  { id: '29', name: '블루베리잼', category: '청/잼/당류', unit: '개' },
  { id: '30', name: '한라봉잼', category: '청/잼/당류', unit: '개' },
  { id: '31', name: '레몬청', category: '청/잼/당류', unit: '개' },
  { id: '32', name: '생강청', category: '청/잼/당류', unit: '개' },
  { id: '33', name: '연유', category: '청/잼/당류', unit: '개' },
  { id: '34', name: '시럽', category: '청/잼/당류', unit: '개' },
  { id: '35', name: '설탕', category: '청/잼/당류', unit: '개' },
  { id: '36', name: '얼그레이 티백', category: '티백', unit: '개' },
  { id: '37', name: '썸머베리 티백', category: '티백', unit: '개' },
  { id: '38', name: '캐모마일 티백', category: '티백', unit: '개' },
  { id: '39', name: '페퍼민트 티백', category: '티백', unit: '개' },
  { id: '40', name: '초코소프트', category: '파우더', unit: '개' },
  { id: '41', name: '바닐라스카이', category: '파우더', unit: '개' },
  { id: '42', name: '콘', category: '아이스크림', unit: '개' },
  { id: '43', name: '콘지', category: '아이스크림', unit: '개' },
  { id: '44', name: '아이스크림컵', category: '아이스크림', unit: '개' },
  { id: '45', name: '오레오 분태', category: '토핑/부재료', unit: '개' },
  { id: '46', name: '쿠앤크', category: '토핑/부재료', unit: '개' },
  { id: '47', name: '코코볼', category: '토핑/부재료', unit: '개' },
  { id: '48', name: '콘푸로스트', category: '토핑/부재료', unit: '개' },
  { id: '49', name: '컴파운드 초코칩', category: '토핑/부재료', unit: '개' },
  { id: '50', name: '마카다미아', category: '토핑/부재료', unit: '개' },
  { id: '51', name: '가당딸기', category: '토핑/부재료', unit: '개' },
  { id: '52', name: '초코쉘', category: '토핑/부재료', unit: '개' },
  { id: '53', name: '오렌지 건칩', category: '토핑/부재료', unit: '개' },
  { id: '54', name: '플레인 베이글', category: '베이커리', unit: '개' },
  { id: '55', name: '어니언 베이글', category: '베이커리', unit: '개' },
  { id: '56', name: '크로크무슈', category: '베이커리', unit: '개' },
  { id: '57', name: '소금빵', category: '베이커리', unit: '개' },
  { id: '58', name: '티라미슈', category: '베이커리', unit: '개' },
  { id: '59', name: '뉴욕치즈타르트', category: '베이커리', unit: '개' },
  { id: '60', name: '초코 마카롱', category: '베이커리', unit: '개' },
  { id: '61', name: '딸기 마카롱', category: '베이커리', unit: '개' },
  { id: '62', name: '피자붕어빵', category: '베이커리', unit: '개' },
  { id: '63', name: '마카다미아 쿠키', category: '베이커리', unit: '개' },
  { id: '64', name: '텍사스 화이트칩 쿠키', category: '베이커리', unit: '개' },
  { id: '65', name: '스모어쿠키', category: '베이커리', unit: '개' },
  { id: '66', name: '미니초코바이트', category: '베이커리', unit: '개' },
  { id: '67', name: '베이글칩', category: '베이커리', unit: '개' },
  { id: '68', name: '체다치즈 베이글칩', category: '베이커리', unit: '개' },
  { id: '69', name: '큰빵봉지', category: '소모품', unit: '개' },
  // 신규 추가 품목 (2026.8.9 재고조사 기준)
  { id: '70', name: '플레인 요거트', category: '파우더', unit: '개' },
  { id: '71', name: '아이스크림뚜껑', category: '소모품', unit: '줄' },
  { id: '72', name: 'L자봉투', category: '소모품', unit: '개' },
  { id: '73', name: '망고잼', category: '청/잼/당류', unit: '개' },
  { id: '75', name: '코코넛젤리', category: '토핑/부재료', unit: '개' },
  { id: '76', name: '팥', category: '토핑/부재료', unit: '개' },
  { id: '77', name: '버터떡', category: '베이커리', unit: '봉지' },
  { id: '78', name: '황치즈마카롱', category: '베이커리', unit: '개' },
  { id: '79', name: '순우유 마카롱', category: '베이커리', unit: '개' },
  { id: '80', name: '에그타르트', category: '베이커리', unit: '개' },
  { id: '81', name: '쿠앤크 뚱카롱', category: '베이커리', unit: '개' },
  { id: '82', name: '팥 붕어빵', category: '베이커리', unit: '개' },
  { id: '83', name: '크로플', category: '베이커리', unit: '개' },
  { id: '84', name: '초코칩 쿠키', category: '베이커리', unit: '개' },
  { id: '85', name: '오레오 케이크', category: '베이커리', unit: '개' },
  { id: '86', name: '당근 케이크', category: '베이커리', unit: '개' },
  { id: '87', name: '냉동망고', category: '토핑/부재료', unit: '개' },
  { id: '88', name: '오렌지 착즙주스', category: '청/잼/당류', unit: '개' },
];

export const INITIAL_DATA: CatalogItem[] = SEED.map((item, index) => ({ ...item, display_order: index }));

/** 카테고리 이름을 CATEGORY_ORDER 순서로 정렬하고, 목록에 없는 이름은 처음 나온 순서대로 뒤에 둔다. */
export function orderCategories(names: Iterable<string>): string[] {
  const unique = [...new Set(names)];
  const rank = (name: string) => {
    const index = CATEGORY_ORDER.indexOf(name);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return unique.sort((a, b) => rank(a) - rank(b));
}

/** 품목을 카테고리별로 묶는다. 묶음 안의 순서는 입력 순서를 따른다. */
export function groupByCategory<T extends { category: string }>(items: readonly T[]): Array<{ category: string; items: T[] }> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.category);
    if (group) group.push(item);
    else groups.set(item.category, [item]);
  }
  return orderCategories(groups.keys()).map(category => ({ category, items: groups.get(category)! }));
}

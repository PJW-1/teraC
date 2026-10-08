/** 품목 이름(대소문자 무시)이나 카테고리에 검색어가 들어 있으면 true. 빈 검색어는 모두 맞다. */
export function matchesSearch(item: { name: string; category: string }, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return item.name.toLowerCase().includes(needle) || item.category.toLowerCase().includes(needle);
}

// 품목 시트 입력 검사와 드래그 결과 변환
export type ItemFormInput = { name: string; category: string; unit: string };
export type ItemFormErrors = Partial<Record<keyof ItemFormInput, string>>;

/** otherNames: 이 품목을 뺀 나머지 품목의 이름 */
export function parseItemForm(
  input: ItemFormInput,
  otherNames: readonly string[],
): { ok: true; value: ItemFormInput } | { ok: false; errors: ItemFormErrors } {
  const name = input.name.trim();
  const errors: ItemFormErrors = {};
  if (!name) errors.name = '품목 이름을 입력해 주세요.';
  else if (otherNames.includes(name)) errors.name = '이미 있는 품목 이름입니다.';
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, category: input.category, unit: input.unit } };
}

type Drop = {
  draggableId: string;
  source: { droppableId: string; index: number };
  destination?: { droppableId: string; index: number } | null;
};

/** 같은 카테고리 안에서 자리가 바뀐 드롭만 moveItem 인자로 바꾼다. */
export function toMove({ source, destination, draggableId }: Drop) {
  if (!destination || destination.droppableId !== source.droppableId || destination.index === source.index) return null;
  return { category: source.droppableId, itemId: draggableId, toIndex: destination.index };
}

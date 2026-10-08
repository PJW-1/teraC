import { describe, expect, it } from 'vitest';
import { parseItemForm, toMove } from './itemForm';

const input = { name: '  말차  ', category: '파우더', unit: '개' };

describe('parseItemForm', () => {
  it('trims the name and accepts a new one', () => {
    expect(parseItemForm(input, ['콘'])).toEqual({ ok: true, value: { name: '말차', category: '파우더', unit: '개' } });
  });

  it('requires a name', () => {
    expect(parseItemForm({ ...input, name: '   ' }, [])).toEqual({ ok: false, errors: { name: '품목 이름을 입력해 주세요.' } });
  });

  it('rejects a name another item already has', () => {
    expect(parseItemForm(input, ['말차'])).toEqual({ ok: false, errors: { name: '이미 있는 품목 이름입니다.' } });
  });
});

describe('toMove', () => {
  const base = { draggableId: 'a', source: { droppableId: '파우더', index: 0 } };

  it('maps a drop inside one category to a move', () => {
    expect(toMove({ ...base, destination: { droppableId: '파우더', index: 2 } })).toEqual({ category: '파우더', itemId: 'a', toIndex: 2 });
  });

  it('ignores drops outside, in another category or in place', () => {
    expect(toMove({ ...base, destination: null })).toBeNull();
    expect(toMove({ ...base, destination: { droppableId: '원두', index: 1 } })).toBeNull();
    expect(toMove({ ...base, destination: { droppableId: '파우더', index: 0 } })).toBeNull();
  });
});

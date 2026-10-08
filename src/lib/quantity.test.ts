import { describe, expect, it } from 'vitest';
import { formatQuantity, parseQuantityInput, stepQuantity } from './quantity';

describe('parseQuantityInput', () => {
  it('empty input means not entered', () => {
    expect(parseQuantityInput('')).toEqual({ ok: true, value: null });
    expect(parseQuantityInput('  ')).toEqual({ ok: true, value: null });
  });

  it('accepts 0, decimals and a comma as the decimal mark', () => {
    expect(parseQuantityInput('0')).toEqual({ ok: true, value: 0 });
    expect(parseQuantityInput('1.5')).toEqual({ ok: true, value: 1.5 });
    expect(parseQuantityInput('2,25')).toEqual({ ok: true, value: 2.25 });
    expect(parseQuantityInput('3.')).toEqual({ ok: true, value: 3 });
  });

  it('rejects what the server would reject', () => {
    expect(parseQuantityInput('-1').ok).toBe(false);
    expect(parseQuantityInput('abc').ok).toBe(false);
    expect(parseQuantityInput('1.234').ok).toBe(false);
    expect(parseQuantityInput('1000001').ok).toBe(false);
    expect(parseQuantityInput('1e3').ok).toBe(false);
  });
});

describe('formatQuantity', () => {
  it('shows up to two decimals without trailing zeros', () => {
    expect(formatQuantity(1.5)).toBe('1.5');
    expect(formatQuantity(2)).toBe('2');
    expect(formatQuantity(null)).toBe('');
  });
});

describe('stepQuantity', () => {
  it('starts from 0 when not entered and never goes below 0', () => {
    expect(stepQuantity(null, 0.5, 1)).toBe(0.5);
    expect(stepQuantity(null, 0.5, -1)).toBe(0);
    expect(stepQuantity(0.3, 0.5, -1)).toBe(0);
    expect(stepQuantity(2, 0.5, 1)).toBe(2.5);
    expect(stepQuantity(0.1, 0.2, 1)).toBe(0.3);
  });
});

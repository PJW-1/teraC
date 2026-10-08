import { describe, expect, it } from 'vitest';
import { matchesSearch } from './search';

const item = { name: 'Matcha 말차', category: '파우더' };

describe('matchesSearch', () => {
  it('matches everything for an empty or blank term', () => {
    expect(matchesSearch(item, '')).toBe(true);
    expect(matchesSearch(item, '   ')).toBe(true);
  });

  it('matches part of the name, ignoring case', () => {
    expect(matchesSearch(item, 'matcha')).toBe(true);
    expect(matchesSearch(item, 'TCH')).toBe(true);
    expect(matchesSearch(item, '말차')).toBe(true);
  });

  it('matches part of the category', () => {
    expect(matchesSearch(item, '파우')).toBe(true);
  });

  it('trims the term and rejects other text', () => {
    expect(matchesSearch(item, '  말차  ')).toBe(true);
    expect(matchesSearch(item, '바닐라')).toBe(false);
  });
});

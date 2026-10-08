import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp, seedHistory } from '../../test/renderApp';

const DAY = 86_400_000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const item = (id: string, name: string, category: string, order: number) => ({ id, name, category, unit: '봉지', display_order: order, count: null });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    'inventory_items',
    JSON.stringify([item('a', '말차', '파우더', 0), item('b', '콘', '아이스크림', 1), item('c', '시럽', '파우더', 2), item('d', '설탕', '파우더', 3)]),
  );
  seedHistory([
    {
      id: 'r2',
      created_at: ago(DAY),
      items: [
        { id: 'a', name: '말차', category: '파우더', count: 0 },
        { id: 'b', name: '콘', category: '아이스크림', count: 3 },
      ],
    },
    { id: 'r1', created_at: ago(9 * DAY), items: [{ id: 'c', name: '시럽', category: '파우더', count: 2 }] },
  ]);
});

const row = (name: string) => screen.getByRole('listitem', { name });

describe('StockPage', () => {
  it('groups by category and shows the last count with badges', async () => {
    renderApp('/admin/stock');
    await screen.findByRole('listitem', { name: '말차' });
    expect(screen.getByRole('heading', { name: /파우더/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /아이스크림/ })).toBeInTheDocument();

    expect(within(row('말차')).getByText('0봉지')).toBeInTheDocument();
    expect(within(row('말차')).getByText('0개')).toBeInTheDocument();
    expect(within(row('말차')).getByText('1일 전 확인')).toBeInTheDocument();

    expect(within(row('콘')).getByText('3봉지')).toBeInTheDocument();
    expect(within(row('콘')).queryByText('0개')).toBeNull();
    expect(within(row('콘')).queryByText('오래됨')).toBeNull();

    expect(within(row('시럽')).getByText('2봉지')).toBeInTheDocument();
    expect(within(row('시럽')).getByText('오래됨')).toBeInTheDocument();

    expect(within(row('설탕')).getByText('미확인')).toBeInTheDocument();
  });

  it('filters by 0개 and 미확인', async () => {
    renderApp('/admin/stock');
    await screen.findByRole('listitem', { name: '말차' });
    await userEvent.click(screen.getByRole('button', { name: '0개' }));
    expect(screen.getByRole('listitem', { name: '말차' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: '콘' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '미확인' }));
    expect(screen.getByRole('listitem', { name: '설탕' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: '말차' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '전체' }));
    expect(screen.getByRole('listitem', { name: '콘' })).toBeInTheDocument();
  });
});

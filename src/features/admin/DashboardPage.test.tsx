import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp, seedHistory } from '../../test/renderApp';

const HOUR = 3_600_000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const item = (id: string, name: string, order: number) => ({ id, name, category: '파우더', unit: '개', display_order: order, count: null });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('inventory_items', JSON.stringify([item('a', '말차', 0), item('b', '콘', 1), item('c', '시럽', 2), item('d', '설탕', 3)]));
});

const kpi = (name: string) => screen.getByRole('group', { name });

describe('DashboardPage', () => {
  beforeEach(() =>
    seedHistory([
      {
        id: 'r2',
        created_at: ago(HOUR),
        items: [
          { id: 'a', name: '말차', category: '파우더', count: 0 },
          { id: 'b', name: '콘', category: '파우더', count: 2 },
          { id: 'c', name: '시럽', category: '파우더', count: null },
        ],
      },
      { id: 'r1', created_at: ago(10 * 24 * HOUR), items: [{ id: 'c', name: '시럽', category: '파우더', count: 0 }] },
    ]),
  );

  it('shows the KPIs computed from the history', async () => {
    renderApp('/admin');
    await screen.findByText('1건');
    expect(within(kpi('등록 품목')).getByText('4')).toBeInTheDocument();
    expect(within(kpi('0개 품목')).getByText('2')).toBeInTheDocument();
    expect(within(kpi('0개 품목')).getByText('그중 오래됨 1개')).toBeInTheDocument();
    expect(within(kpi('미확인 품목')).getByText('1')).toBeInTheDocument();
    expect(within(kpi('최근 7일 조사')).getByText('1건')).toBeInTheDocument();
  });

  it('shows the latest record and links to it', async () => {
    renderApp('/admin');
    const section = await screen.findByRole('region', { name: '마지막 조사' });
    expect(await within(section).findByText('입력 2개 · 0개 1개')).toBeInTheDocument();
    expect(within(section).getByRole('link')).toHaveAttribute('href', '/admin/records/r2');
  });

  it('lists the items whose last count is 0, marking stale ones', async () => {
    renderApp('/admin');
    const section = await screen.findByRole('region', { name: '0개 품목' });
    const rows = await within(section).findAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('말차')).toBeInTheDocument();
    expect(within(rows[0]).queryByText('오래됨')).toBeNull();
    expect(within(rows[1]).getByText('시럽')).toBeInTheDocument();
    expect(within(rows[1]).getByText('오래됨')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: '전체 보기' })).toHaveAttribute('href', '/admin/stock');
  });

  it('lists the recent records with a 0개 badge', async () => {
    renderApp('/admin');
    const section = await screen.findByRole('region', { name: '최근 제출' });
    const links = await within(section).findAllByRole('link', { name: /입력/ });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/admin/records/r2');
    expect(within(links[0]).getByText('입력 2개')).toBeInTheDocument();
    expect(within(links[0]).getByText('0개')).toBeInTheDocument();
    expect(within(links[1]).getByText('입력 1개')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: '전체 기록' })).toHaveAttribute('href', '/admin/records');
  });
});

describe('DashboardPage without records', () => {
  it('shows the empty texts', async () => {
    renderApp('/admin');
    expect(await screen.findByText('0개로 입력된 품목이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('아직 제출된 조사가 없습니다')).toBeInTheDocument();
    expect(within(kpi('미확인 품목')).getByText('4')).toBeInTheDocument();
  });
});

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp, seedHistory } from '../../test/renderApp';

type StoredItem = { id: string; name: string; category: string; unit: string; display_order: number; count: number | null };

function seedItems(counts: Record<string, number | null> = {}) {
  const items: StoredItem[] = [
    { id: '6', name: '말차', category: '파우더', unit: '개', display_order: 0, count: null },
    { id: '16', name: '바닐라', category: '파우더', unit: '개', display_order: 1, count: null },
    { id: 'b1', name: '크루아상', category: '베이커리', unit: '봉지', display_order: 2, count: null },
  ];
  localStorage.setItem('inventory_items', JSON.stringify(items.map(item => ({ ...item, count: counts[item.id] ?? null }))));
}

const storedCounts = (): Record<string, number | null> =>
  Object.fromEntries((JSON.parse(localStorage.getItem('inventory_items') ?? '[]') as StoredItem[]).map(i => [i.id, i.count]));
const storedHistory = () => JSON.parse(localStorage.getItem('inventory_history') ?? '[]') as Array<{ id: string; items: unknown[] }>;

beforeEach(() => {
  localStorage.clear();
  seedItems();
});

afterEach(() => vi.restoreAllMocks());

describe('count screen', () => {
  it('lists items by category without the progress line or x/total counts', async () => {
    renderApp('/count');
    expect(await screen.findByRole('heading', { name: '재고 조사' })).toBeInTheDocument();
    await screen.findByRole('textbox', { name: '말차 수량' });
    expect(screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)).toEqual(['파우더', '베이커리']);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+\s*\/\s*\d+/)).not.toBeInTheDocument();
    expect(screen.getByText('(봉지)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '조사 완료' })).toBeInTheDocument();
  });

  it('steps by 0.5, keeps 0 distinct from not entered and keeps the counts on the device', async () => {
    const user = userEvent.setup();
    renderApp('/count');
    const matcha = await screen.findByRole('textbox', { name: '말차 수량' });
    expect(matcha).toHaveValue('');
    expect(matcha).toHaveAttribute('data-state', 'empty');

    await user.click(screen.getByRole('button', { name: '말차 늘리기' }));
    expect(matcha).toHaveValue('0.5');
    await user.click(screen.getByRole('button', { name: '말차 늘리기' }));
    expect(matcha).toHaveValue('1');
    await user.click(screen.getByRole('button', { name: '바닐라 줄이기' }));
    const vanilla = screen.getByRole('textbox', { name: '바닐라 수량' });
    expect(vanilla).toHaveValue('0');
    expect(vanilla).toHaveAttribute('data-state', 'zero');

    await waitFor(() => expect(storedCounts()).toEqual({ '6': 1, '16': 0, b1: null }));
    expect(screen.getByRole('button', { name: '조사 완료 · 입력 2개' })).toBeInTheDocument();
    const chips = screen.getByRole('navigation', { name: '카테고리' });
    expect(within(chips).getByRole('button', { name: '파우더 2' })).toBeInTheDocument();
    expect(within(chips).getByRole('button', { name: '베이커리' })).toBeInTheDocument();
  });

  it('takes direct input and clearing it means not entered', async () => {
    const user = userEvent.setup();
    renderApp('/count');
    const matcha = await screen.findByRole('textbox', { name: '말차 수량' });
    await user.type(matcha, '2.5');
    await waitFor(() => expect(storedCounts()['6']).toBe(2.5));
    await user.clear(matcha);
    await waitFor(() => expect(storedCounts()['6']).toBeNull());
    expect(matcha).toHaveAttribute('data-state', 'empty');
  });

  it('restores the counts entered on this device', async () => {
    seedItems({ '6': 4 });
    renderApp('/count');
    expect(await screen.findByRole('textbox', { name: '말차 수량' })).toHaveValue('4');
  });

  it('jumps to a category from the chips', async () => {
    const user = userEvent.setup();
    renderApp('/count');
    const chips = await screen.findByRole('navigation', { name: '카테고리' });
    await user.click(within(chips).getByRole('button', { name: '베이커리' }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('resets every count after confirming', async () => {
    const user = userEvent.setup();
    seedItems({ '6': 3, '16': 0 });
    renderApp('/count');
    const matcha = await screen.findByRole('textbox', { name: '말차 수량' });
    expect(matcha).toHaveValue('3');
    await user.click(screen.getByRole('button', { name: '초기화' }));
    const sheet = await screen.findByRole('dialog');
    await user.click(within(sheet).getByRole('button', { name: '모두 미입력으로 되돌리기' }));
    expect(matcha).toHaveValue('');
    await waitFor(() => expect(storedCounts()).toEqual({ '6': null, '16': null, b1: null }));
  });
});

describe('submitting', () => {
  it('saves a record, copies the report and shows the completion screen', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/count');
    await user.click(await screen.findByRole('button', { name: '말차 늘리기' }));
    await user.click(screen.getByRole('button', { name: '바닐라 줄이기' }));
    await user.click(screen.getByRole('button', { name: '조사 완료 · 입력 2개' }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText('입력 2 · 0개 1')).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '제출하기' }));

    expect(await screen.findByRole('heading', { name: '제출했습니다' })).toBeInTheDocument();
    const history = storedHistory();
    expect(history).toHaveLength(1);
    expect(history[0].items).toEqual([
      { id: '6', name: '말차', category: '파우더', unit: '개', count: 0.5 },
      { id: '16', name: '바닐라', category: '파우더', unit: '개', count: 0 },
      { id: 'b1', name: '크루아상', category: '베이커리', unit: '봉지', count: null },
    ]);
    expect(router.state.location.search).toBe(`?submitted=${history[0].id}`);

    const report = await screen.findByLabelText('보고서 텍스트');
    expect(report.textContent).toMatch(/^\[테라커피 재고조사 - .+\]\r\n\r\n말차: 0\.5 개\r\n바닐라: 0 개$/);
    await expect(navigator.clipboard.readText()).resolves.toBe(report.textContent);
    expect(screen.getByRole('button', { name: '텍스트 복사' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '파일 저장' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '기록 보기' })).toHaveAttribute('href', `/records/${history[0].id}`);

    // 제출한 수량은 비우고 다음 조사를 새로 시작한다
    await waitFor(() => expect(storedCounts()).toEqual({ '6': null, '16': null, b1: null }));
    await user.click(screen.getByRole('button', { name: '새 조사 시작' }));
    expect(await screen.findByRole('textbox', { name: '말차 수량' })).toHaveValue('');
  });

  it('does not submit when nothing is entered', async () => {
    const user = userEvent.setup();
    renderApp('/count');
    await user.click(await screen.findByRole('button', { name: '조사 완료' }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText('입력한 수량이 없습니다. 한 품목 이상 입력해 주세요.')).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: '제출하기' })).toBeDisabled();
  });

  it('lists the items left blank and jumps to one', async () => {
    const user = userEvent.setup();
    renderApp('/count');
    await user.click(await screen.findByRole('button', { name: '말차 늘리기' }));
    await user.click(screen.getByRole('button', { name: '조사 완료 · 입력 1개' }));
    const sheet = await screen.findByRole('dialog');
    await user.click(within(sheet).getByText('미입력 품목 보기'));
    expect(within(sheet).queryByRole('button', { name: '말차' })).not.toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '크루아상' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the counts and says so when the record cannot be saved', async () => {
    const user = userEvent.setup();
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === 'inventory_history') throw new Error('quota');
      setItem.call(this, key, value);
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderApp('/count');
    await user.click(await screen.findByRole('button', { name: '말차 늘리기' }));
    await user.click(screen.getByRole('button', { name: '조사 완료 · 입력 1개' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: '제출하기' }));

    expect(await screen.findByText(/기록을 저장하지 못했습니다/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '제출했습니다' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '말차 수량' })).toHaveValue('0.5');
    expect(screen.getByRole('textbox', { name: '말차 수량' })).toBeEnabled();
  });
});

describe('completion screen', () => {
  it('opens a saved record from the link', async () => {
    seedHistory([
      {
        id: 'r1',
        created_at: '2026-10-08T07:00:00Z',
        items: [
          { id: '6', name: '말차', category: '파우더', count: 1.5 },
          { id: 'b1', name: '크루아상', category: '베이커리', unit: '봉지', count: 0 },
          { id: '16', name: '바닐라', category: '파우더', count: null },
        ],
      },
    ]);
    renderApp('/count?submitted=r1');
    const report = await screen.findByLabelText('보고서 텍스트');
    expect(report.textContent).toBe('[테라커피 재고조사 - 2026. 10. 8.]\r\n\r\n말차: 1.5 개\r\n\r\n크루아상: 0 봉지');
    expect(screen.getByText('입력 2개')).toBeInTheDocument();
    expect(screen.getByText('0개 1개')).toBeInTheDocument();
  });

  it('says so when the record is missing', async () => {
    renderApp('/count?submitted=nope');
    expect(await screen.findByText('기록을 찾을 수 없습니다')).toBeInTheDocument();
  });
});

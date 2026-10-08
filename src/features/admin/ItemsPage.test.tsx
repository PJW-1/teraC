import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';

const item = (id: string, name: string, category: string, unit: string, order: number) => ({ id, name, category, unit, display_order: order, count: null });
const stored = () => JSON.parse(localStorage.getItem('inventory_items') ?? '[]') as Array<{ name: string; category: string; unit: string }>;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('inventory_items', JSON.stringify([item('a', '말차', '파우더', '개', 0), item('b', '콘', '아이스크림', '줄', 1)]));
});

describe('ItemsPage', () => {
  it('lists items per category with their unit', async () => {
    renderApp('/admin');
    const row = await screen.findByRole('listitem', { name: '콘' });
    expect(within(row).getByText('단위 줄')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: '파우더' })).getByText('말차')).toBeInTheDocument();
  });

  it('adds an item from the header button and persists it', async () => {
    renderApp('/admin');
    await screen.findByRole('listitem', { name: '말차' });
    await userEvent.click(screen.getByRole('button', { name: '품목 추가' }));
    expect(screen.getByLabelText('카테고리')).toHaveValue('파우더');
    await userEvent.type(screen.getByLabelText('품목 이름'), '  신상  ');
    await userEvent.selectOptions(screen.getByLabelText('단위'), '팩');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(screen.queryByLabelText('품목 이름')).toBeNull());
    expect(await screen.findByRole('listitem', { name: '신상' })).toBeInTheDocument();
    expect(stored()).toContainEqual(expect.objectContaining({ name: '신상', category: '파우더', unit: '팩' }));
  });

  it('preselects the category of the card button', async () => {
    renderApp('/admin');
    await screen.findByRole('listitem', { name: '말차' });
    await userEvent.click(screen.getByRole('button', { name: '아이스크림에 품목 추가' }));
    expect(screen.getByLabelText('카테고리')).toHaveValue('아이스크림');
  });

  it('shows validation errors and keeps the sheet open', async () => {
    renderApp('/admin');
    await screen.findByRole('listitem', { name: '말차' });
    await userEvent.click(screen.getByRole('button', { name: '품목 추가' }));
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByText('품목 이름을 입력해 주세요.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('품목 이름'), '콘');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByText('이미 있는 품목 이름입니다.')).toBeInTheDocument();
    expect(stored()).toHaveLength(2);
  });

  it('edits the name and unit, showing the category as text', async () => {
    renderApp('/admin');
    await userEvent.click(await screen.findByRole('button', { name: '말차 수정' }));
    expect(screen.getByText('카테고리: 파우더')).toBeInTheDocument();
    expect(screen.queryByLabelText('카테고리')).toBeNull();
    const name = screen.getByLabelText('품목 이름');
    await userEvent.clear(name);
    await userEvent.type(name, '그린티');
    await userEvent.selectOptions(screen.getByLabelText('단위'), '통');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByRole('listitem', { name: '그린티' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: '말차' })).toBeNull();
    expect(stored()).toContainEqual(expect.objectContaining({ name: '그린티', unit: '통' }));
  });

  it('deletes after confirming, and cancel keeps the item', async () => {
    renderApp('/admin');
    await userEvent.click(await screen.findByRole('button', { name: '말차 수정' }));
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText("'말차' 품목을 삭제합니다. 모든 기기의 목록에서 사라지고, 지난 기록은 그대로 남습니다.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(stored()).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: '말차 수정' }));
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    await userEvent.click(screen.getByRole('button', { name: '삭제하기' }));
    await waitFor(() => expect(screen.queryByRole('listitem', { name: '말차' })).toBeNull());
    expect(stored().map(i => i.name)).toEqual(['콘']);
  });
});

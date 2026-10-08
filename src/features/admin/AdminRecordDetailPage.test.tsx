import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp, seedHistory } from '../../test/renderApp';

beforeEach(() => localStorage.clear());

const it_ = (id: string, name: string, category: string, count: number | null) => ({ id, name, category, unit: '개', count });

// 최신순: r3(보는 기록) > r2 > r1
const seed = () =>
  seedHistory([
    {
      id: 'r3',
      created_at: '2026-10-08T07:05:00Z',
      items: [
        it_('1', '말차', '파우더', 5),
        it_('2', '녹차', '파우더', 2),
        it_('3', '홍차', '파우더', 0),
        it_('4', '보리차', '티백', 1),
        it_('5', '새 품목', '티백', 4),
        it_('6', '미입력 품목', '티백', null),
      ],
    },
    {
      id: 'r2',
      created_at: '2026-10-07T07:00:00Z',
      items: [it_('1', '말차', '파우더', 3), it_('2', '녹차', '파우더', 2), it_('3', '홍차', '파우더', 4), it_('4', '보리차', '티백', 3)],
    },
    { id: 'r1', created_at: '2026-10-06T07:00:00Z', items: [it_('1', '말차', '파우더', 1)] },
  ]);

describe('AdminRecordDetailPage', () => {
  it('없는 기록이면 안내를 보여 준다', async () => {
    renderApp('/admin/records/nope');
    expect(await screen.findByText('기록을 찾을 수 없습니다')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '조사 기록' }).some(a => a.getAttribute('href') === '/admin/records')).toBe(true);
  });

  it('머리글에 시각과 입력 개수를 보여 준다', async () => {
    seed();
    renderApp('/admin/records/r3');
    expect(await screen.findByRole('heading', { name: '조사 기록 상세' })).toBeInTheDocument();
    expect(screen.getByText('10/8 16:05 조사 완료 · 입력 5개 · 0개 1개')).toBeInTheDocument();
  });

  it('이전 기록과 비교한 태그를 보여 준다', async () => {
    seed();
    renderApp('/admin/records/r3');
    // 이전 기록은 따로 불러오므로 태그가 나타날 때까지 기다린다.
    const row = async (name: string, text: string) => {
      const li = await screen.findByRole('listitem', { name });
      expect(await within(li).findByText(text)).toBeInTheDocument();
      return within(li);
    };
    expect((await row('말차', '+2')).getByText('이전 3개')).toBeInTheDocument();
    await row('녹차', '변화 없음');
    await row('홍차', '0이 됨');
    await row('보리차', '-2');
    await row('새 품목', '이전 기록 없음');
  });

  it('변화 있는 품목만, 미입력 품목도 걸러서 보여 준다', async () => {
    seed();
    renderApp('/admin/records/r3');
    await screen.findByRole('listitem', { name: '말차' });
    // 기본: 미입력 숨김
    expect(screen.queryByRole('listitem', { name: '미입력 품목' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: '미입력 품목도 보기' }));
    expect(within(screen.getByRole('listitem', { name: '미입력 품목' })).getByText('미입력')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: '변화 있는 품목만 보기' }));
    expect(screen.getByRole('listitem', { name: '말차' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: '녹차' })).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: '미입력 품목' })).not.toBeInTheDocument();
  });
});

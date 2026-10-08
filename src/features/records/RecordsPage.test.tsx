import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp, seedHistory } from '../../test/renderApp';

beforeEach(() => localStorage.clear());

const item = (id: string, name: string, count: number | null) => ({ id, name, category: '파우더', unit: '개', count });

describe('RecordsPage', () => {
  it('기록이 없으면 빈 상태를 보여 준다', async () => {
    renderApp('/records');
    expect(await screen.findByText('아직 저장된 조사가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('조사를 제출하면 여기에 기록이 쌓입니다.')).toBeInTheDocument();
  });

  it('날짜별로 묶고 행에 입력 개수, 품목 미리보기, 0개 배지를 보여 준다', async () => {
    seedHistory([
      {
        id: 'r2',
        created_at: '2026-10-08T07:05:00Z',
        items: [item('1', '말차', 0), item('2', '녹차', 2), item('3', '홍차', 1), item('4', '보리차', 4), item('5', '미입력', null)],
      },
      { id: 'r1', created_at: '2026-10-07T03:00:00Z', items: [item('1', '말차', null)] },
    ]);
    renderApp('/records');
    const day = await screen.findByRole('region', { name: '10월 8일 (목)' });
    const link = within(day).getByRole('link');
    expect(link).toHaveAttribute('href', '/records/r2');
    expect(link).toHaveTextContent(/(오후|PM) 4:05/);
    expect(link).toHaveTextContent('입력 4개');
    expect(link).toHaveTextContent('말차, 녹차, 홍차 외 1개');
    expect(link).toHaveTextContent('0개 1');
    const other = within(screen.getByRole('region', { name: '10월 7일 (수)' })).getByRole('link');
    expect(other).toHaveTextContent('입력 0개');
    expect(other).toHaveTextContent('입력한 품목 없음');
    expect(other).not.toHaveTextContent('0개 0');
  });

  it('더 보기로 다음 기록을 불러온다', async () => {
    seedHistory(
      Array.from({ length: 25 }, (_, i) => ({
        id: `r${i}`,
        created_at: new Date(Date.UTC(2026, 9, 8, 0, 0) - i * 3600_000).toISOString(),
        items: [item('1', '말차', 1)],
      })),
    );
    renderApp('/records');
    await screen.findAllByRole('link', { name: /입력 1개/ });
    expect(screen.getAllByRole('link', { name: /입력 1개/ })).toHaveLength(20);
    await userEvent.click(screen.getByRole('button', { name: '더 보기' }));
    await waitFor(() => expect(screen.getAllByRole('link', { name: /입력 1개/ })).toHaveLength(25));
    expect(screen.queryByRole('button', { name: '더 보기' })).not.toBeInTheDocument();
  });
});

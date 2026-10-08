import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { readStoredCounts } from '../../lib/inventory/storage';
import { renderApp, seedHistory } from '../../test/renderApp';

beforeEach(() => localStorage.clear());

const seed = () =>
  seedHistory([
    {
      id: 'r1',
      created_at: '2026-10-08T07:05:00Z',
      items: [
        { id: '6', name: '말차', category: '파우더', unit: '개', count: 3 },
        { id: '4', name: '청송사과', category: '파우더', unit: '개', count: 0 },
        { id: '1', name: '디카페인 원두', category: '원두', unit: '개', count: null },
      ],
    },
  ]);

describe('RecordDetailPage', () => {
  it('없는 기록이면 안내를 보여 준다', async () => {
    renderApp('/records/nope');
    expect(await screen.findByText('기록을 찾을 수 없습니다')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '기록 목록' })).toHaveAttribute('href', '/records');
  });

  it('요약과 입력한 품목만 보여 주고, 체크하면 미입력도 보여 준다', async () => {
    seed();
    renderApp('/records/r1');
    expect(await screen.findByText(/^10월 8일 \(목\) (오후|PM) 4:05 완료$/)).toBeInTheDocument();
    expect(screen.getByText(/입력 2개/)).toBeInTheDocument();
    expect(screen.getByText('· 0개 1')).toBeInTheDocument();
    expect(screen.getByText('말차')).toBeInTheDocument();
    expect(screen.getByText('청송사과')).toBeInTheDocument();
    expect(screen.queryByText('디카페인 원두')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: '미입력 품목도 보기' }));
    const group = screen.getByRole('region', { name: '원두' });
    expect(within(group).getByText('디카페인 원두')).toBeInTheDocument();
    expect(within(group).getByText('미입력')).toBeInTheDocument();
  });

  it('보고서 버튼을 보여 준다', async () => {
    seed();
    renderApp('/records/r1');
    expect(await screen.findByRole('button', { name: '텍스트 복사' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '파일 저장' })).toBeInTheDocument();
  });

  it('불러오기를 확인하면 수량을 덮어쓰고 조사 화면으로 간다', async () => {
    seed();
    const { router } = renderApp('/records/r1');
    await userEvent.click(await screen.findByRole('button', { name: '이 수량 불러오기' }));
    const sheet = await screen.findByRole('dialog', { name: '기록 불러오기' });
    expect(within(sheet).getByText('이 기록의 수량으로 지금 입력한 수량을 덮어씁니다. 품목 목록은 그대로입니다.')).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole('button', { name: '불러오기' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/count'));
    await waitFor(() => expect(readStoredCounts()['6']).toBe(3));
  });

  it('취소하면 아무것도 바꾸지 않는다', async () => {
    seed();
    const { router } = renderApp('/records/r1');
    await userEvent.click(await screen.findByRole('button', { name: '이 수량 불러오기' }));
    const sheet = await screen.findByRole('dialog', { name: '기록 불러오기' });
    await userEvent.click(within(sheet).getByRole('button', { name: '취소' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: '기록 불러오기' })).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe('/records/r1');
  });
});

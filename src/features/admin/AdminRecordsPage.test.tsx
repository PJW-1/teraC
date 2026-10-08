import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp, seedHistory } from '../../test/renderApp';

beforeEach(() => localStorage.clear());

describe('AdminRecordsPage', () => {
  it('같은 목록을 관리 경로 링크로 보여 준다', async () => {
    seedHistory([
      {
        id: 'r1',
        created_at: '2026-10-08T07:05:00Z',
        items: [
          { id: '6', name: '말차', category: '파우더', unit: '개', count: 0 },
          { id: '4', name: '청송사과', category: '파우더', unit: '개', count: 2 },
        ],
      },
    ]);
    renderApp('/admin/records');
    const day = await screen.findByRole('region', { name: '10월 8일 (목)' });
    const link = within(day).getByRole('link');
    expect(link).toHaveAttribute('href', '/admin/records/r1');
    expect(link).toHaveTextContent('입력 2개');
    expect(link).toHaveTextContent('0개 1');
    expect(screen.getByRole('heading', { name: '조사 기록' })).toBeInTheDocument();
  });

  it('기록이 없으면 빈 상태를 보여 준다', async () => {
    renderApp('/admin/records');
    expect(await screen.findByText('아직 저장된 조사가 없습니다')).toBeInTheDocument();
  });
});

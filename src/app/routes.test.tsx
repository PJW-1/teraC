import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

beforeEach(() => localStorage.clear());

describe('routes', () => {
  it('opens the count screen at / and shows 조사 · 기록 · 관리 tabs without role gating', async () => {
    const { router } = renderApp('/');
    await waitFor(() => expect(router.state.location.pathname).toBe('/count'));
    const nav = screen.getByRole('navigation', { name: '주요 메뉴' });
    expect(nav).toHaveTextContent('조사');
    expect(nav).toHaveTextContent('기록');
    expect(nav).toHaveTextContent('관리');
  });

  it('shows the not found page for an unknown path', async () => {
    renderApp('/nope');
    expect(await screen.findByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
  });
});

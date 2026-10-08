import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { STORE_NAME } from '../lib/store';
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

  it('opens item management from the 관리 tab under the same menu', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/count');
    await screen.findByRole('heading', { name: '재고 조사' });
    await user.click(within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', { name: '관리' }));
    expect(router.state.location.pathname).toBe('/admin');
    expect(await screen.findByRole('heading', { name: '품목 관리' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '관리 메뉴' })).toBeNull();
  });

  it.each(['/admin/stock', '/admin/records', '/admin/records/abc', '/admin/items'])('sends the old admin address %s to item management', async path => {
    const { router } = renderApp(path);
    expect(await screen.findByRole('heading', { name: '품목 관리' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/admin');
    expect(screen.queryByText('대시보드')).toBeNull();
    expect(screen.queryByText('재고 현황')).toBeNull();
  });

  it('goes back to the count screen from the store name in the header', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/records');
    await user.click(await screen.findByRole('link', { name: STORE_NAME }));
    expect(router.state.location.pathname).toBe('/count');
  });

  it('leaves the completion view for a new count from the store name', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/count?submitted=missing');
    await screen.findByText('기록을 찾을 수 없습니다');
    await user.click(screen.getByRole('link', { name: STORE_NAME }));
    expect(router.state.location.search).toBe('');
    expect(await screen.findByRole('heading', { name: '재고 조사' })).toBeInTheDocument();
  });

  it('goes to the count screen from the store name on the item management screen', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/admin');
    await user.click(await screen.findByRole('link', { name: STORE_NAME }));
    expect(router.state.location.pathname).toBe('/count');
  });

  it('plays the page entrance again when moving to another screen', async () => {
    const user = userEvent.setup();
    renderApp('/count');
    await screen.findByRole('heading', { name: '재고 조사' });
    const page = screen.getByRole('main').firstElementChild;
    expect(page).toHaveClass('animate-page-in');

    await user.click(within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', { name: '기록' }));
    const next = screen.getByRole('main').firstElementChild;
    expect(next).not.toBe(page);
    expect(next).toHaveClass('animate-page-in');
  });

  it('keeps the count submit bar outside the animated page so it stays pinned', async () => {
    renderApp('/count');
    const submit = await screen.findByRole('button', { name: '조사 완료' });
    expect(submit.closest('main')).toBeNull();
  });

  it('shows the not found page for an unknown path', async () => {
    renderApp('/nope');
    expect(await screen.findByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
  });
});

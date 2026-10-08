import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { Providers } from '../app/Providers';
import { routes } from '../app/routes';

/** 바텀시트(vaul)와 스크롤 이동에 필요한데 jsdom 에 없는 브라우저 API */
export function stubBrowserApis() {
  window.matchMedia ??= vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  Element.prototype.scrollIntoView ??= vi.fn();
  Element.prototype.setPointerCapture ??= vi.fn();
  Element.prototype.releasePointerCapture ??= vi.fn();
  Element.prototype.hasPointerCapture ??= vi.fn(() => false);
}

/**
 * 앱 전체(공급자 + 라우터)를 path 에서 연다. 테스트는 Supabase 설정이 비어 있어서
 * 품목은 INITIAL_DATA(또는 localStorage 'inventory_items'), 기록은 localStorage 'inventory_history' 를 쓴다.
 */
export function renderApp(path: string) {
  stubBrowserApis();
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const view = render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { ...view, router };
}

export type SeedRecord = {
  id: string;
  created_at: string;
  timestamp?: string;
  items: Array<{ id: string; name: string; category: string; unit?: string; count: number | null }>;
};

/** 로컬 모드 기록(최신순)을 넣는다 */
export function seedHistory(records: SeedRecord[]) {
  localStorage.setItem(
    'inventory_history',
    JSON.stringify(records.map(r => ({ ...r, timestamp: r.timestamp ?? new Date(r.created_at).toLocaleString('ko-KR') }))),
  );
}

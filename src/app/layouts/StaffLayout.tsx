import { ClipboardList, History, LayoutDashboard } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { cn } from '../../components/ui';
import { STORE_NAME } from '../../lib/store';

// 역할 구분이 없어서 관리 탭도 모두에게 보인다
const tabs = [
  { to: '/count', label: '조사', icon: ClipboardList, end: true },
  { to: '/records', label: '기록', icon: History, end: false },
  { to: '/admin', label: '관리', icon: LayoutDashboard, end: false },
];

/** 조사 화면(모바일 우선): 매장 머리글과 하단 탭 조사 · 기록 · 관리 */
export function StaffLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          <span className="truncate text-lg font-bold">{STORE_NAME}</span>
        </div>
      </header>

      <main className="flex-1 pb-[calc(var(--spacing-row)+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto flex max-w-3xl">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-row flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors duration-(--duration-press)',
                    isActive ? 'text-accent' : 'text-fg-muted',
                  )
                }
              >
                <Icon className="size-6" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

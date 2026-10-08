import { ClipboardList, Crown, History, Package } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { cn } from '../../components/ui';
import { STORE_NAME } from '../../lib/store';
import { tabIndicator } from './navStyles';

// 역할 구분이 없어서 관리 탭도 모두에게 보인다
const tabs = [
  { to: '/count', label: '조사', icon: ClipboardList, end: true },
  { to: '/records', label: '기록', icon: History, end: false },
  { to: '/admin', label: '관리', icon: Package, end: false },
];

/** 조사 화면(모바일 우선): 매장 머리글과 하단 탭 조사 · 기록 · 관리 */
export function StaffLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          {/* 매장 이름은 홈 버튼: 어느 화면에서든 재고 조사로 돌아온다 */}
          <Link to="/count" className="flex min-h-touch min-w-0 items-center gap-1.5">
            <Crown className="size-5 shrink-0 fill-accent-fill text-accent-fill" aria-hidden />
            <span className="truncate text-lg font-bold">{STORE_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-[calc(var(--spacing-row)+env(safe-area-inset-bottom))]">
        {/* 화면을 옮길 때마다 새로 그려서 등장 효과를 다시 재생한다 */}
        <div key={pathname} className="animate-page-in">
          <Outlet />
        </div>
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
                    'group flex min-h-row flex-col items-center justify-center gap-0.5 text-xs font-semibold',
                    'transition-[color,transform] duration-(--duration-press) active:scale-95',
                    isActive ? 'text-fg' : 'text-fg-muted',
                  )
                }
              >
                <span className={tabIndicator}>
                  <Icon className="size-5" aria-hidden />
                </span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
